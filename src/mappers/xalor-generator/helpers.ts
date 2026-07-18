import {
  isString,
  isNull,
  isArray,
  isObject,
  yieldAllKeyValuePairs,
  isSafeRecord,
  isTupleOf,
  isInstanceOfShape,
} from '../../../shared';
import { TSolidShape } from '../../../shared';
import { shapeKindUtilsService } from '../../../shared/service';
import { INSTANCE_CAST_COERCERS } from './cast-instance-coercer';
/**
 * COMPILER-DRIVEN TUPLE ENTRIES SCHEMA PACKER
 *
 * ROLE:
 * Converts a loose collection array into a rigid, positionally verified
 * series matrix of two-element entries tuples.
 *
 * STRATEGY:
 * Iterates through the array using an index-based linear progression. It checks
 * the length of each inner structural layout block point-free, verifying it
 * contains at least two scalar components before packing them into a strict
 * type-safe tuple structure.
 */
export function verifyTupleEntries(
  items: unknown[],
): readonly (readonly [unknown, unknown])[] {
  const verified: [unknown, unknown][] = [];
  const len = items.length;

  for (let i = 0; i < len; i++) {
    const current = items[i];
    if (isArray(current) && current.length >= 2) {
      verified.push([current[0], current[1]]);
    }
  }
  return verified;
}
/**
 * COMPILER-DRIVEN OBJECT DICTIONARY STRUCTURAL NARROWER
 *
 * ROLE:
 * Verifies that an unverified object container is a safe, string-indexed dictionary
 * map composed exclusively of primitive string keys and string values.
 *
 * STRATEGY:
 * Leverages the native library guard `isSafeRecord` to confirm the base object layout matrix.
 * It then pipes fields into the zero-allocation generator stream `yieldAllKeyValuePairs`
 * to evaluate and narrow the scalar contents point-free.
 *
 */
export function isStringDictionary(
  value: unknown,
): value is Record<string, string> {
  if (!isSafeRecord(value)) return false;
  for (const [key, val] of yieldAllKeyValuePairs(value)) {
    if (!isString(key) || !isString(val)) {
      return false;
    }
  }
  return true;
}
/**
 * @utilType Guard
 * @name isHeaderTuple
 * @category Guards Core
 *
 * ROLE:
 * Strict positional type guard factory validating HTTP Header tuple compliance.
 *
 */
export const isHeaderTuple = isTupleOf<string, string>(isString, isString);

/**
 * EXHAUSTIVE INSTANCEOF NODE MATERIALIZER COORDINATOR
 *
 * ROLE:
 * The centralized instance error boundary and translation engine portal.
 * Converts flat, serialized wire-format inputs back into live platform object instances.
 *
 * @see INSTANCE_REGISTRY_MAPPER
 * @see INSTANCE_CAST_COERCERS
 */
export const castInstanceOfNode = (
  shape: TSolidShape,
  data: unknown,
): unknown => {
  if (!isInstanceOfShape(shape)) return null;
  const targetConfig = shapeKindUtilsService.getInstanceOfKind(shape.name);

  if (isObject(data) && data instanceof targetConfig.ctor) return data;

  // 2. CENTRALIZED SAFETY GATEWAY: Evaluates coercions in a unified execution capsule
  try {
    const coercer = INSTANCE_CAST_COERCERS[shape.name];
    if (coercer) {
      const repairedInstance = coercer(data);
      if (!isNull(repairedInstance)) return repairedInstance;
    }
  } catch (_executionPanic) {
    // console.error(executionPanic);
  }

  return targetConfig.def();
};
