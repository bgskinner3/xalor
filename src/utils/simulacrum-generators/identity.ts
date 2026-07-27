import { SIMULACRUM_ASCII_TABLES } from '../../models/constants';

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * @see {@link simulacrumGeneratorDocs.generateCompactId}
 */
export const generateCompactId = (length = 10): string => {
  const { URL_SAFE_BASE64_BYTES } = SIMULACRUM_ASCII_TABLES;
  // Enforce rigid engine boundaries declaratively to protect production server memory
  const targetLength = Math.max(4, Math.min(length, 128));

  // Pre-allocate a single byte array for the output and an equivalent chunk for crypto entropy
  const buffer = new Uint8Array(targetLength);
  const entropy = new Uint8Array(targetLength);

  // Fill the entropy buffer directly from the operating system kernel in one execution step
  crypto.getRandomValues(entropy);

  // Map entropy bytes directly onto the static ASCII character pool via fast pointer manipulation
  for (let i = 0; i < targetLength; i++) {
    // Because the pool length is exactly 64, bitwise AND 63 serves as a blazing fast modulo operator
    buffer[i] = URL_SAFE_BASE64_BYTES[entropy[i] & 63];
  }

  // Exactly one external string allocation emitted via the global runtime decoder
  const result = String.fromCharCode.apply(null, buffer as unknown as number[]);

  return result;
};

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * @see {@link simulacrumGeneratorDocs.generateFastUuidV4}
 */
export const generateFastUuidV4 = (): string => {
  const { HEX_BYTES } = SIMULACRUM_ASCII_TABLES;
  const HYPHEN_BYTE = 45; // Character code for the hyphen separator '-' (45)

  // Fix the exact 36-byte allocation structure up front to block runtime layout shifts
  const buffer = new Uint8Array(36);

  // High-performance structural pointer iteration loop
  for (let i = 0; i < 36; i++) {
    // 1. Declaratively inject structural hyphen boundaries without manual branching statements
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      buffer[i] = HYPHEN_BYTE;
      continue;
    }

    // 2. Enforce absolute UUIDv4 specification validity rules at coordinates 14 and 19
    if (i === 14) {
      buffer[i] = 52; // Hardcoded ASCII for '4' (Version 4 indicator)
      continue;
    }

    // Calculate raw numeric entropy using bitwise-shifted math metrics
    const randomValue = Math.floor(Math.random() * 16);

    if (i === 19) {
      // Clock variant must map strictly to 8, 9, a, or b via a low-overhead bitwise mask
      buffer[i] = HEX_BYTES[(randomValue & 0x3) | 0x8];
      continue;
    }

    // 3. Fallback: Map standard high-entropy numbers onto the hexadecimal ASCII vector array
    buffer[i] = HEX_BYTES[randomValue];
  }

  // Exactly one external string allocation emitted via the global runtime decoder
  return String.fromCharCode.apply(null, buffer as unknown as number[]);
};
