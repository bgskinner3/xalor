import type {
  TTransformPickAndOmit,
  TSanitizeSlicedObject,
  TTransformRecursionLoop,
  TTransformSanitize,
  TTransformRename,
  TTransformPredicate,
  TRenameDependency,
  TTransformDependency,
  TMergeDependency,
  TPickOmitDependency,
  TTransformMerge,
  TTransformWorkerBase,
} from '../models/types';
import { TRANSFORM_SHAPE_MAPPER, TRANSFORM_FLATTEN_MAPPER } from '../mappers';
import {
  markAsSolid,
  executePickOmitFork,
  executeMergeFork,
  executeRenameFork,
} from '../utils';
import { isObject, isNull } from '../../shared';
import type { TSolidShape } from '../../shared';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared/constants';

export class XalethorVaultTransformer {
  // ====================================================================
  // ====================================================================
  // ====================================================================
  // ====================================================================
  // PRIVATE AND PUBLIC METHODS FOR MODES
  //
  // MERGE, OMIT, PICK, RENAME
  // ====================================================================
  // ====================================================================
  // ====================================================================
  // ====================================================================
  /**
   * 🚀 UNIVERSAL STRATEGY DISPATCHER
   *
   * ROLE:
   * Safely unwraps polymorphic shape union variants, ensuring that the
   * inner callback structures align identically with the master mapper contract.
   */
  private static dispatchPolymorphicShape<SK extends TSolidShape['kind']>(
    targetKind: SK,
    targetShape: Extract<TSolidShape, { kind: SK }>,
    targetValue: unknown,
    dependency: TTransformDependency,
    depth: number,
    seenObjectsMap: Map<unknown, unknown>,
    predicate: TTransformPredicate,
  ): unknown {
    const executeStrategy = <K extends TSolidShape['kind']>(
      kindToken: K,
      shapeNode: Extract<TSolidShape, { kind: K }>,
    ): unknown => {
      const internalStrategyWorker = TRANSFORM_SHAPE_MAPPER[kindToken];

      const recurseCallback: TTransformRecursionLoop = (v, s, f, d) => {
        /* prettier-ignore */
        return this.sanitize({ val: v, currentShape: s, dependency: f, depth: d, seenObjectsMap, predicate });
      };

      return internalStrategyWorker(
        shapeNode,
        targetValue,
        dependency,
        depth,
        recurseCallback,
      );
    };

    return executeStrategy(targetKind, targetShape);
  }

  /**
   * 🔪 INTERNAL OBJECT SLICING & MUTATION ENGINGE WORKER
   *
   * ROLE:
   * Dynamically forks key allocation algorithms by evaluating the explicit dependency.mode tag.
   */
  private static sliceObjectProperties(
    context: TSanitizeSlicedObject,
  ): unknown {
    const { val, currentShape, dependency } = context;

    // In merge mode, find which object reference contains the rich class instance.
    // If dependency.patchData holds a class instance, extract its proto; otherwise, default to val.
    let targetProto = Object.getPrototypeOf(val || {});

    if (dependency.mode === 'merge' && dependency.patchData) {
      const patchProto = Object.getPrototypeOf(dependency.patchData);
      if (patchProto && patchProto !== Object.prototype) {
        targetProto = patchProto;
      }
    }

    const cleanObj = Object.create(targetProto);

    // ✔️ FIX: Symmetrical Dual-Graph Pointer Registration!
    // Record baseline object reference in the circular lookup cache table natively
    context.seenObjectsMap.set(val, cleanObj);

    // If a merge pass is active, record the patch element reference to the same output container reference!
    // This allows either parent back-reference pointer to successfully clear cache checks deeper down the tree wire.
    if (dependency.mode === 'merge' && dependency.patchData) {
      context.seenObjectsMap.set(dependency.patchData, cleanObj);
    }

    // Pack parameters bundle for standalone workers
    const workerBundle: TTransformWorkerBase = {
      ...context,
      cleanObj,
      dataRef: val,
      props: currentShape.properties,
      sanitizeHandler: (args) => this.sanitize(args),
    };
    // ========================================================================
    // 🎛️ FORK ROUTE 1 & 2: EVALUATES SELECTION PIPELINES ('pick' / 'omit')
    // ========================================================================
    if (dependency.mode === 'pick' || dependency.mode === 'omit') {
      return executePickOmitFork({
        ...workerBundle,
        dependency: dependency as TPickOmitDependency,
      });
    }
    // ========================================================================
    // 🎛️ FORK ROUTE 3: EVALUATES NOMINAL KEY TRANSLATIONS ('rename')
    // ========================================================================
    if (dependency.mode === 'rename') {
      return executeRenameFork({
        ...workerBundle,
        dependency: dependency as TRenameDependency,
      });
    }
    // ========================================================================
    // 🎛️ FORK ROUTE 4: EVALUATES ENTITY AGGREGATIONS ('merge')
    // ========================================================================
    if (dependency.mode === 'merge') {
      return executeMergeFork({
        ...workerBundle,
        dependency: dependency as TMergeDependency,
      });
    }

    return cleanObj;
  }

