import type { TTypeGuard, TAssert } from '../../../shared';

/**
 * @utilType util
 * @name assertValue
 * @category Validations Assertions
 * @description Asserts that a value passes a type guard check, throwing an error if it fails while preserving TS narrowing.
 * @link #assertvalue
 *
 * @throws {Error} If the value does not satisfy the type guard.
 *
 * @example
 * ```ts
 * const isString = (v: unknown): v is string => typeof v === 'string';
 * const myValue: unknown = "hello";
 * assertValue(myValue, isString); // narrows type of myValue to string
 * ```
 */
export function assertValue<T>(
  value: unknown,
  typeGuard: TTypeGuard<T>,
  message?: string,
): asserts value is T {
  if (!typeGuard(value)) {
    throw new Error(
      message ??
        `Assertion failed: value ${JSON.stringify(value)} does not satisfy ${typeGuard.name || 'type guard'}`,
    );
  }
}

/**
 * @utilType util
 * @name makeAssert
 * @category Validations Assertions
 * @description Higher-order utility that creates a reusable assertion function for a specific type guard.
 * @link #makeassert
 *
 * @example
 * ```ts
 * const isNumber = (v: unknown): v is number => typeof v === 'number';
 * const assertNumber = makeAssert(isNumber, 'myNumber');
 *
 * const value: unknown = 42;
 * assertNumber(value); // Narrows value type to number
 * ```
 */
export const makeAssert = <T>(
  guard: TTypeGuard<T>,
  _key: string,
): TAssert<T> => {
  // 🚀 Adding 'asserts value is T' here satisfies the TAssert interface contract
  return (value: unknown, message?: string): asserts value is T => {
    assertValue(value, guard, message);
  };
};
