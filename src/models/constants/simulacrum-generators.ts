import type { TPercentageBias } from '../types';

/**
 * Shared Immutable ASCII Pools (Zero string wrappers, zero heap allocations)
 *
 * DESIGN INTENT:
 * Consonants: b(98) through z(122). Packs precise lowercase character codes into a
 * flat byte vector. Used by generative algorithms via low-overhead bitwise indices
 * to alternate characters natively in memory, producing pronounceable fake text blocks
 * while completely eliminating the need to load string literals into the engine heap space.
 *
 * Consonants: b(98), c(99), d(100), f(102), g(103), h(104), j(106), k(107), l(108), m(109), n(110), p(112), q(113), r(114), s(115), t(116), v(118), w(119), x(120), y(121), z(122)
 */
/* prettier-ignore */
const CONSONANT_BYTES = new Uint8Array([98, 99, 100, 102, 103, 104, 106, 107, 108, 109, 110, 112, 113, 114, 115, 116, 118, 119, 120, 121, 122]);

/**
 * Shared Immutable ASCII Pools (Zero string wrappers, zero heap allocations)
 *
 * DESIGN INTENT:
 * Vowels: a(97) through u(117). Companion lookup vector paired with CONSONANT_BYTES
 * to drive structural text generation completely free of static dictionary file bloat.
 */
/* prettier-ignore */
const VOWEL_BYTES = new Uint8Array([97, 101, 105, 111, 117]);

/**
 * Shared Immutable URL-Safe Base64 ASCII Pool (Zero string wrappers, zero heap allocations)
 *
 * DESIGN INTENT:
 * Contains exact character codes for: A-Z (65-90), a-z (97-122), 0-9 (48-57), _ (95), - (45).
 * Optimized specifically for high-throughput unique token builders. Because the array length
 * is exactly 64, it allows the engine to utilize a fast bitwise logic gate check (`& 63`)
 * as a high-speed modulo operator, translating random entropy numbers straight into safe web-routing
 * identifiers at the hardware level.
 */
const URL_SAFE_BASE64_BYTES = new Uint8Array([
  65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
  84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106,
  107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121,
  122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 95, 45,
]);

/**
 * Shared Immutable Hexadecimal ASCII Pool (Zero string wrappers, zero heap allocations)
 *
 * DESIGN INTENT:
 * Contains exact character codes for: 0-9 (48-57) and a-f (97-102).
 * Acts as a low-overhead hardware translation table for structural identifiers (such as
 * custom bitwise UUID tracks or system hash strings). It allows your engine to convert raw
 * numeric values into concrete hex characters inside a fixed memory buffer without using
 * expensive string splits or transformations.
 */
/* prettier-ignore */
const HEX_BYTES = new Uint8Array([
  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // 0-9
  97, 98, 99, 100, 101, 102               // a-f
]);

/**
 * Shared Immutable Top-Level Domain (TLD) Byte-Offset Pool (Zero string wrappers, zero heap allocations)
 *
 * DESIGN INTENT:
 * Packs the precise ASCII values for common Web routing domains: 'io', 'net', 'org', and 'dev'.
 * To strictly honor Commandment IX (No Switch Blocks), this buffer uses a fixed-width mapping
 * strategy where each domain is allocated exactly 3 contiguous bytes (padded with 0 if shorter).
 * Generative engines can calculate a fast coordinate offset (index * 3) to stream TLD characters
 * directly into target layout buffers using flat loop operations, completely bypassing string
 * dictionaries and manual branching statements.
 */
/* prettier-ignore */
const TLD_POOL_BYTES = new Uint8Array([
  105, 111, 0,   // io  [Offset 0]
  110, 101, 116, // net [Offset 3]
  111, 114, 103, // org [Offset 6]
  100, 101, 118  // dev [Offset 9]
]);
// Pre-calculated Base64URL ASCII codes for the standard structural JWT Header:
// {"alg":"HS256","typ":"JWT"} -> "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
/* prettier-ignore */
const JWT_HEADER_BYTES = new Uint8Array([
  101, 121, 74, 104, 98, 71, 99, 105, 79, 105, 74, 73, 85, 122, 73, 49, 78, 105, 73, 115, 73, 110, 82, 53, 99, 67, 73, 54, 73, 107, 112, 88, 86, 67, 74, 57
]);

// Pre-calculated Base64URL ASCII codes for a structural deterministic fallback Mock Payload:
// {"sub":"xalor_mock_user","auth":true} -> "eyJzdWIiOiJ4YWxvcl9tb2NrX3VzZXIiLCJhdXRoIjp0cnVlfQ"
/* prettier-ignore */
const DEFAULT_PAYLOAD_BYTES = new Uint8Array([
  101, 121, 74, 122, 100, 87, 73, 105, 79, 105, 74, 52, 121, 103, 120, 118, 99, 108, 57, 116, 98, 71, 78, 114, 88, 51, 118, 122, 90, 88, 73, 105, 76, 67, 74, 104, 100, 88, 82, 111, 73, 106, 112, 48, 99, 110, 86, 108, 102, 81
]);