  /**
   * CORE RECURSIVE SANITIZER GATE
   */
  private static sanitize({
    val,
    currentShape,
    dependency,
    depth,
    seenObjectsMap,
    predicate,
  }: TTransformSanitize): unknown {
    const { reifyLimit } = IS_SOLID_CONFIG_ITEMS;
    if (depth > reifyLimit.maxDepth) return null;
    // !!! NOTE: conditional below caution.
    if (val === null || typeof val !== 'object') return val;
    if (seenObjectsMap.has(val)) return seenObjectsMap.get(val);
    if (!currentShape) return val;

    const kind = currentShape.kind;

    /* prettier-ignore */
    if (kind === 'object') return this.sliceObjectProperties({ val, currentShape: currentShape, dependency, depth, seenObjectsMap, predicate });

    const activePredicate: TTransformPredicate = predicate ?? (() => true);
    /* prettier-ignore */
    return this.dispatchPolymorphicShape(kind, currentShape, val, dependency, depth, seenObjectsMap, activePredicate);
  }

  public static transformPickAndOmit<K extends keyof ISolidRegistry>({
    data,
    shape,
    filterSet,
    predicate,
    mode,
  }: TTransformPickAndOmit & { mode: 'pick' | 'omit' }): ISolidRegistry[K] {
    const seenObjectsMap = new Map<unknown, unknown>();
    const pickOmitEnvelope: TPickOmitDependency = {
      mode: mode,
      set: filterSet,
    };

    /* prettier-ignore */
    const rawResultObj = this.sanitize({ val: data, currentShape: shape, dependency: pickOmitEnvelope, depth: 0, seenObjectsMap, predicate: predicate as TTransformPredicate });

    if (markAsSolid<K, ISolidRegistry[K]>(rawResultObj)) {
      return rawResultObj;
    }
    throw new Error(
      `[xalor] Critical Failure: Failed to brand mutation output structure graph.`,
    );
  }

  /**
   * 🚀 PUBLIC EXECUTOR: NOMINAL KEY TRANSLATION ('rename')
   */
  public static transformRename<K extends keyof ISolidRegistry>({
    data,
    shape,
    mappings,
  }: TTransformRename): ISolidRegistry[K] {
    const seenObjectsMap = new Map<unknown, unknown>();
    const renameEnvelope: TRenameDependency = {
      mode: 'rename',
      mappings,
    };

    /* prettier-ignore */
    const rawResultObj = this.sanitize({ val: data, currentShape: shape, dependency: renameEnvelope, depth: 0, seenObjectsMap });

    if (markAsSolid<K, ISolidRegistry[K]>(rawResultObj)) {
      return rawResultObj;
    }
    throw new Error(
      `[xalor] Critical Failure: Failed to brand rename mutation output structure graph.`,
    );
  }

