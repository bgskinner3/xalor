import {
  DRIFT_VARIANCE_CATEGORIES,
  COMPLEXITY_TAXONOMY_TOKEN_KEYS,
  DEFAULT_OBJECT_MAPPER,
} from '../constants';
import type {
  TSolidShape,
  TSolidObjectRawShape,
  TDeepWriteable,
  TRuntimeTriggerName,
  TTripleKV,
} from '../../../shared';
import type {
  TTelemetryTokenNames,
  TStudioApiUsageMap,
  TStudioNodeItem,
  IStudioOverviewPayload,
} from './studio';

/**
 * Core primitive lookup types mapped directly from the constant manifests.
 */
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
  readonly compileTimeOverheadMs: number;
};

export type TParsedLocation = {
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly anchor: number;
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
  readonly location: TParsedLocation;
  metrics: {
    depth: number;
    complexityScore: TTaxonomyTokenKeys;
    rawComplexityScore: number;
    nodesCollapsed: number;
  };
};

export type TDepthWarning = {
  readonly typeKey: string;
  readonly currentDepth: number;
};
export type TDuplicateShape = {
  readonly canonicalHash: string;
  readonly conflictingKeys: readonly string[];
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
  totalOrphanedKeys: number;
  readonly totalCriticalDepthWarnings: number;
  readonly depthWarnings: readonly TDepthWarning[];
  readonly duplicateShapes: readonly TDuplicateShape[];
};

/**totalOrphanedKeys
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
  readonly studioAPIMapper: TStudioApiUsageMap;
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
export type TTopologyEdge = {
  readonly sourceKey: string;
  readonly targetKey: string;
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
  readonly edges: readonly TTopologyEdge[];
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
  readonly physicalPackageMetrics: TAuditSizeMetrics;
};

/**
 * TAuditToStudioSharedData
 * ROLE: Local untransformed pipeline bridge type tracking raw computations shared with the Studio layer.
 * STRATEGY: Enforces strict structural boundaries to expose calculation sheets zero-cast.
 */
export type TAuditToStudioSharedData = {
  readonly globalSummary: TXalorAuditSummary;
  readonly nodes: readonly TXalorAuditNode[];
  readonly systemHygiene: TXalorAuditHygiene;
  readonly telemetry: TXalorAuditTelemetry;
  readonly lifecycleFootprint: TXalorAuditLifecycleFootprint;
  readonly drift: TXalorAuditDrift;
};
/**
 * TPackageSizeMetrics
 * 🪐 THE AUTHORITATIVE PACKAGE WEIGHT DATA CONTRACT
 *
 * ROLE:
 * An explicit type specification model ensuring a structured, immutable delivery
 * payload for package physical weights and installation footprint telemetry.
 *
 * DESIGN INVARIANT:
 * Governs deep, compiler-safe metric tracking point-free, linking distribution weights
 * back to workspace presentation panels with absolute type-safety under Commandment I.
 *
 * @param bundleSizeBytes The exact physical unzipped weight of what tsup emits and npm packs (dist, README.md, LICENSE)
 * @param estimatedInstallFootprintBytes The projected absolute installation weight added to a user's node_modules workspace (Bundle + Dependencies)
 * @param productionDependenciesCount Direct count of production dependencies listed in package.json to prevent architectural bloat
 * @param isMissingManifest Safety boundary flag indicating if the parser executed inside a folder missing a package.json file
 */
