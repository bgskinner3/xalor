// shared/genesis/hydrate-from-genesis.ts
import type { TSolidShape } from '../types';
import { EXTRACT_SHAPE_NORMALIZERS, BUILD_SHAPE_INFLATORS } from './mappers';

/**
 * 🌀 RECURSIVE RE-SHREDDER
 *
 * ROLE:
 * Deeply flattens complex nested objects into a content-addressable storage map.
 *
 * STRATEGY:
 * Pure computational function. Passes its own identifier as a clean continuation
 * callback loop parameter, entirely avoiding context binding or 'this' keywords.
 *
 * WHY:
 * Satisfies Commandment VIII (Zero-Footprint Iteration). It passes operational
 * states via the stack without allocating intermediate closures.
 */
export function extractAndNormalizeShape(
  shape: TSolidShape,
  flatPool: Record<string, TSolidShape>,
): TSolidShape {
  if (!shape) return shape;

  const executeNormalizer = <K extends TSolidShape['kind']>(
    kind: K,
    targetShape: Extract<TSolidShape, { kind: K }>,
  ): TSolidShape => {
    const normalizer = EXTRACT_SHAPE_NORMALIZERS[kind];

    return normalizer(targetShape, flatPool, (nextShape) =>
      extractAndNormalizeShape(nextShape, flatPool),
    );
  };

  return executeNormalizer(shape.kind, shape);
}

/**
 * 🚀 RECURSIVE RE-ASSEMBLER
 *
 * ROLE:
 * Re-inflates serialized reference hash records back into complete nested objects.
 *
 * STRATEGY:
 * Pure runtime mapping loop. Leverages structural literal handlers to maintain
 * linear execution properties during system cold-starts.
 */
export function inflateAndNormalizeShape(
  shape: TSolidShape,
  blueprintsPool: Record<string, TSolidShape>,

  seen: Map<string, TSolidShape> = new Map(),
): TSolidShape {
  if (!shape) return shape;

  const executeInflator = <K extends TSolidShape['kind']>(
    kind: K,
    targetShape: Extract<TSolidShape, { kind: K }>,
  ): TSolidShape => {
    const inflator = BUILD_SHAPE_INFLATORS[kind];
    return inflator(
      targetShape,
      blueprintsPool,

      (nextShape) => inflateAndNormalizeShape(nextShape, blueprintsPool, seen),
      seen,
    );
  };

  return executeInflator(shape.kind, shape);
}
