import type { TTypeGuard } from '../../types';
import { isNull, isString, isNumber, isSymbol } from './primitives';
import { ObjectUtils } from '../object-utils';
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
 * @name isObject
 * @category Guards Core
 * @description Validates that a value is a non-null, non-array object.
 * @link #isobject
 */
export const isObjectSimple: TTypeGuard<object> = <T extends object, U>(
  term: T | U,
): term is NonNullable<T> => !isNull(term) && typeof term === 'object';
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
 * @utilType Guard Factory
 * @name isRecordOf
 * @category Guards Core
 *
 * @description Higher-order type guard that validates a Record<string, V> structure,
 * where every value in the object must satisfy the provided value guard.
 * ⚠️ Note:
 * Uses `Object.values()` which only validates enumerable own properties.
 * It does not traverse prototypes.
 */
export const isRecordOf =
  <V>(valueGuard: TTypeGuard<V>) =>
  (value: unknown): value is Record<string, V> =>
    isRecord(value) && ObjectUtils.values(value).every(valueGuard);

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

/**
 * ### isExactLiteralMatch
 * @utilType Guard
 * @name isExactLiteralMatch
 * @category Guards Core
 * @description Generically validates if an unknown input value matches a specific, dynamically targeted string literal token.
 *
 * @example
 * ```ts
 * type TLoggerTheme = 'standard' | 'crimson' | 'contrast' | 'naked';
 * const looseInput: unknown = 'crimson';
 *
 * // 🛰️ PASS 1: AUTOMATIC LITERAL TYPE INFERENCE
 * // TypeScript implicitly infers T as the exact literal type 'crimson' point-free.
 * if (isExactLiteralMatch(looseInput, 'crimson')) {
 *   // Inside this execution branch, looseInput is narrowed strictly to 'crimson'
 *   xalorLog.banner('Operation Halt', looseInput, 'filled');
 * }
 *
 * // 🛰️ PASS 2: STRICT UNION TYPE ENFORCEMENT
 * // Explicitly adding the type parameter forces the IDE compiler to intercept
 * // typos with a red underline the exact millisecond you write them.
 *
 * // 🚨 CRITICAL LINT FAILURE TRAPPED:
 * // Throws compiler error because 'crimzon' cannot be assigned to TLoggerTheme!
 * if (isExactLiteralMatch<TLoggerTheme>(looseInput, 'crimzon')) { ... }
 *
 * // ✅ BALANCED COMPILER ALIGNMENT:
 * if (isExactLiteralMatch<TLoggerTheme>(looseInput, 'contrast')) {
 *   // Input is narrowed strictly to the valid union variant 'contrast'
 *   xalorLog.divider('═', looseInput);
 * }
 * ```
 *
 *
 */
export const isLiteralMatch: <T extends string>(
  value: unknown,
  targetToken: T,
) => value is T = <T extends string>(
  value: unknown,
  targetToken: T,
): value is T => isString(value) && value === targetToken;
/**
 * @utilType Guard
 * @name hasOwnProperty
 * @category Guards Core
 * @description A type-safe wrapper for Object.prototype.hasOwnProperty
 * that narrows the object type to include the specified key.
 */
export const hasOwnProperty = <T, K extends PropertyKey>(
  obj: T,
  prop: K,
): obj is T & Record<K, unknown> => {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

/**
 * @utilType Guard
 * @name isShape
 * @category Guards Core
 * @description Factory for creating recursive structural type guards that validate an object against a schema of guards.
 * @link #isshape
 *
 * ## 🧩 isShape — Recursive Structural Type Guard Factory
 *
 * Creates a **high-fidelity type guard** that validates whether an unknown object
 * conforms to a specific structural "contract" defined by a schema of guards.
 *
 * @typeParam T - The target interface or object type to validate.
 * @param schema - A mapping of keys from `T` to their corresponding `TTypeGuard`.
 * @returns A type guard function that narrows `unknown` to `T`.
 *
 *
 * ```ts
 *
 *  type Nested = {
 *     id: string;
 *     meta: { ok: boolean };
 *    };
 *
 *   const isNested = matchesShape<Nested>({
 *      id: isString,
 *      meta: isShape<{ ok: boolean }>({
 *        ok: isBoolean,
 *      }),
 *    });
 *
 *
 *  isNested(valid)
 *
 * ```
 */
export const matchesShape = <T extends object>(schema: {
  [K in keyof T]: TTypeGuard<T[K]>;
}): TTypeGuard<T> => {
  const schemaKeys = ObjectUtils.keys(schema);

  return (value: unknown): value is T => {
    if (!isObject(value)) return false;

    for (const key of schemaKeys) {
      const guard = schema[key];

      if (!isKeyInObject(key)(value)) return false;

      if (!guard(value[key])) return false;
    }

    return true;
  };
};

export function isSafeRecord(value: unknown): value is Record<string, unknown> {
  return isObject(value) && !isNull(value) && isRecord(value);
}
