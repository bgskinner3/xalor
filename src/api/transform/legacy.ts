// import { XalethorService } from '../../xalor-service';
// import type { TDeepKeyOf } from '../../../shared';
// import type { TTransformXalorModes } from '../../../shared/auto';
// export type TPickOmitContext<K extends keyof ISolidRegistry> = {
//   readonly data: unknown;
//   readonly keys: readonly TDeepKeyOf<ISolidRegistry[K]>[];
// };

// export type TMergeContext = {
//   readonly dataOne: unknown;
//   readonly dataTwo: unknown;
// };
// export type TFlattenDataContext = {
//   readonly data: unknown;
// };
// // ----------------------------------------------------------------------------------------------------
// /**
//  * AUTOMATED PARAMETERS LOOKUP DICTIONARY
//  *
//  * ROLE:
//  * Single source of truth index ledger linking strategy tokens to narrow context blocks.
//  */
// export type TTransformXalorParamMap<K extends keyof ISolidRegistry> = {
//   readonly pick: TPickOmitContext<K>;
//   readonly omit: TPickOmitContext<K>;
//   readonly merge: TMergeContext;
//   readonly flatten: TFlattenDataContext;
// };
// /**
//  * AUTOMATED OUTPUTS LOOKUP DICTIONARY
//  *
//  * ROLE:
//  * Single source of truth index ledger linking strategy tokens to narrow resulting structures.
//  */
// export type TTransformXalorResultMap<K extends keyof ISolidRegistry> = {
//   readonly pick: ISolidRegistry[K];
//   readonly omit: ISolidRegistry[K];
//   readonly merge: ISolidRegistry[K];
//   readonly flatten: Record<string, string | number | boolean>;
// };
// // ----------------------------------------------------------------------------------------------------
// /**
//  * TYPE-PARAMETERIZED DISCRIMINATED TRANSFORM CONTEXT
//  *
//  * ROLE:
//  * Generically locks down the required parameter payload properties block
//  * based on the precise mode literal argument passed to the generic slot.
//  *
//  * WHY:
//  * Satisfies Commandment I and V. Enforces complete compile-time validation for
//  * user-land calls like `transformXalor<"KEY", "pick">({ mode: 'pick', data, keys })`,
//  * instantly flagging mismatched field keys inside the developer's IDE.
//  */
// export type TTransformContext<
//   K extends keyof ISolidRegistry,
//   M extends TTransformXalorModes = TTransformXalorModes,
// > = {
//   readonly mode: M;
// } & TTransformXalorParamMap<K>[M];

// /**
//  * AUTOMATED DYNAMIC RETURN TYPE DISPATCHER
//  *
//  * ROLE:
//  * Computes and links the precise structural return type based on the active strategy token.
//  */
// export type TTransformXalorReturn<
//   K extends keyof ISolidRegistry,
//   M extends TTransformXalorModes,
// > = TTransformXalorResultMap<K>[M];

