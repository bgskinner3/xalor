// import * as fs from 'fs';
import * as os from 'os';
import type { TDeepWriteable, TTripleKV } from '../../shared/types';
import type { IStudioOverviewPayload, TXalorAuditNode } from '../models/types';
import { yieldItems } from '../../shared/utils';
import { fsContext } from '../../shared/service';
// import { CLIAuditEngineService } from './audit-cli-service';
import { auditEngineService } from './cli-audit-engine';
import {
  DEFAULT_STUDIO_PAYLOAD,
  STUDIO_COMMAND_CONFIG,
} from '../models/constants';
import { generateSolidTypeScriptString } from '../utils';

export class StudioCLIEngineService {
  // private readonly auditEngine: CLIAuditEngineService;

  // constructor(projectRoot: string) {
  //   this.auditEngine = new CLIAuditEngineService(projectRoot);
  // }

  private generateDefaultPayload(
    fallbackPort?: number,
  ): TDeepWriteable<IStudioOverviewPayload> {
    // 💚 CRITICAL FIX: Deep clone the blueprint so previous compilation loops don't bleed data
    const freshPayload = JSON.parse(
      JSON.stringify(DEFAULT_STUDIO_PAYLOAD),
    ) as TDeepWriteable<IStudioOverviewPayload>;

    freshPayload.environment.activePort =
      fallbackPort ?? STUDIO_COMMAND_CONFIG.port;
    freshPayload.environment.executionPlatform = os.platform();
    freshPayload.environment.nodeRuntimeVersion = process.version;
    freshPayload.environment.lastTelemetrySyncTimestamp = Date.now();

    // Explicitly guarantee registryItems starts completely empty for the new loop pass
    freshPayload.registryItems = {};

    return freshPayload;
  }

  private formatRegistryItems(
    studioPayload: IStudioOverviewPayload,
    nodes: readonly TXalorAuditNode[],
    rawVaultData: TTripleKV,
  ) {
    for (const node of yieldItems(nodes)) {
      const blueprintShape =
        rawVaultData.blueprints[node.identity.casFingerprint];

      if (blueprintShape) {
        // 🪐 THE KV ASSIGNMENT: Make the unique typeKey the primary index accessor
        studioPayload.registryItems[node.identity.typeKey] = {
          identity: {
            typeKey: node.identity.typeKey,
            symbolName: node.identity.symbolName,
            casFingerprint: node.identity.casFingerprint,
          },
          location: {
            filePath: node.location.filePath,
            line: node.location.line,
            column: node.location.column,
            anchorIndex: node.location.anchor,
          },
          dataShape: generateSolidTypeScriptString(
            blueprintShape,
            rawVaultData.blueprints,
          ),
          metrics: {
            depth: node.metrics.depth,
            complexityScore: node.metrics.complexityScore,
            nodesCollapsed: node.metrics.nodesCollapsed,
          },
        };
      }
    }
  }

  // !!! ================================================================================
  // !!! ================================================================================
  // !!! EXECUTION METHODS
  // !!! ================================================================================
  // !!! ================================================================================
  /**
   * COMPILE DASHBOARD OVERVIEW DATASET
   * ROLE: Master transformation engine mapping raw payload calculations to web contracts point-free.
   * STRATEGY: Combines flat node layers with raw blueprint shapes and host environment variables.
   *
   * @param activePort Loopback network HTTP port currently binding the Studio process
   * @returns Fully hydrated payload satisfying the exact IStudioOverviewPayload specifications
   */
  public async compileDashboardOverviewDataset(
    activePort: number,
  ): Promise<IStudioOverviewPayload> {
    const studioPayload = this.generateDefaultPayload(activePort);
    const rawVaultData = await fsContext.ingestVaultSnapshotFromDisk();

    // Fire your optimized, headless audit calculator loop pass to fetch raw data calculation sheets
    const sharedData = await auditEngineService.executeStudioOverviewRun();

    if (!rawVaultData || sharedData.globalSummary.totalRegisteredKeys === 0) {
      return studioPayload;
    }

    // =========================================================================
    // GLOBAL SUMMARY FOOTPRINT HYDRATION
    // =========================================================================
    /* prettier-ignore */ studioPayload.globalSummary.totalRegisteredKeys = sharedData.globalSummary.totalRegisteredKeys;
    /* prettier-ignore */ studioPayload.globalSummary.totalUniqueFingerprints = sharedData.globalSummary.totalUniqueFingerprints;
    /* prettier-ignore */ studioPayload.globalSummary.globalCompactionRatio = sharedData.globalSummary.casCompressionRatio;
    /* prettier-ignore */ studioPayload.globalSummary.totalDatabaseDiskBytes = sharedData.globalSummary.totalDatabaseDiskBytes;
    /* prettier-ignore */ studioPayload.globalSummary.highestGraphDepthRecorded = sharedData.globalSummary.highestGraphDepthRecorded;

    // =========================================================================
    // SYSTEM HYGIENE FOOTPRINT HYDRATION
    // =========================================================================
    /* prettier-ignore */ studioPayload.systemHygiene.totalOrphanedKeys = sharedData.telemetry.orphanedKeys.length;
    /* prettier-ignore */ studioPayload.systemHygiene.totalCriticalDepthWarnings = sharedData.systemHygiene.totalCriticalDepthWarnings;
    /* prettier-ignore */ studioPayload.systemHygiene.hasBreakingContractDrift = sharedData.drift.hasBreakingChanges;

    // =========================================================================
    // LIFECYCLE MEMORY FOOTPRINT HYDRATION
    // =========================================================================
    /* prettier-ignore */ studioPayload.lifecycleFootprint.developmentCacheBytes = sharedData.globalSummary.totalDatabaseDiskBytes;
    /* prettier-ignore */ studioPayload.lifecycleFootprint.productionEstimatedBytes = sharedData.globalSummary.totalDatabaseDiskBytes;

    // =========================================================================
    // TOPOLOGY LAYOUT NETWORK HYDRATION
    // =========================================================================
    // SECURE FIX: Map array properties point-free straight to their correct target channels
    studioPayload.topology.edges = [...sharedData.topology.edges];
    studioPayload.topology.cyclicPaths = sharedData.topology.cyclicPaths.map(
      (pathRow) => [...pathRow],
    );

    // =========================================================================
    // PHYSICAL INFRASTRUCTURE ENVIRONMENT HYDRATION
    // =========================================================================
    studioPayload.environment.activePort = activePort;

    // 3. EXECUTE REGISTRY HYDRATION INTERACTION PASS
    this.formatRegistryItems(studioPayload, sharedData.nodes, rawVaultData);

    // 4. RETURN THE COMPRESSED OBJECT ENVELOPE SECURELY FROZEN (0 compile errors!)
    return Object.freeze(studioPayload);
  }
}
