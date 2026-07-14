import type { TSolidShape } from '../shape-domain';

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

export type TBakedTripleKV = {
  blueprints: Record<string, TSolidShape>;
  references: Record<string, string>;
  driftTracking: Record<string, TVaultDriftEntry>;
};

/**
 * TSolidVaultMap SNAPSHOT
 *
 * @see {@link GlobalRootTypeDocs.TSolidVaultMap }
 */
export type TSolidVaultMap = {
  blueprints: Map<string, TSolidShape>;
  references: Map<string, string>;
  driftTracking: Map<string, TVaultDriftEntry>;
  manifest?: Map<string, TVaultManifestEntry>;
  registry?: Map<string, TVaultRegistryEntry>;
  errors?: Map<string, TSolidError[]>;
  _isHydrated?: boolean;
};

/**
 * TSolidError
 *
 * @see {@link GlobalRootTypeDocs.TSolidError }
 */
export type TSolidError = {
  readonly key: string;
  readonly pathSnapshot: (string | number)[];
  readonly errorKey: string & {};
  readonly received: unknown;
  readonly shapeContext?: TSolidShape | string | number;
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
