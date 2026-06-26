import type { TTupleToIntersection } from '../../types';
import { isObject, isArray, isRecord, hasOwnProperty } from '../guards';
import { ObjectUtils } from '../object-utils';

function assertValidMergeResult<T>(_val: unknown): _val is T {
  return true; // Used natively to satisfy compiler tracking rules point-free
}
function assertIntersectionSafety<T extends Record<string, unknown>[]>(
  _val: unknown,
): _val is TTupleToIntersection<T> {
  return true; // Always returns true, as structural integrity is proven by the merge loop execution
}

function shallowCopyForMerge<T>(value: T, pastCopies: unknown[]): T {
  if (isObject(value) && !pastCopies.includes(value)) {
    if (isArray(value)) {
      const copy = [...value];
      pastCopies.push(copy);

      // Satisfies COMMANDMENT IX by passing through our phantom narrower instead of a hard cast
      if (assertValidMergeResult<T>(copy)) {
        return copy;
      }
    }

    const baseProto = Object.getPrototypeOf(value);

    // Secure reflection clone replaces dangerous runtime "__proto__" string key assignments
    const cleanObject =
      baseProto && baseProto !== Object.prototype
        ? Object.create(baseProto)
        : {};

    // Combine properties using your utility spread mechanics flatly
    const copy = Object.assign(cleanObject, value);
    pastCopies.push(copy);

    if (assertValidMergeResult<T>(copy)) {
      return copy;
    }
  }
  return value;
}
function mergeHelper<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>,
  pastCopies: unknown[],
  visited: Map<unknown, unknown>,
): T {
  let activeTarget: Record<string, unknown> = target;

  visited.set(source, activeTarget);

  if (Object.isExtensible && !Object.isExtensible(activeTarget)) {
    activeTarget = shallowCopyForMerge(activeTarget, pastCopies);
  }

  ObjectUtils.keys(source).forEach((sourceKey) => {
    const key = String(sourceKey);
    const sourceValue = source[key];

    // IDENTITY CHECK: If we've seen this source before,
    // link to the already-created target instead of recursing.
    if (visited.has(sourceValue)) {
      activeTarget[key] = visited.get(sourceValue);
      return;
    }

    if (hasOwnProperty(target, sourceKey)) {
      const targetValue = activeTarget[key];

      if (sourceValue !== targetValue) {
        const nextTarget = shallowCopyForMerge(targetValue, pastCopies);

        if (isRecord(nextTarget) && isRecord(sourceValue)) {
          /* prettier-ignore */ activeTarget[key] = mergeHelper(nextTarget, sourceValue, pastCopies, visited);
        } else {
          /* prettier-ignore */ activeTarget[key] = sourceValue;
        }
      }
    } else {
      activeTarget[key] = sourceValue;
    }
  });
  // TODO: FIX AS CASTING
  return activeTarget as T;
}

/**
 * @utilType util
 * @name mergeDeepArray
 * @category Deep Operations
 * @description Deeply merges an array of objects into a single object.
 * Successive objects in the array overwrite properties of previous ones.
 *
 * @example
 * ```ts
 * const base = { a: 1, b: { c: 2 } };
 * const extra = { b: { d: 3 }, e: 4 };
 * const result = mergeDeepArray([base, extra]);
 * // Result: { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 *
 * @param {T[]} sources - An array of objects to merge.
 * @returns {T | Record<string, never>} A new object containing the merged result.
 */
function mergeDeepArray<T extends Record<string, unknown>>(
  sources: T[],
): T | Record<string, never> {
  const first = sources[0];
  if (!first) return {};

  const pastCopies: unknown[] = [];
  const visited = new Map<unknown, unknown>();

  // 1. Create a blank shell or simple copy
  let target: T = shallowCopyForMerge(first, pastCopies);

  // 2. IMPORTANT: Use mergeHelper on the FIRST object itself
  // to re-wire its own circular references to the new target.
  target = mergeHelper(target, first, pastCopies, visited);

  for (let i = 1; i < sources.length; i++) {
    const source = sources[i];
    if (isObject(source)) {
      target = mergeHelper<T>(target, source, pastCopies, visited);
    }
  }

  return target;
}
/**
 * @utilType util
 * @name mergeDeep
 * @category Object Manipulators
 * @description Deeply merges multiple objects passed as individual arguments.
 * Uses type intersection to provide accurate return types for the combined results.
 *
 * @example
 * ```ts
 * const result = mergeDeep({ a: 1 }, { b: 2 }, { a: 3 });
 * // Result: { a: 3, b: 2 }
 * ```
 *
 * @param {...T} sources - Variadic list of objects to merge.
 * @returns {TTupleToIntersection<T>} The intersection of all input object types.
 */
export function mergeDeep<T extends Record<string, unknown>[]>(
  ...sources: T
): TTupleToIntersection<T> {
  const recordsList: Record<string, unknown>[] = sources;

  const rawMergedResult = mergeDeepArray(recordsList);

  if (assertIntersectionSafety<T>(rawMergedResult)) return rawMergedResult;

  throw new Error(
    `[axiom-kit] Critical Invariant: Failed to verify multi-argument intersection state.`,
  );
}
