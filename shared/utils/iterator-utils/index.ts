/**
 * @utilType util
 * @name yieldEntries
 * @category Iteration
 * @description Lazily yields [key, value] pairs from an object that pass a type guard.
 *
 * @example
 * ```ts
 * interface Device {
 *   id: number;
 *   model: string;
 *   isOnline: boolean;
 * }
 *
 * const laptop: Device = { id: 101, model: "X1", isOnline: true };
 *
 * // Example: A guard that only yields string-based properties
 * const isStringProp = (key: keyof Device, value: any): key is "model" =>
 *   typeof value === 'string';
 *
 * const entries = yieldEntries(laptop, isStringProp);
 *
 * for (const [key, value] of entries) {
 *   console.log(key);   // type: "model"
 *   console.log(value); // type: string
 * }
 * ```
 */
export function* yieldEntries<T extends object, K extends keyof T>(
  obj: T,
  guard: (key: keyof T, value: T[keyof T]) => key is K,
): Generator<[K, T[K]]> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (guard(key, obj[key])) {
        yield [key, obj[key]];
      }
    }
  }
}

/**
 * @utilType util
 * @name yieldFiltered
 * @category Iteration
 * @description Lazily yields items from a collection that pass a specific guard.
 * Zero memory allocation for intermediate arrays.
 */
export function* yieldFiltered<T, S extends T>(
  items: Iterable<T>,
  guard: (item: T) => item is S,
): Generator<S> {
  for (const item of items) {
    if (guard(item)) {
      yield item;
    }
  }
}

/**
 * 🛰️ LAZY ITERATOR PIPELINE
 *
 * ROLE:
 * Iterates over an array lazily, yielding transformed elements one frame
 * at a time on demand with an absolute O(1) heap memory footprint.
 *
 * ENVIRONMENT PURITY:
 * Fully generic and completely isolated from the TypeScript Compiler API.
 * Natively safe to run inside client bundles, edges, and browser windows.
 */
export function* mapIterableLazy<T, R>(
  items: readonly T[], // 🛡️ Accept readonly arrays to support Phase 1 shapes natively
  transform: (item: T) => R,
): Generator<R, void, unknown> {
  const len = items.length;
  for (let i = 0; i < len; i++) {
    yield transform(items[i]);
  }
}
/**
 * @utilType util
 * @name yieldItems
 * @category Iteration
 * @description Lazily yields items from a readonly collection one element at a time.
 * Provides a zero-allocation traversal mechanism for array-backed datasets while
 * preserving deterministic iteration order.
 *
 * @remarks
 * This utility is intended for scenarios where eager iteration utilities such as
 * `map`, `filter`, or `flatMap` would create unnecessary intermediate arrays.
 * Consumers receive values on demand through generator consumption.
 *
 * @example
 * ```ts
 * const values = ['alpha', 'beta', 'gamma'] as const;
 *
 * for (const value of yieldItems(values)) {
 *   console.log(value);
 * }
 *
 * // Output:
 * // alpha
 * // beta
 * // gamma
 * ```
 *
 * @example
 * ```ts
 * const tokens = ['--watch', '--verbose'];
 *
 * const iterator = yieldItems(tokens);
 *
 * console.log(iterator.next().value); // '--watch'
 * console.log(iterator.next().value); // '--verbose'
 * ```
 *
 * @performance
 * - O(N) traversal complexity
 * - O(1) memory overhead
 * - No intermediate array allocations
 * - Preserves original collection ordering
 */
export function* yieldItems<T>(items: readonly T[]): Generator<T> {
  const len = items.length;

  for (let i = 0; i < len; i++) {
    yield items[i];
  }
}
