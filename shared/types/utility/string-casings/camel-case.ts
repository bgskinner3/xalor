import type {
  TWords,
  TDelimiterCaseOptions,
  TMergeDelimiterCaseOptions,
} from './shared';

type CamelCaseFromArray<
  WordsArr extends string[],
  Options extends { preserveConsecutiveUppercase: boolean },
  IsFirst extends boolean = true,
> = WordsArr extends [
  infer First extends string,
  ...infer Rest extends string[],
]
  ? IsFirst extends true
    ? // Handle the first word: force full lowercase if not preserving
      `${Options['preserveConsecutiveUppercase'] extends true
        ? Uncapitalize<First>
        : Lowercase<First>}${CamelCaseFromArray<Rest, Options, false>}`
    : // Handle subsequent words: force capitalization
      `${Options['preserveConsecutiveUppercase'] extends true
        ? Capitalize<First>
        : Capitalize<
            Lowercase<First>
          >}${CamelCaseFromArray<Rest, Options, false>}`
  : '';

/**
 * @utilType type
 * @name TCamelCase
 * @category Advanced Type Utilities
 * @description Recursively transforms a string or string union into camelCase by normalizing separators and word boundaries.
 * @link #tcamelcase
 *
 * ## 🐪 TCamelCase — Type-Level camelCase Transformer
 *
 * Converts a string literal or union of strings into `camelCase`.
 * It intelligently handles:
 * - **Separators**: Normalizes snake_case, kebab-case, and spaces.
 * - **Casing**: Automatically handles SCREAMING_SNAKE_CASE and PascalCase.
 * - **Inference**: Preserves TypeScript literal types for precise mapping.
 *
 * @template Type - The string literal or union to transform.
 * @template Options - Optional configuration for delimiter handling.
 */
export type TCamelCase<
  Type,
  Options extends TDelimiterCaseOptions = object,
> = Type extends string
  ? string extends Type
    ? Type
    : CamelCaseFromArray<
        TWords<Type extends Uppercase<Type> ? Lowercase<Type> : Type>,
        TMergeDelimiterCaseOptions<Options>,
        true // Explicitly start as first word
      >
  : Type;
