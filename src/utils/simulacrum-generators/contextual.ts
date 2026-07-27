import {
  SIMULACRUM_ASCII_TABLES,
  SIMULACRUM_ASCII_SYNTAX_MARKERS,
  TIME_UNIT_MULTIPLIERS,
} from '../../models/constants';
import type { TXalorSimTypeMap } from '../../models/types';

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * @see {@link simulacrumGeneratorDocs.generateSemanticEmail}
 */
export const generateSemanticEmail = (propertyKey: string): string => {
  const { CONSONANT_BYTES, VOWEL_BYTES, TLD_POOL_BYTES } =
    SIMULACRUM_ASCII_TABLES;
  const C_LEN = CONSONANT_BYTES.length;
  const V_LEN = VOWEL_BYTES.length;
  const keyLength = propertyKey.length;

  let seed = 0;
  for (let i = 0; i < keyLength; i++) {
    seed = (seed << 5) - seed + propertyKey.charCodeAt(i);
  }
  seed = Math.abs(seed | 0);

  const prefixLength = (seed % 6) + 5; // 5 to 10 characters
  const tldType = seed % 4; // Map to 4 options: io (2), net (3), org (3), dev (3)

  const tldLengths = new Uint8Array([2, 3, 3, 3]); // io, net, org, dev
  const tldLength = tldLengths[tldType];
  const totalBytes = prefixLength + 7 + tldLength;

  const buffer = new Uint8Array(totalBytes);
  let cursor = 0;

  // 3. Generate alternating word structure directly out of the byte pools
  for (let i = 0; i < prefixLength; i++) {
    const isEven = (i & 1) === 0;

    const pool = isEven ? CONSONANT_BYTES : VOWEL_BYTES;
    const poolLen = isEven ? C_LEN : V_LEN;

    const poolIdx = (seed + i) % poolLen;
    buffer[cursor++] = pool[poolIdx];
  }

  // Inject fixed structural tracking bytes for '@xalor.'
  buffer[cursor++] = 64;
  buffer[cursor++] = 120;
  buffer[cursor++] = 97;
  buffer[cursor++] = 108;
  buffer[cursor++] = 111;
  buffer[cursor++] = 114;
  buffer[cursor++] = 46;

  const startOffset = tldType * 3;

  for (let i = 0; i < tldLength; i++) {
    buffer[cursor++] = TLD_POOL_BYTES[startOffset + i];
  }

  return String.fromCharCode.apply(null, buffer as unknown as number[]);
};

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * @see {@link simulacrumGeneratorDocs.generateMockUserHandle}
 */
export const generateMockUserHandle = (propertyKey: string): string => {
  const { CONSONANT_BYTES, VOWEL_BYTES } = SIMULACRUM_ASCII_TABLES;
  const C_LEN = CONSONANT_BYTES.length;
  const V_LEN = VOWEL_BYTES.length;
  const keyLength = propertyKey.length;

  let seed = 0;
  for (let i = 0; i < keyLength; i++) {
    seed = (seed << 5) - seed + propertyKey.charCodeAt(i);
  }
  seed = Math.abs(seed | 0);

  const firstSegmentLength = (seed % 3) + 4; // 4 to 6 characters
  const secondSegmentLength = (seed % 4) + 4; // 4 to 7 characters

  // 🎯 FIXED: Allocate 1 extra byte to safely house the prefix token slot!
  const totalBytes = 1 + firstSegmentLength + secondSegmentLength;
  const buffer = new Uint8Array(totalBytes);

  let cursor = 0;

  // Inject the required structural corporate '@' identifier token at index 0 (ASCII 64)
  buffer[cursor++] = 64;

  for (let i = 0; i < firstSegmentLength; i++) {
    const isEven = (i & 1) === 0;
    const pool = isEven ? CONSONANT_BYTES : VOWEL_BYTES;
    const poolLen = isEven ? C_LEN : V_LEN;
    const rawByte = pool[(seed + i) % poolLen];
    const isFirstChar = i === 0;
    buffer[cursor++] = isFirstChar ? rawByte - 32 : rawByte;
  }

  for (let i = 0; i < secondSegmentLength; i++) {
    const isEven = ((i + 1) & 1) === 0;
    const pool = isEven ? CONSONANT_BYTES : VOWEL_BYTES;
    const poolLen = isEven ? C_LEN : V_LEN;
    const rawByte = pool[(seed * 3 + i) % poolLen];
    const isFirstChar = i === 0;
    buffer[cursor++] = isFirstChar ? rawByte - 32 : rawByte;
  }

  return new TextDecoder().decode(buffer);
};

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * @see {@link simulacrumGeneratorDocs.generateLoremMarkdown}
 */
