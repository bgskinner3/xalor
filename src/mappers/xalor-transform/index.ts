import type {
  TUniversalTransformMapper,
  TShapeFlattenMapper,
} from '../../models/types';
// import { isUndefined } from '../../../shared';
import { XalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import { validateShape, createInitialContext } from '../../validation';
import { transformerMapperObject } from './mapper-object';
import { transformerMapperArray } from './mapper-array';
import { isObject, isNull, isArray } from '../../../shared';
/**
 * 🗺️ UNIVERSAL AUTOMATED SHAPE TRANSFORMATION MAPPER MATRIX
 *
 * ROLE:
 * The single source of truth matrix driving both property selection ('pick'/'omit')
 * and nominal alignment ('rename'). It collapses duplicate boilerplate routines
 * into a single unified execution pass with O(1) performance capability.
 *
 */
export const TRANSFORM_SHAPE_MAPPER: TUniversalTransformMapper = {
  primitive: (_shape, data, dependency) => {
    if (dependency.mode === 'merge') {
      // If a patch override exists inside patchData, select it; otherwise, return the baseline data field safely
      return dependency.patchData !== undefined ? dependency.patchData : data;
    }
    return data;
  },

  literal: (shape, data, dependency) => {
    if (dependency.mode === 'merge') {
      const activeValue =
        dependency.patchData !== undefined ? dependency.patchData : data;
      return activeValue === shape.value ? activeValue : null;
    }
    return data === shape.value ? data : null;
  },

  // ✔️ FIX: Positional forwarding matches signature tuple bounds perfectly!
  object: (shape, data, dependency, depth, recurse) =>
    transformerMapperObject({ shape, data, dependency, depth, recurse }),

  // ✔️ FIX: Positional forwarding matches signature tuple bounds perfectly!
  array: (shape, data, dependency, depth, recurse) =>
    transformerMapperArray({ shape, data, dependency, depth, recurse }),

  union: (shape, data, dependency, depth, recurse) => {
    const sampleVal =
      dependency.mode === 'merge' && data === undefined
        ? dependency.patchData
        : data;
    const matchingBranch = shape.values.find((branch) =>
      validateShape(sampleVal, branch, createInitialContext()),
    );
    return matchingBranch
      ? recurse(data, matchingBranch, dependency, depth)
      : null;
  },

  intersection: (shape, data, dependency, depth, recurse) => {
    let merged = {};
    for (const part of shape.parts) {
      const transformedPart = recurse(data, part, dependency, depth);
      if (transformedPart && typeof transformedPart === 'object') {
        merged = { ...merged, ...transformedPart };
      }
    }
    return merged;
  },

  reference: (shape, data, dependency, depth, recurse) => {
    const subShape = XalethorVaultKeeper.peek('blueprint', shape.name);
    return subShape ? recurse(data, subShape, dependency, depth + 1) : null;
  },

  branded: (shape, data, dependency, depth, recurse) => {
    return recurse(data, shape.base, dependency, depth);
  },
} as const satisfies TUniversalTransformMapper;
// TODO: FIX AS CASTING AND TYPE ISSUES
/**
 * UNIVERSAL AUTOMATED FLATTEN SHAPE MAPPER MATRIX
 *
 * ROLE:
 * The single source of truth matrix driving matrix decompression and dot-notation flat mapping.
 * Encapsulates the unique linear state accumulator pattern with zero switch-case nesting blocks.
 */
export const TRANSFORM_FLATTEN_MAPPER: TShapeFlattenMapper = {
  // primitive: (shape, data, accumulator, currentPath) => {
  //   if (data === undefined || data === null) return;

  //   // Safely rejects malicious type objects when the schema strictly dictates string/number/boolean.
  //   const actualType = typeof data;
  //   const expectedType = shape.type;

  //   if (actualType === expectedType) {
  //     accumulator[currentPath] = data as string | number | boolean;
  //   }
  //   // Toxic type mismatches are cleanly ignored and pruned from the flat dictionary output natively!
  // },
  primitive: (shape, data, accumulator, currentPath) => {
    if (data === undefined) return;

    // ✔️ FIX A: Explicit null value primitives pass through cleanly to the dictionary map layout!
    if (data === null) {
      accumulator[currentPath] = null;
      return;
    }

    // Verify type safety matching rules for other runtime values
    const actualType = typeof data;
    const expectedType = shape.type;

    if (actualType === expectedType) {
      accumulator[currentPath] = data as string | number | boolean;
    }
  },

  literal: (shape, data, accumulator, currentPath) => {
    if (data === shape.value) {
      accumulator[currentPath] = data as string | number | boolean;
    }
  },

  /* prettier-ignore */ object: (shape, val, accumulator, currentPath, depth, seenObjectsMap, recurse) => {
    if (!isObject(val) || isNull(val) || isArray(val)) return;

    const props = shape.properties;
    const dataRef = val as Record<string, unknown>;

    for (const key of Object.keys(props)) {
      const propertyContainer = props[key];

      if (propertyContainer?.shape && Object.prototype.hasOwnProperty.call(dataRef, key)) {
        // Build the nested path breadcrumb: e.g., "user" + "." + "address" -> "user.address"
        const nextPath = currentPath === '' ? key : `${currentPath}.${key}`;
        
         /* prettier-ignore */ recurse(dataRef[key], propertyContainer.shape, accumulator, nextPath, depth + 1, seenObjectsMap);
      }
    }
  },

  /* prettier-ignore */ array: (shape, val, accumulator, currentPath, depth, seenObjectsMap, recurse) => {
    if (!isArray(val)) return;

    for (let i = 0; i < val.length; i++) {
      // Build the standard array bracket index path string: e.g., "items[0]"
      const nextPath = `${currentPath}[${i}]`;
      
       /* prettier-ignore */ recurse(val[i], shape.items, accumulator, nextPath, depth + 1, seenObjectsMap);
    }
  },
  /* prettier-ignore */ union: (shape, val, accumulator, currentPath, depth, seenObjectsMap, recurse) => {
    const matchingBranch = shape.values.find((branch) =>
      validateShape(val, branch, createInitialContext()),
    );
    
    if (matchingBranch) {
       /* prettier-ignore */ recurse(val, matchingBranch, accumulator, currentPath, depth, seenObjectsMap);
    }
  },

  /* prettier-ignore */ intersection: (shape, val, accumulator, currentPath, depth, seenObjectsMap, recurse) => {
    for (const part of shape.parts) {
       /* prettier-ignore */ recurse(val, part, accumulator, currentPath, depth, seenObjectsMap);
    }
  },

  /* prettier-ignore */ reference: (shape, val, accumulator, currentPath, depth, seenObjectsMap, recurse) => {
    const subShape = XalethorVaultKeeper.peek('blueprint', shape.name);
    
    if (subShape) {
       /* prettier-ignore */ recurse(val, subShape, accumulator, currentPath, depth + 1, seenObjectsMap);
    }
  },

  /* prettier-ignore */ branded: (shape, val, accumulator, currentPath, depth, seenObjectsMap, recurse) => {
    /* prettier-ignore */  recurse(val, shape.base, accumulator, currentPath, depth, seenObjectsMap);
  },
} as const satisfies TShapeFlattenMapper;
