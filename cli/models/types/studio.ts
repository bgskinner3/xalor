import type { TTaxonomyTokenKeys } from './audit';
import type {
  TSolidShape,
  TRuntimeTriggerName,
  TTripleKV,
} from '../../../shared';

import { TELEMETRY_API_TOKEN_NAMES } from '../constants';
import type {
  TXalorAuditLifecycleFootprint,
  TAuditToStudioSharedData,
} from './audit';

/**
 * Core primitive lookup types mapped directly from the constant manifests.
 */
export type TTelemetryTokenNames = (typeof TELEMETRY_API_TOKEN_NAMES)[number];

/**
 * TStudioGlobalSummary
 * ROLE: High-level macro aggregation metrics compiled across the workspace.
 *
 * @param totalRegisteredKeys Total number of user-declared macro hooks across the system
 * @param totalUniqueFingerprints Total deduplicated CAS structural nodes committed to disk snapshot
 * @param globalCompactionRatio Overall network and storage space saved repository-wide (0.00 to 1.00)
 * @param totalDatabaseDiskBytes Physical footprint size of node_modules/vault-snapshot.json
 * @param highestGraphDepthRecorded System-wide nesting apex checked directly against the 25-cap limit
 */
type TStudioGlobalSummary = {
  readonly totalRegisteredKeys: number;
  readonly totalUniqueFingerprints: number;
  readonly globalCompactionRatio: number;
  readonly totalDatabaseDiskBytes: number;
  readonly highestGraphDepthRecorded: number;
  readonly compileTimeOverheadMs: number;
};

/**
 * TSystemHygiene
 * ROLE: Aggregated telemetry health indicators used to populate warning system layouts.
 *
 * @param totalOrphanedKeys Global count of stale keys powering the Orphaned Type Detector badge
 * @param totalCriticalDepthWarnings Combined count of all type contracts hovering at depth layers > 20
 * @param hasBreakingContractDrift Master safety flag showing if local changes breach production baselines
 */
type TSystemHygiene = {
  readonly totalOrphanedKeys: number;
  readonly totalCriticalDepthWarnings: number;
  readonly hasBreakingContractDrift: boolean;
};

/**
 * TEnvironment
 * ROLE: Host framework details and synchronization runtime flags.
 *
 * @param activePort The local gateway proxy interface server port (e.g. 8001)
 * @param executionPlatform Host machine execution platform signature (win32, darwin, linux)
 * @param nodeRuntimeVersion Node.js process runtime engine coordinates
 * @param lastTelemetrySyncTimestamp Epoch milliseconds stamp mapping the latest filesystem HMR update pass
 */
type TEnvironment = {
  readonly activePort: number;
  readonly executionPlatform: string;
  readonly nodeRuntimeVersion: string;
  readonly lastTelemetrySyncTimestamp: number;
};
// ======================================================================================================
// ======================================================================================================
// STUDIO NODE ITEM
// ======================================================================================================
// ======================================================================================================

/**
 * TNodeItemIdentity
 * ROLE: Identity properties matching explicit nominal identifiers and cache pointers.
 *
 * @param typeKey Nominal target identifier key (UUID Law)
 * @param symbolName Original declared TypeScript interface or type alias name
 * @param casFingerprint Structural content-addressable storage hash pointer
 */
type TNodeItemIdentity = {
  readonly typeKey: string;
  readonly symbolName: string;
  readonly casFingerprint: string;
  isOrphan: boolean;
};

/**
 * TNodeItemLocation
 * ROLE: Direct spatial file system geometry coordinates mapped for click-to-open links.
 *
 * @param filePath Project-relative path to source file for click-to-open IDE links
 * @param line Starting line coordinate index
 * @param column Starting column coordinate index
 * @param anchorIndex Sequential hook signature offset inside the same file drawer
 */
type TNodeItemLocation = {
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly anchorIndex: number;
};

/**
 * TNodeItemMetrics
 * ROLE: Evaluation complexity scores and nested depth tracking values.
 *
 * @param depth Structural nesting level count (Evaluated against the 25-cap threshold)
 * @param complexityScore O(1) Flat, O(N) Linear, or O(N²) High Risk token keys
 * @param nodesCollapsed Count of duplicate source code structures absorbed by this hash
 */
type TNodeItemMetrics = {
  readonly depth: number;
  readonly complexityScore: TTaxonomyTokenKeys;
  readonly nodesCollapsed: number;
};

