// models/guards/common/primitives.ts
import type {
  TTypeGuard,
  TPrimitive,
  TAnyFunction,
  TStringFunction,
} from '../../types';
/**
 * @utilType Guard
 * @name isNull
 * @category Guards Primitive
 * @description Validates that a value is explicitly null.
 * @link #isnull
 */
export const isNull: TTypeGuard<null> = <T>(term: T | null): term is null =>
  term === null;
/**
 * @utilType Guard
 * @name isBigInt
 * @category Guards Core
 * @description Validates that a value is a BigInt.
 * @link #isbigint
 */
export const isBigInt: TTypeGuard<bigint> = (value: unknown): value is bigint =>
  typeof value === 'bigint';

/**
 * @utilType Guard
 * @name isUndefined
 * @category Guards Primitive
 * @description Validates that a value is undefined.
 * @link #isundefined
 */
export const isUndefined: TTypeGuard<undefined> = (value): value is undefined =>
  typeof value === 'undefined';
/**
 * @utilType Guard
 * @name isString
 * @category Guards Core
 * @description Validates that a value is a string.
 * @link #isstring
 */
export const isString: TTypeGuard<string> = (value: unknown): value is string =>
  typeof value === 'string';
/**
 * @utilType Guard
 * @name isNumber
 * @category Guards Core
 * @description Validates that a value is a number, excluding NaN and Infinity.
 * @link #isnumber
 */
export const isNumber: TTypeGuard<number> = (value: unknown): value is number =>
  typeof value === 'number';
/**
 * @utilType Guard
 * @name isBoolean
 * @category Guards Core
 * @description Validates that a value is a boolean (true or false).
 * @link #isboolean
 */
export const isBoolean: TTypeGuard<boolean> = (
  value: unknown,
): value is boolean => typeof value === 'boolean';
/**
 * @utilType Guard
 * @name isPrimitive
 * @category Guards Core
 * @description Validates if a value is any of the basic JS primitives: string, number, boolean, or bigint.
 * @link #isprimitive
 */
export const isPrimitive: TTypeGuard<TPrimitive> = (
  value: unknown,
): value is TPrimitive =>
  isString(value) || isNumber(value) || isBoolean(value) || isBigInt(value);
/**
 * @utilType Guard
 * @name isOptional
 * @category Guards Core
 * @description Creates a type guard that accepts either `undefined` or a value matching the supplied guard.
 * @link #isoptional
 *
 * ## 🧩 isOptional — Optional Guard Combinator
 */
export const isOptional =
  <T>(guard: TTypeGuard<T>): TTypeGuard<T | undefined> =>
  (value: unknown): value is T | undefined =>
    isUndefined(value) || guard(value);
/**
 * @utilType Guard
 * @name isFunction
 * @category Guards Core
 * @description Validates that a value is a callable function.
 * @link #isfunction
 */
export const isFunction: TTypeGuard<TAnyFunction> = (
  value: unknown,
): value is TAnyFunction => typeof value === 'function';

/**
 * @utilType Guard
 * @name isStringFunction
 * @category Guards Core
 * @description Validates that a value is a callable function.
 * @link #isstringfunction
 */
export const isStringFunction: TTypeGuard<TStringFunction> = (
  value: unknown,
): value is TStringFunction => typeof value === 'function';
/**
 * @utilType Guard
 * @name isSymbol
 * @category Guards Core
 * @description Validates that a value is a unique JavaScript symbol.
 * @link #issymbol
 */
export const isSymbol: TTypeGuard<symbol> = (value): value is symbol =>
  typeof value === 'symbol';
/**
 * @utilType Guard
 * @name isDefined
 * @category Guards Primitive
 * @description Ensures a value is neither null nor undefined.
 * @link #isdefined
 */
export const isDefined: TTypeGuard<unknown> = (
  value,
): value is NonNullable<unknown> => value !== null && value !== undefined;
/**
 * @utilType Guard
 * @name isSet
 * @category Guards Core
 * @description Validates that a value is an instance of a Set.
 * @link #isset
 */
export const isSet: TTypeGuard<Set<unknown>> = <T, U>(
  term: Set<T> | U,
): term is Set<T> => term instanceof Set;
/**
 * @utilType Guard
 * @name isInstanceOf
 * @category Guards Core
 * @description Checks if a value is an instance of a specific class constructor.
 * @link #isinstanceof
 */
export function isInstanceOf<T extends object, Args extends unknown[]>(
  value: unknown,
  constructor: new (...args: Args) => T,
): value is T {
  return value instanceof constructor;
}
/**
 * @utilType Comparator
 * @name isSamePrimitiveType
 * @category Runtime Checks
 * @description Compares whether two values share the same JavaScript primitive type.
 *
 * NOTE:
 * This is NOT a TypeScript type guard because it compares two inputs.
 *
 * @returns true if both values share the same typeof classification.
 */
export const isSamePrimitiveType = (a: unknown, b: unknown): boolean =>
  typeof a === typeof b;
/**
 * @utilType Guard
 * @name isRegExp
 * @category Guards Core
 * @description A helper to execute a type guard schema against a value for immediate narrowing.
 * @link #isRegExp
 */
export const isRegExp = <T extends RegExp>(val: unknown): val is T => {
  return val instanceof RegExp;
};

/**
 * @utilType Guard
 * @name isDate
 * @category Guards Core
 * @description Checks if a value is a valid Date instance.
 * @link #isDate
 */
export const isDate = <T extends Date>(val: unknown): val is T => {
  return val instanceof Date && !isNaN(val.getTime());
};