// /**
//  * AUTOMATED STRATEGY SWITCHBOARD ENGINE CONTRACT
//  *
//  * ROLE:
//  * Links each unique 'Mode' token string key directly to its matching narrow
//  * parameter object shape AND narrow output result shape simultaneously.
//  *
//  */
// export type TTransformStrategyEngine<K extends keyof ISolidRegistry> = {
//   readonly [Mode in TTransformXalorModes]: (
//     key: K,
//     ctx: TTransformXalorParamMap<K>[Mode],
//   ) => TTransformXalorResultMap<K>[Mode];
// };
// /**
//  * RUNTIME API: TRANSFORM XALOR
//  *
//  * Executes high-performance structural mutation sweeps across strongly typed data contracts.
//  * Coordinates 'pick', 'omit', 'merge', and 'flatten' operations directly in-memory.
//  *
//  * @example
//  * ```ts
//  *  transformXalor<"REGISTERED_KEY", 'mode'>(ctx?: {...})
//  * //// MODES: 'pick', 'omit', 'rename', 'merge', and 'flatten'
//  * ```
//  *
//  * @see {@link RuntimeApiDocs.transformXalor}
//  */
// /* prettier-ignore */
// export function transformXalor<
//   K extends keyof ISolidRegistry,
//   _M extends 'pick',
// >(injectedKey: K, injectedMode: 'pick', ctx: TPickOmitContext<K>): ISolidRegistry[K];
// /* prettier-ignore */
// export function transformXalor<
//   K extends keyof ISolidRegistry,
//   _M extends 'omit',
// >(injectedKey: K, injectedMode: 'omit', ctx: TPickOmitContext<K>): ISolidRegistry[K];
// /* prettier-ignore */
// export function transformXalor<
//   K extends keyof ISolidRegistry,
//   _M extends 'merge',
// >(injectedKey: K, injectedMode: 'merge', ctx: TMergeContext): ISolidRegistry[K];
// /* prettier-ignore */
// export function transformXalor<
//   K extends keyof ISolidRegistry,
//   _M extends 'flatten',
// >(injectedKey: K, injectedMode: 'flatten', ctx: TFlattenDataContext): Record<string, string | number | boolean>;
// export function transformXalor<
//   K extends keyof ISolidRegistry,
//   M extends TTransformXalorModes,
// >(
//   injectedKey?: K,
//   injectedMode?: M,
//   ctx?: TTransformContext<K, M>,
// ): ISolidRegistry[K] | Record<string, string | number | boolean> | void {
//   if (!injectedKey || !injectedMode || !ctx) {
//     throw new Error(
//       `[xalor] 🚨 GATEWAY BLOCK: 'transformXalor' executed without compiled metadata properties.\n` +
//         `Ensure your build-time transformer plugin is active.`,
//     );
//   }
//   const activeShape = XalethorService.blueprintVault(injectedKey);
//   if (!activeShape) {
//     throw new Error(
//       `[xalor] 🚨 Transformation failed: Blueprint missing from Vault for key: ${injectedKey}`,
//     );
//   }
//   const TRANSFORMATION_MODES: TTransformStrategyEngine<K> = {
//     pick: (_key, context) => {
//       const { keys, data } = context;
//       const stringKeysCollection = keys.map(String);
//       const activeFilterSet = new Set<string>(stringKeysCollection);
//       /* prettier-ignore */ return XalethorService.executePickSanitizer(data, activeShape, activeFilterSet);
//     },
//     omit: (_key, context) => {
//       const { keys, data } = context;
//       const stringKeysCollection = keys.map(String);
//       const activeFilterSet = new Set<string>(stringKeysCollection);
//       /* prettier-ignore */ return XalethorService.executeOmitSanitizer(data, activeShape, activeFilterSet);
//     },
//     merge: (_key, context) => {
//       const { dataOne, dataTwo } = context;
//       /* prettier-ignore */ return XalethorService.executeMergeSanitizer(dataOne, dataTwo, activeShape);
//     },
//     flatten: (_key, context) => {
//       const { data } = context;
//       /* prettier-ignore */ return XalethorService.executeFlattenSanitizer(data, activeShape);
//     },
//   } satisfies TTransformStrategyEngine<K>;

//   return TRANSFORMATION_MODES[injectedMode](injectedKey, ctx);
// }

/// TRANFORMER SEVRVICE

// import type {
//   TTransformPickAndOmit,
//   TSanitizeSlicedObject,
//   TTransformRecursionLoop,
//   TTransformSanitize,
//   TTransformPredicate,
//   TTransformDependency,
//   TMergeDependency,
//   TPickOmitDependency,
//   TTransformMerge,
//   TTransformWorkerBase,
//   TFlattenAccumulator,
// } from '../models/types';
// import { TRANSFORM_SHAPE_MAPPER, TRANSFORM_FLATTEN_MAPPER } from '../mappers';

// import { markAsSolid, executePickOmitFork, executeMergeFork } from '../utils';
// import { isObject, isNull } from '../../shared';
// import type { TSolidShape } from '../../shared';
// import { IS_SOLID_CONFIG_ITEMS } from '../../shared/constants';

// export class XalethorVaultTransformer {
//   // ====================================================================
//   // ====================================================================
//   // ====================================================================
//   // ====================================================================
//   // PRIVATE AND PUBLIC METHODS FOR MODES
//   //
//   // MERGE, OMIT, PICK, RENAME
//   // ====================================================================
//   // ====================================================================
//   // ====================================================================
//   // ====================================================================
//   /**
//    * 🚀 UNIVERSAL STRATEGY DISPATCHER
//    *
//    * ROLE:
//    * Safely unwraps polymorphic shape union variants, ensuring that the
//    * inner callback structures align identically with the master mapper contract.
//    */
//   private static dispatchPolymorphicShape<SK extends TSolidShape['kind']>(
//     targetKind: SK,
//     targetShape: Extract<TSolidShape, { kind: SK }>,
//     targetValue: unknown,
//     dependency: TTransformDependency,
//     depth: number,
//     seenObjectsMap: Map<unknown, unknown>,
//     predicate: TTransformPredicate,
//   ): unknown {
//     const executeStrategy = <K extends TSolidShape['kind']>(
//       kindToken: K,
//       shapeNode: Extract<TSolidShape, { kind: K }>,
//     ): unknown => {
//       const internalStrategyWorker = TRANSFORM_SHAPE_MAPPER[kindToken];

