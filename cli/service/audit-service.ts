import * as fs from 'fs';
import * as path from 'path';
import type {
  IXalorAuditPayload,
  TXalorAuditNode,
  TCalculateDepthParams,
  TDepthWarning,
  TDuplicateShape,
  TTopologyEdge,
  TTelemetryStrategyShape,
  TDriftMutationShape,
  TPropertyDeltaContext,
} from '../models/types';
import {
  DEPTH_STRATEGY_MAPPER,
  DEFAULT_AUDIT_PAYLOAD,
  TELEMETRY_API_TOKEN_NAMES,
  TELEMETRY_TOKEN_NAME_MAPPER,
  PROPERTY_DRIFT_EVALUATION_RULES,
} from '../models/constants';
import {
  yieldItems,
  resolveXalorPaths,
  ObjectUtils,
  isValidSolidShape,
  isNull,
  isObjectShape,
} from '../../shared/utils';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared/constants';
import type {
  TXalorResolvedPaths,
  TTripleKV,
  TVaultManifestEntry,
  TVaultRegistryEntry,
  TSolidShape,
  TDeepWriteable,
} from '../../shared/types';
import {
  parseManifestCoordinates,
  createBaseAuditNodeRecord,
  mapDepthToComplexity,
  recursiveReferenceTracerPipeline,
  buildTopologyEdge,
  mapTopologyGraphCycles,
  buildAdjacencyMap,
} from '../utils';

export class CLIAuditEngineService {
  private readonly paths: TXalorResolvedPaths;
  private readonly projectRoot: string;

