import { isBigInt, isString, isUndefined } from '../guards';

/**
 * @utilType util
 * @name serialize
 * @category Debug
 * @description Safely serializes any value, including BigInts and circular structures, into a pretty-printed string.
 * @link #serialize
 *
 * ## 🗂️ serialize — Safe Data Stringifier
 *
 * Converts values into readable JSON. Gracefully handles types that normally
 * break `JSON.stringify`, like BigInts, and provides clean indentation.
 *
 * @param data - The value to serialize.
 * @returns A formatted string representation.
 */
export const serialize = (data: unknown): string => {
  if (isUndefined(data)) return 'undefined';
  if (isString(data)) return `"${data}"`;
  if (typeof data === 'bigint') return `${data.toString()}n`;
  if (typeof data === 'symbol') return data.toString();
  try {
    return JSON.stringify(
      data,
      (_, value) => (isBigInt(value) ? value.toString() : value),
      2,
    );
  } catch {
    return String(data);
  }
};
