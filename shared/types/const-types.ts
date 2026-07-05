import { AUDITOR_KEYWORDS, IS_SOLID_CONFIG_ITEMS } from '../constants';

/**
 * TAuditorKeywords
 * List of All Auditing key words in order to build Error messages
 * @see {@link FoundationalTypesDocs.TAuditorKeywords}
 */
export type TAuditorKeywords = (typeof AUDITOR_KEYWORDS)[number];

// ====================================================================================================
// ====================================================================================================

// ====================================================================================================
// ====================================================================================================

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
