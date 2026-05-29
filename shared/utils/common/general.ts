/**
 * Generates a rapid, zero-dependency 32-bit structural fingerprint from a raw string.
 * @param input - The raw string to hash.
 * @returns A string prefixed with 'sh_' followed by the base-36 hash.
 */
export const computeStringHash = (input: string): string => {
  let hash = 0;
  const len = input.length;

  for (let i = 0; i < len; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Force 32-bit integer
  }

  // Use unsigned right shift (>>> 0) to avoid Math.abs()
  // This prevents negative hash collision skewing
  return `sh_${(hash >>> 0).toString(36)}`;
};
