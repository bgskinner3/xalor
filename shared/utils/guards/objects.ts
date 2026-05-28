import type { TTypeGuard } from '../../types';
import { isNull, isString, isNumber, isSymbol } from './primitives';
/**
 * @utilType Guard
 * @name isArray
 * @category Guards Core
 * @description Validates that a value is an Array.
 * @link #isarray
 */
export const isArray: TTypeGuard<unknown[]> = <T, U>(
  term: Array<T> | U,
): term is Array<T> => Array.isArray(term);
/**
 * @utilType Guard
 * @name isObject
 * @category Guards Core
 * @description Validates that a value is a non-null, non-array object.
 * @link #isobject
 */
export const isObject: TTypeGuard<object> = <T extends object, U>(
  term: T | U,
): term is NonNullable<T> =>
  !isNull(term) && !isArray(term) && typeof term === 'object';

/**
 * @utilType Guard
 * @name isRecord
 * @category Guards Core
 * @description Validates that a value is a non-null object (and not an array)
 * that can be indexed by strings.
 */
export const isRecord: TTypeGuard<Record<string, unknown>> = (
  value: unknown,
): value is Record<string, unknown> =>
  isObject(value) &&
  value !== null &&
  !isArray(value) &&
  !(value instanceof Date) &&
  !(value instanceof RegExp);
/**
 * @utilType Guard
 * @name isKeyOfObject
 * @category Guards Core
 * @description Validates if a value is a valid property key (string, number, or symbol) of a specific object.
 * @link #iskeyofobject
 *
 * ## 🔑 isKeyOfObject — Object Key Validator
 *
 * This function returns a **TypeScript type guard**, allowing you to safely
 * access object properties with dynamic keys while retaining full type safety.
 *
 * @typeParam T - The type of the target object.
 * @returns A type guard `(key: unknown) => key is keyof T`.
 */
export const isKeyOfObject =
  <T extends object>(obj: T): TTypeGuard<keyof T> =>
  (key: unknown): key is keyof T =>
    (isString(key) || isNumber(key) || isSymbol(key)) && key in obj;

/**
 * @utilType Guard
 * @name isKeyInObject
 * @category Guards Core
 * @description Narrows an unknown value to an object containing a specific property key, allowing safe property access.
 * @link #iskeyinobject
 *
 * ## 📦 isKeyInObject — Object Property Guard
 *
 * Narrows the *object* itself. After calling this function, TypeScript knows that
 * the input is a non-null object containing the specified key.
 *
 * @param key - The property key to check for.
 * @returns A type guard that checks if an unknown value is an object containing the key.
 */
export const isKeyInObject =
  <K extends PropertyKey>(key: K) =>
  (obj: unknown): obj is Record<K, unknown> =>
    isObject(obj) && key in obj;
/**
 * @utilType Guard
 * @name isKeyOfArray
 * @category Guards Core
 * @description Validates if a primitive value exists within a specific readonly array of allowed keys.
 * @link #iskeyofarray
 *
 * ## 🧩 isKeyOfArray — Type Guard for Allowed Primitive Keys
 *
 * ### 📘 Example Usage
 * ```ts
 * const allowedKeys = ['id', 'name', 'age'] as const;
 * const key: unknown = 'name';
 *
 * if (isKeyOfArray(allowedKeys)(key)) {
 *   // ✅ TypeScript now knows `key` is 'id' | 'name' | 'age'
 *   console.log(key); // 'name'
 * }
 *
 * const invalidKey: unknown = 'email';
 * isKeyOfArray(allowedKeys)(invalidKey); // false
 *
 * // Inline usage
 * isKeyOfArray(['x', 'y', 'z'] as const)('x'); // true
 * isKeyOfArray(['x', 'y', 'z'] as const)('a'); // false
 * ```
 */
export const isKeyOfArray =
  <T extends readonly (string | number | symbol)[]>(
    keys: T,
  ): TTypeGuard<T[number]> =>
  (key: unknown): key is T[number] =>
    (isString(key) || isNumber(key) || isSymbol(key)) && keys.includes(key);

/**
 * @utilType Guard
 * @name hasKey
 * @category Guards Core
 * @description
 * Validates that an unknown value is an object containing a specific key.
 *
 * @link #haskey
 *
 * ## 🧩 hasKey — Object Property Type Guard
 *
 * Safely checks whether a value is a non-null object
 * containing a given property key.
 *
 * Useful for narrowing unknown structures before
 * accessing nested properties.
 *
 * ---
 *
 * ### 📘 Example Usage
 *
 * ```ts
 * const value: unknown = {
 *   id: 123,
 *   name: 'Solid',
 * };
 *
 * hasKey('test')(null); // false
 * hasKey('x')(123); // false
 * ```
 */
export const hasKey =
  <K extends PropertyKey>(key: K): TTypeGuard<Record<K, unknown>> =>
  (obj: unknown): obj is Record<K, unknown> =>
    isObject(obj) && !isNull(obj) && isKeyInObject(key)(obj);
/**
 * @utilType Guard
 * @name isInArray
 * @category Guards Core
 * @description Creates an O(1) optimized type guard to check if a value exists within a predefined array.
 * @link #isinarray
 *
 * ## 🧩 isInArray — Type Guard Factory for Array Membership
 *
 * Creates a **type guard** that checks whether a value exists in a given array.
 * Internally, it uses a `Set` for **O(1) lookup**, making repeated checks more efficient.
 *
 * @typeParam T - The type of elements in the target array.
 * @param target - The array of allowed values.
 * @returns A type guard function that narrows `unknown` to `T`.
 */
export const isInArray = <T>(target: readonly T[]): TTypeGuard<T> => {
  const set = new Set<unknown>(target);
  return (value: unknown): value is T => set.has(value as T);
};
/**
 * @utilType Guard
 * @name isArrayOf
 * @category Guards Core
 * @description Verifies that a value is an array where every element satisfies a provided type guard.
 * @link #isarrayof
 *
 * ## 🧩 isArrayOf — Type Guard for Arrays of Specific Types
 *
 * Checks if a value is an array where **all elements satisfy a given type guard**.
 * This allows TypeScript to narrow types safely and perform runtime validation.
 *
 * @typeParam T - Type of array elements.
 * @param typeGuard - Type guard function for the array elements.
 * @param value - Value to validate.
 */
export const isArrayOf = <T>(
  typeGuard: TTypeGuard<T>,
  value: unknown,
): value is T[] => Array.isArray(value) && value.every(typeGuard);
/**
 * @utilType Guard
 * @name isTupleOf
 * @category Guards Core
 * @description Verifies that a value is a tuple of up to two elements, where each element satisfies its corresponding type guard.
 * @link #istupleof
 *
 * ## 🧩 isTupleOf — Type Guard for Tuples of Specific Types
 *
 * Checks if a value is an array of a fixed length (max 2) where **each element satisfies its positional type guard**.
 * This allows TypeScript to narrow types safely to a tuple structure and perform rigid runtime validation.
 *
 * @typeParam A - Type of the first tuple element.
 * @typeParam B - Type of the second tuple element (defaults to never if omitted).
 * @param guards - A rest parameter accepting one or two type guard functions.
 */
export const isTupleOf =
  <A, B = never>(...guards: [TTypeGuard<A>, TTypeGuard<B>?]) =>
  (value: unknown): value is [A, B] extends [unknown, never] ? [A] : [A, B] =>
    isArray(value) && guards.every((guard, index) => guard?.(value[index]));