  /**
   * @param projectRoot Target workspace directory anchor path
   */
  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    // Switchlessly computes physical drive targets (vaultFile, cacheDir, etc.) exactly once
    this.paths = resolveXalorPaths(projectRoot);
  }

  private generateDefaultPayload(): IXalorAuditPayload {
    return DEFAULT_AUDIT_PAYLOAD;
  }

  /**
   * CALCULATE CAS STORAGE OPTIMIZATION LEDGER
   * ROLE: Compiles high-level macro statistics detailing compiler compaction efficiency.
   *
   * @param vault Statically-typed raw object representing the compiled type registry database
   */
  private calculateCasStorageOptimizationLedger(
    vault: TTripleKV,
  ): TDeepWriteable<IXalorAuditPayload['summary']> {
    // 1. Extract total registered hooks and unique compacted leaves directly from key vectors
    const userKeysArray = Object.keys(vault.references);
    const uniqueHashesArray = Object.keys(vault.blueprints);

    const totalRegisteredKeys = userKeysArray.length;
    const totalUniqueFingerprints = uniqueHashesArray.length;

    // 2. Prevent division-by-zero exceptions if the user boots a completely pristine blank vault
    let casCompressionRatio = 0;
    if (totalRegisteredKeys > 0) {
      // Compression ratio represents the percentage volume of duplicate structures crushed away
      casCompressionRatio = 1 - totalUniqueFingerprints / totalRegisteredKeys;
    }

    // 3. Extract the physical hard disk footprint allocation down to the exact byte safely
    let totalDatabaseDiskBytes = 0;
    try {
      if (fs.existsSync(this.paths.vaultFile)) {
        const fileStats = fs.statSync(this.paths.vaultFile);
        totalDatabaseDiskBytes = fileStats.size;
      }
    } catch {
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

  /**
   * INGEST VAULT SNAPSHOT FROM DISK
   * ROLE: Safe asynchronous database bootloader extracting raw content from node_modules.
   * STRATEGY: Intercepts files using your high-speed discriminator guard to screen data purity.
   */
  // TODO: OPTIMIZE
  private async ingestVaultSnapshotFromDisk(): Promise<TTripleKV | null> {
    try {
      if (!fs.existsSync(this.paths.vaultFile)) {
        return null;
      }

      const rawJsonString = await fs.promises.readFile(
        this.paths.vaultFile,
        'utf-8',
      );
      const parsedVault: unknown = JSON.parse(rawJsonString);

      // Verify the parsed vault structurally exists and possesses the expected sub-drawers
      if (!parsedVault || typeof parsedVault !== 'object') {
        return null;
      }

      const candidate = parsedVault as TTripleKV;
      const blueprintKeys = Object.keys(candidate.blueprints || {});
      const len = blueprintKeys.length;

      // PURE STATIC HIGH-SPEED DISCRIMINATION SCREENING
      // Run your fast boundary discriminator across the blueprints map to verify file hygiene
      for (let i = 0; i < len; i++) {
        const shapeNode = candidate.blueprints[blueprintKeys[i]];
        if (!isValidSolidShape(shapeNode)) {
          // Corrupted or unsupported schema leaf node found. Fail early and safe.
          return null;
        }
      }

      return candidate;
    } catch {
      // Catastrophic Disk Snapshot Recovery Valve (Section X Compliance)
      return null;
    }
  }
  /**
   * CALCULATE BLUEPRINT DEPTH
   * ROLE: Entry-point orchestrator computing structural type nesting depths switchlessly.
   *
   * @param shape Targeted structural schema description block currently being evaluated
   * @param blueprints Authoritative content-addressed storage repository registry map
   * @param traversalStack Path sequence array tracking active parents to prevent infinite cyclic traps
   */
  private calculateBlueprintDepth({
    traversalStack,
    shape,
    blueprints,
  }: TCalculateDepthParams): number {
    // 1. HARD DEPTH CEILING PROTECTION GATE (Commandment XIII Compliance)
    if (traversalStack.length >= 25) return 25;

    const runDistributedStrategy = <K extends TSolidShape['kind']>(
      targetKind: K,
      targetShape: Extract<TSolidShape, { kind: K }>,
    ): number => {
      // Direct lookup from your authoritative DEPTH_STRATEGY_MAPPER constant matrix
      const handler = DEPTH_STRATEGY_MAPPER[targetKind];

      // Safe execution checkpoint guard
      if (!handler) {
        return 0;
      }
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
  /**
   * EVALUATE SYSTEM HYGIENE AND DEPTH ALARMS
   * ROLE: Comprehensive operational scanner calculating active depth limits, alarms, and performance scores.
   * STRATEGY: Maps metrics switchlessly while validating structures against your master IS_SOLID_CONFIG_ITEMS.
   *
   * @param vault The authoritative raw TTripleKV project vault database structure read from disk
   * @param compiledNodes Flat collection array profiling every registered type contract discovered across the codebase
   * @returns Fully compiled hygiene sub-ledger matching your TXalorAuditHygiene specifications
   */
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
      metrics.complexityScore = mapDepthToComplexity(calculatedDepth);

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
      totalOrphanedKeys: 0, // Computed downstream inside Phase 3's bundle scanner step
      totalCriticalDepthWarnings,
      depthWarnings: Object.freeze(depthWarnings),
      duplicateShapes: Object.freeze(duplicateShapes),
    };
  }
  private extractNodeCoreDataLayout(
    vault: TTripleKV,
  ): readonly TXalorAuditNode[] {
    const userKeys = ObjectUtils.keys(vault.references);

    // 1. DEDUPLICATION INDEX LOOKUP MATRIX:
    // Build a quick, O(1) in-memory frequency counter tracking exactly how many times
    // separate user registrations were collapsed into a single content-addressed storage fingerprint.
    const casCollapseCounter: Record<string, number> = {};

    for (const key of userKeys) {
      const fingerprint = vault.references[key];
      casCollapseCounter[fingerprint] =
        (casCollapseCounter[fingerprint] || 0) + 1;
    }

    // 2. INITIALIZE OUTPUT TARGET
    const compiledNodes: TXalorAuditNode[] = [];

    // 3. GENERATOR-BASED SINGLE-PASS COMPILER STREAM (Commandment VIII Alignment)
    for (const typeKey of yieldItems(userKeys)) {
      const nodeRecord = createBaseAuditNodeRecord();

      const casFingerprint = vault.references[typeKey];

      /* prettier-ignore */
      const manifestRow: TVaultManifestEntry | undefined = vault.manifest[typeKey];
      /* prettier-ignore */
      const registryRow: TVaultRegistryEntry | undefined = vault.registry[typeKey];
      /* prettier-ignore */
      const symbolName = registryRow ? registryRow.symbolName : 'anonymous_type';
      const location = parseManifestCoordinates(manifestRow);

      // Update identity parameters cleanly
      nodeRecord.identity.typeKey = typeKey;
      nodeRecord.identity.symbolName = symbolName;
      nodeRecord.identity.casFingerprint = casFingerprint;

      // Update precise physical filesystem coordinates
      nodeRecord.location = location;

      compiledNodes.push(nodeRecord);
    }

    return Object.freeze(compiledNodes);
  }

  /**
   * PROFILE RUNTIME FOOTPRINT AND ORPHANS
   * ROLE: Asynchronous workspace bundle inspector tracking dead weight keys and strategy distributions.
   * STRATEGY: Scans compiled asset production scripts linearly via fs.promises to extract static telemetry.
   *
   * @param vault The authoritative raw TTripleKV project vault database structure read from disk
   * @returns Fully compiled telemetry dataset matching your TXalorAuditTelemetry specifications
   */
  // TODO: MODULARIZE
  private async profileRuntimeFootprintAndOrphans(
    vault: TTripleKV,
  ): Promise<IXalorAuditPayload['telemetry']> {
    const { buildLayer } = IS_SOLID_CONFIG_ITEMS;
    const registeredKeys = ObjectUtils.keys(vault.references);

    const strategyTokensArray = TELEMETRY_API_TOKEN_NAMES;

    const strategyCounters: Record<string, number> = {};

    for (const token of yieldItems(strategyTokensArray)) {
      strategyCounters[token] = 0;
    }
    const activeEncounteredKeysSet = new Set<string>();
    const possibleBuildDirs = buildLayer.allowedOutputDirectories;
    let activeTargetDir = '';

    for (const dir of possibleBuildDirs) {
      const candidatePath = path.join(this.projectRoot, dir);
      if (
        fs.existsSync(candidatePath) &&
        fs.statSync(candidatePath).isDirectory()
      ) {
        activeTargetDir = candidatePath;
        break;
      }
    }

    if (!activeTargetDir) {
      return {
        orphanedKeys: Object.freeze([...registeredKeys]),
        strategyDistribution: Object.freeze(
          strategyTokensArray.map((token) => ({
            strategyToken: token,
            invocationCount: 0,
          })),
        ),
      };
    }
    try {
      const fileNames = await fs.promises.readdir(activeTargetDir);
      const targetJsFiles = fileNames.filter(
        (name) => name.endsWith('.js') || name.endsWith('.mjs'),
      );
      for (const fileName of targetJsFiles) {
        const absoluteFilePath = path.join(activeTargetDir, fileName);
        const fileContentString = await fs.promises.readFile(
          absoluteFilePath,
          'utf-8',
        );

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
    } catch {
      // TODO: add our Error handler logger
      // graceful fallback
    }

    const orphanedKeys: string[] = [];

    for (const key of yieldItems(registeredKeys)) {
      if (!activeEncounteredKeysSet.has(key)) {
        orphanedKeys.push(key);
      }
    }

    const strategyDistribution: TTelemetryStrategyShape[] = [];

    for (const token of yieldItems(strategyTokensArray)) {
      strategyDistribution.push({
        strategyToken: token,
        invocationCount: strategyCounters[token],
      });
    }

    return {
      orphanedKeys: Object.freeze(orphanedKeys),
      strategyDistribution: Object.freeze(strategyDistribution),
    };
  }
  /**
   * COMPUTE LIFECYCLE FOOTPRINT DELTAS
   * ROLE: Equation engine predicting physical size evaporation from heavy dev cache to bare-metal prod.
   * STRATEGY: Simulates data stripping by measuring a subset object payload string size via Buffer.byteLength.
   *
   * @param vault The authoritative raw TTripleKV project vault database structure read from disk
   * @returns Fully compiled footprint tracking ledger matching your TXalorAuditLifecycleFootprint specifications
   */
  private computeLifecycleFootprintDeltas(
    vault: TTripleKV,
  ): IXalorAuditPayload['lifecycleFootprint'] {
    const { blueprints, references, version } = vault;

    let developmentCacheBytes: number | null = null;

    if (fs.existsSync(this.paths.vaultFile)) {
      try {
        developmentCacheBytes = fs.statSync(this.paths.vaultFile).size;
      } catch {
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

  /**
   * EXECUTE SELF-HEALING PRUNE SWEEP
   * ROLE: Destructive in-memory database pruner and filesystem flusher (--fix).
   * STRATEGY:
   * 1. Computes active orphans by running the Phase 3 static tracker inline.
   * 2. Purges dead nominal keys and orphaned CAS blueprint structures permanently.
   * 3. Triggers a clean, non-blocking fs.promises.writeFile snapshot save pass.
   *
   * @param vault Reference to the active in-memory TTripleKV vault object being sanitized
   */
  // TODO: MODULARIZE
  private async executeSelfHealingPruneSweep(vault: TTripleKV): Promise<void> {
    // 1. COMPUTE CURRENT WORKSPACE DEAD WEIGHT (Invoke your Phase 3 tracker)
    const telemetryData = await this.profileRuntimeFootprintAndOrphans(vault);
    const orphanedKeysList = telemetryData.orphanedKeys;
    const orphansLength = orphanedKeysList.length;

    // Short-circuit instantly if the codebase is already perfectly pruned and optimized
    if (orphansLength === 0) {
      return;
    }

    // 2. TIER 1 SANITIZATION: NOMINAL REGISTER DELETIONS
    // Evict the stale registration keys completely across your metadata drawers
    for (const deadKey of yieldItems(orphanedKeysList)) {
      delete vault.references[deadKey];
      delete vault.manifest[deadKey];
      delete vault.registry[deadKey];
    }
    const remainingKeys = ObjectUtils.keys(vault.references);
    const activeHashesInUse = new Set<string>();

    // Initialize the tracking seeds using remaining root level keys
    for (let i = 0; i < remainingKeys.length; i++) {
      const rootHash = vault.references[remainingKeys[i]];
      if (rootHash) {
        activeHashesInUse.add(rootHash);
      }
    }

    // 3. TIER 2 SANITIZATION: CASCADE RECURSIVE CAS BLUEPRINT PURGING
    // Run your switchless standalone tracer utility across all blueprints currently anchored by root keys
    const blueprintKeys = ObjectUtils.keys(vault.blueprints);
    for (const hashKey of yieldItems(blueprintKeys)) {
      if (activeHashesInUse.has(hashKey)) {
        const rootShape = vault.blueprints[hashKey];
        if (rootShape) {
          recursiveReferenceTracerPipeline(
            rootShape,
            vault.blueprints,
            activeHashesInUse,
          );
        }
      }
    }

    // 4. EVICT UNREFERENCED BLUEPRINT HOLES PERMANENTLY
    for (const key of yieldItems(blueprintKeys)) {
      if (!activeHashesInUse.has(key)) {
        delete vault.blueprints[key];
      }
    }

    // 5. ASYNC CACHE DELTA RADAR PASS: ATOMIC DISK PERSISTENCE FLUSH
    try {
      const optimizedJsonString = JSON.stringify(vault, null, 2);

      // Asynchronously overwrite the file snapshot securely, locking the data state
      await fs.promises.writeFile(
        this.paths.vaultFile,
        optimizedJsonString,
        'utf-8',
      );

      // TODO: add our Error handler logger
      console.log(
        `\n🧼 [Xalor Self-Healing]: Successfully evicted ${orphansLength} orphaned keys.`,
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

  /**
   * INTERCEPT CONTRACT DRIFT RADAR
   * ROLE: Historical baseline snapshot comparative analyzer protecting production schemas over time.
   * STRATEGY: Switchlessly cross-examines the active vault data against a frozen disk ledger file
   * to catch backward-compatibility contract breaks before deployment blocks execute.
   *
   * @param activeVault Reference to the current live in-memory TTripleKV database layout being validated
   * @returns Fully compiled contract drift sub-ledger tracking structural modification traces
   */
  private async interceptContractDriftRadar(
    activeVault: TTripleKV,
  ): Promise<IXalorAuditPayload['drift']> {
    /* prettier-ignore */
    /* prettier-ignore */
    const baselineFilePath = path.join(path.dirname(this.paths.vaultFile), 'production-baseline.json');
    const mutations: TDriftMutationShape[] = [];
    let hasBreakingChanges = false;

    // If no production baseline ledger exists on disk yet, flag as a safe initial seed pass
    if (!fs.existsSync(baselineFilePath)) {
      return {
        hasBreakingChanges: false,
        mutations: Object.freeze([]),
      };
    }

    try {
      const rawBaselineString = await fs.promises.readFile(
        baselineFilePath,
        'utf-8',
      );
      const baselineVault: TTripleKV = JSON.parse(rawBaselineString);

      const activeKeys = ObjectUtils.keys(activeVault.references);
      const baselineKeys = ObjectUtils.keys(baselineVault.references);

      // FAST SET-BASED REFERENCE TABLES INDEX (O(1) lookups instead of continuous array scanning)
      const activeKeysSet = new Set(activeKeys);
      const baselineKeysSet = new Set(baselineKeys);
      const rulesLength = PROPERTY_DRIFT_EVALUATION_RULES.length;

      // A. LOOP PASS 1: SCAN FOR NEW ADDITIONS AND SHAPE MUTATIONS
      for (const typeKey of yieldItems(activeKeys)) {
        const activeHash = activeVault.references[typeKey];
        const baselineHash = baselineVault.references[typeKey];

        // Rule 1: Clean addition trace check
        if (!baselineKeysSet.has(typeKey)) {
          mutations.push({
            typeKey,
            changeType: 'COMPATIBLE_ADDITION',
            propertyPath: '$',
            description: `Contract key '${typeKey}' newly declared inside active workspace registry graph.`,
          });
          continue;
        }

        // Extract the physical layout schemas to run deep sub-tree comparison alignments
        const activeShape = activeVault.blueprints[activeHash];
        const baselineShape = baselineVault.blueprints[baselineHash];

        if (activeShape && baselineShape) {
          // Rule 3: Primitive kind constraint check
          if (activeShape.kind !== baselineShape.kind) {
            hasBreakingChanges = true;
            mutations.push({
              typeKey,
              changeType: 'BREAKING_MUTATION',
              propertyPath: '$',
              description: `Type contract primitive kind altered from '${baselineShape.kind}' down to '${activeShape.kind}'.`,
            });
            continue;
          }

          // Deep Property Sub-Tree Comparison for Object Types Switchlessly
          if (isObjectShape(activeShape) && isObjectShape(baselineShape)) {
            for (const propKey in activeShape.properties) {
              if (
                Object.prototype.hasOwnProperty.call(
                  activeShape.properties,
                  propKey,
                )
              ) {
                // 1. Pack the evaluation elements cleanly into your strict context type structure
                const contextPayload: TPropertyDeltaContext = {
                  typeKey,
                  propKey,
                  activeProp: activeShape.properties[propKey],
                  baselineProp: baselineShape.properties[propKey],
                };

                // 2. Stream through your pre-compiled standalone rules array index point-free
                for (let r = 0; r < rulesLength; r++) {
                  const rule = PROPERTY_DRIFT_EVALUATION_RULES[r];

                  if (rule.test(contextPayload)) {
                    // If the matched rule is classified as destructive, trip the global failure alarm gate
                    if (rule.isBreaking) {
                      hasBreakingChanges = true;
                    }

                    // Inject the pristine trace block straight into your accumulator array vector
                    mutations.push({
                      typeKey,
                      changeType: rule.category,
                      propertyPath: `$.${propKey}`,
                      description: rule.describe(),
                    });

                    break; // Short-circuit instantly: this property's delta has been fully resolved
                  }
                }
              }
            }
          }
        }
      }

      // B. LOOP PASS 2: SCAN FOR COMPATIBLE DELETIONS
      for (const baselineKey of yieldItems(baselineKeys)) {
        if (!activeKeysSet.has(baselineKey)) {
          mutations.push({
            typeKey: baselineKey,
            changeType: 'COMPATIBLE_DELETION',
            propertyPath: '$',
            description: `Stale or orphaned contract key permanently evicted from active database registry frames.`,
          });
        }
      }
    } catch {
      // TODO: add our Error handler logger
      // Graceful ingestion safety recovery fallback loop
    }

    return {
      hasBreakingChanges,
      mutations: Object.freeze(mutations),
    };
  }

  /**
   * ANALYZE DEPENDENCY GRAPH TOPOLOGY
   * ROLE: Directional linkage scanner and closed-circuit circular loop path discoverer.
   * STRATEGY: Tracks data nodes via iterative linear stack vectors to protect process memory frames.
   * Populates edge vectors and recursive circles switchlessly without casting hooks.
   *
   * @param vault The authoritative raw TTripleKV project vault database structure read from disk
   * @returns Fully compiled topology mapping metrics satisfying your TXalorAuditTopology specifications
   */
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

  /**
   * EXECUTE FULL AUDIT RUN
   * ROLE: Primary pipeline orchestrator generating the comprehensive macro operational dataset.
   * STRATEGY: Coordinates extraction lanes sequentially to insulate files from memory thrashing.
   *
   * @param flags Readonly feature switches dictating optimization sweeps (--fix)
   * @returns Pure, un-allocated master snapshot payload compliant with IXalorAuditPayload
   */
  // TODO: omptimize
  public async executeFullAuditRun(flags: {
    readonly fix: boolean;
  }): Promise<IXalorAuditPayload> {
    // 1. Safe Ingestion Boundary Pass
    const rawVaultData = await this.ingestVaultSnapshotFromDisk();
    if (!rawVaultData) {
      return this.generateDefaultPayload();
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

    return {
      summary,
      nodes,
      hygiene: {
        ...hygiene,
        // Integrate the orphaned keys count computed inside the runtime telemetry bundle scanner pass
        totalOrphanedKeys: telemetry.orphanedKeys.length,
      },
      telemetry,
      lifecycleFootprint,
      drift,
      topology,
    };
  }
}
