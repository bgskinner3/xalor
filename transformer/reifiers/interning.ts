// transformer/miner/interning.ts
import type { TSolidShape } from '../../shared';
import { computeStableShapeHash } from '../../shared';
/**
 * SHAPE FINGERPRINTS
 * A private cache that stores unique structures.
 * Key: Stringified JSON (The DNA)
 * Value: The actual TSolidShape object (The Memory Reference)
 */
const shapeCache = new Map<string, TSolidShape>();

export function internShape(shape: TSolidShape): TSolidShape {
  // FIX GAUNTLET: We eliminate JSON.stringify entirely from the evaluation pipeline.
  // We invoke our canonical bitwise fingerprinter which possesses built-in circular-reference shielding.
  const stableHashKey = computeStableShapeHash(shape);

  const existing = shapeCache.get(stableHashKey);
  if (existing) {
    return existing;
  }

  shapeCache.set(stableHashKey, shape);
  return shape;
}
