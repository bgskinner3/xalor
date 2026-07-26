import { mergeDeep } from '../../shared/utils/deep-operations';
import {
  isRecord,
  isObject,
  isNull,
  isUndefined,
  isObjectSimple,
  isNumber,
  isInstanceOf,
  isKeyInObject,
  isFunction,
  // isFunction,
} from '../../shared/utils/guards';
import { isArrayShape, isShapeOfKind } from '../../shared';
import {
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  ObjectUtils,
} from '../../shared/utils';
import type {
  TXalorMergeContexts,
  TCloneRecurseCallback,
  TRecurseMaterializer,
} from '../models/types';
import type { TSolidShape } from '../../shared';
import { xalethorVaultKeeper } from './vault-keeper';
import { xalethorVaultDiagnostics } from './vault-diagnostics';
import {
  CLONE_SHAPE_SANITIZER_MAPPER,
  DEFAULT_SHAPE_MATERIALIZER,
  MOCK_SHAPE_MATERIALIZER,
  clonePlatformInstance,
} from '../mappers';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import { isTargetRegistryStructure } from '../utils';
class XalethorVaultTransform {
  private PRUNE_DROP_SIGNAL = Symbol('__pruneDropSignal');
  // =================================================
  // =================================================
  // MERGE METHODS
  // =================================================
  // =================================================
  /**
   * PURE STRUCTURAL KEY CHECKER
   * Evaluates whether a raw key is structurally permitted to survive the
   * selection passes based on the configured pick and omit boundaries.
   *
   * CRITICAL: Zero allocations, zero mutations, zero hidden-class V8 degradation.
   */
  private isKeyPermitted(
    rawKey: string,
    pickSet: Set<string> | null,
    omitSet: Set<string> | null,
  ): boolean {
    if (pickSet && !pickSet.has(rawKey)) return false;
    if (omitSet && omitSet.has(rawKey)) return false;
    return true;
  }
  /**
   * ENCAPSULATED DATA-HEALING PASS
   * Evaluates the prune strategy linearly and applies your advanced materializers
   * cleanly without duplicated code blocks or nested if-else statements.
   */
  private applyPruneStrategy(
    strategy: 'defaults' | 'mocks' | 'nulls' | 'drop' | undefined,
    targetShapeNode: TSolidShape | undefined,
    recurseDefault: TRecurseMaterializer,
    recurseMock: TRecurseMaterializer,
  ): unknown {
    if (strategy === 'defaults' || strategy === 'mocks') {
      return this.executePruneHealing(
        strategy,
        targetShapeNode,
        recurseDefault,
        recurseMock,
      );
    }
    return strategy === 'nulls' ? null : this.PRUNE_DROP_SIGNAL;
  }
  /**
   * COSMETIC KEY CASING MANAGER
   * Restyles a surviving key string layout into its final configured aesthetic format.
   * Maps natively to your TCamelCase, TSnakeCase, and TKebabCase definitions.
   *
   * CRITICAL: Completely zero-allocation fallback behavior if no style is matched.
   */
  private applyKeyCasing(
    rawKey: string,
    casingStyle?: 'camel' | 'snake' | 'kebab',
  ): string {
    if (casingStyle === 'camel') return toCamelCase(rawKey);
    if (casingStyle === 'snake') return toSnakeCase(rawKey);
    if (casingStyle === 'kebab') return toKebabCase(rawKey);

    return rawKey;
  }
  private executeDefaultNode<K extends TSolidShape['kind']>(
    kind: K,
    shape: Extract<TSolidShape, { readonly kind: K }>,
    depth: number,
    recurse: TRecurseMaterializer,
  ): unknown {
    const runner = DEFAULT_SHAPE_MATERIALIZER[kind];
    return runner(shape, depth, recurse);
  }
  private executeMockNode<K extends TSolidShape['kind']>(
    kind: K,
    shape: Extract<TSolidShape, { readonly kind: K }>,
    depth: number,
    recurse: TRecurseMaterializer,
  ): unknown {
    const runner = MOCK_SHAPE_MATERIALIZER[kind];
    return runner(shape, depth, recurse);
  }
  /**
   * IN-FLIGHT RECURSIVE DATA HEALER
   *
   * Leverages your native framework materializers to synthesize structurally perfect
   * default primitives or random mocks whenever a field value matches prune constraints.
   */
  private executePruneHealing(
    strategy: 'defaults' | 'mocks' | 'nulls',
    propShape: TSolidShape | undefined,
    recurseDefault: TRecurseMaterializer,
    recurseMock: TRecurseMaterializer,
  ): unknown {
    if (strategy === 'nulls') {
      return null;
    }
    if (!propShape) return undefined;

    /* prettier-ignore */
    if (strategy === 'defaults' && Reflect.has(DEFAULT_SHAPE_MATERIALIZER, propShape.kind)) {
    return this.executeDefaultNode(propShape.kind, propShape, 0, recurseDefault);
    }
    /* prettier-ignore */
    if (strategy === 'mocks' && Reflect.has(MOCK_SHAPE_MATERIALIZER, propShape.kind)) {
      return this.executeMockNode(propShape.kind, propShape, 0, recurseMock);
    }

    return undefined;
  }

