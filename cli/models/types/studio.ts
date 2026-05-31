import type { TTaxonomyTokenKeys } from './audit';
import type { TSolidShape } from '../../../shared';

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
 * TLifeCycleFootPrint
 * ROLE: Three-phase storage metrics tracking raw structural evaporation deltas.
 *
 * @param developmentCacheBytes Footprint size inside node_modules/.cache with spatial IDE coordinates
 * @param productionEstimatedBytes Predicted size of bare-metal validation schema migrating to production bundles
 * @param netBytesEvaporated Volume of metadata fat permanently sliced away by the build-time engine
 * @param evaporationEfficiencyRatio Performance trimming efficiency coefficient (0.00 to 1.00)
 */
type TLifeCycleFootPrint = {
  readonly developmentCacheBytes: number;
  readonly productionEstimatedBytes: number;
  readonly netBytesEvaporated: number;
  readonly evaporationEfficiencyRatio: number;
};

/**
 * TTopology
 * ROLE: Structural sharing network edge links and cyclic reference path vectors.
 *
 * @param edges Origin-to-target mapping tracing physical type dependency vectors
 * @param cyclicPaths Multi-dimensional array tracing closed-circuit recursion loops
 */
type TTopology = {
  readonly edges: readonly {
    readonly sourceKey: string;
    readonly targetKey: string;
  }[];
  readonly cyclicPaths: readonly (readonly string[])[];
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
 * TStudioNodeItem
 * ROLE: Comprehensive macro node container mapping detailed item structures for web panels.
 *
 * @param identity Unique reference tokens mapping to nominal paths and file signatures
 * @param location Structural file system coordinates enabling direct click-to-open mapping
 * @param dataShape Direct mapping to your recursive build-time type graph database layout
 * @param metrics Extracted structural density scores and performance weight taxonomies
 */
export type TStudioNodeItem = {
  readonly identity: TNodeItemIdentity;
  readonly location: TNodeItemLocation;
  readonly dataShape: TSolidShape;
  readonly metrics: TNodeItemMetrics;
};

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
  readonly lifecycleFootprint: TLifeCycleFootPrint;
  readonly registryItems: TStudioNodeItem[];
  readonly topology: TTopology;
  readonly environment: TEnvironment;
}
