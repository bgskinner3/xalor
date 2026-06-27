import { IS_SOLID_CONFIG_ITEMS } from '../../../shared';
import type { TSolidShape } from '../../../shared';
import { CLONE_SHAPE_SANITIZER_MAPPER } from '../../mappers';

/**
 * 🧼 PRODUCE CLONE
 *
 * ROLE:
 * Performs a deep, circular-safe copy of an input object while
 * physically scrubbing away any keys missing from the TSolidShape blueprint.
 *
 * LAW: Zero 'any', Zero type assertions ('as'), and Zero 'switch' blocks.
 */
export function produceClone(
  data: unknown,
  shape: TSolidShape,
  seen = new Map<unknown, unknown>(),
  depth = 0,
): unknown {
  if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) {
    return null;
  }

  if (data === null || typeof data !== 'object') {
    return data;
  }

  const cached = seen.get(data);
  if (cached !== undefined) {
    return cached;
  }

  if (!shape) return data;

  const executeCloneSanitizer = <K extends TSolidShape['kind']>(
    kind: K,
    targetShape: Extract<TSolidShape, { kind: K }>,
  ): unknown => {
    const sanitizer = CLONE_SHAPE_SANITIZER_MAPPER[kind];
    return sanitizer(targetShape, data, seen, depth, produceClone);
  };

  return executeCloneSanitizer(shape.kind, shape);
}
