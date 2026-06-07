import { XALOR_MESSAGE_HANDLER } from '../error/messages';
import {
  IS_SOLID_SHAPE_KINDS_CONFIG,
  AUDITOR_KEYWORDS,
  SOLID_SHAPE_PRIMITIVE_KEYS,
  CLI_COMMAND_MODES,
  TRANSFORMER_EXECUTE_MODES,
  ALL_CLI_FLAGS,
  IS_SOLID_CONFIG_ITEMS,
} from '../constants';

/**
 * TSolidShapeKinds
 *  The exhaustive list of supported type categories in the Solid system.
 * @see {@link FoundationalTypesDocs.TSolidShapeKinds}
 */
export type TSolidShapeKinds = keyof typeof IS_SOLID_SHAPE_KINDS_CONFIG;

/**
 * TAuditorKeywords
 * List of All Auditing key words in order to build Error messages
 * @see {@link FoundationalTypesDocs.TAuditorKeywords}
 */
export type TAuditorKeywords = (typeof AUDITOR_KEYWORDS)[number];

/**
 * TSolidShapePrimitiveKeys
 * List of All primitive key types in our Transformer
 * @see {@link FoundationalTypesDocs.TSolidShapePrimitiveKeys}
 */
export type TSolidShapePrimitiveKeys =
  (typeof SOLID_SHAPE_PRIMITIVE_KEYS)[number];

// ====================================================================================================
// ====================================================================================================
/**
 * GLOBAL ERROR HANDLER MAPPER KEYS
 */
export type TXalorErrorKey = keyof typeof XALOR_MESSAGE_HANDLER.ERROR;
export type TXalorWarningKey = keyof typeof XALOR_MESSAGE_HANDLER.WARNING;
// ====================================================================================================
// ====================================================================================================

/**
 * TXalorCLIModes
 *
 * Transformer List Modes
 *
 * @see {@link FoundationalTypesDocs.TXalorCLIModes}
 */
export type TXalorCLIModes = keyof typeof CLI_COMMAND_MODES;
/**
 * TXalorCLIModesMap
 *
 * PURPOSE:
 * A strongly-typed mapped utility structure.
 *
 * ROLE:
 * Enables referencing explicit single compiler keys using lookup notation.
 */
export type TXalorCLIModesMap = {
  readonly [K in TXalorCLIModes]: K;
};

/**
 * TCLIFlags
 * ROLE: Strict union type derived from the master allowed flag array index.
 * STRATEGY: Enforces strict type-safety, blocking unknown terminal parameter strings at compile time.
 */
export type TCLIFlags = (typeof ALL_CLI_FLAGS)[number];
/**
 * TTransformerExecuteMode
 *
 * Strict union type matching only: 'watch' | 'compile' | 'vacuum' | 'sudto | 'clear
 */
export type TTransformerExecuteMode = keyof typeof TRANSFORMER_EXECUTE_MODES;
/**
 * TSearchFileNames
 * ROLE: Type-safe contract for the workspace configuration file-name map.
 * STRATEGY: Inferred directly from the source constant object to guarantee
 * consumers remain aligned with the canonical file-name definitions.
 */
export type TSearchFileNames = typeof IS_SOLID_CONFIG_ITEMS.searchFileNames;
// ================================================================================
// ================================================================================
// FILE SYSTEM TYPES
// ================================================================================
// ================================================================================

/* prettier-ignore */
export type TIgnoreDirKeys = (typeof IS_SOLID_CONFIG_ITEMS.fileSystemMap.ignoreDirectories)[number];
/* prettier-ignore */
export type TPackageIndicatorKeys = (typeof IS_SOLID_CONFIG_ITEMS.fileSystemMap.packageIndicators)[number];
/* prettier-ignore */
export type TRepoBoundaryNames = (typeof IS_SOLID_CONFIG_ITEMS.fileSystemMap.workspaceIndicators)[number];
/* prettier-ignore */
export type TAllowedFileExts = (typeof IS_SOLID_CONFIG_ITEMS.fileSystemMap.allowedExtensions)[number];
