import type { TVaultSyncPayload } from '../../shared';

export type TGlobalKeyRegistry = Map<string, TVaultSyncPayload>;

// ==============================================================================
// 🪐 TWIN-MAP BIDIRECTIONAL METADATA STRUCTURES
// ==============================================================================
export type TSessionKeyMeta = {
  readonly anchor: string;
  readonly area: string;
  readonly filePath: string;
};

export type TSessionAnchorMeta = {
  readonly keyName: string;
  readonly area: string;
  readonly filePath: string;
};

/**
 * TSessionPathKeys
 * Encapsulates the twin lookup tables isolated for a single file path context.
 */
export type TSessionPathKeys = {
  // Key Name -> Structural Metadata (Anchor Location)
  readonly keys: Record<string, TSessionKeyMeta>;
  // Position Anchor -> Structural Metadata (Key Name Location)
  readonly anchors: Record<string, TSessionAnchorMeta>;
};
/**
 * Compile Command Phases in order to prioritize registration first
 */
export type TCompilationPhase =
  | 'INGEST_REGISTRY'
  | 'REIFY_RUNTIME'
  | 'STANDARD_INLINE';

/**
 * TSessionRegistry
 * The global process memory ledger mapping project-relative file paths
 * straight to their respective Twin-Map session tracking objects.
 */
export type TSessionRegistry = {
  [projectRelativeFilePath: string]: TSessionPathKeys;
};

// ==============================================================================
// ==============================================================================
// CONTEXT METHODS
// ==============================================================================
// ==============================================================================

export type TUpdateSessionRegistry = {
  readonly keyName: string;
  readonly filePath: string;
  readonly area: string; // 15:1
  readonly anchor: string; // #call:1
};
export type TDeleteSessionRegistry = {
  readonly keyName: string;
  readonly filePath: string;
};
export type TXalorEngineContext = {
  readonly globalKeyRegistry: TGlobalKeyRegistry;
  readonly sessionRegistry: TSessionRegistry;
  readonly activePassKeys: Set<string>;
  readonly rootDir: string;
  readonly isHydrated: boolean;
  readonly blacklistedKeys: Set<string>;
  readonly targetedFilesSet: Set<string>;
  readonly compilationPhase: TCompilationPhase;
};
