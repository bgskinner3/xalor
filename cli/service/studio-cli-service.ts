import * as os from 'os';
import type {
  IStudioOverviewPayload,
  TDefaultObjectKeys,
  TDefaultReturnKeyMap,
  TFormatNodes,
} from '../models/types';
import type { TTripleKV } from '../../shared/types';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared/constants';
import {
  yieldItems,
  cloneDeep,
  isValidSolidShape,
  isKeyInObject,
  measurePayloadSizeMB,
  buildAbsolutePathTypeLink,
  computeStringHash,
  isUndefined,
} from '../../shared';
import { fsContext } from '../../shared/service';
import { auditEngineService } from './cli-audit-engine';
import {
  DEFAULT_OBJECT_MAPPER,
  STUDIO_COMMAND_CONFIG,
} from '../models/constants';
import { complexityService } from './complexity-service';

export class StudioCLIEngineService {
  private cliConfigOptions = IS_SOLID_CONFIG_ITEMS.cliConfig;
  private createDefaultAuditTemplate<T extends TDefaultObjectKeys>(
    defaultType: T,
  ): TDefaultReturnKeyMap<T> {
    const baseStaticTemplate = DEFAULT_OBJECT_MAPPER[defaultType];

    return cloneDeep(baseStaticTemplate);
  }

