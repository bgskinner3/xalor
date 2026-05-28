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
