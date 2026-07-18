import type {
  TShapeCastMapperMapper,
  TCastingPrimitiveMapper,
} from '../../models/types';
import {
  isObject,
  isSymbol,
  isNull,
  isString,
  isBoolean,
  isNumber,
  isBigInt,
  isUndefined,
  isArray,
  isRecord,
  yieldItems,
  yieldAllKeyValuePairs,
  isPrimitiveShape,
  isObjectShape,
} from '../../../shared';
import { xalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import { PRIMITIVE_DEFAULTS } from '../../models';
import { xalethorVaultDiagnostics } from '../../xalor-service/vault-diagnostics';
import { castInstanceOfNode } from './helpers';

/**
 * CASTING_PRIMITIVE_GENERATORS
 *
 */
/* prettier-ignore */ const CASTING_PRIMITIVE_GENERATOR: TCastingPrimitiveMapper = {
  number: (data) => {
    if (isNumber(data)) return data;
    const parsed = Number(data);
    return Number.isNaN(parsed) ? PRIMITIVE_DEFAULTS.number : parsed;
  },

  string: (data) => {
    if (isString(data)) return data;
    if (isNull(data) || isUndefined(data)) return PRIMITIVE_DEFAULTS.string;
    if (typeof data === 'object') {
      try { return JSON.stringify(data); } catch { return PRIMITIVE_DEFAULTS.string; }
    }
    return String(data);
  },

  boolean: (data) => {
    if (isBoolean(data)) return data;
    if (isString(data)) {
      const cleaned = data.trim().toLowerCase();
      if (cleaned === 'true') return true;
      if (cleaned === 'false') return false;

      return PRIMITIVE_DEFAULTS.boolean;
    }
    return !!data;
  },
  bigint: (data) => {
    if (isBigInt(data)) return data;
    if (isNull(data) || isUndefined(data)) return PRIMITIVE_DEFAULTS.bigint;
    try { 
      return BigInt(String(data)); 
    } catch { 
      return PRIMITIVE_DEFAULTS.bigint; 
    }
  },

  symbol: (data) => {
    if (isSymbol(data)) return data;
    if (isString(data)) return Symbol.for(data);
    return Symbol(String(data));
  },

  null: () => null,

  undefined: () => undefined,

  void: () => undefined,

  never: () => {
    return xalethorVaultDiagnostics.panic('never param', `[Xalor Graph Integrity Error]: Core Type Coercion layer triggered a critical boundary breach. An input payload attempted to map against a terminal "never" property node.`)

  },

  unknown: (data) => data,

  any: (data) => data,
} satisfies TCastingPrimitiveMapper;

export const CAST_SHAPE_MAPPER: TShapeCastMapperMapper = {
  primitive: (shape, data) => {
    if (isUndefined(data) || isNull(data)) {
      return PRIMITIVE_DEFAULTS[shape.type];
    }
    const coercer = CASTING_PRIMITIVE_GENERATOR[shape.type];
    return coercer ? coercer(data) : PRIMITIVE_DEFAULTS[shape.type];
  },

  literal: (shape, data) => {
    if (data === shape.value) return data;

    // Tolerant structural mapping comparisons for string and numeric scalar values
    if (isString(shape.value) && isString(data)) {
      if (data.trim().toLowerCase() === shape.value.toLowerCase()) {
        return shape.value;
      }
    }
    if (isNumber(shape.value)) {
      const parsed = Number(data);
      if (!Number.isNaN(parsed) && parsed === shape.value) {
        return parsed;
      }
    }
    if (isBoolean(shape.value)) {
      const normalizedInput = String(data).trim().toLowerCase();
      if (normalizedInput === 'true' && shape.value === true) return true;
      if (normalizedInput === 'false' && shape.value === false) return false;
    }

    return shape.value;
  },

  object: (shape, data, depth, recurse) => {
    const source =
      isObject(data) && !isArray(data) && !isNull(data) ? data : {};
    const castedObject: Record<string, unknown> = {};

    for (const [key, propDescriptor] of yieldAllKeyValuePairs(
      shape.properties,
    )) {
      const rawValue = Reflect.get(source, key);

      if (isUndefined(rawValue)) {
        if (propDescriptor.optional) {
          if (propDescriptor.allowsExplicitUndefined) {
            castedObject[key] = undefined;
          }
          continue;
        }
      }

      // Recursively map and cast the structural properties
      const cleanValue = recurse(propDescriptor.shape, rawValue, depth + 1);
      if (cleanValue !== undefined) {
        castedObject[key] = cleanValue;
      }
    }

    // Extra un-declared property fields are stripped away naturally by omission!
    return castedObject;
  },

  array: (shape, data, depth, recurse) => {
    const arr: unknown[] = [];

    if (!isArray(data)) {
      if (data !== undefined && data !== null) {
        arr.push(recurse(shape.items, data, depth + 1));
        return arr;
      }
      return [];
    }

    // TUPLE CAST PATTERN: If the shape defines elementShapes, map fields onto fixed position offsets
    if (shape.elementShapes && shape.elementShapes.length > 0) {
      const tupleLength = shape.elementShapes.length;

      for (let i = 0; i < tupleLength; i++) {
        const subBlueprint = shape.elementShapes[i];
        const rawInputItem = data[i];

        if (subBlueprint) {
          arr.push(recurse(subBlueprint, rawInputItem, depth + 1));
        }
      }
      // 🚀 FIX: Return the packed array tuple here immediately!
      // This shields execution from running into shape.items which is mapped to 'never'
      return arr;
    }

    // Standard Array Fallback Pass using your optimized zero-allocation iteration stream
    for (const rawItem of yieldItems(data)) {
      arr.push(recurse(shape.items, rawItem, depth + 1));
    }
    return arr;
  },

  union: (shape, data, depth, recurse) => {
    if (shape.values.length === 0) return undefined;

    for (const branch of yieldItems(shape.values)) {
      if (isPrimitiveShape(branch) && typeof data === branch.type) {
        return recurse(branch, data, depth);
      }
      if (isObjectShape(branch) && isObject(data) && !isArray(data)) {
        return recurse(branch, data, depth);
      }
    }

    const fallbackBranch = shape.values[0];
    return fallbackBranch ? recurse(fallbackBranch, data, depth) : data;
  },

  intersection: (shape, data, depth, recurse) => {
    const combinedResult: Record<string, unknown> = {};

    // Recursively materializes partial schemas and reduces them together on demand
    for (const branch of yieldItems(shape.values)) {
      const partialVal = recurse(branch, data, depth + 1);
      if (partialVal && isObject(partialVal) && isRecord(partialVal)) {
        for (const [k, v] of yieldAllKeyValuePairs(partialVal)) {
          if (combinedResult[k] === undefined) {
            combinedResult[k] = v;
          }
        }
      }
    }
    return combinedResult;
  },

  reference: (shape, data, depth, recurse) => {
    const resolvedBlueprint = xalethorVaultKeeper.peek('blueprint', shape.name);
    if (!resolvedBlueprint) {
      return xalethorVaultDiagnostics.panic(
        shape.name,
        `[Xalor Graph Integrity Error]: Missing internal reference target: ${shape.name}`,
      );
    }
    return recurse(resolvedBlueprint, data, depth + 1);
  },

  branded: (shape, data, depth, recurse) => recurse(shape.base, data, depth),

  function: (_shape, data) => {
    // Preserve the callable function reference, otherwise return null
    return typeof data === 'function' ? data : null;
  },

  instanceof: (shape, data) => {
    return castInstanceOfNode(shape, data);
  },
} satisfies TShapeCastMapperMapper;