export const generateLoremMarkdown = ({
  paragraphs = 2,
  sentencesPerParagraph = 0, // 0 dictates mathematical randomization fallback
  wordsPerSentence = 0, // 0 dictates mathematical randomization fallback
  includeHeader = true,
}: TXalorSimTypeMap<'TMarkdownConfig'> = {}): string => {
  // Clamp configuration limits safely via Math primitives to block unsafe inputs
  const pCount = Math.max(1, Math.min(paragraphs, 16));
  const sMax = Math.max(0, Math.min(sentencesPerParagraph, 16));
  const wMax = Math.max(0, Math.min(wordsPerSentence, 32));

  // Resolve vector data structures straight from global shared immutable pools
  const { CONSONANT_BYTES, VOWEL_BYTES } = SIMULACRUM_ASCII_TABLES;
  const MD_C_LEN = CONSONANT_BYTES.length;
  const MD_V_LEN = VOWEL_BYTES.length;

  // Pre-calculate exact maximum safe memory block allocation
  const maxBytes = pCount * 512 + 256;
  const buffer = new Uint8Array(maxBytes);
  let cursor = 0;

  // Local inline generation loop streaming letters directly into our memory segment
  const injectWord = (wordLen: number): void => {
    for (let w = 0; w < wordLen; w++) {
      const isEven = (w & 1) === 0;
      const pool = isEven ? CONSONANT_BYTES : VOWEL_BYTES;
      const poolLen = isEven ? MD_C_LEN : MD_V_LEN;
      buffer[cursor++] = pool[Math.floor(Math.random() * poolLen)];
    }
  };

  // 1. Inject Structural Headers only if explicit authorization flag matches true
  if (includeHeader) {
    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_HASH;
    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_SPACE;
    buffer[cursor++] = 86; // V
    buffer[cursor++] = 97; // a
    buffer[cursor++] = 117; // u
    buffer[cursor++] = 108; // l
    buffer[cursor++] = 116; // t
    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_SPACE;
    buffer[cursor++] = 68; // D
    buffer[cursor++] = 111; // o
    buffer[cursor++] = 99; // c
    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_NL;
    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_NL;

    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_GT;
    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_SPACE;
    buffer[cursor++] = 84; // T
    buffer[cursor++] = 101; // e
    buffer[cursor++] = 108; // l
    buffer[cursor++] = 101; // e
    buffer[cursor++] = 109; // m
    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_SPACE;
    buffer[cursor++] = 110; // n
    buffer[cursor++] = 111; // o
    buffer[cursor++] = 100; // d
    buffer[cursor++] = 101; // e
    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_PERIOD;
    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_NL;
    buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_NL;
  }

  // 2. Primary Hierarchical Document Generation Pass
  for (let p = 0; p < pCount; p++) {
    // Determine target sentence volume mathematically based on user configurations
    const totalSentences =
      sMax === 0 ? Math.floor(Math.random() * 3) + 2 : sMax;

    for (let s = 0; s < totalSentences; s++) {
      const totalWords = wMax === 0 ? Math.floor(Math.random() * 5) + 4 : wMax;

      for (let w = 0; w < totalWords; w++) {
        const randSeed = Math.random();
        const isStartOfSentence = w === 0;

        if (isStartOfSentence) {
          const preCursor = cursor;
          injectWord(Math.floor(Math.random() * 3) + 4);
          buffer[preCursor] = buffer[preCursor] - 32; // Direct subtraction conversion to Uppercase ASCII
        } else if (includeHeader && randSeed > 0.93) {
          buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_AST;
          buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_AST;
          injectWord(Math.floor(Math.random() * 3) + 4);
          buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_AST;
          buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_AST;
        } else if (includeHeader && randSeed > 0.88) {
          buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_TICK;
          injectWord(Math.floor(Math.random() * 3) + 3);
          buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_TICK;
        } else {
          injectWord(Math.floor(Math.random() * 3) + 4);
        }

        const isLastWord = w === totalWords - 1;
        buffer[cursor++] = isLastWord
          ? SIMULACRUM_ASCII_SYNTAX_MARKERS.B_PERIOD
          : SIMULACRUM_ASCII_SYNTAX_MARKERS.B_SPACE;
      }

      const isLastSentence = s === totalSentences - 1;
      if (!isLastSentence) {
        buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_SPACE;
      }
    }

    // 3. Inject structural List Block breaks between consecutive paragraph segments
    const isLastParagraph = p === pCount - 1;
    if (!isLastParagraph) {
      buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_NL;
      buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_NL;

      if (includeHeader) {
        buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_DASH;
        buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_SPACE;
        buffer[cursor++] = 78; // N
        buffer[cursor++] = 111; // o
        buffer[cursor++] = 100; // d
        buffer[cursor++] = 101; // e
        buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_SPACE;
        buffer[cursor++] = 49 + p; // Converts integer increment to ASCII character number dynamically
        buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_NL;
        buffer[cursor++] = SIMULACRUM_ASCII_SYNTAX_MARKERS.B_NL;
      }
    }
  }

  /* prettier-ignore */
  return String.fromCharCode.apply(null, buffer.subarray(0, cursor) as unknown as number[]);
};

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 *
 * @example
 * ```ts
   import { generateRelativeTimestamp } from './primitives';
  
   // 1. Bounded Random Mode (Ideal for realistic user data simulations)
   const creationTime = generateRelativeTimestamp({ pattern: "-1h", allowDrift: true });
   // Returns: "2026-07-26T13:48:12.142Z" (Dynamically drifted by ~52 minutes ago)
  
   // 2. Hard Deterministic Mode (Ideal for rigid integration test assertions)
   const lockedTime = generateRelativeTimestamp({ pattern: "-15m", allowDrift: false });
  // Returns precisely: "2026-07-26T14:29:00.000Z" (Exactly 15 minutes ago on the dot)
 * ```
 *
 * @see {@link simulacrumGeneratorDocs.generateRelativeTimestamp}
 */
export const generateRelativeTimestamp = ({
  pattern = '-0m',
  allowDrift = true,
}: TXalorSimTypeMap<'TTimestampConfig'> = {}): string => {
  const patternLength = pattern.length;

  const safeLength = Math.max(2, Math.min(patternLength, 8));

  const signChar = pattern.charAt(0);
  const unitChar = pattern.charAt(safeLength - 1);

  const numericStringSlice = pattern.substring(1, safeLength - 1);
  const rawValue = parseInt(numericStringSlice, 10);
  const value = Number.isNaN(rawValue) ? 0 : rawValue;

  const unitMultiplier =
    TIME_UNIT_MULTIPLIERS[unitChar] ?? TIME_UNIT_MULTIPLIERS.m;
  const baseDeltaMs = value * unitMultiplier;

  const driftFactor = allowDrift ? 0.9 + Math.random() * 0.2 : 1.0;
  const finalDeltaMs = Math.round(baseDeltaMs * driftFactor);

  const now = Date.now();
  const targetMs = signChar === '+' ? now + finalDeltaMs : now - finalDeltaMs;

  return new Date(targetMs).toISOString();
};