//       const recurseCallback: TTransformRecursionLoop = (v, s, f, d) => {
//         /* prettier-ignore */
//         return this.sanitize({ val: v, currentShape: s, dependency: f, depth: d, seenObjectsMap, predicate });
//       };

//       return internalStrategyWorker(
//         shapeNode,
//         targetValue,
//         dependency,
//         depth,
//         recurseCallback,
//       );
//     };

//     return executeStrategy(targetKind, targetShape);
//   }

//   /**
//    * 🔪 INTERNAL OBJECT SLICING & MUTATION ENGINGE WORKER
//    *
//    * ROLE:
//    * Dynamically forks key allocation algorithms by evaluating the explicit dependency.mode tag.
//    */
//   private static sliceObjectProperties(
//     context: TSanitizeSlicedObject,
//   ): unknown {
//     const { val, currentShape, dependency } = context;

//     // In merge mode, find which object reference contains the rich class instance.
//     // If dependency.patchData holds a class instance, extract its proto; otherwise, default to val.
//     let targetProto = Object.getPrototypeOf(val || {});

//     if (dependency.mode === 'merge' && dependency.patchData) {
//       const patchProto = Object.getPrototypeOf(dependency.patchData);
//       if (patchProto && patchProto !== Object.prototype) {
//         targetProto = patchProto;
//       }
//     }

//     const cleanObj = Object.create(targetProto);

//     // ✔️ FIX: Symmetrical Dual-Graph Pointer Registration!
//     // Record baseline object reference in the circular lookup cache table natively
//     context.seenObjectsMap.set(val, cleanObj);

//     // If a merge pass is active, record the patch element reference to the same output container reference!
//     // This allows either parent back-reference pointer to successfully clear cache checks deeper down the tree wire.
//     if (dependency.mode === 'merge' && dependency.patchData) {
//       context.seenObjectsMap.set(dependency.patchData, cleanObj);
//     }

//     // Pack parameters bundle for standalone workers
//     const workerBundle: TTransformWorkerBase = {
//       ...context,
//       cleanObj,
//       dataRef: val,
//       props: currentShape.properties,
//       sanitizeHandler: (args) => this.sanitize(args),
//     };
//     // ========================================================================
//     // 🎛️ FORK ROUTE 1 & 2: EVALUATES SELECTION PIPELINES ('pick' / 'omit')
//     // ========================================================================
//     if (dependency.mode === 'pick' || dependency.mode === 'omit') {
//       return executePickOmitFork({
//         ...workerBundle,
//         dependency: dependency as TPickOmitDependency,
//       });
//     }
//     // ========================================================================
//     // 🎛️ FORK ROUTE 3: EVALUATES NOMINAL KEY TRANSLATIONS ('rename')
//     // ========================================================================

//     // ========================================================================
//     // 🎛️ FORK ROUTE 4: EVALUATES ENTITY AGGREGATIONS ('merge')
//     // ========================================================================
//     if (dependency.mode === 'merge') {
//       return executeMergeFork({
//         ...workerBundle,
//         dependency: dependency as TMergeDependency,
//       });
//     }

//     return cleanObj;
//   }

//   /**
//    * CORE RECURSIVE SANITIZER GATE
//    */
//   private static sanitize({
//     val,
//     currentShape,
//     dependency,
//     depth,
//     seenObjectsMap,
//     predicate,
//   }: TTransformSanitize): unknown {
//     const { reifyLimit } = IS_SOLID_CONFIG_ITEMS;
//     if (depth > reifyLimit.maxDepth) return null;
//     // !!! NOTE: conditional below caution.
//     if (val === null || typeof val !== 'object') return val;
//     if (seenObjectsMap.has(val)) return seenObjectsMap.get(val);
//     if (!currentShape) return val;

//     const kind = currentShape.kind;