/**
 * TStudioApiUsageMap
 * ROLE: Highly structured, serializable JSON registry mapping active API usage.
 * STRATEGY: Binds nominal type keys to their exact operational strategy modifiers point-free.
 *
 * ## 📘 Structural Blueprint Match
 * ```ts
 * {
 *   TRANSACTION_EVENT: { generateXalor: ['mock'], validateXalor: [], transformXalor: [] },
 *   USER_ACCOUNT:      { generateXalor: ['clone', 'default'], validateXalor: [], transformXalor: [] }
 * }
 * ```
 */
export type TStudioApiUsageMap = Record<
  string,
  Record<TRuntimeTriggerName, string[]>
>;

/**
 * TStudioNodeItem
 *
 * ROLE:
 * Comprehensive macro node container mapping detailed item structures for web panels.
 *
 * 🪐 V1 ARCHITECTURE NOTE:
 * The `dataShape` parameter has been explicitly transformed from a raw recursive type
 * graph object (`TSolidShape`) into an pre-flattened, pre-compiled, highly readable
 * TypeScript representation string. This optimization completely eradicates structural
 * data shipping bloat over network pipeline boundaries, drastically slashing JSON payload
 * footprints, minimizing browser-side hydration memory churn, and delivering instant
 * layout render metrics straight out of your loopback server ledger frames.
 *
 * @param identity Unique reference tokens mapping to nominal paths and file signatures
 * @param location Structural file system coordinates enabling direct click-to-open mapping
 * @param dataShape Pre-rendered, human-readable TypeScript representation string format
 * @param metrics Extracted structural density scores and performance weight taxonomies
 */
export type TStudioNodeItem = {
  readonly identity: TNodeItemIdentity;
  readonly location: TNodeItemLocation;
  readonly dataShape: string; // Changed to string for V1 to minimize transmission overhead
  readonly metrics: TNodeItemMetrics;
  readonly apisUsed: Record<TRuntimeTriggerName, string[]>;
};

// export type TXalorAPIMode = 'generateXalor' | 'validateXalor' | 'transformXalor';

// export type TStudioNodeItem = {
//   readonly identity: {
//     readonly typeKey: string;
//     readonly symbolName: string;
//     readonly casFingerprint: string;
//   };
//   readonly location: {
//     readonly filePath: string;
//     readonly line: number;
//     readonly column: number;
//     readonly anchorIndex: number;
//   };
//   readonly dataShape: string;
//   readonly metrics: {
//     readonly depth: number;
//     readonly complexityScore: string;
//     readonly nodesCollapsed: number;
//   };
//   // 🟢 NEW 10X MATRIX TRACKER
//   readonly apisUsed: Record<TXalorAPIMode, readonly string[]>;
// };
// ======================================================================================================
// ======================================================================================================
// FINAL STUDIO PAYLOAD
// ======================================================================================================
// ======================================================================================================

/**
 * IStudioOverviewPayload
 * ROLE: Master context envelope orchestrating the root Loopback transmission pipeline for the Studio UI.
 *
 * @param globalSummary Overall aggregate calculations extracted across the active project vault
 * @param systemHygiene Real-time structural system validation alert state parameters
 * @param lifecycleFootprint Volume analysis showing build-time metadata evaporation deltas
 * @param registryItems Detailed list collection providing fully unrolled metadata and properties
 * @param topology Full connection mapping data used to render interactive link networks
 * @param environment Platform configuration settings and gateway stream identifiers
 */
export interface IStudioOverviewPayload {
  readonly globalSummary: TStudioGlobalSummary;
  readonly systemHygiene: TSystemHygiene;
  readonly lifecycleFootprint: TXalorAuditLifecycleFootprint;
  readonly registryItems: Record<string, TStudioNodeItem>;

  readonly environment: TEnvironment;
}

export type TServerCommands = Partial<Record<NodeJS.Platform, string>>;

// ======================================================================================================
// ======================================================================================================
// BLUEPRINT REBUILDER
// ======================================================================================================
// ======================================================================================================

export type TRebuildParams = {
  readonly shape: TSolidShape;
  readonly pool: Record<string, TSolidShape> | Map<string, TSolidShape>;
  readonly depth: number;
  readonly spacing: string;
};

export type TRebuildStrategy = (params: TRebuildParams) => string;

export type TRebuildShapeMapper = Record<TSolidShape['kind'], TRebuildStrategy>;
export type TFormatNodes = {
  studioPayload: IStudioOverviewPayload;
  sharedData: TAuditToStudioSharedData;
  rawVaultData: TTripleKV;
};
