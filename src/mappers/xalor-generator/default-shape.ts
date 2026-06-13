import type { TShapeDefaultMaterializeMap } from '../../models/types';
import { ObjectUtils } from '../../../shared';
import { PRIMITIVE_DEFAULTS } from '../../models/constants';
import { XalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import { isObject } from '../../../shared';
import type { InstanceRegistryKey } from '../../../shared';
import { shapeKindUtilsService } from '../../../shared/service';
const INSTANCE_REGISTRY_MAPPER = {
  Date: {
    ctor: Date,
    create: () => new Date(0),
  },

  RegExp: {
    ctor: RegExp,
    create: () => new RegExp(``),
  },

  Map: {
    ctor: Map,
    create: () => new Map(),
  },

  Set: {
    ctor: Set,
    create: () => new Set(),
  },

  URL: {
    ctor: URL,
    create: () => new URL('https://example.com'),
  },

  Promise: {
    ctor: Promise,
    create: () => Promise.resolve(undefined),
  },
};
export function resolveInstanceFactory(
  key: InstanceRegistryKey,
): () => unknown {
  return INSTANCE_REGISTRY_MAPPER[key].create;
}
/**
 * ============================================================================
 * 🏗️ DESIGN SYSTEM MAPPER: DEFAULT SHAPE MATERIALIZER
 * ============================================================================
 *
 * ROLE:
 * The "Materializer." Converts static structural TSolidShape blueprints into
 * physical, clean, zero-value JavaScript objects. It acts as the core
 * "3D Printer" of the Factory Layer (Category 3 Generator API).
 * @see produceDefault
 */
export const DEFAULT_SHAPE_MATERIALIZER: TShapeDefaultMaterializeMap = {
  primitive: (shape) => PRIMITIVE_DEFAULTS[shape.type],
  literal: (shape) => shape.value,

  object: (shape, depth, recurse) => {
    const obj: Record<string, unknown> = {};
    const keys = ObjectUtils.keys(shape.properties);

    for (const key of keys) {
      const metadata = shape.properties[key];

      if (!metadata.optional) {
        obj[key] = recurse(metadata.shape, depth + 1);
      }
    }
    return obj;
  },

  array: () => [],

  union: (shape, depth, recurse) => {
    const firstBranch = shape.values[0];
    return firstBranch ? recurse(firstBranch, depth + 1) : undefined;
  },

  reference: (shape, depth, recurse) => {
    const subShape = XalethorVaultKeeper.peek('blueprint', shape.name);
    return subShape ? recurse(subShape, depth + 1) : undefined;
  },

  branded: (shape, depth, recurse) => recurse(shape.base, depth + 1),

  function: (shape, depth, recurse) => {
    const fn = (..._args: unknown[]) => recurse(shape.returnType, depth + 1);
    return fn;
  },
  instanceof: (shape) => {
    const instanceKind = shapeKindUtilsService.getInstanceOfKind(shape.name);
    return instanceKind.def();
  },
  intersection: (shape, depth, recurse) => {
    const result: Record<string, unknown> = {};

    for (const part of shape.values) {
      const value = recurse(part, depth + 1);

      if (value && isObject(value)) {
        for (const [k, v] of Object.entries(value)) {
          if (result[k] === undefined) {
            result[k] = v;
          }
        }
      }
    }

    return result;
  },
} satisfies TShapeDefaultMaterializeMap;
