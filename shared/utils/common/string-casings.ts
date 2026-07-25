import type { TCamelCase, TKebabCase, TSnakeCase } from '../../types';

const toWords = (value: string): string[] => {
  if (!value) return [];

  // 1. Split by existing delimiters (space, dash, underscore)
  // 2. Use a regex that catches:
  //    - Lowercase to Uppercase transitions (camelCase -> camel, Case)
  //    - Acronym boundaries (XMLHttp -> XML, Http)
  //    - Numbers
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // XMLHttp -> XML Http
    .replace(/[^a-zA-Z0-9]+/g, ' ') // delimiters -> space
    .trim()
    .split(/\s+/);
};

/**
 * @utilType util
 * @name toCamelCase
 * @category String Transformers
 * @description Converts a string from any format (snake, kebab, space) into camelCase.
 * @link #tocamelcase

 * ### Example
 *
 * ```ts
 * toCamelCase('hello-world'); // "helloWorld"
 * toCamelCase('user_name'); // "userName"
 * toCamelCase('Hello World'); // "helloWorld"
 * ```
 */
export const toCamelCase = <T extends string>(
  value: T | string,
): TCamelCase<T | string> => {
  const words = toWords(value);
  if (words.length === 0) return '';

  return words
    .map((word, idx) => {
      const lower = word.toLowerCase();
      return idx === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('') as TCamelCase<T>;
};
/**
 * @utilType util
 * @name toKebabCase
 * @category String Transformers
 * @description Converts a string into kebab-case, ideal for URLs and CSS class names.
 * @link #tokebabcase
 *
 * ### Example
 *
 * ```ts
 * toKebabCase('helloWorld'); // "hello-world"
 * toKebabCase('User Name'); // "user-name"
 * toKebabCase('user_name'); // "user-name"
 * ```
 */
export const toKebabCase = <T extends string>(
  value: T | string,
): TKebabCase<T | string> => {
  const words = toWords(value);
  if (words.length === 0) return '';

  return words.map((word) => word.toLowerCase()).join('-') as TKebabCase<T>;
};
/**
 * @utilType util
 * @name toSnakeCase
 * @category String Transformers
 * @description Converts a string into snake_case, commonly used for database and API fields.
 * @link #tosnakecase

 *
 * ### Example
 *
 * ```ts
 * toSnakeCase('helloWorld'); // "hello_world"
 * toSnakeCase('User Name'); // "user_name"
 * toSnakeCase('user-name'); // "user_name"
 * ```
 */
export const toSnakeCase = <T extends string>(
  value: T | string,
): TSnakeCase<T | string> => {
  const words = toWords(value);
  if (words.length === 0) return '';

  return words.map((word) => word.toLowerCase()).join('_') as TSnakeCase<T>;
};
