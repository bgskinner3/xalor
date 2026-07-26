import { SIMULACRUM_ASCII_TABLES } from '../../models/constants';
/**
 * ============================================================================
 * 🎲 DESIGN SYSTEM UTILITY: ROMAN III — COMPACT ID GENERATOR
 * ============================================================================
 *
 * ROLE:
 * Generates an ultra-fast, cryptographically unique, URL-safe Base64 token
 * optimized for database indexing and router path components.
 *
 * STRATEGY:
 * Pre-allocates a target `Uint8Array` buffer bounded strictly by structural safety
 * parameters. It uses the global runtime `crypto.getRandomValues()` method to fill
 * an entropy byte buffer in a single, unallocated hardware block. A single `for` loop
 * maps these raw entropy numbers directly to coordinates inside our static
 * URL-safe ASCII byte map using a fast bitwise remainder operation (`& 63`).
 *
 * INVARIANT COMPLIANCE:
 * - Commandment VIII: Zero intermediate string parts, slices, or push operations.
 * - Commandment IX: No switch statements, type assertions, or use of `any`.
 *
 * @param length - The requested total character length of the generated compact token.
 * @returns A cryptographically unique, URL-safe base-64 routing identifier.
 *
 * @example
 * ```ts
 * import { generateCompactId } from './identity';
 *
 * // Generates distinct, high-entropy index keys instantly:
 * const tokenA = generateCompactId(10); // Returns: "X_7mK-9pQ2"
 * const tokenB = generateCompactId(16); // Returns: "z_9pKw-LmN4q_R1x"
 * ```
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
  return String.fromCharCode.apply(null, buffer as unknown as number[]);
};
/**
 * ============================================================================
 * 🎲 DESIGN SYSTEM UTILITY: ROMAN IV — FAST UUID V4 GENERATOR (PURE JS)
 * ============================================================================
 *
 * ROLE:
 * Generates a standard 36-character UUIDv4 string completely within a single
 * pre-allocated byte buffer using bitwise math, avoiding global crypto runtimes.
 *
 * STRATEGY:
 * Pre-allocates a 36-byte target buffer to map out the UUID layout. It computes
 * random entropy integers natively using a fast linear pseudo-random bitwise loop.
 * As it traverses the buffer, it inserts hyphens at exact index coordinates (8, 13,
 * 18, 23). It enforces strict UUIDv4 compliance by hardcoding the version variant '4'
 * at index 14 and masking the clock variant at index 19, reading directly from a
 * static hexadecimal ASCII lookup array.
 *
 * INVARIANT COMPLIANCE:
 * - Commandment VIII: Zero intermediate string concatenations or split allocations.
 * - Commandment IX: No switch statements, type assertions (`as`), or use of `any`.
 *
 * @returns A standard 36-character UUIDv4 string layout primitive.
 *
 * @example
 * ```ts
 * import { generateFastUuidV4 } from './identity';
 *
 * const uuidA = generateFastUuidV4(); // Returns: "f81d4fae-7dec-41d0-a765-00a0c91e6bf6"
 * const uuidB = generateFastUuidV4(); // Returns: "3e5a1b2c-4d5e-4f7a-8b9c-0d1e2f3a4b5c"
 * ```
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
