import * as os from 'os';
import type {
  IStudioOverviewPayload,
  TDefaultObjectKeys,
  TDefaultReturnKeyMap,
  TFormatNodes,
} from '../models/types';
import type { TTripleKV } from '../../shared/types';
import {
  yieldItems,
  cloneDeep,
  isValidSolidShape,
  isKeyInObject,
} from '../../shared/utils';
import { fsContext } from '../../shared/service';
import { auditEngineService } from './cli-audit-engine';
import {
  DEFAULT_OBJECT_MAPPER,
  STUDIO_COMMAND_CONFIG,
} from '../models/constants';
// import { generateSolidTypeScriptString } from '../utils';

export class StudioCLIEngineService {
  private createDefaultAuditTemplate<T extends TDefaultObjectKeys>(
    defaultType: T,
  ): TDefaultReturnKeyMap<T> {
    const baseStaticTemplate = DEFAULT_OBJECT_MAPPER[defaultType];

    return cloneDeep(baseStaticTemplate);
  }

  private formatNodes(
    params: TFormatNodes,
    references: TTripleKV['references'],
  ) {
    const { studioPayload, rawVaultData, sharedData } = params;
    const nodes = sharedData.nodes;
    const { studioAPIMapper, orphanedKeys } = sharedData.telemetry;
    const orphanLookup = new Set(orphanedKeys);

    for (const node of yieldItems(nodes)) {
      if (!node) continue;

      const uuidName = node.identity.typeKey;
      /* prettier-ignore */
      const blueprintShape = rawVaultData.blueprints[node.identity.casFingerprint];
      if (!isValidSolidShape(blueprintShape)) continue;

      const template = this.createDefaultAuditTemplate('studioNode');

      // Hydrate identity primitives point-free
      template.identity.typeKey = uuidName;
      template.identity.symbolName = node.identity.symbolName;
      template.identity.casFingerprint = node.identity.casFingerprint;
      template.identity.isOrphan = orphanLookup.has(uuidName);

      // Hydrate spatial file system coordinates mapping tokens cleanly
      template.location = {
        filePath: node.location.filePath,
        line: node.location.line,
        column: node.location.column,
        anchorIndex: node.location.anchor, // Map explicit parameter names safely
      };

      // V1 Optimization Handshake: Pre-compile our complex AST into flat text strings
      // template.dataShape = generateSolidTypeScriptString(
      //   blueprintShape,
      //   rawVaultData.blueprints,
      // );
      template.dataShape = isKeyInObject(uuidName)(references)
        ? references[uuidName]
        : 'unknown';
      template.metrics = {
        depth: node.metrics.depth,
        complexityScore: node.metrics.complexityScore,
        nodesCollapsed: node.metrics.nodesCollapsed,
      };

      // Ingest pre-seeded API usage lists, falling back gracefully to empty lists
      if (isKeyInObject(uuidName)(studioAPIMapper)) {
        template.apisUsed = studioAPIMapper[uuidName];
      }
      studioPayload.registryItems[uuidName] = template;
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
    const studioPayload = this.createDefaultAuditTemplate('studioDefault');
    const rawVaultData = await fsContext.ingestVaultSnapshotFromDisk();

    // Fire your optimized, headless audit calculator loop pass to fetch raw data calculation sheets
    const sharedData = await auditEngineService.executeStudioOverviewRun();

    if (!rawVaultData || sharedData.globalSummary.totalRegisteredKeys === 0) {
      return studioPayload;
    }
    studioPayload.environment.activePort =
      activePort ?? STUDIO_COMMAND_CONFIG.port;
    studioPayload.environment.executionPlatform = os.platform();
    studioPayload.environment.nodeRuntimeVersion = process.version;
    studioPayload.environment.lastTelemetrySyncTimestamp = Date.now();
    // =========================================================================
    // GLOBAL SUMMARY FOOTPRINT HYDRATION
    // =========================================================================
    studioPayload.globalSummary = {
      ...sharedData.globalSummary,
      globalCompactionRatio: sharedData.globalSummary.casCompressionRatio,
    };
    // =========================================================================
    // SYSTEM HYGIENE FOOTPRINT HYDRATION
    // =========================================================================
    /* prettier-ignore */ studioPayload.systemHygiene.totalOrphanedKeys = sharedData.telemetry.orphanedKeys.length;
    /* prettier-ignore */ studioPayload.systemHygiene.totalCriticalDepthWarnings = sharedData.systemHygiene.totalCriticalDepthWarnings;
    /* prettier-ignore */ studioPayload.systemHygiene.hasBreakingContractDrift = sharedData.drift.hasBreakingChanges;

    // =========================================================================
    // LIFECYCLE MEMORY FOOTPRINT HYDRATION
    // =========================================================================
    studioPayload.lifecycleFootprint = sharedData.lifecycleFootprint;

    // =========================================================================
    // PHYSICAL INFRASTRUCTURE ENVIRONMENT HYDRATION
    // =========================================================================
    studioPayload.environment.activePort = activePort;

    // 3. EXECUTE REGISTRY HYDRATION INTERACTION PASS
    this.formatNodes(
      { studioPayload, sharedData, rawVaultData },
      rawVaultData.references,
    );

    studioPayload.blueprints = rawVaultData.blueprints;

    // 4. RETURN THE COMPRESSED OBJECT ENVELOPE SECURELY FROZEN (0 compile errors!)
    return Object.freeze(studioPayload);
  }
}

export const studioEngine = new StudioCLIEngineService();

/**
     const studioEngine = new StudioCLIEngineService();
    const res = await studioEngine.compileDashboardOverviewDataset(8001);
    console.log('==========================================');
    console.dir(res, {
      depth: null,
      colors: true,
      showHidden: false,
    });
    console.log('==========================================');
    console.log('==========================================');
    console.log('\n\n\n\n');
 */
