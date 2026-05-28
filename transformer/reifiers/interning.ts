// transformer/miner/interning.ts
import type { TSolidShape } from '../../shared';
/**
 * SHAPE FINGERPRINTS
 * A private cache that stores unique structures.
 * Key: Stringified JSON (The DNA)
 * Value: The actual TSolidShape object (The Memory Reference)
 */
const shapeCache = new Map<string, TSolidShape>();

export function internShape(shape: TSolidShape): TSolidShape {
  const fingerprint = JSON.stringify(shape);

  const existing = shapeCache.get(fingerprint);

  if (existing) {
    return existing;
  }

  shapeCache.set(fingerprint, shape);
  return shape;
}
