/**
 * 🎛️ TSOLID DEEP KEY PATH RESOLVER
 *
 * ROLE:
 * Computes a comprehensive union string literal array tracking all nested dot-notation paths.
 *
 * WHY:
 * Satisfies Commandment V (Graph Integrity). It dynamically inspects your strongly-typed
 * registry schemas, allowing arrays to autocomplete deep fields (e.g. 'items.SKU')
 * natively within the developer's IDE while completely purging 'any' types.
 */
export type TDeepKeyOf<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: T[K] extends readonly unknown[]
        ? `${K}` | `${K}.${TDeepKeyOf<T[K][number]>}`
        : T[K] extends object
          ? `${K}` | `${K}.${TDeepKeyOf<T[K]>}`
          : `${K}`;
    }[keyof T & (string | number)]
  : never;

/**
 * TDeepWriteable
 * ROLE: Recursively strips the 'readonly' modifier from all nested properties of an object graph.
 * STRATEGY: Iterates through keys deep-pass to unlock structures specifically during building/mutation phases.
 */
export type TDeepWriteable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? TDeepWriteable<T[P]> : T[P];
};
/**
 * ## TRecursiveRequired — Deep Requirement Utility
 * @utilType type
 * @name TRecursiveRequired
 * @category Advanced Type Utilities
 * @description Recursively removes the optional '?' modifier from every property level, ensuring the structure is fully populated.
 * @link #trecursiverequired
 *
 * @example
 * ```ts
 * type User = {
 *   profile: {
 *     name: string;
 *   };
 * };
 *
 * // {
 * //   readonly profile: {
 * //     readonly name: string;
 * //   };
 * // }
 * type ImmutableUser = TRecursiveRequired<User>;
 * ```
 *
 * The inverse of TRecursivePartial. It ensures the entire structure is fully
 * populated while safely bypassing functions to avoid breaking method signatures.
 */
export type TRecursiveRequired<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends Array<infer U>
    ? Array<TRecursiveRequired<U>>
    : T extends object
      ? { [K in keyof T]-?: TRecursiveRequired<T[K]> }
      : T;

/**
 * ## TRecursiveReadonly — Deep Immutability Utility
 * @utilType type
 * @name TRecursiveReadonly
 * @category Advanced Type Utilities
 * @description Recursively applies the 'readonly' modifier to every property of an object and its children.
 * @link #trecursivereadonly
 *
 * @example
 * ```ts
 * type User = {
 *   profile: {
 *     name: string;
 *   };
 * };
 *
 * // {
 * //   readonly profile: {
 * //     readonly name: string;
 * //   };
 * // }
 * type ImmutableUser = TRecursiveReadonly<User>;
 * ```
 *
 * Recursively applies the 'readonly' modifier to every property of an object,
 * including nested objects and arrays, ensuring the entire structure is immutable.
 */
export type TRecursiveReadonly<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<TRecursiveReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: TRecursiveReadonly<T[K]> }
      : T;

/**
 * @utilType type
 * @name TDeepMerge
 * @category Advanced Type Utilities
 * @description Recursively merges two types T and U, prioritizing U's properties and preserving optionality.
 * @link #tdeepmerge
 *
 * ## 🛠️ TDeepMerge — Recursive Object Merger
 *
 * A high-performance utility that deeply merges two structures. It maps over the
 * combined keys of both types, handling nested objects recursively while
 * maintaining property modifiers (like optionality).
 *
 * @note If a key exists in both T and U, the types are merged. If they are
 * primitives, U typically overrides or unions with T depending on the structure.
 *
 * @template T - The base/original type structure.
 * @template U - The type structure to merge into T.
 */
export type TDeepMerge<T, U> = T extends object
  ? U extends object
    ? {
        [K in keyof (T & U)]: K extends keyof T
          ? K extends keyof U
            ? TDeepMerge<T[K], U[K]>
            : T[K]
          : K extends keyof U
            ? U[K]
            : never;
      }
    : U
  : U;
/**
 * @utilType type
 * @name TRecursivePartial
 * @category Advanced Type Utilities
 * @description Recursively makes every property in an object, including nested structures and arrays, optional.
 * @link #trecursivepartial
 *
 * ## 🧩 TRecursivePartial — Deep Optional Utility
 *
 * Makes every property in an object—and all nested objects/arrays—optional.
 * Ideal for defining partial updates for complex state trees or configuration overrides.
 */
export type TRecursivePartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends Array<infer U>
    ? Array<TRecursivePartial<U>>
    : T extends object
      ? { [P in keyof T]?: TRecursivePartial<T[P]> }
      : T;
