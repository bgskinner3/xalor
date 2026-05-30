import {
  TELEMETRY_API_TOKEN_NAMES,
  DRIFT_VARIANCE_CATEGORIES,
  COMPLEXITY_TAXONOMY_TOKEN_KEYS,
} from '../constants';

/**
 * Core primitive lookup types mapped directly from the constant manifests.
 */
export type TTelemetryTokenNames = (typeof TELEMETRY_API_TOKEN_NAMES)[number];
export type TVarianceCategories = (typeof DRIFT_VARIANCE_CATEGORIES)[number];
export type TTaxonomyTokenKeys = keyof typeof COMPLEXITY_TAXONOMY_TOKEN_KEYS;

/**
 * TXalorAuditSummary
 * ROLE: Core CAS optimization and storage footprint summary ledger.
 *
 * @param totalRegisteredKeys Absolute count of macro identification tags
 * @param totalUniqueFingerprints Count of distinct structural hashes (sh_xxxxxx) post-CAS interning
 * @param casCompressionRatio Percentage of duplicate structures collapsed (e.g. 0.64)
 * @param totalDatabaseDiskBytes Absolute storage footprint of vault-snapshot.json on disk
 * @param highestGraphDepthRecorded System-wide nesting apex (evaluated against the 25-cap boundary)
 */
export type TXalorAuditSummary = {
  readonly totalRegisteredKeys: number;
  readonly totalUniqueFingerprints: number;
  readonly casCompressionRatio: number;
  readonly totalDatabaseDiskBytes: number;
  readonly highestGraphDepthRecorded: number;
};

/**
 * TXalorAuditNode
 * ROLE: Compact, performance-optimized macro metadata record for a single type registration.
 *
 * @param identity Unique identity elements mapping to nominal keys and content hashes
 * @param location Concrete physical file coordinates used by Studio click-to-open links
 * @param metrics Calculated density limits and algorithmic complexity scoring
 */
export type TXalorAuditNode = {
  readonly identity: {
    readonly typeKey: string;
    readonly symbolName: string;
    readonly casFingerprint: string;
  };
  readonly location: {
    readonly filePath: string;
    readonly line: number;
    readonly column: number;
    readonly anchorIndex: number;
  };
  readonly metrics: {
    readonly depth: number;
    readonly complexityScore: TTaxonomyTokenKeys;
    readonly nodesCollapsed: number;
  };
};

/**
 * TXalorAuditHygiene
 * ROLE: High-risk structural alerts mapping depth violations and structural collisions.
 *
 * @param totalOrphanedKeys Count of active keys with zero runtime execution references
 * @param totalCriticalDepthWarnings Count of nodes exceeding safety line boundaries (depth > 20)
 * @param depthWarnings Registry of specific keys looming close to the recursion limit
 * @param duplicateShapes Identical structures compiled under separate unique string keys
 */
export type TXalorAuditHygiene = {
  readonly totalOrphanedKeys: number;
  readonly totalCriticalDepthWarnings: number;
  readonly depthWarnings: readonly {
    readonly typeKey: string;
    readonly currentDepth: number;
  }[];
  readonly duplicateShapes: readonly {
    readonly canonicalHash: string;
    readonly conflictingKeys: readonly string[];
  }[];
};

/**
 * TTelemetryStrategyShape
 * ROLE: Pivot mapping linking runtime strategy sub-commands to static usage markers.
 *
 * @param strategyToken Target runtime identifier token (e.g. 'guard', 'assert')
 * @param invocationCount Total static references found across application distribution code
 */
export type TTelemetryStrategyShape = {
  readonly strategyToken: TTelemetryTokenNames;
  readonly invocationCount: number;
};

/**
 * TXalorAuditTelemetry
 * ROLE: Codebase runtime API strategy usage statistics and orphaned key trackers.
 *
 * @param orphanedKeys Target keys registered inside code but entirely unused at runtime
 * @param strategyDistribution Comprehensive invocation breakdown of the application stack
 */
