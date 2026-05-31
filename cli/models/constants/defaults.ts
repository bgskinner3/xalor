import type {
  TAuditToStudioSharedData,
  IXalorAuditPayload,
  TXalorAuditTelemetry,
  TTelemetryStrategyShape,
  TXalorAuditNode,
  TXalorAuditDrift,
} from '../types';
import { TDeepWriteable } from '../../../shared';
import { TELEMETRY_API_TOKEN_NAMES } from './audit';
/**
 * DEFAULT_AUDIT_PAYLOAD
 * ROLE: Emergency recovery zero-state container used if snapshot disk reads fail during main CLI cycles.
 * STRATEGY: Recursively strips 'readonly' modifiers to provide a deeply mutable scaffolding shell layout,
 * allowing property keys to initialize or safely merge zero-state vectors without runtime crashes.
 */
export const DEFAULT_AUDIT_PAYLOAD: TDeepWriteable<IXalorAuditPayload> = {
  summary: {
    totalRegisteredKeys: 0,
    totalUniqueFingerprints: 0,
    casCompressionRatio: 0,
    totalDatabaseDiskBytes: 0,
    highestGraphDepthRecorded: 0,
  },
  nodes: [],
  hygiene: {
    totalOrphanedKeys: 0,
    totalCriticalDepthWarnings: 0,
    depthWarnings: [],
    duplicateShapes: [],
  },
  telemetry: { orphanedKeys: [], strategyDistribution: [] },
  lifecycleFootprint: {
    developmentCacheBytes: 0,
    productionEstimatedBytes: 0,
    netBytesEvaporated: 0,
    evaporationEfficiencyRatio: 0,
  },
  drift: { hasBreakingChanges: false, mutations: [] },
  topology: { edges: [], cyclicPaths: [] },
} satisfies TDeepWriteable<IXalorAuditPayload>;
/**
 * DEFAULT_AUDIT_SHARED_PAYLOAD
 * ROLE: Emergency recovery zero-state container used if snapshot disk reads fail during Studio data fetches.
 * STRATEGY: Strips 'readonly' constraints to create an open baseline template tracking raw calculated blocks.
 * Enforces property names and layouts that directly feed the downstream StudioEngine adapter layers.
 */

export const DEFAULT_AUDIT_SHARED_PAYLOAD: TDeepWriteable<TAuditToStudioSharedData> =
  {
    globalSummary: {
      totalRegisteredKeys: 0,
      totalUniqueFingerprints: 0,
      casCompressionRatio: 0,
      totalDatabaseDiskBytes: 0,
      highestGraphDepthRecorded: 0,
    },
    nodes: [],
    systemHygiene: {
      totalOrphanedKeys: 0,
      totalCriticalDepthWarnings: 0,
      depthWarnings: [],
      duplicateShapes: [],
    },
    telemetry: {
      orphanedKeys: [],
      strategyDistribution: [],
    },
    topology: {
      edges: [],
      cyclicPaths: [],
    },
  } satisfies TDeepWriteable<TAuditToStudioSharedData>;

/**
 * INITIAL_MUTABLE_TELEMETRY_TEMPLATE
 * ROLE: Deeply mutable static zero-state template structure tracking API distributions.
 * STRATEGY: Compiles metrics point-free exactly once on engine boot from TELEMETRY_API_TOKEN_NAMES.
 * Recursively un-locks all 'readonly' modifiers to allow direct runtime accumulator additions.
 */
export const INITIAL_MUTABLE_TELEMETRY_TEMPLATE: TDeepWriteable<TXalorAuditTelemetry> =
  {
    orphanedKeys: [],
    strategyDistribution: TELEMETRY_API_TOKEN_NAMES.map(
      (token): TDeepWriteable<TTelemetryStrategyShape> => ({
        strategyToken: token,
        invocationCount: 0,
      }),
    ),
  } satisfies TDeepWriteable<TXalorAuditTelemetry>;
/**
 * CREATE BASE AUDIT NODE RECORD
 * ROLE: Factory utility generating an unallocated, unique object template to insulate properties.
 */
export const BASE_AUDIT_NODE_RECORD: TDeepWriteable<TXalorAuditNode> = {
  identity: {
    typeKey: '',
    symbolName: '',
    casFingerprint: '',
  },
  location: {
    filePath: '',
    line: 0,
    column: 0,
    anchor: 0,
  },
  metrics: {
    depth: 0,
    complexityScore: 'FLAT_O1',
    nodesCollapsed: 1,
  },
} satisfies TDeepWriteable<TXalorAuditNode>;

/**
 * INITIAL_MUTABLE_DRIFT_TEMPLATE
 * ROLE: Deeply mutable static zero-state template structure tracking contract drifts.
 * STRATEGY: Recursively un-locks all 'readonly' modifiers to allow direct runtime
 * array pushes and boolean toggle mutations without any type coercion overrides.
 */
export const INITIAL_MUTABLE_DRIFT_TEMPLATE: TDeepWriteable<TXalorAuditDrift> =
  {
    hasBreakingChanges: false,
    mutations: [],
  } satisfies TDeepWriteable<TXalorAuditDrift>;

/**
 * DEFAULT OOBJECT GENEREATOR
 */
export const DEFAULT_OBJECT_MAPPER = {
  original: DEFAULT_AUDIT_PAYLOAD,
  studio: DEFAULT_AUDIT_SHARED_PAYLOAD,
  telemetry: INITIAL_MUTABLE_TELEMETRY_TEMPLATE,
  node: BASE_AUDIT_NODE_RECORD,
  drift: INITIAL_MUTABLE_DRIFT_TEMPLATE,
} as const;