  /**
   * 🧬 PUBLIC EXECUTOR: MULTI-ENTITY AGGREGATIONS ('merge')
   *
   */
  public static transformMerge<K extends keyof ISolidRegistry>({
    dataOne,
    dataTwo,
    shape,
  }: TTransformMerge): ISolidRegistry[K] {
    const seenObjectsMap = new Map<unknown, unknown>();
    const mergeEnvelope: TMergeDependency = {
      mode: 'merge',
      patchData: dataOne,
    };

    /* prettier-ignore */
    const rawResultObj = this.sanitize({ val: dataTwo, currentShape: shape, dependency: mergeEnvelope, depth: 0, seenObjectsMap });

    if (markAsSolid<K, ISolidRegistry[K]>(rawResultObj)) {
      return rawResultObj;
    }
    throw new Error(
      `[xalor] Critical Failure: Failed to brand merge mutation output structure graph.`,
    );
  }
  // ====================================================================
  // ====================================================================
  // ====================================================================
  // ====================================================================
  // PRIVATE AND PUBLIC METHODS FOR MODE -- Flat
  // ====================================================================
  // ====================================================================
  // ====================================================================
  // ====================================================================
  private static dispatchFlattenShape<SK extends TSolidShape['kind']>(
    targetKind: SK,
    targetShape: Extract<TSolidShape, { kind: SK }>,
    targetValue: unknown,
    accumulator: Record<string, string | number | boolean | null>,
    currentPath: string,
    depth: number,
    seenObjectsMap: Set<unknown>,
  ): void {
    const executeStrategy = <K extends TSolidShape['kind']>(
      kindToken: K,
      shapeNode: Extract<TSolidShape, { kind: K }>,
    ): void => {
      const internalStrategyWorker = TRANSFORM_FLATTEN_MAPPER[kindToken];
      /* prettier-ignore */
      const recurseCallback = (v: unknown, s: TSolidShape, a: Record<string, string | number | boolean | null>, p: string, d: number, seen: Set<unknown>) => {
        this.executeFlattenProcessor(v, s, a, p, d, seen);
      };
      // TODO: FI TYPE ISSUE
      /* prettier-ignore */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      internalStrategyWorker(shapeNode as any, targetValue, accumulator, currentPath, depth, seenObjectsMap, recurseCallback);
    };

    executeStrategy(targetKind, targetShape);
  }
  private static executeFlattenProcessor(
    val: unknown,
    currentShape: TSolidShape,
    accumulator: Record<string, string | number | boolean | null>,
    currentPath: string,
    depth: number,
    seenObjectsMap: Set<unknown>,
  ): void {
    const { reifyLimit } = IS_SOLID_CONFIG_ITEMS;
    // THE DEPTH LAW (Security control check)
    if (depth > reifyLimit.maxDepth) return;

    // Circular loop memory stack boundary intercept validation
    if (isObject(val) && !isNull(val)) {
      if (seenObjectsMap.has(val)) return;
      seenObjectsMap.add(val);
    }

    if (!currentShape) return;

    const kind = currentShape.kind;

    /* prettier-ignore */
    this.dispatchFlattenShape(kind, currentShape, val, accumulator, currentPath, depth, seenObjectsMap);
  }
  /**
   * 📊 PUBLIC EXECUTOR: HIERARCHICAL DECOMPRESSION ('flatten')
   *
   * ROLE:
   * Initializes a fresh linear state accumulator canvas tracking context frame for flat mappings.
   */
  public static transformFlatten({
    data,
    shape,
  }: {
    readonly data: unknown;
    readonly shape: TSolidShape;
  }): Record<string, string | number | boolean> {
    const accumulator: Record<string, string | number | boolean> = {};
    const seenObjectsMap = new Set<unknown>();
    /* prettier-ignore */
    this.executeFlattenProcessor(data, shape, accumulator, '', 0, seenObjectsMap);
    return accumulator;
  }
}
