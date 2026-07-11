import type { TTypeGuard, TAssert, TValidationContext } from '../../../shared';

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
  return (value: unknown, message?: string): asserts value is T => {
    assertValue(value, guard, message);
  };
};

/**
 * Executes a validation branch under a temporary tree path and manages context cleanup.
 *
 * This high-frequency helper updates the validation context path pointer before evaluation
 * to ensure deep tracking strings (e.g., `$.user.profile.id`) are accurate. To maximize
 * traversal performance, it allows safe mutation: if validation succeeds, the deep path
 * remains intact for subsequent siblings; if it fails, it instantly rolls back to the
 * original state to prevent telemetry tracking contamination.
 *
 * @param ctx - The shared mutable validation context object containing error stores and path states.
 * @param tempPath - The targeted AST node string path or subscript to evaluate next.
 * @param validateCb - The deterministic execution block wrapping the core shape evaluator.
 * @returns `true` if the validation branch passes successfully, otherwise `false`.
 */
export function withPathRestore(
  ctx: TValidationContext,
  tempPath: string,
  validateCb: () => boolean,
): boolean {
  const originalPath = ctx.path;
  ctx.path = tempPath;

  const isValid = validateCb();
  if (!isValid) {
    ctx.path = originalPath;
  }
  return isValid;
}