//     /* prettier-ignore */
//     if (kind === 'object') return this.sliceObjectProperties({ val, currentShape: currentShape, dependency, depth, seenObjectsMap, predicate });

//     const activePredicate: TTransformPredicate = predicate ?? (() => true);
//     /* prettier-ignore */
//     return this.dispatchPolymorphicShape(kind, currentShape, val, dependency, depth, seenObjectsMap, activePredicate);
//   }

//   public static transformPickAndOmit<K extends keyof ISolidRegistry>({
//     data,
//     shape,
//     filterSet,
//     predicate,
//     mode,
//   }: TTransformPickAndOmit & { mode: 'pick' | 'omit' }): ISolidRegistry[K] {
//     const seenObjectsMap = new Map<unknown, unknown>();
//     const pickOmitEnvelope: TPickOmitDependency = {
//       mode: mode,
//       set: filterSet,
//     };

//     /* prettier-ignore */
//     const rawResultObj = this.sanitize({ val: data, currentShape: shape, dependency: pickOmitEnvelope, depth: 0, seenObjectsMap, predicate: predicate as TTransformPredicate });

//     if (markAsSolid<K, ISolidRegistry[K]>(rawResultObj)) {
//       return rawResultObj;
//     }
//     throw new Error(
//       `[xalor] Critical Failure: Failed to brand mutation output structure graph.`,
//     );
//   }

//   /**
//    * 🧬 PUBLIC EXECUTOR: MULTI-ENTITY AGGREGATIONS ('merge')
//    *
//    */
//   public static transformMerge<K extends keyof ISolidRegistry>({
//     dataOne,
//     dataTwo,
//     shape,
//   }: TTransformMerge): ISolidRegistry[K] {
//     const seenObjectsMap = new Map<unknown, unknown>();
//     const mergeEnvelope: TMergeDependency = {
//       mode: 'merge',
//       patchData: dataOne,
//     };

//     /* prettier-ignore */
//     const rawResultObj = this.sanitize({ val: dataTwo, currentShape: shape, dependency: mergeEnvelope, depth: 0, seenObjectsMap });

//     if (markAsSolid<K, ISolidRegistry[K]>(rawResultObj)) {
//       return rawResultObj;
//     }
//     throw new Error(
//       `[xalor] Critical Failure: Failed to brand merge mutation output structure graph.`,
//     );
//   }
//   // ====================================================================
//   // ====================================================================
//   // ====================================================================
//   // ====================================================================
//   // PRIVATE AND PUBLIC METHODS FOR MODE -- Flat
//   // ====================================================================
//   // ====================================================================
//   // ====================================================================
//   // ====================================================================
//   private static dispatchFlattenShape<SK extends TSolidShape['kind']>(
//     targetKind: SK,
//     targetShape: Extract<TSolidShape, { kind: SK }>,
//     targetValue: unknown,
//     accumulator: TFlattenAccumulator,
//     currentPath: string,
//     depth: number,
//     seenObjectsMap: Set<unknown>,
//   ): void {
//     const executeStrategy = <K extends TSolidShape['kind']>(
//       kindToken: K,
//       shapeNode: Extract<TSolidShape, { kind: K }>,
//     ): void => {
//       const internalStrategyWorker = TRANSFORM_FLATTEN_MAPPER[kindToken];
//       /* prettier-ignore */
//       const recurseCallback = (v: unknown, s: TSolidShape, a: TFlattenAccumulator, p: string, d: number, seen: Set<unknown>) => {
//         this.executeFlattenProcessor(v, s, a, p, d, seen);
//       };
//       // TODO: FI TYPE ISSUE
//       /* prettier-ignore */
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       internalStrategyWorker(shapeNode as any, targetValue, accumulator, currentPath, depth, seenObjectsMap, recurseCallback);
//     };

//     executeStrategy(targetKind, targetShape);
//   }
//   private static executeFlattenProcessor(
//     val: unknown,
//     currentShape: TSolidShape,
//     accumulator: TFlattenAccumulator,
//     currentPath: string,
//     depth: number,
//     seenObjectsMap: Set<unknown>,
//   ): void {
//     const { reifyLimit } = IS_SOLID_CONFIG_ITEMS;
//     // THE DEPTH LAW (Security control check)
//     if (depth > reifyLimit.maxDepth) return;

//     // Circular loop memory stack boundary intercept validation
//     if (isObject(val) && !isNull(val)) {
//       if (seenObjectsMap.has(val)) return;
//       seenObjectsMap.add(val);
//     }

