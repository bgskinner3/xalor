import type { TShapeCloneMapperMap } from '../../models/types';
import { isObject, isNull } from '../../../shared';
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

    // Preserve class prototypes cleanly if tracking class instances
    const proto = Object.getPrototypeOf(data);
    const cleanObj = Object.create(proto);
    seen.set(data, cleanObj);

    // This physically strips un-declared variables from memory cache layers.
    const blueprintProps = shape.properties;
    for (const key in blueprintProps) {
      if (
        Reflect.has(blueprintProps, key) &&
        Reflect.has(data as object, key)
      ) {
        const sourceValue = data[key];
        const metadata = blueprintProps[key];

        cleanObj[key] = recurse(sourceValue, metadata.shape, seen, depth + 1);
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
      copy[i] = recurse(data[i], shape.items, seen, depth + 1);
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

  intersection: (shape, data, seen, depth, recurse) => {
    let merged: Record<string, unknown> | unknown = undefined;

    for (const part of shape.parts) {
      // 🎯 THE FIX: Pass 'data' first, and the blueprint 'part' second
      const clonedPart = recurse(data, part, seen, depth);

      if (clonedPart === null || clonedPart === undefined) continue;

      if (typeof clonedPart === 'object' && !Array.isArray(clonedPart)) {
        const currentObj = clonedPart as Record<string, unknown>;

        merged =
          merged && typeof merged === 'object' && !Array.isArray(merged)
            ? { ...(merged as Record<string, unknown>), ...currentObj }
            : currentObj;
      } else {
        merged = clonedPart;
      }
    }
    return merged;
  },

  reference: (shape, data, seen, depth, recurse) => {
    const subShape = XalethorVaultKeeper.peek('blueprint', shape.name);
    return subShape ? recurse(data, subShape, seen, depth) : data;
  },

  branded: (shape, data, seen, depth, recurse) =>
    recurse(data, shape.base, seen, depth),
} satisfies TShapeCloneMapperMap;
