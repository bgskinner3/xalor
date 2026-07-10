import type { CompilerOptions } from 'typescript';

/**
 * TXalorParsedConfig
 * 🪐 THE UNIFIED COMPILER CONFIGURATION DATA CONTRACT
 *
 * ROLE:
 * An authoritative type specification model ensuring a structured, immutable
 * delivery payload for parsed TypeScript workspace options across the full platform toolchain.
 *
 * DESIGN INVARIANT:
 * Guarantees a zero-config unified footprint pattern, separating raw file-system parameters
 * from the compiler engine logic with absolute compile-time strictness.
 *
 * @param compilerOptions Authoritative TypeScript directives managing emit layouts and target script targets
 * @param includePatterns Readonly array of glob file tracks actively monitored for type contract extractions
 * @param excludePatterns Readonly array of boundary path masks explicitly blacklisted from compilation scans
 * @param isFallbackMode System indicator proving if configuration attributes fall back onto zero-config defaults
 */
export type TXalorParsedConfig = {
  readonly compilerOptions: CompilerOptions;
  readonly includePatterns: readonly string[];
  readonly excludePatterns: readonly string[];
  readonly isFallbackMode: boolean;
};
/**
 * TResolvedConfigPath
 * 🛰️ PATH MATCHING SEPARATOR
 *
 * ROLE:
 * Explicit contract payload tracking the precise configuration filename found
 * on disk and its fully qualified absolute directory resolution path context.
 */
export type TResolvedConfigPath = {
  readonly fileName: string;
  readonly absolutePath: string;
};
