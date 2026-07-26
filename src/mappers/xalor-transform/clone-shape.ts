import type { TShapeCloneMapperMap } from '../../models/types';
import {
  // isObject,
  isNull,
  isFunction,
  isArray,
  isSafeRecord,
  isUndefined,
  isKeyInObject,
  isInstanceOf,
} from '../../../shared/utils/guards';
import { xalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import { xalethorVaultValidation } from '../../xalor-service/vault-validation';
import { INSTANCE_CLONE_STRATEGIES } from './clone-instance-coercer';
import { IS_SOLID_CONFIG_ITEMS } from '../../../shared';
import { xalethorVaultDiagnostics } from '../../xalor-service/vault-diagnostics';
import { shapeKindUtilsService } from '../../../shared/service';
import { xalethorCoreService } from '../../xalor-service';
import type { TSolidShape } from '../../../shared';
import { verifyRuntimePrimitiveCompliance } from './helpers';
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
  primitive: (shape, data) => {
    return verifyRuntimePrimitiveCompliance(shape.type, data) ? data : null;
  },
  literal: (shape, data) => {
    if (!verifyRuntimePrimitiveCompliance(shape.type, data)) {
      return null;
    }

    return data === shape.value ? data : null;
  },

  union: (shape, data, seen, depth, recurse) => {
    const branches = shape.values;
    const totalBranches = branches.length;

    for (let i = 0; i < totalBranches; i++) {
      const branch = branches[i];

      const activeCtx = xalethorVaultValidation.createInitialContext(
        branch.kind,
      );

      if (xalethorCoreService.validateShape(data, branch, activeCtx)) {
        const scrubbedResult = recurse(data, branch, seen, depth);
        if (!isNull(scrubbedResult) && !isUndefined(scrubbedResult)) {
          return scrubbedResult;
        }
      }
    }

    return null;
  },

  reference: (shape, data, seen, depth, recurse) => {
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
    if (!isSafeRecord(data)) return null;

    const branches = shape.values || [];
    const totalBranches = branches.length;
    if (totalBranches === 0) {
      return null;
    }

    const cleanMergedObj: Record<string, unknown> = Object.create(null);
    const propertyMatchCounts: Record<string, number> = Object.create(null);

    for (let i = 0; i < totalBranches; i++) {
      const branchOutput = recurse(data, branches[i], seen, depth + 1);

      if (isNull(branchOutput) || isUndefined(branchOutput)) {
        return null;
      }

      if (isSafeRecord(branchOutput)) {
        const activeKeys = Object.keys(branchOutput);
        const totalKeys = activeKeys.length;

        for (let j = 0; j < totalKeys; j++) {
          const key = activeKeys[j];
          const val = Reflect.get(branchOutput, key);

          if (!isNull(val) && !isUndefined(val)) {
            propertyMatchCounts[key] = (propertyMatchCounts[key] || 0) + 1;
            cleanMergedObj[key] = val;
          }
        }
      }
    }

    const finalKeys = Object.keys(cleanMergedObj);
    const totalFinalKeys = finalKeys.length;

    for (let i = 0; i < totalFinalKeys; i++) {
      const key = finalKeys[i];
      if (propertyMatchCounts[key] !== totalBranches) {
        Reflect.deleteProperty(cleanMergedObj, key);
      }
    }

    const outputPayload = Object.create(Object.prototype);

    for (let i = 0; i < totalFinalKeys; i++) {
      const key = finalKeys[i];
      const finalValue = cleanMergedObj[key];
      if (!isUndefined(finalValue)) {
        outputPayload[key] = finalValue;
      }
    }

    return outputPayload;
  },

  instanceof: (shape, data) => {
    if (
      Reflect.has(INSTANCE_CLONE_STRATEGIES, shape.name) &&
      isKeyInObject(shape.name)(INSTANCE_CLONE_STRATEGIES)
    ) {
      const cloneStrategy = INSTANCE_CLONE_STRATEGIES[shape.name];

      if (cloneStrategy) {
        const cleanClone = cloneStrategy(data);
        if (!isNull(cleanClone)) return cleanClone;
      }
    }

    const targetConfig = shapeKindUtilsService.getInstanceOfKind(shape.name);
    if (!targetConfig) {
      return null;
    }
    return targetConfig.def();
  },

  object: (shape, data, seen, depth, recurse) => {
    if (!isSafeRecord(data)) {
      return null;
    }

    if (isInstanceOf(seen, Map)) {
      const shapeCacheMap = seen.get(data);

      if (shapeCacheMap instanceof Map) {
        const cached = shapeCacheMap.get(shape);
        if (cached !== undefined) {
          return cached;
        }
      }
    }

    const proto = Object.getPrototypeOf(data);
    const cleanObj: Record<string, unknown> = Object.create(proto);

    if (isInstanceOf(seen, Map)) {
      const shapeCache = seen.get(data);

      if (isInstanceOf(shapeCache, Map)) {
        shapeCache.set(shape, cleanObj);
      } else {
        const newCacheMap = new Map<TSolidShape, unknown>();
        newCacheMap.set(shape, cleanObj);
        seen.set(data, newCacheMap);
      }
    }

    const propKeys = Object.keys(shape.properties);
    const totalKeys = propKeys.length;

    for (let i = 0; i < totalKeys; i++) {
      const key = propKeys[i];
      const propDescriptor = shape.properties[key];
      if (!propDescriptor) {
        continue;
      }

      const rawValue = Reflect.get(data, key);

      if (isUndefined(rawValue)) {
        if (propDescriptor.optional && propDescriptor.allowsExplicitUndefined) {
          cleanObj[key] = undefined;
        }
        continue;
      }

      const targetShape = propDescriptor.shape;
      const cleanValue = recurse(rawValue, targetShape, seen, depth + 1);

      if (!isNull(cleanValue) && !isUndefined(cleanValue)) {
        cleanObj[key] = cleanValue;
      }
    }

    return cleanObj;
  },
  array: (shape, data, seen, depth, recurse) => {
    if (!isArray(data)) return [];

    const cached = seen.get(data);
    if (!isUndefined(cached)) return cached;

    const copy: unknown[] = [];
    seen.set(data, copy);

    const maxLimit = IS_SOLID_CONFIG_ITEMS.reifyLimit.maxObjectProperties;
    const limit = data.length > maxLimit ? maxLimit : data.length;

    const targetItemBlueprint = shape.items;

    for (let i = 0; i < limit; i++) {
      const value = recurse(data[i], targetItemBlueprint, seen, depth + 1);
      if (!isNull(value) && !isUndefined(value)) {
        copy[i] = value;
      }
    }

    return copy;
  },
} satisfies TShapeCloneMapperMap;
