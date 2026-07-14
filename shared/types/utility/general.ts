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

/* prettier-ignore */
export type TDetermineInstance<CtorType> =
  // Rule 1: Checks for construct signatures FIRST
  CtorType extends { new (...args: any[]): infer R } ? R :
  // Rule 2: Falls back to prototypes for hybrid interfaces SECOND
  CtorType extends { prototype: infer P } ? P :
  never;
/**
 * @utilType type
 * @name TPrettify
 * @category Primitive Type Utilities
 * @description Flattens complex type intersections into a single readable object for better IDE IntelliSense.
 * @link #tprettify
 *
 */
export type TPrettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * 🔗 REVERSE LOOKUP ENGINE
 *
 * Performance Profile: O(1) Shallow Index Map lookup.
 * Strategy: Scans ISolidRegistry to find which specific plaintext string key maps
 * exactly to the provided structural type payload shape.
 */
export type TExtractRegistryKeyName<T> = {
  [K in keyof ISolidRegistry]: ISolidRegistry[K] extends T
    ? T extends ISolidRegistry[K]
      ? K
      : never
    : never;
}[keyof ISolidRegistry];
/**
 * 🧬 TYPE REIFICATION GRAPH REALIGNMENT ENGINE
 *
 * Performance Profile: Erased completely at compile-time.
 * Strategy: Recursively converts system constructor tracking nodes into active
 * runtime execution instance formats, satisfying strict closure expectations.
 */
export type TResolveInstanceGraph<T> = T extends (...args: unknown[]) => unknown
  ? T // Preserve closures exactly as declared
  : T extends { readonly [key: string]: unknown }
    ? {
        -readonly [K in keyof T]: T[K] extends { prototype: infer P }
          ? P // Extract instance layout straight out of constructor signatures
          : T[K] extends readonly (infer U)[]
            ? TResolveInstanceGraph<U>[] // Flatten readonly arrays to mutable arrays for return blocks
            : T[K] extends object
              ? TResolveInstanceGraph<T[K]> // Recursively process child object structures
              : T[K];
      }
    : T;

/**
 * @utilType type
 * @name TKeys
 * @category Primitive Type Utilities
 * @description Produces the union of all property keys from an object type.
 * @link #tkeys
 *
 * @example
 * ```ts
 * type User = {
 *   id: number;
 *   name: string;
 * };
 *
 * type Keys = TKeys<User>;
 * // "id" | "name"
 * ```
 *
 * Equivalent to TypeScript's built-in `keyof` operator, provided as a reusable
 * utility type for consistency throughout the library.
 */
export type TKeys<T extends Record<PropertyKey, string>> = keyof T;

/**
 * @utilType type
 * @name TValues
 * @category Primitive Type Utilities
 * @description Produces the union of all property value types from an object type.
 * @link #tvalues
 *
 * @example
 * ```ts
 * type User = {
 *   id: number;
 *   name: string;
 *   active: boolean;
 * };
 *
 * type Values = TValues<User>;
 * // number | string | boolean
 * ```
 *
 * Indexes every property of an object using its complete key union to produce
 * a union of all possible value types.
 */
export type TValues<T extends Record<PropertyKey, string>> = T[keyof T];
