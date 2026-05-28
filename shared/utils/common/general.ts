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
// /**
//  *  UTILITY: SPATIAL POSITION EXTRACTOR
//  *
//  * Extracts line and column character metrics from a standardized location area coordinate string.
//  *
//  * @see {@link TransformerDocs.extractSourcePosition}
//  */
// export function extractSourcePosition(filePath: string): {
//   line: number;
//   character: number;
// } | null {
//   const match = REGEX_PATTERNS.coordinates.exec(filePath);
//   // if (!match) return null;

//   return {
//     line: +match![1],
//     character: +match![2],
//   };
// }
