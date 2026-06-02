import type { CompilerOptions } from 'typescript';
import { PACKAGE_FILE_KEY_NAMES } from '../../constants';

/**
 * TCoreFileNamesList
 *
 * List of all file names used for the life cycle flow
 */
export type TPackageFileKey = (typeof PACKAGE_FILE_KEY_NAMES)[number];
export type TCoreFileNameMapper = {
  readonly [Key in TPackageFileKey]: string;
};
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
/**
 * TPackageManifestContract
 * @see {@link SharedTypesDocs.TPackageManifestContract}
 *
 * ROLE:
 * An explicit compile-time typing shape ensuring strict structural layout
 * characteristics for parsed package.json manifest structures.
 */
export type TPackageManifestContract = {
  readonly files?: readonly unknown[];
  readonly dependencies?: Readonly<Record<string, unknown>>;
};

// ================================================================
// LOGGER SERVICE
// ================================================================

export type TLoggerTheme = 'standard' | 'crimson' | 'contrast' | 'naked';
export type TLoggerOutputMode = 'log' | 'str';
export type TLoggerBannerVariant = 'boxed' | 'filled' | 'minimal' | 'split';
export type TTextColorToken =
  | 'default'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';
/* prettier-ignore */
export type TThemeBlocks = Record<Exclude<TLoggerTheme, 'naked'>, { bg: string; fg: string }>;
