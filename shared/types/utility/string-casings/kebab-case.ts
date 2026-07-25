import type {
  TWords,
  TDelimiterCaseOptions,
  TMergeDelimiterCaseOptions,
} from './shared';

type KebabCaseFromArray<
  WordsArr extends string[],
  Options extends { preserveConsecutiveUppercase: boolean },
> = WordsArr extends [
  infer FirstWord extends string,
  ...infer Rest extends string[],
]
  ? Rest['length'] extends 0
    ? Options['preserveConsecutiveUppercase'] extends true
      ? FirstWord // Preserve: 'ID' -> 'ID'
      : Lowercase<FirstWord> // Don't Preserve: 'ID' -> 'id'
    : Options['preserveConsecutiveUppercase'] extends true
      ? `${FirstWord}-${KebabCaseFromArray<Rest, Options>}`
      : `${Lowercase<FirstWord>}-${KebabCaseFromArray<Rest, Options>}`
  : '';
/**
 * @utilType type
 * @name TKebabCase
 * @category Advanced Type Utilities
 * @description Recursively transforms a string into kebab-case (e.g., hello-world), ideal for CSS classes and URLs.
 * @link #tkebabcase
 *
 * ## 🧵 TKebabCase — Type-Level kebab-case Transformer
 *
 * Converts a string literal or union into `kebab-case`.
 * It automatically splits at camelCase boundaries, spaces, or underscores
 * and joins them with dashes.
 *
 * @template Type - The string literal to transform.
 */
export type TKebabCase<
  Type,
  Options extends TDelimiterCaseOptions = object,
> = Type extends string
  ? string extends Type
    ? Type
    : KebabCaseFromArray<
        TWords<Type>, // Pass raw 'camelCaseInput' here
        TMergeDelimiterCaseOptions<Options>
      >
  : Type;
