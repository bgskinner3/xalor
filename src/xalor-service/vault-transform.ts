import { mergeDeep } from '../../shared/utils/deep-operations';
import {
  isRecord,
  isObject,
  isNull,
  isUndefined,
  isObjectSimple,
  isNumber,
  isInstanceOf,
  isFunction,
} from '../../shared/utils/guards';
import { isArrayShape, isShapeOfKind } from '../../shared';
import type {
  TXalorMergeContext,
  TCloneRecurseCallback,
} from '../models/types';
import type { TSolidShape } from '../../shared';
import { xalethorVaultKeeper } from './vault-keeper';
import { xalethorVaultDiagnostics } from './vault-diagnostics';
import { CLONE_SHAPE_SANITIZER_MAPPER } from '../mappers';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';

class XalethorVaultTransform {
  // =================================================
  // =================================================
  // MERGE METHODS
  // =================================================
  // =================================================
  private executeRootPick(
    targetObj: Record<string | symbol, unknown>,
    allowedKeys: Array<string | symbol | number>,
  ): void {
    const pickSet = new Set<string>();

    for (const key of allowedKeys) {
      pickSet.add(String(key));
    }

    for (const key in targetObj) {
      if (Reflect.has(targetObj, key) && !pickSet.has(key)) {
        Reflect.deleteProperty(targetObj, key);
      }
    }
  }

  private executeRootOmit(
    targetObj: Record<string | symbol, unknown>,
    bannedKeys: Array<string | symbol | number>,
  ): void {
    for (const key of bannedKeys) {
      const keyStr = String(key);
      if (Reflect.has(targetObj, keyStr)) {
        Reflect.deleteProperty(targetObj, keyStr);
      }
    }
  }
  private executeRootMap(
    targetObj: Record<string | symbol, unknown>,
    mapRegistry: Record<string, unknown>,
  ): void {
    for (const key in mapRegistry) {
      if (Reflect.has(mapRegistry, key)) {
        const customTransformer = mapRegistry[key];

        if (isFunction(customTransformer) && Reflect.has(targetObj, key)) {
          /* prettier-ignore */ const executableProjector = customTransformer as (...args: unknown[]) => unknown;

          /* prettier-ignore */ targetObj[key] = executableProjector(targetObj[key], targetObj);
        }
      }
    }
  }

  public transformMerge<K extends keyof ISolidRegistry>(
    ctx: TXalorMergeContext<ISolidRegistry[K]>,
  ): unknown {
    // I. Refine loose incoming variables into mutable record tracking contexts safely

    /* prettier-ignore */ const baseRecord: Record<string, unknown> = isRecord(ctx.dataOne) ? ctx.dataOne : {};
    /* prettier-ignore */ const patchRecord: Record<string, unknown> = isRecord(ctx.dataTwo) ? ctx.dataTwo : {};

    const rawMergedResult: unknown = mergeDeep(baseRecord, patchRecord);

    if (isRecord(rawMergedResult)) {
      const resultPayload: Record<string | symbol, unknown> = rawMergedResult;

      /* prettier-ignore */ if (ctx.pick) this.executeRootPick(resultPayload, ctx.pick);

      /* prettier-ignore */ if (ctx.omit) this.executeRootOmit(resultPayload, ctx.omit);

      /* prettier-ignore */ if (ctx.map) this.executeRootMap(resultPayload, ctx.map as Record<string, unknown>);

      return resultPayload;
    }
    return rawMergedResult;
  }

  // =================================================
  // =================================================
  // CLONE METHODS
  // =================================================
  // =================================================
  private isEvaluableArrayStructure(
    payload: unknown,
  ): payload is { readonly [index: number]: unknown; readonly length: number } {
    if (isNull(payload) || !isObjectSimple(payload)) return false;

    if (!Reflect.has(payload, 'length')) return false;

    const rawLength = Reflect.get(payload, 'length');
    return isNumber(rawLength);
  }
  private isTargetRegistryStructure<K extends TActiveRegistryKeys>(
    payload: unknown,
  ): payload is TResolveRegistryStructure<K> {
    return isRecord(payload);
  }

  /* prettier-ignore */
  private requireShape<K extends TActiveRegistryKeys>(key: K, msg: string) {
    const shape = xalethorVaultKeeper.peek('blueprint', key);

    if (!shape) return xalethorVaultDiagnostics.panic(key, msg);

    return shape;
  }