export type TAuditSizeMetrics = {
  readonly bundleSizeBytes: number;
  readonly estimatedInstallFootprintBytes: number;
  readonly productionDependenciesCount: number;
  readonly isMissingManifest: boolean;
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

// ======================================================================================================
// ======================================================================================================
// SERVICE TYPES
// ======================================================================================================
// ======================================================================================================
type TDefaultReturnMap = {
  original: IXalorAuditPayload;
  studio: TAuditToStudioSharedData;
  telemetry: TDeepWriteable<TXalorAuditTelemetry>;
  node: TDeepWriteable<TXalorAuditNode>;
  drift: TDeepWriteable<TXalorAuditDrift>;
  packageMetrics: TDeepWriteable<TAuditSizeMetrics>;
  studioNode: TDeepWriteable<TStudioNodeItem>;
  studioDefault: IStudioOverviewPayload;
};
export type TDefaultObjectKeys = keyof typeof DEFAULT_OBJECT_MAPPER;

export type TDefaultReturnKeyMap<K extends keyof TDefaultReturnMap> =
  TDefaultReturnMap[K];

// ======================================================================================================
// ======================================================================================================
// METHOD TYPES
// ======================================================================================================
// ======================================================================================================
export type TUnrolledCountParams<K extends TSolidShape['kind']> = {
  readonly shape: Extract<TSolidShape, { kind: K }>;
  readonly blueprints: TTripleKV['blueprints'];
  readonly visited: Set<string>;
};

export type TUnrolledCountCrawlerMapper = {
  readonly [K in TSolidShape['kind']]: (
    params: TUnrolledCountParams<K>,
  ) => number;
};
/**
 * TReferenceCollectorHandler
 * ROLE: Pure functional signature contract for structural shape reference tracers.
 */
export type TReferenceCollectorHandler<K extends TSolidShape['kind']> = (
  shape: Extract<TSolidShape, { kind: K }>,
  activeSet: Set<string>,
  self: (shape: TSolidShape) => void,
) => void;

export type TReferenceCollectorMapper = {
  [K in TSolidShape['kind']]: TReferenceCollectorHandler<K>;
};

/**
 * TPropertyDeltaContext
 * ROLE: Local payload container holding property descriptors for comparison boundaries.
 */
export type TPropertyDeltaContext = {
  readonly typeKey: string;
  readonly propKey: string;
  readonly activeProp: TSolidObjectRawShape;
  readonly baselineProp: TSolidObjectRawShape | undefined;
};

/**
 * TPropertyDriftRule
 * ROLE: Pure functional signature contract governing contract drift evaluation criteria rows.
 * STRATEGY: Enforces strict type matching across category labels to remove casting shortcuts entirely.
 */
export type TPropertyDriftRule = {
  readonly test: (ctx: TPropertyDeltaContext) => boolean;
  readonly category: TVarianceCategories;
  readonly isBreaking: boolean;
  readonly describe: () => string;
};

export type TScanTelemetryParams = {
  counters: Record<string, number>;
  seenKeys: Set<string>;
  registeredKeySet: Set<string>;
  targetDir: string;
  excludes: readonly string[];
  apiUsageCollectionMap: Map<string, Record<TRuntimeTriggerName, Set<string>>>;
};

export type TAPIModeCounter = {
  sanitizedFileString: string;
  registeredKeySet: Set<string>;
  counters: Record<string, number>;
  seenKeys: Set<string>;
};
export type TAPIStudioModeCounter = {
  counters: Record<string, number>;
  sanitizedFileString: string;
  apiUsageCollectionMap: Map<string, Record<TRuntimeTriggerName, object>>;
};
export type TCapturedAPICall = {
  readonly apiMode: string;
  readonly targetKey: string;
  readonly strategyToken: string;
};

// ================================================================
// ================================================================
// ================================================================
// COMPLEXITY SERVICE TYPES
// ================================================================
// ================================================================
// ================================================================

export type TComplexityParams = {
  readonly shape: TSolidShape;
  readonly pool: Record<string, TSolidShape> | Map<string, TSolidShape>;
  readonly currentDepth: number;
  readonly visited: Set<string>;
  readonly telemetry: { nodesCount: number };
};
export type TCalculatedMetricsResult = {
  readonly depth: number;
  readonly nodesCollapsed: number;
  readonly rawComplexityScore: number;
};

export type TComplexityCrawlerMapper = {
  readonly [K in TSolidShape['kind']]: (params: TComplexityParams) => number;
};
/**
 * TMaxDepthParams
 * ROLE: Local payload parameter box tracking context for depth calculations.
 * STRATEGY: Enforces type narrowing via specific generic kind extractors point-free.
 */
export type TMaxDepthParams<K extends TSolidShape['kind']> = {
  readonly shape: Extract<TSolidShape, { kind: K }>;
  readonly pool: Record<string, TSolidShape> | Map<string, TSolidShape>;
  readonly visited: Set<string>;
};

/**
 * TMaxDepthCrawlerMapper
 * ROLE: Exhaustive polymorphic strategy dictionary contract resolving physical layers.
 * SPECIFICATIONS:
 * - Maps every single TSolidShape['kind'] token to its exact narrowed depth evaluation function.
 * - Guarantees hard strictness under Commandment IX: zero as-casts, zero any-mutes.
 */
export type TMaxDepthCrawlerMapper = {
  readonly [K in TSolidShape['kind']]: (params: TMaxDepthParams<K>) => number;
};
