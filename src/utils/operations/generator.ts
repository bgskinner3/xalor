import { IS_SOLID_CONFIG_ITEMS } from '../../../shared/constants';
import type { TSolidShape } from '../../../shared/shape-domain/types';
import {
  DEFAULT_SHAPE_MATERIALIZER,
  MOCK_SHAPE_MATERIALIZER,
  CAST_SHAPE_MAPPER,
} from '../../mappers';
// TODO: add proper return type for mocks, default clones ...
/**
 *  PRODUCE Defualt
 *
 * ROLE:
 */
export function produceDefault(shape: TSolidShape, depth = 0): unknown {
  if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) return null;

  if (!shape) return undefined;

  const executeMaterializer = <K extends TSolidShape['kind']>(
    kind: K,
    targetShape: Extract<TSolidShape, { kind: K }>,
  ): unknown => {
    const materializer = DEFAULT_SHAPE_MATERIALIZER[kind];
    return materializer(targetShape, depth, produceDefault);
  };

  // Pass the shape kind and target payload straight into the generic runner.
  // This satisfies the compiler perfectly with 100% compile-time security.
  return executeMaterializer(shape.kind, shape);
}

/**
 * PRODUCE MOCK
 *
 * ROLE:
 * Converts a static TSolidShape blueprint into a randomized, high-entropy
 * physical mock layout using a clean O(1) dictionary lookup map.
 *
 * LAW: Zero 'any', Zero type assertions ('as'), and Zero 'switch' blocks.
 */
export function produceMock(shape: TSolidShape, depth = 0): unknown {
  if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) return null;

  if (!shape) return undefined;

  const executeMockMaterializer = <K extends TSolidShape['kind']>(
    kind: K,
    targetShape: Extract<TSolidShape, { kind: K }>,
  ): unknown => {
    const normalizer = MOCK_SHAPE_MATERIALIZER[kind];
    return normalizer(targetShape, depth, produceMock);
  };

  return executeMockMaterializer(shape.kind, shape);
}

/**
 * 🧹 PRODUCE CAST
 *
 * ROLE:
 * Coerces loose runtime data values cleanly into the exact structural and
 * primitive types demanded by your type blueprint contracts.
 *
 * LAW: Zero 'any', Zero type assertions ('as'), and Zero 'switch' blocks.
 */
export function produceCast(
  shape: TSolidShape,
  data: unknown,
  depth = 0,
): unknown {
  if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) {
    return data;
  }
  if (!shape) return data;

  const executeCastMaterializer = <K extends TSolidShape['kind']>(
    kind: K,
    targetShape: Extract<TSolidShape, { kind: K }>,
  ): unknown => {
    const caster = CAST_SHAPE_MAPPER[kind];
    return caster(targetShape, data, depth, produceCast);
  };

  return executeCastMaterializer(shape.kind, shape);
}
