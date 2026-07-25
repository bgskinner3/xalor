import type {
  TWords,
  TDelimiterCaseOptions,
  TMergeDelimiterCaseOptions,
} from './shared';

/**
 * Join an array of words with underscores (_), respecting preserveConsecutiveUppercase
 */
type SnakeCaseFromArray<
  WordsArr extends string[],
  Options extends { preserveConsecutiveUppercase: boolean },
  OutputString extends string = '',
> = WordsArr extends [
  infer FirstWord extends string,
  ...infer Rest extends string[],
]
  ? Rest['length'] extends 0
    ? Options['preserveConsecutiveUppercase'] extends true
      ? FirstWord
      : Lowercase<FirstWord>
    : Options['preserveConsecutiveUppercase'] extends true
      ? `${FirstWord}_${SnakeCaseFromArray<Rest, Options>}`
      : `${Lowercase<FirstWord>}_${SnakeCaseFromArray<Rest, Options>}`
  : OutputString;

/**
 * @utilType type
 * @name TSnakeCase
 * @category Advanced Type Utilities
 * @description Recursively transforms a string into snake_case (e.g., hello_world), ideal for database or API keys.
 * @link #tsnakecase
 *
 * ## 🐍 TSnakeCase — Type-Level snake_case Transformer
 *
 * Converts a string literal or union into `snake_case`.
 * Handles normalization of existing separators and ensures all words
 * are joined by underscores.
 *
 * @template Type - The string literal to transform.
 */
export type TSnakeCase<
  Type,
  Options extends TDelimiterCaseOptions = object,
> = Type extends string
  ? string extends Type
    ? Type
    : SnakeCaseFromArray<
        TWords<Type extends Uppercase<Type> ? Lowercase<Type> : Type>,
        TMergeDelimiterCaseOptions<Options>
      >
  : Type;