//     if (!currentShape) return;

//     const kind = currentShape.kind;

//     /* prettier-ignore */
//     this.dispatchFlattenShape(kind, currentShape, val, accumulator, currentPath, depth, seenObjectsMap);
//   }
//   /**
//    * 📊 PUBLIC EXECUTOR: HIERARCHICAL DECOMPRESSION ('flatten')
//    *
//    * ROLE:
//    * Initializes a fresh linear state accumulator canvas tracking context frame for flat mappings.
//    */
//   public static transformFlatten({
//     data,
//     shape,
//   }: {
//     readonly data: unknown;
//     readonly shape: TSolidShape;
//   }): Record<string, string | number | boolean> {
//     const accumulator: Record<string, string | number | boolean> = {};
//     const seenObjectsMap = new Set<unknown>();
//     /* prettier-ignore */
//     this.executeFlattenProcessor(data, shape, accumulator, '', 0, seenObjectsMap);
//     return accumulator;
//   }
// }

// HELPERS
// import { isObject, isSet } from '../../../shared';
// import type {
//   TExecuteMergeFork,
//   TExecutePickOmitFork,
//   TPickOmitDependency,
//   TMergeDependency,
// } from '../../models/types';
// /**
//  * 🔍 PREDICATE EXECUTIONER: FIELD SELECTIVE RETENTION (PICK MODE)
//  *
//  * ROLE:
//  * Evaluates target schema field tokens against the user-supplied filtering context tracking set.
//  * Explicitly determines whether a field layout graph edge should be retained or sliced away.
//  *
//  * BEHAVIORAL MATRIX:
//  * - If the active properties collection filter Set is empty, evaluates flatly to `true` (pass-through).
//  * - Matches root property string keys directly via high-performance O(1) hashing operations (`has`).
//  * - Parses compound template literal dot-notation strings recursively to support nested lookups (e.g., 'items.SKU').
//  * - If the current field acts as a namespace prefix directory path or contains child elements targeted for sub-slicing,
//  *   retains the parent structure natively (`true`) to allow deeper matrix walks.
//  *
//  * @param fieldKey - The raw string name accessor of the property currently being evaluated by the loop stack frame.
//  * @param propertiesSet - The source filtering context tracking Set containing explicit developer selection coordinates.
//  * @param _depth - The tracking index counter tracking the absolute current nesting tier position within the graph tree.
//  * @returns Boolean value where `true` authorizes a clone allocation pass, and `false` forces property deletion.
//  */
// export const pickPredicateExecutioner = (
//   fieldKey: string,
//   propertiesSet: Set<string> | Record<string, string>,
//   _depth: number,
// ) => {
//   if (!isSet(propertiesSet)) return true;

//   const hasDirectMatch = propertiesSet.has(fieldKey);

//   const hasNestedMatch = Array.from(propertiesSet).some((path) => {
//     const pathSegments = path.split('.');
//     return pathSegments.includes(fieldKey) || path.startsWith(`${fieldKey}.`);
//   });

//   return hasDirectMatch || hasNestedMatch;
// };
// /**
//  * ✂️ PREDICATE EXECUTIONER: FIELD STRUCTURAL EXCLUSION (OMIT MODE)
//  *
//  * ROLE:
//  * Evaluates target schema field tokens against the user-supplied filtering context tracking set.
//  * Explicitly determines whether a field layout graph edge should be discarded or kept intact.
//  *
//  * BEHAVIORAL MATRIX (OMIT INVERSION LAW):
//  * - Operates as the strict logical inverse of the `pick` predicate engine block.
//  * - If the active properties collection filter Set is empty, evaluates flatly to `true` (maintains payload state).
//  * - Implements a double-negative assertion lookup track: blocks matching keys immediately at the root entrance layer.
//  * - If any compound nested path target matches the current namespace sequence (e.g., 'profile.secretToken' under 'profile'),
//  *   safely allows the parent graph bridge entry (`true`) so sub-slicing rules can evaluate individual deep nodes.
//  *
//  * @param fieldKey - The raw string name accessor of the property currently being evaluated by the loop stack frame.
//  * @param propertiesSet - The source filtering context tracking Set containing explicit developer exclusion coordinates.
//  * @param _depth - The tracking index counter tracking the absolute current nesting tier position within the graph tree.
//  * @returns Boolean value where `true` preserves the property edge, and `false` drops the value payload entirely.
//  */
// export const omitPredicateExecutioner = (
//   fieldKey: string,
//   propertiesSet: Set<string> | Record<string, string>,
//   _depth: number,
// ) => {
//   if (!isSet(propertiesSet)) return true;