// Pre-calculated Base64URL ASCII codes for a fixed high-entropy mock signature track:
// "fGst_MockSignatureTrackingBytes_xalorEngineV3"
/* prettier-ignore */
const MOCK_SIGNATURE_BYTES = new Uint8Array([
  102, 71, 115, 116, 95, 77, 111, 99, 107, 83, 105, 103, 110, 97, 116, 117, 114, 101, 84, 114, 97, 99, 107, 105, 110, 103, 66, 121, 116, 101, 115, 95, 120, 97, 108, 111, 114, 69, 110, 103, 105, 110, 101, 86, 51
]);
// Shared Immutable Hexadecimal ASCII Pool (Zero string wrappers, zero heap allocations)
/* prettier-ignore */
const FEISTEL_HEX_BYTES = new Uint8Array([
  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // 0-9
  97, 98, 99, 100, 101, 102               // a-f
]);

/**
 * Shared Immutable ASCII Syntax Markers
 *
 * SIMULACRUM FOUNDATION:
 * Canonical single-byte ASCII control and punctuation markers used throughout
 * Simulacrum's parsing, formatting, and generative utilities. Centralizing
 * these values eliminates magic numbers, improves readability, and provides a
 * single source of truth for structural byte comparisons performed against
 * `Uint8Array` buffers.
 *
 * DESIGN GOALS:
 * - Immutable ASCII byte constants.
 * - Zero string allocations for syntax checks.
 * - Self-documenting structural markers.
 * - Consistent reuse across all parsing and generation pipelines.
 */
export const SIMULACRUM_ASCII_SYNTAX_MARKERS = {
  B_HASH: 35, // #
  B_SPACE: 32, // ' '
  B_NL: 10, // \n
  B_GT: 62, // >
  B_DASH: 45, // -
  B_AST: 42, // *
  B_PERIOD: 46, // .
  B_TICK: 96, // `
} as const;

/**
 * Shared Immutable ASCII Lookup Tables
 *
 * SIMULACRUM FOUNDATION:
 * Centralized byte pools powering the library's generative utilities. These
 * immutable ASCII tables serve as the primitive building blocks for producing
 * deterministic structural representations—identifiers, pronounceable names,
 * tokens, hashes, and other generated artifacts—without allocating temporary
 * strings or maintaining redundant lookup data throughout the codebase.
 *
 * DESIGN GOALS:
 * - Single source of truth for reusable ASCII byte pools.
 * - Zero runtime mutation (`as const` + immutable Uint8Arrays).
 * - Zero string-wrapper overhead during generation.
 * - Cache-friendly lookup tables for high-throughput algorithms.
 */
export const SIMULACRUM_ASCII_TABLES = {
  URL_SAFE_BASE64_BYTES: URL_SAFE_BASE64_BYTES,
  HEX_BYTES: HEX_BYTES,
  VOWEL_BYTES: VOWEL_BYTES,
  CONSONANT_BYTES: CONSONANT_BYTES,
  TLD_POOL_BYTES: TLD_POOL_BYTES,
  JWT_HEADER_BYTES: JWT_HEADER_BYTES,
  DEFAULT_PAYLOAD_BYTES: DEFAULT_PAYLOAD_BYTES,
  MOCK_SIGNATURE_BYTES: MOCK_SIGNATURE_BYTES,
  FEISTEL_HEX_BYTES: FEISTEL_HEX_BYTES,
} as const;

/**
 * Immutable Percentage Bias Strategy Registry
 *
 * SIMULACRUM FOUNDATION:
 * Declarative mathematical distribution strategies used by generative utilities
 * to influence probability, weighting, and selection behavior without branching
 * logic or imperative condition handling.
 *
 * Each strategy transforms a uniform random source into a predictable bias
 * profile, allowing generated artifacts to express controlled variation while
 * maintaining deterministic structural rules at the algorithmic layer.
 *
 * DESIGN GOALS:
 * - Replace switch/conditional behavior with declarative strategy lookup.
 * - Preserve immutable generation rules.
 * - Provide reusable probability shaping primitives.
 * - Keep distribution logic allocation-free and composable.
 *
 */
export const PERCENTAGE_BIAS_STRATEGIES: Record<TPercentageBias, () => number> =
  {
    flat: () => Math.random(),
    high: () => Math.max(Math.random(), Math.random()), // Skews heavily toward 80%-100%
    low: () => Math.min(Math.random(), Math.random()), // Skews heavily toward 0%-20%
    centered: () => (Math.random() + Math.random()) / 2, // Bell-curve clustering around 40%-60%
  };

/**
 * Immutable Time Unit Multiplier Registry
 *
 * SIMULACRUM FOUNDATION:
 * Declarative conversion primitives used by generative utilities to translate
 * human-readable time units into their canonical millisecond representations.
 *
 * This registry provides a static mathematical mapping layer that allows time
 * expressions to be resolved through direct lookup rather than imperative
 * branching, preserving predictable behavior and minimizing runtime overhead.
 *
 * DESIGN GOALS:
 * - Replace switch/conditional conversion gates with declarative mappings.
 * - Maintain immutable time transformation rules.
 * - Provide allocation-free unit resolution.
 * - Keep temporal calculations centralized and extensible.
 *
 * SUPPORTED UNITS:
 * - m: Minutes
 * - h: Hours
 * - d: Days
 * - w: Weeks
 */
export const TIME_UNIT_MULTIPLIERS: Record<string, number> = {
  m: 60 * 1000, // Minute in milliseconds
  h: 60 * 60 * 1000, // Hour in milliseconds
  d: 24 * 60 * 60 * 1000, // Day in milliseconds
  w: 7 * 24 * 60 * 60 * 1000, // Week in milliseconds
} satisfies Record<string, number>;
