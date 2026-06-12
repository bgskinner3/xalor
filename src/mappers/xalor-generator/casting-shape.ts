import type {
  TShapeCastMapperMapper,
  TCastingPrimitiveMapper,
} from '../../models/types';
import {
  isObject,
  isNull,
  isString,
  isBoolean,
  isNumber,
  isBigInt,
  isUndefined,
  isArray,
  ObjectUtils,
} from '../../../shared';
import { validateShape, createInitialContext } from '../../validation';
// import type { TSolidShape } from '../../../shared';
import { XalethorVaultKeeper } from '../../xalor-service/vault-keeper';
/**
 * CASTING_PRIMITIVE_GENERATORS
 *
 */
/* prettier-ignore */ const CASTING_PRIMITIVE_GENERATOR: TCastingPrimitiveMapper = {
    number: (data: unknown): number | unknown => {
    if (isNumber(data)) return data;
  
    const parsed = Number(data);
    return isNumber(parsed) ? parsed : data; 
  },
  string: (data: unknown): string => {
    if (isString(data)) return data;
    if (isObject(data)) return JSON.stringify(data);
    return String(data);
  },
  boolean: (data: unknown): boolean => {
    if (isBoolean(data)) return data;
    
    if (isString(data)) {
      const cleaned = data.trim().toLowerCase();
      if (cleaned === 'true') return true;
      if (cleaned === 'false') return false;
    }
    return Boolean(data);
  },
  bigint: (data: unknown): bigint | unknown => {
    if (isBigInt(data)) return data;
    try {
      return BigInt(String(data));
    } catch {
      return data;
    }
  },
  unknown: (data: unknown): unknown => data
} satisfies TCastingPrimitiveMapper
export const CAST_SHAPE_MAPPER: TShapeCastMapperMapper = {
  primitive: (shape, data) => {
    if (isUndefined(data) || isNull(data)) return data;

    const coercer = CASTING_PRIMITIVE_GENERATOR[shape.type];
    return coercer ? coercer(data) : data;
  },

  object: (shape, data, depth, recurse) => {
    if (!isObject(data) || isNull(data) || isArray(data)) return data;

    const castedObject: Record<string, unknown> = {};

    for (const key of ObjectUtils.keys(shape.properties)) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

      const childShape = shape.properties[key].shape;

      const value = recurse(
        childShape,
        (data as Record<string, unknown>)[key],
        depth + 1,
      );

      if (value !== undefined) {
        castedObject[key] = value;
      }
    }

    return castedObject;
  },

  array: (shape, data, depth, recurse) => {
    if (!isArray(data)) {
      if (!isUndefined(data) && !isNull(data)) {
        return [recurse(shape.items, data, depth + 1)];
      }
      return [];
    }

    return data.map((item) => recurse(shape.items, item, depth + 1));
  },

  union: (shape, data, depth, recurse) => {
    const ctx = createInitialContext();

    const immediateMatch = shape.values.find((branch) =>
      validateShape(data, branch, ctx),
    );

    if (immediateMatch) return recurse(immediateMatch, data, depth);

    const fallbackBranch = shape.values[0];
    return fallbackBranch ? recurse(fallbackBranch, data, depth) : data;
  },

  literal: (shape, data) => {
    if (data === shape.value) return data;

    if (isString(shape.value) && isString(data)) {
      if (data.trim().toLowerCase() === shape.value.toLowerCase()) {
        return shape.value;
      }
    }

    if (isNumber(shape.value)) {
      const parsed = Number(data);
      if (!isNaN(parsed) && parsed === shape.value) {
        return parsed;
      }
    }

    if (isBoolean(shape.value)) {
      const normalizedInput = String(data).trim().toLowerCase();
      if (normalizedInput === String(shape.value)) {
        return shape.value;
      }
    }

    return data;
  },

  reference: (shape, data, depth, recurse) => {
    const resolvedBlueprint = XalethorVaultKeeper.peek('blueprint', shape.name);

    if (!resolvedBlueprint) return data;

    return recurse(resolvedBlueprint, data, depth + 1);
  },

  branded: (shape, data, depth, recurse) => recurse(shape.base, data, depth),
  function: (_shape, data) => {
    if (typeof data !== 'function') return null;

    // CAST RULE:
    // preserve callable identity, do not execute or transform
    return data;
  },
  intersection: (shape, data, depth, recurse) => {
    if (data == null) return null;

    let current: unknown = data;

    for (const branch of shape.values) {
      const result = recurse(branch, current, depth + 1);

      if (result === null || result === undefined) {
        return null;
      }

      current = result;
    }

    return current;
  },
  instanceof: (shape, data) => {
    if (data == null || typeof data !== 'object') return null;

    const ctor = Object.getPrototypeOf(data)?.constructor?.name;

    return ctor === shape.name ? data : null;
  },
} satisfies TShapeCastMapperMapper;
// export const CAST_SHAPE_MAPPER: TShapeCastMapperMapper = {
//   /* prettier-ignore */ primitive: (shape: Extract<TSolidShape, { kind: 'primitive' }>, data: unknown, _depth: number, _recurse: unknown) => {
//     if (isUndefined(data)|| isNull(data)) return data;
//     const coercer = CASTING_PRIMITIVE_GENERATOR[shape.type];
//     return coercer ? coercer(data) : data;
//   },
//   object: (shape, data, depth, recurse) => {
//     if (!data || !isObject(data) || isArray(data)) return data;
//     const castedObject: Record<string, unknown> = {};
//     for (const key of ObjectUtils.keys(shape.properties)) {
//       const childShape = shape.properties[key].shape;
//       castedObject[key] = recurse(childShape, data[key], depth + 1);
//     }