//   const hasDirectMatch = propertiesSet.has(fieldKey);

//   const hasNestedMatch = Array.from(propertiesSet).some((path) => {
//     const pathSegments = path.split('.');
//     return pathSegments.includes(fieldKey) || path.startsWith(`${fieldKey}.`);
//   });

//   if (hasDirectMatch) return false;
//   if (hasNestedMatch) return true;

//   return true;
// };
// //sliceObjectProperties
// // ========================================================================================================
// // ========================================================================================================
// // ========================================================================================================
// // TRANSFORMER SLICED PROPERTIES
// // ========================================================================================================
// // ========================================================================================================
// // ========================================================================================================

// /**
//  * 🔪 UTILITY WORKER: SELECTION PIPELINES (PICK & OMIT MODES)
//  *
//  * ROLE:
//  * Iterates strictly over authoritative blueprint keys, evaluating field keys via path-aware predicates.
//  */
// export function executePickOmitFork({
//   val,
//   dependency,
//   depth,
//   predicate,
//   cleanObj,
//   dataRef,
//   props,
//   seenObjectsMap,
//   sanitizeHandler,
// }: TExecutePickOmitFork): Record<string, unknown> {
//   const activeSet = dependency.set;

//   if (predicate && isSet(activeSet)) {
//     for (const key of Object.keys(props)) {
//       const metadata = props[key];

//       if (
//         metadata &&
//         metadata.shape &&
//         Object.prototype.hasOwnProperty.call(val || {}, key)
//       ) {
//         if (predicate(key, activeSet, depth) && isObject(dataRef)) {
//           const rawSourceValue = (dataRef as Record<string, unknown>)[key];

//           const childSet = new Set<string>();
//           for (const path of activeSet) {
//             if (path.startsWith(`${key}.`)) {
//               childSet.add(path.slice(key.length + 1));
//             } else if (path === key && dependency.mode === 'pick') {
//               if (metadata.shape.kind === 'object') {
//                 for (const childKey of Object.keys(metadata.shape.properties)) {
//                   childSet.add(childKey);
//                 }
//               }

//               if (
//                 metadata.shape.kind === 'array' &&
//                 metadata.shape.items.kind === 'object'
//               ) {
//                 for (const childKey of Object.keys(
//                   metadata.shape.items.properties,
//                 )) {
//                   childSet.add(childKey);
//                 }
//               }
//             }
//           }

//           const childDependency: TPickOmitDependency = {
//             mode: dependency.mode,
//             set: childSet.size > 0 ? childSet : activeSet,
//           };

//           /* prettier-ignore */ cleanObj[key] = sanitizeHandler({ val: rawSourceValue, currentShape: metadata.shape, dependency: childDependency, depth: depth + 1, seenObjectsMap, predicate,});
//         }
//       }
//     }
//   }
//   return cleanObj;
// }

// /**
//  * 🔪 UTILITY WORKER: ENTITY AGGREGATIONS (MERGE MODE)
//  *
//  * BEHAVIOR:
//  * Deep-merges twin data layers, generating isolated child contexts dynamically down stack frames.
//  */
// export function executeMergeFork({
//   val,
//   dependency,
//   depth,
//   predicate,
//   cleanObj,
//   props,
//   seenObjectsMap,
//   sanitizeHandler,
// }: TExecuteMergeFork): Record<string, unknown> {
//   const baseDataRef = (val as Record<string, unknown>) || {};
//   const patchRef = (dependency.patchData as Record<string, unknown>) || {};

//   for (const key of Object.keys(props)) {
//     const metadata = props[key];

//     if (metadata && metadata.shape) {
//       const val1 = baseDataRef[key];
//       const val2 = patchRef[key];

//       const childDependency: TMergeDependency = {
//         mode: 'merge',
//         patchData: val2,
//       };

//       const targetActiveBaseValue = val1 !== undefined ? val1 : val2;

//       /* prettier-ignore */ cleanObj[key] = sanitizeHandler({ val: targetActiveBaseValue, currentShape: metadata.shape, dependency: childDependency, depth: depth + 1, seenObjectsMap, predicate });
//     }
//   }
//   return cleanObj;
// }
