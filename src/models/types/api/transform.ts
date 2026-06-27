import type { TSolidShape } from '../../../../shared';
// ====================================================================
// ====================================================================
// MERGE TYPES
// ====================================================================
// ====================================================================
/**
 * TXalorMergeContext
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

// ====================================================================
// ====================================================================
// CLONE TYPES
// ====================================================================
// ====================================================================
/**
 * TSHAPE_CLONE_MAPPER_MAP
 *
 * ROLE:
 * The static type-system contract for the "Sanitizer" map. It governs deep,
 * data-scrubbing operations to physically wash un-declared properties away.
 *
 * @see CLONE_SHAPE_SANITIZER
 * @see produceClone
 */
export type TShapeCloneMapperMap = {
  [K in TSolidShape['kind']]: (
    /* prettier-ignore */ shape: Extract<TSolidShape, { kind: K }>,
    /* prettier-ignore */ data: unknown,
    /* prettier-ignore */ seen: Map<unknown, unknown>,
    /* prettier-ignore */ depth: number,
    /* prettier-ignore */ recurse: (d: unknown, s: TSolidShape, seen: Map<unknown, unknown>, depth: number) => unknown,
  ) => unknown;
};
