import type { TSolidShape } from '../shape-domain';
import type { TRuntimeApiErrorRules } from '../error';
/**
 * TVaultManifestEntry
 *
 * data structure for manifest vault
 *
 * @see {@link GlobalRootTypeDocs.TVaultManifestEntry }
 */
export type TVaultManifestEntry = {
  area: string;
  filePath: string;
  anchor: string;
};

/**
 * TVaultRegistryEntry
 *
 * data structure for Registry vault
 *
 * @see {@link GlobalRootTypeDocs.TVaultRegistryEntry }
 */
export type TVaultRegistryEntry = { symbolName: string; typeName: string };

/**
 * TVaultDriftEntry
 *
 * @key version - The ancestral generation token label constraint marker
 * @key hash - The content-addressed hash identifier pointing back into the blueprints pool
 *
 */
export type TVaultDriftEntry = {
  readonly currentKey: string;
  readonly ancestorKey?: string;
};

/**
 * TRIPLE-KV SNAPSHOT
 *
 * The persistence schema for vault-snapshot.json (The Bunker).
 *
 * @see {@link GlobalRootTypeDocs.TTripleKV }
 */
export type TTripleKV = {
  blueprints: Record<string, TSolidShape>;
  manifest: Record<string, TVaultManifestEntry>;
  registry: Record<string, TVaultRegistryEntry>;
  references: Record<string, string>;
  driftTracking: Record<string, TVaultDriftEntry>;
  version: string;
};

/**
 * TSolidVaultMap SNAPSHOT
 *
 * @see {@link GlobalRootTypeDocs.TSolidVaultMap }
 */
export type TSolidVaultMap = {
  blueprints: Map<string, TSolidShape>;
  references: Map<string, string>;
  manifest: Map<string, TVaultManifestEntry>;
  registry: Map<string, TVaultRegistryEntry>;
  driftTracking: Map<string, TVaultDriftEntry>;
  errors: Map<string, TSolidError[]>;
  _isHydrated?: boolean;
};

/**
 * TSolidError
 *
 * @see {@link GlobalRootTypeDocs.TSolidError }
 */
export type TSolidError = {
  key: string;
  path: string;
  message: string;
  expected: string | TSolidShape;
  received: unknown;
  area?: string; // Runtime failure GPS
  origin?: string | TVaultManifestEntry; // Definition GPS
};

/**
 * TXalorRuleKind
 *
 * @see {@link GlobalRootTypeDocs.TXalorRuleKind }
 */
// export type TXalorRuleKind =
//   | 'primitive_mismatch'
//   | 'literal_mismatch'
//   | 'missing_property'
//   | 'excess_property'
//   | 'invalid_key_format' // 🛡️ Added
//   | 'union_exhausted'
//   | 'intersection_breached'
//   | 'depth_overflow'
//   | 'missing_key_presence'
//   | 'missing_from_vault'
//   | 'function_mismatch'
//   | 'instance_mismatch'
//   | 'brand_constraint_violation'
//   | 'function_returns_violation'
//   | 'collection_bounds_exceeded';
/**
 * TXalorIssue
 *
 * @key path - The full dot-notation breadcrumb path matching the payload (e.g., '$.address.zip')
 * @key expected - A human-readable description or stringified representation of the required shape
 * @key received - A stringified JSON or primitive readout of the broken input that was provided
 * @key rule - The specific type-system rule or boundary law that was violated
 *
 * @see {@link GlobalRootTypeDocs.TXalorIssue }
 */
export type TXalorIssue = {
  path: string;
  expected: string;
  received: string;
  rule: TRuntimeApiErrorRules;
};

/**
 * TXalorAuditReport
 *
 * @key valid - Quick flag indicating if the data satisfies the target blueprint
 * @key issues - An array containing deterministic diagnostic traces for each failure found
 *
 * @see {@link GlobalRootTypeDocs.TXalorAuditReport }
 */
export type TXalorAuditReport = {
  valid: boolean;
  issues: TXalorIssue[];
};
/**
 * TXalorResolvedPaths
 *
 * return structure for build paths in our lifecycle process
 *
 * @see {@link GlobalRootTypeDocs.TXalorResolvedPaths }
 */
export type TXalorResolvedPaths = {
  readonly rootDir: string;
  readonly cacheDir: string;
  readonly vaultFile: string;
  readonly bridgeDir: string;
  readonly bridgeFile: string;
  readonly bakedFile: string;
  readonly baselineFile: string;
};
