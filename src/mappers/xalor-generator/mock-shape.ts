import type { TShapeMockMapperMap } from '../../models/types';
import { ObjectUtils } from '../../../shared';
import { generateRandomString } from '../../utils/transformers';
import { xalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import type { TSolidShape } from '../../../shared';
import { shapeKindUtilsService } from '../../../shared/service';
/**
 * ============================================================================
 * 🎲 DESIGN SYSTEM MAPPER: MOCK SHAPE MATERIALIZER
 * ============================================================================
 *
 * ROLE:
 * The "Simulacrum." Materializes highly realistic, randomized data structures
 * that respect your static blueprint limits while introducing structural entropy.
 *
 * @see produceMock
 */
/* prettier-ignore */ const PRIMITIVE_MOCK_GENERATORS: Record<string,(shape: TSolidShape) => unknown> = {
  string: () => generateRandomString(10),
  number: () => Math.floor(Math.random() * 1000),
  boolean: () => Math.random() > 0.5,
  bigint: () => BigInt(Math.floor(Math.random() * 1000000)),
  unknown: () => `unknown_val_${Math.random().toString(36).substring(7)}`,
} satisfies Record<string,(shape: TSolidShape) => unknown>;

export const MOCK_SHAPE_MATERIALIZER: TShapeMockMapperMap = {
  // TODO HANDLE UNKNWON
  primitive: (shape) => {
    const generator = PRIMITIVE_MOCK_GENERATORS[shape.type];
    return generator
      ? generator(shape)
      : PRIMITIVE_MOCK_GENERATORS.unknown(shape);
  },

  literal: (shape) => {
    if (Math.random() < 0.8) return shape.value;
    return undefined;
  },

  object: (shape, depth, recurse) => {
    const obj: Record<string, unknown> = {};
    const keys = ObjectUtils.keys(shape.properties);

    for (const key of keys) {
      const metadata = shape.properties[key];

      const shouldInclude = !metadata.optional || Math.random() > 0.5;

      if (shouldInclude) {
        const value = recurse(metadata.shape, depth + 1);
        if (value !== undefined) {
          obj[key] = value;
        }
      }
    }
    return obj;
  },

  array: (shape, depth, recurse) => {
    const count = Math.floor(Math.random() * 3) + 1;
    return Array.from({ length: count }, () => recurse(shape.items, depth + 1));
  },

  union: (shape, depth, recurse) => {
    const randomIndex = Math.floor(Math.random() * shape.values.length);
    const targetBranch = shape.values[randomIndex];
    return targetBranch ? recurse(targetBranch, depth + 1) : undefined;
  },
  //TODO: ircular reference test WILL eventually break mock generator
  reference: (shape, depth, recurse) => {
    if (depth > 20) return undefined;

    const subShape = xalethorVaultKeeper.peek('blueprint', shape.name);
    return subShape ? recurse(subShape, depth + 1) : undefined;
  },

  branded: (shape, depth, recurse) => recurse(shape.base, depth + 1),
  function: (shape, depth, recurse) => {
    return (..._args: unknown[]) => {
      return recurse(shape.returnType, depth + 1);
    };
  },
  intersection: (shape, depth, recurse) => {
    const result: Record<string, unknown> = {};

    for (const part of shape.values) {
      const value = recurse(part, depth + 1);

      if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          if (result[k] === undefined) {
            result[k] = v;
          }
        }
      }
    }

    return result;
  },
  instanceof: (shape) => {
    const instanceKind = shapeKindUtilsService.getInstanceOfKind(shape.name);
    return instanceKind.def();
  },
} satisfies TShapeMockMapperMap;