export type TXalorAuditTelemetry = {
  readonly orphanedKeys: readonly string[];
  readonly strategyDistribution: readonly TTelemetryStrategyShape[];
};

/**
 * TDriftMutationShape
 * ROLE: Deep structural delta audit descriptor tracking contract drift evolution lines.
 *
 * @param typeKey Targeted contract identity experiencing modifications
 * @param changeType Classifies variation category (e.g. BREAKING_MUTATION, COMPATIBLE_ADDITION)
 * @param propertyPath Fully qualified key sequence mapping the target shift location
 * @param description Highly descriptive message outlining backward-compatibility impact
 */
export type TDriftMutationShape = {
  readonly typeKey: string;
  readonly changeType: TVarianceCategories;
  readonly propertyPath: string;
  readonly description: string;
};

/**
 * TXalorAuditDrift
 * ROLE: Critical CI/CD pipeline gate tracking backward-compatibility contract breaks.
 *
 * @param hasBreakingChanges Flag used to trigger zero-tolerance pipeline abort protocols
 * @param mutations Exhaustive tracking array storing all structural modifications
 */
export type TXalorAuditDrift = {
  readonly hasBreakingChanges: boolean;
  readonly mutations: readonly TDriftMutationShape[];
};

/**
 * TXalorAuditTopology
 * ROLE: Directional reference edge map and cyclic micro-loop dependency analyzer.
 *
 * @param edges Multi-node linking map tracing structural sharing networks
 * @param cyclicPaths Self-referential loop pathways threatening compiler stack ceilings
 *
 * NOTE: cyclicPaths
 * - STRUCTURAL DESIGN: A two-dimensional read-only array containing string sequences
 *   of type key dependencies that form a closed structural circuit loop.
 * - OPERATIONAL PURPOSE: Exposes circular reference pathways across custom contracts
 *   (e.g., [['TNodeA', 'TNodeB', 'TNodeC', 'TNodeA']]). This directly feeds the
 *   Studio 3D visualization graph layer to highlight structural coupling risks.
 * - RISK ANALYSIS: Identifies type layouts that bypass normal linear tree execution.
 *   Even if sub-graphs fit within the level-25 limit, circular dependencies introduce
 *   high maintenance overhead and risk stack-overflow crashes if handled by un-shielded
 *   recursive algorithms.
 */
export type TXalorAuditTopology = {
  readonly edges: readonly {
    readonly sourceKey: string;
    readonly targetKey: string;
  }[];
  readonly cyclicPaths: readonly (readonly string[])[];
};

/**
 * TXalorAuditLifecycleFootprint
 * ROLE: Three-phase storage metrics tracking structural size evaporation from cache down to dist/.
 *
 * @param developmentCacheBytes Disk size within cache folder packing extensive metadata and coordinates
 * @param productionEstimatedBytes Stripped bare-metal payload size destined for runtime memory allocation
 * @param netBytesEvaporated Absolute byte volume trimmed out during build-time filtering
 * @param evaporationEfficiencyRatio Compilation compaction scale (0.00 representing 0% to 1.00 for 100%)
 */
export type TXalorAuditLifecycleFootprint = {
  readonly developmentCacheBytes: number;
  readonly productionEstimatedBytes: number;
  readonly netBytesEvaporated: number;
  readonly evaporationEfficiencyRatio: number;
};

/**
 * IXalorAuditPayload
 * ROLE: Master execution payload orchestrating the full macro operational profile overview.
 */
export interface IXalorAuditPayload {
  readonly summary: TXalorAuditSummary;
  readonly nodes: readonly TXalorAuditNode[];
  readonly hygiene: TXalorAuditHygiene;
  readonly telemetry: TXalorAuditTelemetry;
  readonly lifecycleFootprint: TXalorAuditLifecycleFootprint;
  readonly drift: TXalorAuditDrift;
  readonly topology: TXalorAuditTopology;
}
