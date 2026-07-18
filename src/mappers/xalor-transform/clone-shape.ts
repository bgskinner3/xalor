import type { TShapeCloneMapperMap } from '../../models/types';
import {
  isObject,
  isNull,
  isFunction,
  isArray,
  isSafeRecord,
  // isUndefined,
} from '../../../shared/utils/guards';
import { xalethorVaultKeeper } from '../../xalor-service/vault-keeper';
// import {
//   isObjectShape,
//   isPrimitiveShape,
//   isLiteralShape,
// } from '../../../shared';
import {
  IS_SOLID_CONFIG_ITEMS,
  // yieldItems,
  yieldAllKeyValuePairs,
} from '../../../shared';
import { xalethorVaultDiagnostics } from '../../xalor-service/vault-diagnostics';
import { shapeKindUtilsService } from '../../../shared/service';
import { XalethorService } from '../../xalor-service';
const DEBUG = false;
/**
 * ============================================================================
 * DESIGN SYSTEM MAPPER: CLONE SHAPE SANITIZER
 * ============================================================================
 *
 * ROLE:
 * The "Sanitizer." Performs a deep, circular-safe scrubbing copy of data,
 * physically removing any keys or structural elements NOT defined in the blueprint.
 *
 * @see produceClone
 */
export const CLONE_SHAPE_SANITIZER_MAPPER: TShapeCloneMapperMap = {
  primitive: (_shape, data) => {
    return data;
  },

  literal: (shape, data) => {
    return data === shape.value ? data : null;
  },

  union: (shape, data, seen, depth, recurse) => {
    if (DEBUG)
      console.log(
        `[DEBUG UNION] Entry - Values Count: ${shape.values?.length}, Payload Type: ${typeof data}`,
      );
    const matchingBranch = shape.values.find((branch) =>
      XalethorService.validateShape(
        data,
        branch,
        XalethorService.createInitialContext(shape.kind),
      ),
    );
    if (!matchingBranch) {
      if (DEBUG)
        console.log(
          `[DEBUG UNION] Mismatch - No variant validly mapped this data snapshot.`,
        );
      return null;
    }
    if (DEBUG)
      console.log(
        `[DEBUG UNION] Match Identified - Routing down variant kind: ${matchingBranch.kind}`,
      );
    const scrubbedResult = recurse(data, matchingBranch, seen, depth);
    if (scrubbedResult === null || scrubbedResult === undefined) {
      return null;
    }
    return scrubbedResult;
  },

  reference: (shape, data, seen, depth, recurse) => {
    if (DEBUG)
      console.log(`[DEBUG REFERENCE] Resolving link token: ${shape.name}`);
    const subShape = xalethorVaultKeeper.peek('blueprint', shape.name);
    if (!subShape) {
      return xalethorVaultDiagnostics.panic(
        shape.name,
        `[Xalor Graph Integrity Error]: Missing internal reference clone target: ${shape.name}`,
      );
    }
    return recurse(data, subShape, seen, depth + 1);
  },

  branded: (shape, data, seen, depth, recurse) => {
    return recurse(data, shape.base, seen, depth);
  },

  function: (_shape, data) => {
    return isFunction(data) ? data : null;
  },

  intersection: (shape, data, seen, depth, recurse) => {
    if (!isSafeRecord(data)) {
      return null;
    }

    const cleanMergedObj: Record<string, unknown> = {};
    const branches = shape.values || [];

    if (branches.length === 0) return null;

    // Track how many branches explicitly process and output each property key
    const propertyMatchCounts: Record<string, number> = {};

    for (const branch of branches) {
      // Clean the input data independently against the current branch contract
      const branchOutput = recurse(data, branch, seen, depth + 1);

      if (branchOutput === null || branchOutput === undefined) {
        return null; // If a full branch layout rejects, the full intersection fails
      }

      if (typeof branchOutput === 'object') {
        for (const key of Object.keys(branchOutput)) {
          const val = Reflect.get(branchOutput, key);

          if (val !== undefined && val !== null) {
            propertyMatchCounts[key] = (propertyMatchCounts[key] || 0) + 1;

            // Shallow-merge properties. If types conflict, subsequent loops will overwrite or flag them.
            cleanMergedObj[key] = val;
          }
        }
      }
    }

    // 🎯 CRITICAL RECOVERY GATE: A property is only valid if it successfully
    // passed scrubbing across EVERY SINGLE BRANCH in the intersection union.
    for (const key of Object.keys(cleanMergedObj)) {
      if (propertyMatchCounts[key] !== branches.length) {
        // If it failed to compile or validate in any branch, physically scrub it away!
        Reflect.deleteProperty(cleanMergedObj, key);
      }
    }

    return cleanMergedObj;
  },

  instanceof: (shape, data) => {
    const targetConfig = shapeKindUtilsService.getInstanceOfKind(shape.name);
    if (!targetConfig) return null;

    if (isObject(data) && !isNull(data)) {
      if (data instanceof targetConfig.ctor) {
        // 🎯 CRITICAL FIX: Explicitly clone properties into deep allocations instead of leaking original references
        if (shape.name === 'Date') return new Date((data as Date).getTime());
        if (shape.name === 'RegExp') return new RegExp(data as RegExp);
        if (shape.name === 'Map') {
          const freshMap = new Map();
          for (const [k, v] of (data as Map<unknown, unknown>).entries()) {
            freshMap.set(k, v);
          }
          return freshMap;
        }
        if (shape.name === 'Set') {
          return new Set((data as Set<unknown>).values());
        }
        if (shape.name === 'ArrayBuffer') {
          return (data as ArrayBuffer).slice(0);
        }
        // Fallback pass-through for naturally immutable streams or complex host targets
        return data;
      }
    }

    // Gateway fallback recovery mapping path for corrupt payloads
    if (shape.name === 'Date') return new Date(0);
    if (shape.name === 'URL') return new URL('http://localhost/');
    if (shape.name === 'Map') return new Map();
    if (shape.name === 'Set') return new Set();

    return null;
  },

  object: (shape, data, seen, depth, recurse) => {
    if (DEBUG) console.log(`\n[DEBUG OBJECT] Entering - Depth: ${depth}`);
    if (DEBUG)
      console.log(
        `  [Blueprint Expected Props]:`,
        Object.keys(shape.properties || {}),
      );
    if (DEBUG)
      console.log(
        `  [Incoming Wire Keys]:`,
        isSafeRecord(data) ? Object.keys(data) : typeof data,
      );

    if (!isSafeRecord(data)) {
      if (DEBUG)
        console.log(`  [DEBUG OBJECT] Rejected - Not a safe record structure.`);
      return null;
    }
    if (seen.has(data)) {
      if (DEBUG)
        console.log(
          `  [DEBUG OBJECT] Short-circuiting - Hit circular cached map record reference.`,
        );
      return seen.get(data);
    }

    const proto = Object.getPrototypeOf(data);
    const cleanObj = Object.create(proto) as Record<string, unknown>;
    seen.set(data, cleanObj);

    for (const [key, propDescriptor] of yieldAllKeyValuePairs(
      shape.properties,
    )) {
      const rawValue = Reflect.get(data, key);
      if (DEBUG)
        console.log(
          `    -> Processing Key: "${key}" | Found Raw Value:`,
          typeof rawValue === 'object' ? '{ object }' : rawValue,
        );
      if (DEBUG)
        console.log(
          `       Target Schema Kind for Key "${key}":`,
          propDescriptor.shape?.kind || propDescriptor,
        );

      if (rawValue === undefined) {
        if (propDescriptor.optional) {
          if (propDescriptor.allowsExplicitUndefined) {
            cleanObj[key] = undefined;
          }
          continue;
        }
        continue;
      }

      const cleanValue = recurse(
        rawValue,
        propDescriptor.shape || propDescriptor,
        seen,
        depth + 1,
      );

      if (cleanValue !== null && cleanValue !== undefined) {
        cleanObj[key] = cleanValue;
      }
    }
    if (DEBUG)
      console.log(
        `[DEBUG OBJECT] Outbound Clean Object Keys:`,
        Object.keys(cleanObj),
      );
    return cleanObj;
  },

  array: (shape, data, seen, depth, recurse) => {
    if (DEBUG) console.log(`\n[DEBUG ARRAY] Entering - Depth: ${depth}`);
    if (DEBUG)
      console.log(
        `  [Incoming Data IsArray]:`,
        Array.isArray(data),
        `| Length:`,
        Array.isArray(data) ? data.length : 0,
      );
    if (DEBUG) console.log(`  [Blueprint Items Spec]:`, shape.items);

    if (!isArray(data)) {
      if (DEBUG)
        console.log(
          `  [DEBUG ARRAY] Rejected - Input payload is not a valid array structure.`,
        );
      return [];
    }
    if (seen.has(data)) {
      return seen.get(data);
    }

    const copy: unknown[] = [];
    seen.set(data, copy);

    const maxLimit = IS_SOLID_CONFIG_ITEMS.reifyLimit.maxObjectProperties;
    const limit = data.length > maxLimit ? maxLimit : data.length;

    // Use shape.items if present, otherwise extract shape.items.shape if nested
    const targetItemBlueprint = shape.items || { kind: 'primitive' };
    if (DEBUG)
      console.log(
        `  [DEBUG ARRAY] Routing elements via child schema kind: ${targetItemBlueprint.kind || (targetItemBlueprint as any).shape?.kind}`,
      );

    for (let i = 0; i < limit; i++) {
      if (DEBUG) console.log(`  [DEBUG ARRAY] Iterating Element Index [${i}]`);
      const value = recurse(data[i], targetItemBlueprint, seen, depth + 1);
      if (value !== null && value !== undefined) {
        copy[i] = value;
      }
    }
    return copy;
  },
} satisfies TShapeCloneMapperMap;
