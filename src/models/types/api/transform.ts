// ====================================================================
// ====================================================================
// MERGE TYPES
// ====================================================================
// ====================================================================

/**
 *
 *
 *
 * @key dataOne - The baseline target object graph retrieved from memory, state, or database storage
 * @key dataTwo - The incoming secondary partial delta payload patch containing property overrides
 * @key pick - Optional: Explicit root-field extraction retention list (Zod-like pick)
 * @key omit - Optional: Root property exclusion pruning list (Zod-like omit)
 * @key map -
 *
 */
export type TXalorMergeContext<T> = {
  readonly dataOne: unknown;
  readonly dataTwo: unknown;
  readonly pick?: Array<keyof T | string>;
  readonly omit?: Array<keyof T | string>;
  readonly map?: Partial<{
    [K in keyof T]: (value: T[K], parentGraph: Readonly<Partial<T>>) => T[K];
  }>;
};
