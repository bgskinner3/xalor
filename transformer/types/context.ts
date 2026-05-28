import type { TVaultSyncPayload } from '../../shared';
/**
 * TXalorTransformerRootContext
 *
 * ROLE:
 * The Master Root Execution Payload Object.
 *
 * STRATEGY:
 * Bundles the long-lived process registries and the short-lived file pass metrics
 * into a single unified parameter container at the root gateway frame. This gives
 * your processing functions high-speed, zero-allocation access to all variables.
 */
/**
 * @deprecated
 */
export type TXalorTransformerRootContext = {
  // 🪐 THE PRESENT: Ephemeral, file-isolated execution tracking variables
  readonly currentActiveAbsoluteFile: string;
  readonly freshKeysHarvestedInThisPass: Set<string>;

  // 🏛️ THE PAST: Long-lived process-level tracking database maps
  readonly globalKeyRegistry: Map<string, TVaultSyncPayload>;
  readonly sessionRegistry: Map<string, string>;
};

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
 * TSessionRegistry
 * The global process memory ledger mapping project-relative file paths
 * straight to their respective Twin-Map session tracking objects.
 */
export type TSessionRegistry = {
  [projectRelativeFilePath: string]: TSessionPathKeys;
};
// export type TSessionPathKeys = {
//   [invocationName: string]: {
//     area: string;
//     anchor: string;
//     filePath: string;
//   };
// };
// export type TSessionRegistry = {
//   [filePath: string]: TSessionPathKeys;
// };

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
};
