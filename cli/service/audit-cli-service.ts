import * as fs from 'fs';
import * as path from 'path';
import type {
  IXalorAuditPayload,
  TAuditToStudioSharedData,
  TXalorAuditNode,
  TCalculateDepthParams,
  TDepthWarning,
  TDuplicateShape,
  TTopologyEdge,
  TTelemetryTokenNames,
  TPropertyDeltaContext,
  TDefaultReturnKeyMap,
  TParsedLocation,
  TDefaultObjectKeys,
  TTaxonomyTokenKeys,
  TXalorAuditDrift,
} from '../models/types';
import {
  DEPTH_STRATEGY_MAPPER,
  TELEMETRY_API_TOKEN_NAMES,
  TELEMETRY_TOKEN_NAME_MAPPER,
  PROPERTY_DRIFT_EVALUATION_RULES,
  DEPTH_COMPLEXITY_MAPPER,
  DEFAULT_OBJECT_MAPPER,
} from '../models/constants';
import {
  yieldItems,
  resolveXalorPaths,
  ObjectUtils,
  isValidSolidShape,
  isNull,
  isObjectShape,
  isTripleKVShape,
  cloneDeep,
} from '../../shared/utils';
import { IS_SOLID_CONFIG_ITEMS, REGEX_PATTERNS } from '../../shared/constants';
import type {
  TXalorResolvedPaths,
  TTripleKV,
  TVaultManifestEntry,
  TVaultRegistryEntry,
  TSolidShape,
  TDeepWriteable,
} from '../../shared/types';
import {
  recursiveReferenceTracerPipeline,
  buildTopologyEdge,
  mapTopologyGraphCycles,
  buildAdjacencyMap,
} from '../utils';

