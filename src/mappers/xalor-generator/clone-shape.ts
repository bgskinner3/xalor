import type { TShapeCloneMapperMap } from '../../models/types';
import { isObject, isNull, isFunction } from '../../../shared/utils/guards';
import { XalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import { IS_SOLID_CONFIG_ITEMS } from '../../../shared';
import { validateShape, createInitialContext } from '../../validation';

/**
 * ============================================================================
 * 🧼 DESIGN SYSTEM MAPPER: CLONE SHAPE SANITIZER
 * ============================================================================
 *
 * ROLE:
 * The "Sanitizer." Performs a deep, circular-safe scrubbing copy of data,
 * physically removing any keys or structural elements NOT defined in the blueprint.
 *
 * @see produceClone
 */
export const CLONE_SHAPE_SANITIZER_MAPPER: TShapeCloneMapperMap = {
  primitive: (_shape, data) => data, // Primitives are immutable pass-through nodes

  literal: (shape, data) => (data === shape.value ? data : null),

  object: (shape, data, seen, depth, recurse) => {
    if (!isObject(data) || isNull(data)) return null;

    const proto = Object.getPrototypeOf(data);
    const cleanObj = Object.create(proto);

    seen.set(data, cleanObj);

    const blueprintProps = shape.properties;

    for (const key in blueprintProps) {
      if (!Reflect.has(blueprintProps, key)) continue;
      if (!Reflect.has(data as object, key)) continue;

      const metadata = blueprintProps[key];

      const value = recurse(
        (data as Record<string, unknown>)[key],
        metadata.shape,
        seen,
        depth + 1,
      );

      if (value !== null) {
        cleanObj[key] = value;
      }
    }

    return cleanObj;
  },
  array: (shape, data, seen, depth, recurse) => {
    if (!Array.isArray(data)) return [];

    const copy: unknown[] = [];
    seen.set(data, copy);

    const limit = Math.min(
      data.length,
      IS_SOLID_CONFIG_ITEMS.reifyLimit.maxObjectProperties,
    );

    for (let i = 0; i < limit; i++) {
      const value = recurse(data[i], shape.items, seen, depth + 1);
      copy[i] = value;
    }

    return copy;
  },
  union: (shape, data, seen, depth, recurse) => {
    // Union Sniffing: Locate which sub-branch validly parses this payload shape
    const matchingBranch = shape.values.find((branch) =>
      validateShape(data, branch, createInitialContext()),
    );

    return matchingBranch ? recurse(data, matchingBranch, seen, depth) : null;
  },

  reference: (shape, data, seen, depth, recurse) => {
    const subShape = XalethorVaultKeeper.peek('blueprint', shape.name);
    return subShape ? recurse(data, subShape, seen, depth) : data;
  },

  branded: (shape, data, seen, depth, recurse) =>
    recurse(data, shape.base, seen, depth),
  function: (_shape, data) => {
    if (!isFunction(data)) return null;

    // sanitize: preserve callable identity only
    // (do NOT execute or inspect arguments)
    return data;
  },
  intersection: (shape, data, seen, depth, recurse) => {
    if (!data || typeof data !== 'object') return null;

    let acc: unknown = data;

    for (const part of shape.values) {
      acc = recurse(acc, part, seen, depth + 1);

      if (acc === null) return null;
    }

    return acc;
  },
  instanceof: (shape, data) => {
    if (data == null) return null;

    const ctorName = (data as { constructor?: { name?: string } })?.constructor
      ?.name;

    return ctorName === shape.name ? data : null;
  },
} satisfies TShapeCloneMapperMap;