//     return castedObject;
//   },

//   array: (shape, data, depth, recurse) => {
//     if (!isArray(data)) {
//       // !! If data is accidentally a single item instead of an array, wrap it and attempt coercion
//       if (!isUndefined(data) && !isNull(data))
//         return [recurse(shape.items, data, depth + 1)];
//       return [];
//     }

//     return data.map((item) => recurse(shape.items, item, depth + 1));
//   },
//   union: (shape, data, depth, recurse) => {
//     // I: Check if the raw input already satisfies a branch without casting
//     const immediateMatch = shape.values.find((branch) =>
//       validateShape(data, branch, createInitialContext()),
//     );
//     if (immediateMatch) return recurse(immediateMatch, data, depth);

//     //II: If no direct match, attempt to cast against the first available variant branch
//     const fallbackBranch = shape.values[0];
//     return fallbackBranch ? recurse(fallbackBranch, data, depth) : data;
//   },
//   literal: (shape, data, _depth, _recurse) => {
//     if (data === shape.value) return data;

//     if (isString(shape.value) && isString(data)) {
//       // If they match case-insensitively, force it to the contract's exact target value!
//       if (data.trim().toLowerCase() === shape.value.toLowerCase()) {
//         return shape.value;
//       }
//     }

//     if (isNumber(shape.value)) {
//       const parsed = Number(data);
//       if (!isNaN(parsed) && parsed === shape.value) {
//         return parsed;
//       }
//     }

//     if (isBoolean(shape.value)) {
//       const normalizedInput = String(data).trim().toLowerCase();
//       if (normalizedInput === String(shape.value)) {
//         return shape.value;
//       }
//     }

//     return data;
//   },
//   reference: (shape, data, depth, recurse) => {
//     // Resolve dynamic content-addressable storage layout links inside the global vault pointer mapping
//     const resolvedBlueprint =
//       globalThis.__SOLID_VAULT__?.blueprints?.[shape.name];
//     if (!resolvedBlueprint) return data;
//     return recurse(resolvedBlueprint, data, depth + 1);
//   },
//   branded: (shape, data, depth, recurse) => recurse(shape.base, data, depth),
// } satisfies TShapeCastMapperMapper;