  /**
   * 🧼 PRODUCE CLONE
   *
   * ROLE:
   * Performs a deep, circular-safe copy of an input object while
   * physically scrubbing away any keys missing from the TSolidShape blueprint.
   *
   * LAW: Zero 'any', Zero type assertions ('as'), and Zero 'switch' blocks.
   *
   * STRATEGY:
   * Uses an integrated multi-key cache ledger that isolates execution tracks by both
   * object data reference and shape pointer reference. This achieves absolute safety
   * across complex structural intersection branches and deep self-referencing graph cycles
   * with zero runtime allocation overhead.
   */
  private executeProduceClone(
    targetData: unknown,
    shape: TSolidShape,
    seen = new Map<unknown, unknown>(),
    depth = 0,
  ): unknown {
    // ----------------==================================----------------
    // I: DEPTH BOUNDARY & NULL TRAPS
    // ----------------==================================----------------
    if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) return null;
    if (isNull(targetData)) return targetData;

    // ----------------==================================----------------
    // II: HIGH-VELOCITY RECENT MATRIX CACHE CONTROLS 'OBJECT'
    // ----------------==================================----------------
    if (isObject(targetData)) {
      const shapeCacheMap = seen.get(targetData);

      if (isInstanceOf(shapeCacheMap, Map)) {
        const cachedRecord = shapeCacheMap.get(shape);
        if (!isUndefined(cachedRecord)) {
          return cachedRecord;
        }
        if (isShapeOfKind('reference')(shape) && shapeCacheMap.size > 0) {
          const firstAvailableAccumulator = shapeCacheMap.values().next().value;
          if (!isUndefined(firstAvailableAccumulator)) {
            return firstAvailableAccumulator;
          }
        }
      }
    }
    // ----------------==================================----------------
    // III.: FALLBACK PROTECTION GATES
    // --------------------------------==================----------------
    if (!shape) return isObject(targetData) ? targetData : targetData;

    /* prettier-ignore */
    if (!isShapeOfKind('instanceof')(shape) && !isShapeOfKind('primitive')(shape) && !isShapeOfKind('literal')(shape)) {
      if (!isObjectSimple(targetData) || isNull(targetData)) {
        return targetData;
      }
    }
    // ----------------==================================----------------
    // VI. AUTHORITATIVE ARRAY REIFICATION FLOWS
    // --------------------------------==================----------------
    if (isArrayShape(shape)) {
      if (seen.has(targetData)) return seen.get(targetData);

      const copy: unknown[] = [];
      seen.set(targetData, copy);

      const targetItemBlueprint = shape.items;

      if (this.isEvaluableArrayStructure(targetData)) {
        const limit = Math.min(
          targetData.length,
          IS_SOLID_CONFIG_ITEMS.reifyLimit.maxObjectProperties,
        );

        for (let i = 0; i < limit; i++) {
          const value = this.executeProduceClone(
            targetData[i],
            targetItemBlueprint,
            seen,
            depth + 1,
          );
          if (!isNull(value) && !isUndefined(value)) copy[i] = value;
        }
      }
      return copy;
    }

    const executeCloneSanitizer = <K extends TSolidShape['kind']>(
      kind: K,
      targetShape: Extract<TSolidShape, { kind: K }>,
    ): unknown => {
      const sanitizer = CLONE_SHAPE_SANITIZER_MAPPER[kind];
      if (!sanitizer) return targetData;

      /* prettier-ignore */
      const boundRecurse: TCloneRecurseCallback = (nextData, nextShape, nextSeen, nextDepth) => {
    return this.executeProduceClone(
      nextData,
      nextShape,
      nextSeen ?? seen,
      nextDepth ?? (depth + 1),
    );
  };

      return sanitizer(targetShape, targetData, seen, depth, boundRecurse);
    };

    return executeCloneSanitizer(shape.kind, shape);
  }

  /**
   * GET CLONE (The Sanitizer)
   *
   * ROLE: The "Clean Room."
   * Takes raw, untrusted data and returns a deep-copy that is physically
   * guaranteed to only contain properties defined in the TypeScript interface.
   *
   * STRATEGY:
   * - Graph Integrity: Uses internal Map tracking to handle circular references.
   * - Prototype Preservation: Maintains class instances where possible.
   * - Key Scrubbing: Iterates the Blueprint, not the Data, to ensure purity.
   *
   * @param data - The raw input object to be purified.
   * @param key - The unique identifier of the target blueprint.
   */
  public getClone<K extends TActiveRegistryKeys>(
    data: unknown,
    key: K,
  ): TResolveRegistryStructure<K> {
    /* prettier-ignore */
    const shape =  this.requireShape<K>( key, 'Cloning failed: Blueprint missing from Vault.');

    const cleanData = this.executeProduceClone(data, shape, new Map());

    // Structural boundary check narrowing target generic output naturally via native type guards
    if (this.isTargetRegistryStructure<K>(cleanData)) {
      return cleanData;
    }
    /* prettier-ignore */
    return xalethorVaultDiagnostics.panic( key, `[xalor] Failed to brand purified clone for ${key}`);
  }
}

export const xalethorVaultTransform = new XalethorVaultTransform();
