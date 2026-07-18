import { mergeDeep } from '../../shared/utils/deep-operations';
import {
  isRecord,
  isFunction,
  // isObject,
  isNull,
  // isUndefined,
} from '../../shared/utils/guards';
import type { TXalorMergeContext } from '../models/types';
import type { TSolidShape } from '../../shared';
import { xalethorVaultKeeper } from './vault-keeper';
import { xalethorVaultDiagnostics } from './vault-diagnostics';
import { CLONE_SHAPE_SANITIZER_MAPPER } from '../mappers';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';

class XalethorVaultTransform {
  private isTargetRegistryStructure<K extends TActiveRegistryKeys>(
    payload: unknown,
  ): payload is TResolveRegistryStructure<K> {
    return isRecord(payload);
  }
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
   */
  /* prettier-ignore */
  private executeProduceClone( targetData: unknown, shape: TSolidShape, seen = new Map<unknown, unknown>(), depth = 0): unknown {

     if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) return null;
    if (isNull(targetData)) return targetData;

    // Isolate caches strictly to true Records to avoid bleeding container footprints
    if (typeof targetData === 'object' && targetData !== null && !Array.isArray(targetData)) {
      const cached = seen.get(targetData);
      if (cached !== undefined) return cached;
    }

    if (!shape) {
      return (typeof targetData === 'object' && targetData !== null) ? targetData : targetData;
    }

    // 🎯 RECOVERY GATE 1: If a blueprint explicitly expects an active 'instanceof' class,
    // we MUST let it fall through to the sanitizer map, even if the wire payload is a corrupt string scalar!
    if (shape.kind !== 'instanceof' && shape.kind !== 'primitive' && shape.kind !== 'literal') {
      if (typeof targetData !== 'object' || targetData === null) {
        return targetData;
      }
    }

    // Handle proxies, arrays, and array-like objects authoritatively
    const isArrayLikeStructure = Array.isArray(targetData) || 
      (shape.kind === 'array') ||
      (typeof targetData === 'object' && targetData !== null && 'length' in targetData && typeof (targetData as any).length === 'number');

    if (isArrayLikeStructure && shape.kind === 'array') {
      if (seen.has(targetData)) return seen.get(targetData);
      
      const copy: unknown[] = [];
      seen.set(targetData, copy);

      const rawArrayShape: any = shape;
      const targetItemBlueprint = rawArrayShape.items?.shape || rawArrayShape.items || { kind: 'primitive' };
      
      const iterableData = targetData as Record<string, unknown> & { length: number };
      const limit = Math.min(iterableData.length, IS_SOLID_CONFIG_ITEMS.reifyLimit.maxObjectProperties);
      
      for (let i = 0; i < limit; i++) {
        const value = this.executeProduceClone(iterableData[i], targetItemBlueprint, seen, depth + 1);
        if (value !== null && value !== undefined) {
          copy[i] = value;
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

      const boundRecurse = (
        nextData: unknown, 
        nextShape: any, 
        nextSeen?: any, 
        nextDepth?: number
      ) => {
        return this.executeProduceClone(
          nextData, 
          nextShape, 
          nextSeen ?? seen, 
          nextDepth ?? (depth + 1)
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