export class CLIAuditEngineService {
  public readonly paths: TXalorResolvedPaths;
  private readonly projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.paths = resolveXalorPaths(projectRoot);
  }

  /**
   * generateDefaultPayload
   *
   * ROLE: Generates the default audit payload based on the provided type.
   *
   * @see {@link AuditServiceDocs.generateDefaultPayload}
   */
  private generateDefaultPayload<T extends TDefaultObjectKeys>(
    defaultType: T,
  ): TDefaultReturnKeyMap<T> {
    return DEFAULT_OBJECT_MAPPER[defaultType];
  }
  // ================================================================================
  // ================================================================================
  // ================================================================================
  // INGEST VAULT SNAPSHOT FROM DISK
  // ================================================================================
  // ================================================================================
  // ================================================================================
  /** @see {@link AuditServiceDocs.calculateCasStorageOptimizationLedger} */
  private calculateCasStorageOptimizationLedger(
    vault: TTripleKV,
  ): TDeepWriteable<IXalorAuditPayload['summary']> {
    const userKeysArray = Object.keys(vault.references);
    const uniqueHashesArray = Object.keys(vault.blueprints);

    const totalRegisteredKeys = userKeysArray.length;
    const totalUniqueFingerprints = uniqueHashesArray.length;

    let casCompressionRatio = 0;
    if (totalRegisteredKeys > 0) {
      casCompressionRatio = 1 - totalUniqueFingerprints / totalRegisteredKeys;
    }

    let totalDatabaseDiskBytes = 0;
    try {
      if (fs.existsSync(this.paths.vaultFile)) {
        const fileStats = fs.statSync(this.paths.vaultFile);
        totalDatabaseDiskBytes = fileStats.size;
      }
    } catch {
      // TODO: ERROR HANDLER
      // Suppress disk permission faults transparently, leaving the counter at safe zero state
    }

    // 4. Temporary placeholder tracker for the system-wide depth apex (Computed recursively in Phase 2)
    const highestGraphDepthRecorded = 0;

    return {
      totalRegisteredKeys,
      totalUniqueFingerprints,
      casCompressionRatio,
      totalDatabaseDiskBytes,
      highestGraphDepthRecorded,
    };
  }
  // ================================================================================
  // ================================================================================
  // ================================================================================
  // INGEST VAULT SNAPSHOT FROM DISK
  // ================================================================================
  // ================================================================================
  // ================================================================================

  /**  @see {@link AuditServiceDocs.ingestVaultSnapshotFromDisk} */
  private async ingestVaultSnapshotFromDisk(): Promise<TTripleKV | null> {
    try {
      if (!fs.existsSync(this.paths.vaultFile)) return null;

      const rawJsonString = await fs.promises.readFile(
        this.paths.vaultFile,
        'utf-8',
      );
      const parsedVault: unknown = JSON.parse(rawJsonString);

      if (!parsedVault || !isTripleKVShape(parsedVault)) return null;

      const candidate = parsedVault;

      const blueprintKeys = ObjectUtils.keys(candidate.blueprints);
      const blueprints = candidate.blueprints;

      for (const key of blueprintKeys) {
        const shapeNode = blueprints[key];
        if (!isValidSolidShape(shapeNode)) return null;
      }

      return candidate;
    } catch {
      // TODO: ERROR HANDLER
      return null;
    }
  }
  // ================================================================================
  // ================================================================================
  // ================================================================================
  // CALCULATE BLUEPRINT DEPTH MODULARIZED
  // ================================================================================
  // ================================================================================
  // ================================================================================

  /**  @see {@link AuditServiceDocs.calculateBlueprintDepth} */
  private calculateBlueprintDepth({
    traversalStack,
    shape,
    blueprints,
  }: TCalculateDepthParams): number {
    if (traversalStack.length >= 25) return 25;

    const runDistributedStrategy = <K extends TSolidShape['kind']>(
      targetKind: K,
      targetShape: Extract<TSolidShape, { kind: K }>,
    ): number => {
      // Direct lookup from your authoritative DEPTH_STRATEGY_MAPPER constant matrix
      const handler = DEPTH_STRATEGY_MAPPER[targetKind];

      // Safe execution checkpoint guard
      if (!handler) return 0;

      /* prettier-ignore */
      const self = ({shape, blueprints,traversalStack}: TCalculateDepthParams) =>
        this.calculateBlueprintDepth({
          shape,
          blueprints,
          traversalStack,
        });

      return handler(targetShape, blueprints, traversalStack, self);
    };
    return runDistributedStrategy(shape.kind, shape);
  }

  // ================================================================================
  // ================================================================================
  // ================================================================================
  // EVALUATE SYSTEM HYGIENE AND DEPTH ALARMS MODULARIZED
  // ================================================================================
  // ================================================================================
  // ================================================================================

  private mapDepthToComplexity(depth: number): TTaxonomyTokenKeys {
    for (const rule of DEPTH_COMPLEXITY_MAPPER) {
      if (rule.test(depth)) return rule.key;
    }
    return 'FLAT_O1';
  }

  /**  @see {@link AuditServiceDocs.evaluateSystemHygieneAndDepthAlarms} */
  private evaluateSystemHygieneAndDepthAlarms(
    vault: TTripleKV,
    compiledNodes: TDeepWriteable<TXalorAuditNode>[],
  ): IXalorAuditPayload['hygiene'] {
    const maxAllowedDepth = IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth;

    const depthWarnings: TDepthWarning[] = [];
    const duplicateShapes: TDuplicateShape[] = [];

    const inverseHashCluster: Record<string, string[]> = {};
    let totalCriticalDepthWarnings = 0;

    for (const node of compiledNodes) {
      const { identity, metrics } = node;
      const { typeKey, casFingerprint } = identity;

      const rootShape = vault.blueprints[casFingerprint];
      let calculatedDepth = 0;

      if (rootShape) {
        calculatedDepth = this.calculateBlueprintDepth({
          shape: rootShape,
          blueprints: vault.blueprints,
          traversalStack: [],
        });
      }

      metrics.depth = calculatedDepth;
      metrics.complexityScore = this.mapDepthToComplexity(calculatedDepth);

      if (calculatedDepth > maxAllowedDepth) {
        totalCriticalDepthWarnings++;
        depthWarnings.push({
          typeKey,
          currentDepth: calculatedDepth,
        });
      }

      const bucket = (inverseHashCluster[casFingerprint] ??= []);
      bucket.push(typeKey);

      if (bucket.length === 2) {
        duplicateShapes.push({
          canonicalHash: casFingerprint,
          conflictingKeys: bucket,
        });
      }
    }

    return {
      totalOrphanedKeys: 0,
      totalCriticalDepthWarnings,
      depthWarnings: Object.freeze(depthWarnings),
      duplicateShapes: Object.freeze(duplicateShapes),
    };
  }

  // ================================================================================
  // ================================================================================
  // ================================================================================
  // EXTRACT NODE CORE DATA LAYOUT MODULARIZED
  // ================================================================================
  // ================================================================================
  // ================================================================================
  private parseManifestCoordinates(
    manifestRow?: TVaultManifestEntry,
  ): TParsedLocation {
    const filePath = manifestRow ? manifestRow.filePath : 'unknown_source';
    let line = 0;
    let column = 0;
    let anchor = 0;

    if (!manifestRow) {
      return { line, column, anchor, filePath };
    }

    const lineMatch = manifestRow.area?.match(REGEX_PATTERNS.line);
    const colMatch = manifestRow.area?.match(REGEX_PATTERNS.column);
    const anchorMatch = manifestRow.anchor?.match(REGEX_PATTERNS.anchor);

    if (lineMatch?.[1]) line = Number.parseInt(lineMatch[1], 10);
    if (colMatch?.[1]) column = Number.parseInt(colMatch[1], 10);
    if (anchorMatch?.[1]) anchor = Number.parseInt(anchorMatch[1], 10);

    return { line, column, anchor, filePath };
  }

  /**  @see {@link AuditServiceDocs.extractNodeCoreDataLayout}*/
  private extractNodeCoreDataLayout(
    vault: TTripleKV,
  ): readonly TXalorAuditNode[] {
    const userKeys = ObjectUtils.keys(vault.references);

    const casCollapseCounter: Record<string, number> = {};

    for (const key of userKeys) {
      const fingerprint = vault.references[key];
      casCollapseCounter[fingerprint] =
        (casCollapseCounter[fingerprint] || 0) + 1;
    }

    const compiledNodes: TXalorAuditNode[] = [];

    for (const typeKey of yieldItems(userKeys)) {
      const rawNodePayload = this.generateDefaultPayload('node');

      // 💚 PERFORMANCE OPTIMIZATION: Deep clone your structures cleanly using your Axiom utility!
      const nodeRecord = cloneDeep(rawNodePayload);
      const casFingerprint = vault.references[typeKey];

      /* prettier-ignore */ const manifestRow: TVaultManifestEntry | undefined = vault.manifest[typeKey];
      /* prettier-ignore */ const registryRow: TVaultRegistryEntry | undefined = vault.registry[typeKey];
      /* prettier-ignore */ const symbolName = registryRow ? registryRow.symbolName : 'anonymous_type';
      /* prettier-ignore */ const location = this.parseManifestCoordinates(manifestRow);

      // Update identity parameters cleanly
      nodeRecord.identity.typeKey = typeKey;
      nodeRecord.identity.symbolName = symbolName;
      nodeRecord.identity.casFingerprint = casFingerprint;

      nodeRecord.location = location;

      compiledNodes.push(nodeRecord);
    }

    return Object.freeze(compiledNodes);
  }
  // ================================================================================
  // ================================================================================
  // ================================================================================
  // PROFILE RUNTIME FOOTPRINT AND ORPHANS SWEEP MODULARIZED
  // ================================================================================
  // ================================================================================
  // ================================================================================
  private createTelemetryScanContext(
    strategyTokensArray: readonly TTelemetryTokenNames[],
    projectRoot: string,
  ) {
    const { buildLayer } = IS_SOLID_CONFIG_ITEMS;
    const strategyCounters: Record<string, number> = {};

    for (const token of yieldItems(strategyTokensArray)) {
      strategyCounters[token] = 0;
    }
    const activeEncounteredKeysSet = new Set<string>();
    const possibleBuildDirs = buildLayer.allowedOutputDirectories;
    let activeTargetDir = '';

    for (const dir of possibleBuildDirs) {
      const candidatePath = path.join(projectRoot, dir);
      if (
        fs.existsSync(candidatePath) &&
        fs.statSync(candidatePath).isDirectory()
      ) {
        activeTargetDir = candidatePath;
        break;
      }
    }

    return {
      strategyCounters,
      activeEncounteredKeysSet,
      activeTargetDir,
    };
  }
  private async scanTelemetryFiles(
    strategyTokensArray: readonly TTelemetryTokenNames[],
    strategyCounters: Record<string, number>,
    activeEncounteredKeysSet: Set<string>,
    registeredKeys: string[],
    activeTargetDir: string,
  ) {
    const fileNames = await fs.promises.readdir(activeTargetDir);
    /* prettier-ignore */
    const targetJsFiles = fileNames.filter((name) => name.endsWith('.js') || name.endsWith('.mjs'));

    for (const fileName of targetJsFiles) {
      /* prettier-ignore */
      const absoluteFilePath = path.join(activeTargetDir, fileName);
      /* prettier-ignore */
      const fileContentString = await fs.promises.readFile(absoluteFilePath,'utf-8');

      for (const currentKey of yieldItems(registeredKeys)) {
        if (fileContentString.includes(currentKey)) {
          activeEncounteredKeysSet.add(currentKey);
        }
      }

      for (const activeToken of strategyTokensArray) {
        const targetRegex = TELEMETRY_TOKEN_NAME_MAPPER[activeToken];
        if (targetRegex) {
          targetRegex.lastIndex = 0;

          const matches = fileContentString.match(targetRegex);
          if (matches) {
            strategyCounters[activeToken] += matches.length;
          }
        }
      }
    }
  }
  /**  @see {@link AuditServiceDocs.profileRuntimeFootprintAndOrphans}*/
  private async profileRuntimeFootprintAndOrphans(
    vault: TTripleKV,
  ): Promise<IXalorAuditPayload['telemetry']> {
    const telemetryObject = this.generateDefaultPayload('telemetry');
    const strategyTokensArray = TELEMETRY_API_TOKEN_NAMES;
    const registeredKeys = ObjectUtils.keys(vault.references);

    const { strategyCounters, activeEncounteredKeysSet, activeTargetDir } =
      this.createTelemetryScanContext(strategyTokensArray, this.projectRoot);

    if (!activeTargetDir) {
      telemetryObject.orphanedKeys = registeredKeys;
      return telemetryObject;
    }
    try {
      this.scanTelemetryFiles(
        strategyTokensArray,
        strategyCounters,
        activeEncounteredKeysSet,
        registeredKeys,
        activeTargetDir,
      );
    } catch {
      // TODO: add our Error handler logger
      // graceful fallback
    }

    for (const key of yieldItems(registeredKeys)) {
      if (!activeEncounteredKeysSet.has(key)) {
        telemetryObject.orphanedKeys.push(key);
      }
    }

    for (const token of yieldItems(strategyTokensArray)) {
      telemetryObject.strategyDistribution.push({
        strategyToken: token,
        invocationCount: strategyCounters[token],
      });
    }

    return telemetryObject;
  }

  // ================================================================================
  // ================================================================================
  // ================================================================================
  // COMPUTE LIFECYCLE FOOTPRINT DELTAS
  // ================================================================================
  // ================================================================================
  // ================================================================================

  /** @see {@link AuditServiceDocs.computeLifecycleFootprintDeltas} */
  private computeLifecycleFootprintDeltas(
    vault: TTripleKV,
  ): IXalorAuditPayload['lifecycleFootprint'] {
    const { blueprints, references, version } = vault;

    let developmentCacheBytes: number | null = null;

    if (fs.existsSync(this.paths.vaultFile)) {
      try {
        developmentCacheBytes = fs.statSync(this.paths.vaultFile).size;
      } catch {
        // TODO: add our Error handler logger
        developmentCacheBytes = null;
      }
    }
    if (isNull(developmentCacheBytes)) {
      developmentCacheBytes = Buffer.byteLength(JSON.stringify(vault), 'utf-8');
    }
    const productionEstimatedBytes = Buffer.byteLength(
      JSON.stringify({ blueprints, references, version }),
      'utf-8',
    );
    /* prettier-ignore */
    const netBytesEvaporated = Math.max( 0, developmentCacheBytes - productionEstimatedBytes );
    /* prettier-ignore */
    const evaporationEfficiencyRatio = developmentCacheBytes > 0 ? netBytesEvaporated / developmentCacheBytes : 0;

    return {
      developmentCacheBytes,
      productionEstimatedBytes,
      netBytesEvaporated,
      evaporationEfficiencyRatio,
    };
  }

  // ================================================================================
  // ================================================================================
  // ================================================================================
  // EXECUTE SELF-HEALING PRUNE SWEEP MODULARIZED
  // ================================================================================
  // ================================================================================
  // ================================================================================

  private removeOrphanedReferences(
    vault: TTripleKV,
    orphanedKeys: readonly string[],
  ) {
    for (const key of yieldItems(orphanedKeys)) {
      delete vault.references[key];
      delete vault.manifest[key];
      delete vault.registry[key];
    }
  }

  private resolveActiveHashes(vault: TTripleKV): Set<string> {
    const activeHashes = new Set<string>();
    const remainingKeys = ObjectUtils.keys(vault.references);

    for (const key of yieldItems(remainingKeys)) {
      const hash = vault.references[key];
      if (hash) activeHashes.add(hash);
    }

    return activeHashes;
  }

  private traceBlueprintGraph(vault: TTripleKV, activeHashes: Set<string>) {
    const blueprintKeys = ObjectUtils.keys(vault.blueprints);

    for (const key of yieldItems(blueprintKeys)) {
      if (activeHashes.has(key)) {
        const shape = vault.blueprints[key];
        if (shape) {
          recursiveReferenceTracerPipeline(
            shape,
            vault.blueprints,
            activeHashes,
          );
        }
      }
    }
  }

  private purgeUnreferencedBlueprints(
    vault: TTripleKV,
    activeHashes: Set<string>,
  ): void {
    const blueprintKeys = ObjectUtils.keys(vault.blueprints);
    for (const key of yieldItems(blueprintKeys)) {
      if (!activeHashes.has(key)) {
        delete vault.blueprints[key];
      }
    }
  }

  /** @see {@link AuditServiceDocs.executeSelfHealingPruneSweep} */
  private async executeSelfHealingPruneSweep(vault: TTripleKV): Promise<void> {
    const telemetryData = await this.profileRuntimeFootprintAndOrphans(vault);

    if (telemetryData.orphanedKeys.length === 0) return;

    // Pipeline Sub-Routines Step-by-Step execution pass
    this.removeOrphanedReferences(vault, telemetryData.orphanedKeys);

    const activeHashes = this.resolveActiveHashes(vault);
    this.traceBlueprintGraph(vault, activeHashes);

    // SECURE FIX: Safely evict the orphaned shapes from the blueprints map before writing to disk
    this.purgeUnreferencedBlueprints(vault, activeHashes);

    try {
      /* prettier-ignore */
      const optimizedJsonString = JSON.stringify(vault, null, 2);
      /* prettier-ignore */
      await fs.promises.writeFile(this.paths.vaultFile, optimizedJsonString, 'utf-8');

      // TODO: add our Error handler logger
      console.log(
        `\n🧼 [Xalor Self-Healing]: Successfully evicted ${telemetryData.orphanedKeys.length} orphaned keys.`,
      );
      console.log(`💾 Cache files synchronized and optimized cleanly.\n`);
    } catch (error) {
      // TODO: add our Error handler logger
      const details =
        error instanceof Error
          ? error.message
          : 'Filesystem write barrier violation.';
      console.error(
        `❌ [Xalor Self-Healing Error]: Failed to save optimized snapshot to disk: ${details}`,
      );
    }
  }
  // ================================================================================
  // ================================================================================
  // ================================================================================
  // INTERCEPT CONTRACT DRIFT RADAR MODULARIZED
  // ================================================================================
  // ================================================================================
  // ================================================================================

  private identifyEvictedContractDeletions(
    baselineKeys: readonly string[],
    activeKeysSet: Set<string>,
    driftObject: TDeepWriteable<TXalorAuditDrift>,
  ): void {
    for (const baselineKey of yieldItems(baselineKeys)) {
      if (!activeKeysSet.has(baselineKey)) {
        driftObject.mutations.push({
          typeKey: baselineKey,
          changeType: 'COMPATIBLE_DELETION',
          propertyPath: '$',
          description:
            'Stale or orphaned contract key permanently evicted from active database registry frames.',
        });
      }
    }
  }

  private evaluateObjectPropertiesDrift(
    typeKey: string,
    activeShape: TSolidShape & { kind: 'object' },
    baselineShape: TSolidShape & { kind: 'object' },
    driftContext: TDeepWriteable<TXalorAuditDrift>,
  ): void {
    for (const propKey in activeShape.properties) {
      if (
        Object.prototype.hasOwnProperty.call(activeShape.properties, propKey)
      ) {
        const contextPayload: TPropertyDeltaContext = {
          typeKey,
          propKey,
          activeProp: activeShape.properties[propKey],
          baselineProp: baselineShape.properties[propKey],
        };
        for (const rule of PROPERTY_DRIFT_EVALUATION_RULES) {
          if (rule.test(contextPayload)) {
            if (rule.isBreaking) {
              driftContext.hasBreakingChanges = true;
            }

            driftContext.mutations.push({
              typeKey,
              changeType: rule.category,
              propertyPath: `$.${propKey}`,
              description: rule.describe(),
            });

            break;
          }
        }
      }
    }
  }

  /* prettier-ignore */
  private async ingestBaselineVault(baselineFilePath: string): Promise<TTripleKV | null> {
  try {
    const rawBaselineString = await fs.promises.readFile(baselineFilePath, 'utf-8');
    return JSON.parse(rawBaselineString);
  } catch {
    // TODO: ADD ERROR LOGGER
    return null;
  }
}
  private profileStructuralShapeDrift(
    typeKey: string,
    activeVault: TTripleKV,
    baselineVault: TTripleKV,
    driftContext: TDeepWriteable<TXalorAuditDrift>,
  ): void {
    const activeHash = activeVault.references[typeKey];
    const baselineHash = baselineVault.references[typeKey];

    const activeShape = activeVault.blueprints[activeHash];
    const baselineShape = baselineVault.blueprints[baselineHash];

    if (!activeShape || !baselineShape) return;

    // Catch primitive kind constraint alterations switchlessly
    if (activeShape.kind !== baselineShape.kind) {
      driftContext.hasBreakingChanges = true;
      driftContext.mutations.push({
        typeKey,
        changeType: 'BREAKING_MUTATION',
        propertyPath: '$',
        description: `Type contract primitive kind altered from '${baselineShape.kind}' down to '${activeShape.kind}'.`,
      });
      return;
    }

    // Delegate nested property profiles down to the specialized properties handler block
    if (isObjectShape(activeShape) && isObjectShape(baselineShape)) {
      this.evaluateObjectPropertiesDrift(
        typeKey,
        activeShape,
        baselineShape,
        driftContext,
      );
    }
  }
  /** @see {@link AuditServiceDocs.interceptContractDriftRadar} */
  private async interceptContractDriftRadar(
    activeVault: TTripleKV,
  ): Promise<IXalorAuditPayload['drift']> {
    const driftContext = this.generateDefaultPayload('drift');

    const baselineFilePath = this.paths.baselineFile;
    if (!fs.existsSync(baselineFilePath)) return driftContext;

    const baselineVault = await this.ingestBaselineVault(baselineFilePath);
    if (!baselineVault) return driftContext;

    const activeKeys = ObjectUtils.keys(activeVault.references);
    const baselineKeys = ObjectUtils.keys(baselineVault.references);

    const activeKeysSet = new Set(activeKeys);
    const baselineKeysSet = new Set(baselineKeys);

    for (const typeKey of yieldItems(activeKeys)) {
      // Case A: Fresh Addition Trace Check
      if (!baselineKeysSet.has(typeKey)) {
        driftContext.mutations.push({
          typeKey,
          changeType: 'COMPATIBLE_ADDITION',
          propertyPath: '$',
          description: `Contract key '${typeKey}' newly declared inside active workspace registry graph.`,
        });
        continue;
      }

      // Case B: Deep Structural Evaluation Dispatch
      this.profileStructuralShapeDrift(
        typeKey,
        activeVault,
        baselineVault,
        driftContext,
      );
    }
    this.identifyEvictedContractDeletions(
      baselineKeys,
      activeKeysSet,
      driftContext,
    );
    return driftContext;
  }

  // ================================================================================
  // ================================================================================
  // ================================================================================
  // ANALYZE DEPENDENCY GRAPH TOPOLOGY
  // ================================================================================
  // ================================================================================
  // ================================================================================
  /** @see {@link AuditServiceDocs.analyzeDependencyGraphTopology} */
  private analyzeDependencyGraphTopology(
    vault: TTripleKV,
  ): IXalorAuditPayload['topology'] {
    const blueprintKeys = ObjectUtils.keys(vault.blueprints);

    /* prettier-ignore */
    const edges: TTopologyEdge[] = buildTopologyEdge(blueprintKeys, vault);
    /* prettier-ignore */
    const adjacencyMap: Record<string, string[]> = buildAdjacencyMap(blueprintKeys, edges)
    /* prettier-ignore */
    const cyclicPaths: string[][] = mapTopologyGraphCycles(blueprintKeys, adjacencyMap);

    const frozenCyclicPaths: readonly (readonly string[])[] = cyclicPaths.map(
      (path) => Object.freeze(path),
    );

    return {
      edges: Object.freeze(edges),
      cyclicPaths: Object.freeze(frozenCyclicPaths),
    };
  }

  // ================================================================================
  // ================================================================================
  // ================================================================================
  // SYNC AUDIT BASELINE FILE
  // ================================================================================
  // ================================================================================
  // ================================================================================
  /** @see {@link AuditServiceDocs.syncAuditBaselineFile} */
  private async syncAuditBaselineFile(vault: TTripleKV): Promise<void> {
    try {
      const optimizedJsonString = JSON.stringify(vault, null, 2);

      // Asynchronously overwrite or create the file snapshot directly in the cache track destination
      await fs.promises.writeFile(
        this.paths.baselineFile,
        optimizedJsonString,
        'utf-8',
      );
    } catch {
      // TODO: add our Error handler logger
      // Suppress filesystem boundary blocks cleanly to prevent metric presentation interrupts
    }
  }

  // !!! ================================================================================
  // !!! ================================================================================
  // !!! EXECUTION METHODS
  // !!! ================================================================================
  // !!! ================================================================================

  // TODO: omptimize
  /** @see {@link AuditServiceDocs.executeFullAuditRun} */
  public async executeFullAuditRun(flags: {
    readonly fix: boolean;
  }): Promise<IXalorAuditPayload> {
    // 1. Safe Ingestion Boundary Pass
    const rawVaultData = await this.ingestVaultSnapshotFromDisk();
    if (!rawVaultData) {
      return this.generateDefaultPayload('original');
    }

    // 2. Self-Healing Optimization Guard Pass (Phase 4)
    if (flags.fix) {
      await this.executeSelfHealingPruneSweep(rawVaultData);
    }

    // 3. Parallel Extraction Sub-Pipelines (Phase 1 through Phase 5 Calculations)
    const summary = this.calculateCasStorageOptimizationLedger(rawVaultData);

    // We pass our types through TDeepWriteable cleanly to let downstream metrics populate safely
    const nodes = this.extractNodeCoreDataLayout(rawVaultData);
    const mutableNodesCopy = [...nodes];

    const hygiene = this.evaluateSystemHygieneAndDepthAlarms(
      rawVaultData,
      mutableNodesCopy,
    );
    const telemetry =
      await this.profileRuntimeFootprintAndOrphans(rawVaultData);
    const lifecycleFootprint =
      this.computeLifecycleFootprintDeltas(rawVaultData);

    // Final Phase 5 Structural Computations
    const drift = await this.interceptContractDriftRadar(rawVaultData);
    const topology = this.analyzeDependencyGraphTopology(rawVaultData);

    // Update the master summary ledger with the system-wide highest depth found during hygiene tracking
    summary.highestGraphDepthRecorded = nodes.reduce(
      (max, node) => Math.max(max, node.metrics.depth),
      0,
    );
    // Automatically creates or overwrites the production-baseline.json file
    // inside your node_modules/.cache track to lock this execution pass state.
    await this.syncAuditBaselineFile(rawVaultData);

    return {
      summary,
      nodes,
      hygiene: {
        ...hygiene,
        totalOrphanedKeys: telemetry.orphanedKeys.length,
      },
      telemetry,
      lifecycleFootprint,
      drift,
      topology,
    };
  }

  /** @see {@link AuditServiceDocs.executeStudioOverviewRun} */
  public async executeStudioOverviewRun(): Promise<TAuditToStudioSharedData> {
    const rawVaultData = await this.ingestVaultSnapshotFromDisk();

    if (!rawVaultData) {
      return this.generateDefaultPayload('studio');
    }

    const globalSummary =
      this.calculateCasStorageOptimizationLedger(rawVaultData);

    const nodes = this.extractNodeCoreDataLayout(rawVaultData);
    const mutableNodesCopy = [...nodes];

    const systemHygiene = this.evaluateSystemHygieneAndDepthAlarms(
      rawVaultData,
      mutableNodesCopy,
    );

    const telemetry =
      await this.profileRuntimeFootprintAndOrphans(rawVaultData);
    const topology = this.analyzeDependencyGraphTopology(rawVaultData);
    const drift = await this.interceptContractDriftRadar(rawVaultData);

    globalSummary.highestGraphDepthRecorded = nodes.reduce(
      (max, node) => Math.max(max, node.metrics.depth),
      0,
    );

    return {
      globalSummary,
      nodes,
      systemHygiene: {
        ...systemHygiene,
        totalOrphanedKeys: telemetry.orphanedKeys.length,
      },
      telemetry,
      topology,
      drift,
    };
  }
}