  public transformMerge<
    K extends TActiveRegistryKeys,
    const O extends TXalorMergeContexts<
      TResolveRegistryStructure<K>,
      readonly (keyof TResolveRegistryStructure<K>)[],
      readonly (keyof TResolveRegistryStructure<K>)[]
    >,
  >(ctx: O, blueprintShape?: Record<string, unknown>): Record<string, unknown> {
    if (!isShapeOfKind('object')(blueprintShape)) return {};

    const blueprintShapeProperties = blueprintShape.properties;

    // ============================================================================
    // I. Parse initial objects safely using unknown boundaries rather than assertions
    // ============================================================================
    /* prettier-ignore */
    const baseRecord = isRecord(ctx.dataOne) ? ctx.dataOne : {};
    /* prettier-ignore */
    const patchRecord = isRecord(ctx.dataTwo) ? ctx.dataTwo : {};

    // ============================================================================
    // II. O(1) SETS
    // ============================================================================
    /* prettier-ignore */
    const pickSet = ctx.pick ? new Set<string>([...ctx.pick].map(String)) : null;
    /* prettier-ignore */
    const omitSet = ctx.omit ? new Set<string>([...ctx.omit].map(String)) : null;
    /* prettier-ignore */
    const pruneSet = ctx.pruneAndFill?.values ? new Set<unknown>([...ctx.pruneAndFill.values]) : null;

    const mapRegistry: Record<string, unknown> = ctx.map || {};

    /* prettier-ignore */
    const rawMergedResult: unknown = mergeDeep(baseRecord, patchRecord);

    const pristineOutput: Record<string, unknown> = {};

    if (!isRecord(rawMergedResult)) return pristineOutput;

    // ============================================================================
    // RECURSE DEFAULT OR MOCK FUNCTIONS
    // ============================================================================
    const recurseDefault: TRecurseMaterializer = (s, d) => {
      return this.executeDefaultNode(s.kind, s, d, recurseDefault);
    };

    const recurseMock: TRecurseMaterializer = (s, d) => {
      return this.executeMockNode(s.kind, s, d, recurseMock);
    };

    // IV. SINGLE-PASS ASSEMBLY LOOP (Commandment VIII & IX Compliance)
    const objectKeys: string[] = ObjectUtils.keys(rawMergedResult);
    for (let i = 0; i < objectKeys.length; i++) {
      const rawKey = objectKeys[i];
      if (!rawKey) continue;
      const evaluatedBlueprintKey = this.applyKeyCasing(rawKey, ctx.casing);

      // 1. SECURED CONTRACT GUARDRAIL: If the user omits a custom pick array,
      // we automatically enforce absolute AOT registry contract protection.
      if (!pickSet) {
        /* prettier-ignore */
        if (!blueprintShapeProperties || !Reflect.has(blueprintShapeProperties, evaluatedBlueprintKey)) {
          continue;
        }
      }

      /* prettier-ignore */
      if (!this.isKeyPermitted(evaluatedBlueprintKey, pickSet, omitSet)) continue;

      let targetValue: unknown = rawMergedResult[rawKey];

      const explicitlyUndefinedInPatch =
        Reflect.has(patchRecord, rawKey) && patchRecord[rawKey] === undefined;
      const completelyMissingInBoth =
        !Reflect.has(baseRecord, rawKey) && !Reflect.has(patchRecord, rawKey);

      if (explicitlyUndefinedInPatch || completelyMissingInBoth) {
        targetValue = undefined;
      }

      const propertyDescriptor = blueprintShapeProperties
        ? blueprintShapeProperties[evaluatedBlueprintKey]
        : undefined;
      /* prettier-ignore */
      const targetShapeNode: TSolidShape | undefined = isKeyInObject('shape')(propertyDescriptor) ? propertyDescriptor.shape : undefined;

      // 3. STEP 4: Execute pruneAndFill Data Healing Pass
      if (pruneSet && pruneSet.has(targetValue)) {
        const strategy = ctx.pruneAndFill?.strategy;
        const healedValue = this.applyPruneStrategy(
          strategy,
          targetShapeNode,
          recurseDefault,
          recurseMock,
        );

        if (healedValue === this.PRUNE_DROP_SIGNAL) {
          continue;
        }
        targetValue = healedValue;
      }

      if (ctx.map && Reflect.has(ctx.map, evaluatedBlueprintKey)) {
        const customTransformer: unknown = mapRegistry[evaluatedBlueprintKey];
        if (isFunction(customTransformer)) {
          targetValue = customTransformer(targetValue, rawMergedResult);

          if (pruneSet && pruneSet.has(targetValue)) {
            const strategy = ctx.pruneAndFill?.strategy;
            /* prettier-ignore */
            const healedValue = this.applyPruneStrategy(strategy, targetShapeNode, recurseDefault, recurseMock);

            if (healedValue === this.PRUNE_DROP_SIGNAL) {
              continue;
            }
            targetValue = healedValue;
          }
        }
      }

      pristineOutput[evaluatedBlueprintKey] =
        clonePlatformInstance(targetValue);
    }

    return pristineOutput;
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
    if (isTargetRegistryStructure<K>(cleanData)) {
      return cleanData;
    }
    /* prettier-ignore */
    return xalethorVaultDiagnostics.panic( key, `[xalor] Failed to brand purified clone for ${key}`);
  }
}

export const xalethorVaultTransform = new XalethorVaultTransform();
