import {
  ALL_CLI_FLAGS,
  TRANSFORMER_EXECUTE_MODES,
  ALL_XALOR_ENV_KEYS,
  ALL_CLI_COMMANDS,
} from '../constants';

// ================================================
// BASE CLI TYPES
// ================================================
/**
 * ROLE: Authoritative union registry tracking all valid system environment process keys.
 * STRATEGY: Statically restricts variable injection flags to freeze the environment matrix footprint.
 *
 * EXample: "XALOR_CLI_WATCH" ....  "XALOR_CLI_CLEAR"
 */
export type TXalorEnvTokens = (typeof ALL_XALOR_ENV_KEYS)[number];

/**
 * ROLE: Strict union type derived from the master allowed flag array index.
 * STRATEGY: Enforces strict type-safety, blocking unknown terminal parameter strings at compile time.
 *
 * EXample: "fix" ....  "verbose"
 */
export type TCLIFlags = (typeof ALL_CLI_FLAGS)[number];

/**
 * ROLE: Unified literal string union type defining every valid CLI execution path.
 * STRATEGY: Derived directly from the frozen runtime array to prevent type-to-code drift.
 *
 * EXample: "watch" ....  "vacuum"
 */
export type TXalorCLIModes = (typeof ALL_CLI_COMMANDS)[number];

/**
 * Strict union type matching only: 'watch' | 'compile' | 'vacuum' | 'sudto | 'clear
 *
 * EXample: "watch" ....  "vacuum"
 */
export type TTransformerExecuteMode = keyof typeof TRANSFORMER_EXECUTE_MODES;

// ================================================
// MAPPER CLI TYPES
// ================================================
/**
 * TXalorCLIModesMap
 *
 * PURPOSE: A strongly-typed mapped utility structure.
 * ROLE: Enables referencing explicit single compiler keys using lookup notation.
 */
export type TXalorCLIModesMap = {
  readonly [K in TXalorCLIModes]: K;
};
