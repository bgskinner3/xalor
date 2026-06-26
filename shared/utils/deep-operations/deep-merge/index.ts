import { isObject, isArray, isRecord, isUndefined } from '../../guards';
import type { TTupleToIntersection } from '../../../types';
import {
  assertValidMergeResult,
  assertIntersectionSafety,
  isPlatformInstance,
  hasOwn,
  EMPTY_RECORD,
} from './helpers';

function shallowCopyForMerge<T>(value: T, pastCopies: unknown[]): T {
  if (isObject(value) && !pastCopies.includes(value)) {
    if (isArray(value)) {
      const copy = [...value];
      pastCopies.push(copy);

      if (assertValidMergeResult<T>(copy)) return copy;
    }

    const baseProto = Object.getPrototypeOf(value);

    const cleanObject =
      baseProto && baseProto !== Object.prototype
        ? Object.create(baseProto)
        : {};

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

  if (!Object.isExtensible(activeTarget)) {
    activeTarget = shallowCopyForMerge(activeTarget, pastCopies);
  }

  for (const key in source) {
    if (!hasOwn(source, key)) continue;

    if (key === '__proto__' || key === 'constructor') continue;

    const sourceValue = source[key];
    if (sourceValue === undefined) continue;

    const previous = visited.get(sourceValue);
    if (!isUndefined(previous)) {
      activeTarget[key] = previous;
      continue;
    }

    if (!hasOwn(activeTarget, key)) {
      activeTarget[key] = sourceValue;
      continue;
    }

    const targetValue = activeTarget[key];
    if (targetValue === sourceValue) continue;

    // Preserve native platform objects
    if (isPlatformInstance(sourceValue)) {
      activeTarget[key] = sourceValue;
      continue;
    }

    // Handle symmetrical collection array merging (Track 2 / Track 10)
    if (isArray(sourceValue)) {
      if (!isArray(targetValue)) {
        activeTarget[key] = sourceValue;
        continue;
      }

      const targetLen = targetValue.length;
      const sourceLen = sourceValue.length;
      const length = targetLen > sourceLen ? targetLen : sourceLen;
      const merged = new Array<unknown>(length);

      for (let i = 0; i < length; i++) {
        const base = targetValue[i];
        const patch = sourceValue[i];

        if (patch === undefined) {
          merged[i] = base;
          continue;
        }

        const baseIsRecord = isRecord(base);
        const patchIsRecord = isRecord(patch);

        merged[i] =
          baseIsRecord || patchIsRecord
            ? mergeHelper(
                baseIsRecord ? base : EMPTY_RECORD,
                patchIsRecord ? patch : EMPTY_RECORD,
                pastCopies,
                visited,
              )
            : patch;
      }
      activeTarget[key] = merged;
      continue;
    }

    // Handle deep nested object structures (Track 3)
    if (isRecord(sourceValue)) {
      if (!isRecord(targetValue)) {
        activeTarget[key] = sourceValue;
        continue;
      }
      activeTarget[key] = mergeHelper(
        shallowCopyForMerge(targetValue, pastCopies),
        sourceValue,
        pastCopies,
        visited,
      );
      continue;
    }

    // Default primitive scalar leaf updates (Track 1)
    activeTarget[key] = sourceValue;
  }

  if (assertValidMergeResult<T>(activeTarget)) return activeTarget;

  throw new Error(
    `[axiom-kit] Critical Invariant: Failed to verify structural merge target integrity.`,
  );
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
