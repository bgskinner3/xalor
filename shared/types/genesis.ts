import type { TSolidShape } from '../shape-domain';
/**
 * TSHAPE_NORMALIZER_MAPPER
 *
 * ROLE:
 * The static compiler-layer blueprint contract for the Banker Engine.
 * Drives build-time Content-Addressable Storage (CAS) shredding by forcing
 * exhaustive mapping routines to isolate, index, and deduplicate sub-properties.
 */
export type TShapeNormalizerMapper = {
  [K in TSolidShape['kind']]: (
    shape: Extract<TSolidShape, { kind: K }>,
    flatPool: Record<string, TSolidShape>,
    recurse: (s: TSolidShape, pool: Record<string, TSolidShape>) => TSolidShape,
  ) => TSolidShape;
};
/**
 * TSHAPE_INFLATOR_MAPPER
 *
 * ROLE:
 * The static database de-serialization contract for Stage 5 (Hydration).
 * Enforces strict dictionary compilation paths to expand content-addressable
 * pointer strings recursively into inline execution graphs in active RAM.
 */
// export type TShapeInflatorMapper = {
//   [K in TSolidShape['kind']]: (
//     shape: Extract<TSolidShape, { kind: K }>,
//     blueprintsPool: Record<string, TSolidShape>,
//     recurse: (s: TSolidShape, pool: Record<string, TSolidShape>) => TSolidShape,
//   ) => TSolidShape;
// };

export type TShapeInflatorMapper = {
  [K in TSolidShape['kind']]: (
    shape: Extract<TSolidShape, { kind: K }>,
    blueprintsPool: Record<string, TSolidShape>,
    recurse: (
      s: TSolidShape,
      pool?: Record<string, TSolidShape>,
    ) => TSolidShape,
    // 🧠 SYSTEM ANCHOR: Tracks current cyclic parent addresses up the call stack frame
    seen: Map<string, TSolidShape>,
  ) => TSolidShape;
};