  /**
   * CHECK MEMORY BUDGET & STRUCTURAL STABILITY GATE
   *
   * Role: Evaluates the aggregated dataset payload against global performance thresholds.
   *
   * Further Notes
   * @see {@link StudioServiceDocs.checkMemoryBudget}
   *
   * !! Payload Reduction Strategies
   * @see {@link StudioServiceDocs.ReductionStrategies}
   */
  private checkMemoryBudget(payload: IStudioOverviewPayload) {
    if (!payload) return;

    const currentPayloadSizeMB = measurePayloadSizeMB(payload);

    const currentBlueprintCount = Object.keys(payload.blueprints || {}).length;
    if (currentPayloadSizeMB >= this.cliConfigOptions.studioMemRejectionMax) {
      throw new Error(
        `ENGINE_MEMORY_CEILING_BREACHED\n` +
          `====================================================\n` +
          `🚨 [FATAL EXCEPTION] ENGINE MEMORY CEILING BREACHED\n` +
          `❌ Current Weight: ${currentPayloadSizeMB} MB\n` +
          `🔒 Absolute Production Cap: ${this.cliConfigOptions.studioMemRejectionMax} MB\n` +
          `💡 Action: Modularize blueprints or prune nested literal sets.\n` +
          `====================================================`,
      );
    }

    /* prettier-ignore */
    if (currentBlueprintCount > this.cliConfigOptions.studioMemMaxBlueprintCount) {
      throw new Error(
        `BLUEPRINT_DENSITY_CAP_EXCEEDED\n` +
          `====================================================\n` +
          `🚨 [FATAL EXCEPTION] BLUEPRINT DENSITY CAP EXCEEDED\n` +
          `❌ Registered Blueprints: ${currentBlueprintCount}\n` +
          `🔒 Maximum Allowed Density: ${this.cliConfigOptions.studioMemMaxBlueprintCount}\n` +
          `💡 Action: Split giant layout matrices across workspace contexts.\n` +
          `====================================================`,
      );
    }
  }
  private formatNodes(
    params: TFormatNodes,
    references: TTripleKV['references'],
    blueprints: TTripleKV['blueprints'],
  ) {
    let absoluteWorkspaceMaxScore = 0;
    const { studioPayload, rawVaultData, sharedData } = params;
    const nodes = sharedData.nodes;
    const { studioAPIMapper, orphanedKeys } = sharedData.telemetry;
    const orphanLookup = new Set(orphanedKeys);

    for (const node of yieldItems(nodes)) {
      if (!node) continue;

      const uuidName = node.identity.typeKey;
      /* prettier-ignore */
      const blueprintShape = rawVaultData.blueprints[node.identity.casFingerprint];

      const manifest = rawVaultData.manifest[uuidName];
      if (!isValidSolidShape(blueprintShape)) continue;

      const template = this.createDefaultAuditTemplate('studioNode');

      /* prettier-ignore */
      const filePathLink = buildAbsolutePathTypeLink(manifest.area, manifest.filePath);
      const filePath = node.location.filePath;
      const normalized = filePath.replace(/^\.\.\//, '');
      const baseUUid = `${normalized}#L${node.location.line}`;

      // Hydrate identity primitives point-free
      template.identity.id = computeStringHash(baseUUid, 'loc_');
      template.identity.typeKey = uuidName;
      template.identity.symbolName = node.identity.symbolName;
      template.identity.isOrphan = orphanLookup.has(uuidName);

      template.location = {
        filePath: normalized,
        filePathLink: filePathLink,
        anchorIndex: node.location.anchor,
      };

      template.blueprintId = isKeyInObject(uuidName)(references)
        ? references[uuidName]
        : 'unknown';
      template.dataShape = 'REBUILD IN BROWSER';

      const { depth, rawComplexityScore, nodesCollapsed } =
        complexityService.harvestBlueprintMetrics(blueprintShape, blueprints);

      if (rawComplexityScore > absoluteWorkspaceMaxScore) {
        absoluteWorkspaceMaxScore = rawComplexityScore;
      }

      template.metrics.depth = depth;
      template.metrics.rawComplexityScore = rawComplexityScore;
      template.metrics.nodesCollapsed = nodesCollapsed;

      if (isKeyInObject(uuidName)(studioAPIMapper)) {
        template.apisUsed = studioAPIMapper[uuidName];
      }
      studioPayload.registryItems[uuidName] = template;
    }

    nodes.forEach((node) => {
      if (!node) return;

      const uuidName = node.identity.typeKey;
      const template = studioPayload.registryItems[uuidName];

      // 🎯 THE PERIMETER GUARD: If this node was filtered out during Pass 1,
      // skip it cleanly to prevent undefined reference crashes.
      if (isUndefined(template)) return;

      const rawComplexityScore = template.metrics.rawComplexityScore;

      // 🎯 THE GRADATION: Calculate the relative percentage bracket token switchlessly
      const complexityScore = complexityService.mapScoreToExtendedTaxonomy(
        rawComplexityScore,
        absoluteWorkspaceMaxScore,
      );

      // Commit the finalized Big-O taxonomy classification to both mirrors instantly!
      template.metrics.complexityScore = complexityScore;
      node.metrics.complexityScore = complexityScore; // 👈 Keeps sharedData perfectly synchronized in O(1) constant time
    });
  }

  // !!! ================================================================================
  // !!! ================================================================================
  // !!! EXECUTION METHODS
  // !!! ================================================================================
  // !!! ================================================================================

  /**
   * COMPILE DASHBOARD OVERVIEW DATASET
   *
   * ROLE: Master transformation engine mapping raw payload calculations to web contracts point-free.
   *
   * Further Notes
   * @see {@link StudioServiceDocs.compileDashboardOverviewDataset}
   */
  public async compileDashboardOverviewDataset(
    activePort: number,
  ): Promise<IStudioOverviewPayload> {
    const studioPayload = this.createDefaultAuditTemplate('studioDefault');
    const rawVaultData = await fsContext.ingestVaultSnapshotFromDisk();

    // Fire your optimized, headless audit calculator loop pass to fetch raw data calculation sheets
    const sharedData = await auditEngineService.executeStudioOverviewRun();

    if (!rawVaultData || sharedData.globalSummary.totalRegisteredKeys === 0) {
      return studioPayload;
    }
    /* prettier-ignore */ studioPayload.environment.activePort = activePort ?? STUDIO_COMMAND_CONFIG.port;
    /* prettier-ignore */ studioPayload.environment.executionPlatform = os.platform();
    /* prettier-ignore */ studioPayload.environment.nodeRuntimeVersion = process.version;
    /* prettier-ignore */ studioPayload.environment.lastTelemetrySyncTimestamp = Date.now();
    // =========================================================================
    // GLOBAL SUMMARY FOOTPRINT HYDRATION
    // =========================================================================
    /* prettier-ignore */ studioPayload.globalSummary.globalCompactionRatio = sharedData.globalSummary.casCompressionRatio
    /* prettier-ignore */ studioPayload.globalSummary.highestGraphDepthRecorded = sharedData.globalSummary.highestGraphDepthRecorded
    /* prettier-ignore */ studioPayload.globalSummary.totalDatabaseDiskBytes = sharedData.globalSummary.totalDatabaseDiskBytes
    /* prettier-ignore */ studioPayload.globalSummary.totalRegisteredKeys = sharedData.globalSummary.totalRegisteredKeys
    /* prettier-ignore */ studioPayload.globalSummary.totalUniqueFingerprints = sharedData.globalSummary.totalUniqueFingerprints
    /* prettier-ignore */ studioPayload.globalSummary.compileTimeOverheadMs = sharedData.globalSummary.compileTimeOverheadMs

    // =========================================================================
    // SYSTEM HYGIENE FOOTPRINT HYDRATION
    // =========================================================================
    /* prettier-ignore */ studioPayload.systemHygiene.totalOrphanedKeys = sharedData.telemetry.orphanedKeys.length;
    /* prettier-ignore */ studioPayload.systemHygiene.totalCriticalDepthWarnings = sharedData.systemHygiene.totalCriticalDepthWarnings;
    /* prettier-ignore */ studioPayload.systemHygiene.hasBreakingContractDrift = sharedData.drift.hasBreakingChanges;

    // =========================================================================
    // LIFECYCLE MEMORY FOOTPRINT HYDRATION
    // =========================================================================
    /* prettier-ignore */ studioPayload.lifecycleFootprint = sharedData.lifecycleFootprint;

    // =========================================================================
    // PHYSICAL INFRASTRUCTURE ENVIRONMENT HYDRATION
    // =========================================================================
    /* prettier-ignore */ studioPayload.environment.activePort = activePort;

    // =========================================================================
    // TOPOLOGY AND EDGE NODES
    // =========================================================================
    /* prettier-ignore */ studioPayload.topology = sharedData.topology;

    // 3. EXECUTE REGISTRY HYDRATION INTERACTION PASS
    this.formatNodes(
      { studioPayload, sharedData, rawVaultData },
      rawVaultData.references,
      rawVaultData.blueprints,
    );

    /* prettier-ignore */ studioPayload.blueprints = rawVaultData.blueprints;

    const resolvedPayload = Object.freeze(studioPayload);
    this.checkMemoryBudget(resolvedPayload);
    return resolvedPayload;
  }
}

export const studioEngine = new StudioCLIEngineService();
