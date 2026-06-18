import { computeStableShapeHash } from '../../shared/utils';
import type {
  TSolidObjectRawShape,
  TSolidShape,
  TShapeNormalizerMapper,
  TShapeInflatorMapper,
} from '../../shared';
/**
 * ============================================================================
 * BUILD-TIME ENCODE MAP: EXTRACT SHAPE NORMALIZERS
 * ============================================================================
 *
 * ROLE:
 * The "De-duplicator." Performs a recursive, content-addressable shredding pass
 * during Stage 4 (Persist) to compress structural layouts before writing to disk.
 *
 * STRATEGY:
 * - Targeted Shredding: Isolates 'object' schemas, replaces them with deterministically
 *   hashed reference tokens ('sh_'), and pushes them flatly into the global database pool.
 * - Value Inlining: Leaves scalars (primitives, literals) and wrappers (arrays, unions)
 *   inline to eliminate empty reference token bloat and optimize downstream reads.
 *
 * WHY:
 * Converts deep, redundant, object dependency trees into a highly compacted,
 * single-instance structural grid—saving massive disk space across monorepos.
 *
 * @see XalethorVaultArchive.persist
 */
export const EXTRACT_SHAPE_NORMALIZERS: TShapeNormalizerMapper = {
  object: (shape, flatPool, recurse) => {
    const normalizedProps: Record<string, TSolidObjectRawShape> = {};
    for (const key in shape.properties) {
      if (Reflect.has(shape.properties, key)) {
        const prop = shape.properties[key];
        normalizedProps[key] = {
          ...prop,
          shape: recurse(prop.shape, flatPool),
        };
      }
    }
    const cleanObjectShape: TSolidShape = {
      ...shape,
      properties: normalizedProps,
    };

    const objectHash = computeStableShapeHash(cleanObjectShape);
    flatPool[objectHash] = cleanObjectShape;
    return { kind: 'reference', name: objectHash };
  },
  array: (shape, flatPool, recurse) => {
    const baseNormalized = {
      ...shape,
      items: recurse(shape.items, flatPool),
    };
    if (shape.elementShapes) {
      return {
        ...baseNormalized,
        elementShapes: shape.elementShapes.map((element) =>
          recurse(element, flatPool),
        ),
      };
    }
    return baseNormalized;
  },
  union: (shape, flatPool, recurse) => ({
    ...shape,
    values: shape.values.map((v) => recurse(v, flatPool)),
  }),
  intersection: (shape, flatPool, recurse) => ({
    ...shape,
    values: shape.values.map((v) => recurse(v, flatPool)),
  }),
  branded: (shape, flatPool, recurse) => ({
    ...shape,
    base: recurse(shape.base, flatPool),
  }),
  function: (shape, flatPool, recurse) => ({
    ...shape,
    parameters: shape.parameters.map((param) => ({
      ...param,
      shape: recurse(param.shape, flatPool),
    })),
    returnType: recurse(shape.returnType, flatPool),
  }),
  primitive: (shape) => shape,
  literal: (shape) => shape,
  reference: (shape) => shape,
  instanceof: (shape) => shape,
} satisfies TShapeNormalizerMapper;

/**
 * ============================================================================
 * RUNTIME DECODE MAP: BUILD SHAPE INFLATORS
 * ============================================================================
 *
 * ROLE:
 * The "Re-Assembler." Performs a single-pass inverse tree reconstruction on boot
 * during Stage 5 (Hydrate) to expand flat hashes back into full memory definitions.
 *
 * STRATEGY:
 * - Relational Expansion: Intercepts 'sh_' hash string indicators, jumps to the flat
 *   database snapshot table, and embeds the structural object properties deep inside.
 * - Nominal Isolation: Detects original compiler nominal fragments (like User$d10)
 *   and allows them to bypass the map to maintain cross-fragment tracking for the Bouncer.
 *
 * WHY:
 * Resolves the entire graph data matrix *prizzor* to inserting blueprints into memory.
 * This ensures your validation runs carrying zero map-hopping lookup overhead.
 *
 * @see XalethorVaultArchive.hydrateFromGenesis
 */
export const BUILD_SHAPE_INFLATORS: TShapeInflatorMapper = {
  reference: (shape, blueprintsPool, recurse, seen) => {
    const targetHashKey = shape.name;

    if (Reflect.has(blueprintsPool, targetHashKey)) {
      if (seen.has(targetHashKey)) {
        return seen.get(targetHashKey)!;
      }

      // Forward the active target hash key identifier natively down the recursion stream
      return recurse(
        blueprintsPool[targetHashKey],
        blueprintsPool,
        targetHashKey,
      );
    }

    return shape;
  },

  object: (shape, blueprintsPool, recurse, seen, activeHashKey) => {
    const inflatedProps: Record<string, TSolidObjectRawShape> = {};
    const proxyStub: TSolidShape = { ...shape, properties: inflatedProps };

    // Constant-time O(1) tracking assignment using the inherited tracking string parameter context
    if (activeHashKey !== undefined) {
      seen.set(activeHashKey, proxyStub);
    }

    for (const key in shape.properties) {
      if (Reflect.has(shape.properties, key)) {
        const prop = shape.properties[key];
        inflatedProps[key] = {
          ...prop,
          shape: recurse(prop.shape, blueprintsPool, undefined),
        };
      }
    }

    if (activeHashKey !== undefined) {
      seen.delete(activeHashKey);
    }

    return proxyStub;
  },

  array: (shape, blueprintsPool, recurse, _seen) => {
    const baseInflated = {
      ...shape,
      items: recurse(shape.items, blueprintsPool),
    };

    if (shape.elementShapes !== undefined) {
      return {
        ...baseInflated,
        elementShapes: shape.elementShapes.map((element) =>
          recurse(element, blueprintsPool),
        ),
      };
    }

    return baseInflated;
  },

  union: (shape, blueprintsPool, recurse, _seen) => ({
    ...shape,
    values: shape.values.map((v) => recurse(v, blueprintsPool)),
  }),

  branded: (shape, blueprintsPool, recurse, _seen) => ({
    ...shape,
    base: recurse(shape.base, blueprintsPool),
  }),

  intersection: (shape, blueprintsPool, recurse, _seen) => ({
    ...shape,
    values: shape.values.map((v) => recurse(v, blueprintsPool)),
  }),

  function: (shape, blueprintsPool, recurse, _seen) => ({
    ...shape,
    parameters: shape.parameters.map((param) => ({
      ...param,
      shape: recurse(param.shape, blueprintsPool),
    })),
    returnType: recurse(shape.returnType, blueprintsPool),
  }),

  // Terminal scalar shapes require no recursive unboxing passes—return cleanly unchanged
  primitive: (shape) => shape,
  literal: (shape) => shape,
  instanceof: (shape) => {
    // intentionally no resolution here
    // inflator remains structural-only
    // !!! inflator does NOT ask “what does this mean?”
    return shape;
  },
} satisfies TShapeInflatorMapper;
