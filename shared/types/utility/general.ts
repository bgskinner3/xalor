/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ## TUnique — Constant-Time Array Uniqueness Validator
 * @utilType type
 * @name TUnique
 * @category Advanced Type Utilities
 * @description Validates at compile time that an array literal contains no duplicate elements, mapping violating elements directly to 'never' in O(1) recursion depth.
 * @link #tunique
 *
 * @example
 * ```ts
 * // Passes validation:
 * const ValidTriggers = ['xalor.parse', 'xalor.assert'] as const satisfies TUnique<any>;
 *
 * // Fails validation (the duplicate index turns into 'never'):
 * const InvalidTriggers = ['xalor.audit', 'xalor.audit'] as const satisfies TUnique<any>;
 * // Error: Type 'never' is not assignable to type '"xalor.audit"'
 * ```
 *
 * Evaluates array elements globally using a mapped spatial intersection instead of a
 * head/tail recursive loop. For every element `K`, it scans the rest of the tuple positions `P`
 * to determine if the same value exists anywhere other than its current index.
 */
export type TUnique<T extends readonly unknown[]> = {
  [K in keyof T]: {
    [P in keyof T]: T[P] extends T[K] ? (P extends K ? false : true) : false;
  }[number] extends false
    ? T[K]
    : never;
};

// /* prettier-ignore */
// export type TDetermineInstance<CtorType> =
//   // Rule 1: Prioritize explicit constructor signatures first to capture Streams instantly
//   // Rule 1: Prioritize explicit constructor signatures first to capture Web Streams instantly
//   CtorType extends { new (...args: any[]): infer R } ? R :
//   CtorType extends abstract new (...args: any[]) => infer R ? R :
//   // Rule 2: Fall back to prototype parsing for hybrid global interfaces (DateConstructor)
//   CtorType extends { prototype: infer P } ? P :
//   // 🛡️ Hard bottom boundary: fails explicitly instead of leaking type contexts
//   never;
/* prettier-ignore */
export type TDetermineInstance<CtorType> =
  // Rule 1: Checks for construct signatures FIRST
  CtorType extends { new (...args: any[]): infer R } ? R :
  // Rule 2: Falls back to prototypes for hybrid interfaces SECOND
  CtorType extends { prototype: infer P } ? P :
  never;
