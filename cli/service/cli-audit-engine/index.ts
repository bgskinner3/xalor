import type { TTripleKV } from '../../../shared/types';
import type {
  TDefaultObjectKeys,
  TDefaultReturnKeyMap,
  IXalorAuditPayload,
  TAuditToStudioSharedData,
} from '../../models/types';
import { DEFAULT_OBJECT_MAPPER } from '../../models/constants';
import { cloneDeep } from '../../../shared/utils';
import { telemetryService } from './telemetry-service';
import { packageAuditorService } from './package-auditor-service';
import { auditSummaryService } from './audit-summary-service';
import { hygieneService } from './hygiene-service';
import { auditDriftService } from './drift-service';
import { pruneSweepService } from './prune-sweep-service';
import { topologyAuditService } from './topology-service';
import { auditRegistryService } from './audit-registry-nodes';
import { performance } from 'perf_hooks';
import { fsContext } from '../../../shared';
import { AuditPresenterService } from './audit-presenter';
/**
 * CLIAuditEngineService
 *
 * CLI auditing engine responsible for generating, analyzing,
 * and optimizing Xalor vault audit payloads.
 *
 * ## Responsibilities
 * - Generates default audit payloads
 * - Computes CAS storage optimization ledger
 * - Handles vault snapshot ingestion
 *
 * ## Navigation
 * - RAW VAULT DATA EXTRACT {@link rawVaultData}
 * - SHAPE DEPTH CALCULATION {@link shapeDepthCalculation}
 * - ORPHANS AND SELF HEALING {@link selfHealingPrune}
 * - PRODUCTION FILE CREATION {@link fileCreation}
 *
 *
 * - GLOBAL SUMMARY BUILD  {@link globalSummary}
 * - HYGIENE SUMMARY {@link hygieneSummary}
 * - REGISTRY NODE BUILD {@link registryNodeBuild}
 * - TELEMETRY SUMMARY {@link runtimeAPICallCalc}
 * - LIFE CYCLE FOOTPRINT {@link memoryDetails}
 * - DRIFTING CHANGES {@link historicalChanges}
 * - TOPOLOGY SUMMARY {@link topologyGraphData}
 *
 * @class
 */
export class AuditEngineService extends AuditPresenterService {
  private createDefaultAuditTemplate<T extends TDefaultObjectKeys>(
    defaultType: T,
  ): TDefaultReturnKeyMap<T> {
    const baseStaticTemplate = DEFAULT_OBJECT_MAPPER[defaultType];

    return cloneDeep(baseStaticTemplate);
  }

  private async pruneAndSweepFix(rawVaultData: TTripleKV) {
    /* prettier-ignore */
    const telemetry = await telemetryService.profileRuntimeFootprintAndOrphans(rawVaultData);

    await pruneSweepService.executeSelfHealingPruneSweep(
      rawVaultData,
      telemetry,
    );
  }

  /** @see {@link AuditServiceDocs.executeFullAuditRun} */

  /* prettier-ignore */
  public async executeFullAuditRun(flags: { fix: boolean; debug: boolean }): Promise<IXalorAuditPayload> {

    const baseTemplate = this.createDefaultAuditTemplate('original');
    const performanceStartMarker = performance.now();

    const rawVaultData = await fsContext.ingestVaultSnapshotFromDisk();
    if (!rawVaultData) return baseTemplate;

    if (flags.fix) {
      this.pruneAndSweepFix(rawVaultData);
      return baseTemplate
    }

    // A. EXTRACT AND FORMAT REGISTRY NODES
    const nodes = auditRegistryService.extractNodeCoreDataLayout(rawVaultData);
    const mutableNodesCopy = cloneDeep(nodes);

    // B. COMPUTE AND COMPILE CORE SUMMARY
    /* prettier-ignore */
    const summary = await auditSummaryService.calculateCasStorageSavings(rawVaultData, nodes);

    // C. GENERATE HYGINE METRICS
    const hygiene = hygieneService.evaluateSystemHygieneAndDepthAlarms(
      rawVaultData,
      mutableNodesCopy,
    );
    /* prettier-ignore */
    const telemetry = await telemetryService.profileRuntimeFootprintAndOrphans(rawVaultData, 'audit');

    /* prettier-ignore */
    const drift = await auditDriftService.interceptContractDriftRadar(rawVaultData);

    /* prettier-ignore */
    const topology = topologyAuditService.analyzeDependencyGraphTopology(rawVaultData);

    /* prettier-ignore */
    const lifecycleFootprint = packageAuditorService.computeLifecycleFootprintDeltas(rawVaultData);

    const performanceEndMarker = performance.now();

    const finalCompileTimeOverheadMs = Math.round(
      performanceEndMarker - performanceStartMarker,
    );

    summary.compileTimeOverheadMs = finalCompileTimeOverheadMs;
    hygiene.totalOrphanedKeys = telemetry.orphanedKeys.length;

    // Automatically creates or overwrites the production-baseline.json file
    // inside your node_modules/.cache track to lock this execution pass state.
    await fsContext.syncAuditedBaselineFile(rawVaultData);

    return {
      summary,
      nodes,
      hygiene,
      telemetry,
      lifecycleFootprint,
      drift,
      topology,
    }
  }

  public async executeStudioOverviewRun(): Promise<TAuditToStudioSharedData> {
    const performanceStartMarker = performance.now();

    const rawVaultData = await fsContext.ingestVaultSnapshotFromDisk();

    if (!rawVaultData) {
      return this.createDefaultAuditTemplate('studio');
    }

    const nodes = auditRegistryService.extractNodeCoreDataLayout(rawVaultData);
    const mutableNodesCopy = cloneDeep(nodes);

    // B. COMPUTE AND COMPILE CORE SUMMARY
    /* prettier-ignore */
    const globalSummary = await auditSummaryService.calculateCasStorageSavings(rawVaultData, nodes);

    const systemHygiene = hygieneService.evaluateSystemHygieneAndDepthAlarms(
      rawVaultData,
      mutableNodesCopy,
    );

    const telemetry = await telemetryService.profileRuntimeFootprintAndOrphans(
      rawVaultData,
      'studio',
    );
    const lifecycleFootprint =
      packageAuditorService.computeLifecycleFootprintDeltas(rawVaultData);

    const drift =
      await auditDriftService.interceptContractDriftRadar(rawVaultData);

    const performanceEndMarker = performance.now();

    const finalCompileTimeOverheadMs = Math.round(
      performanceEndMarker - performanceStartMarker,
    );

    globalSummary.compileTimeOverheadMs = finalCompileTimeOverheadMs;
    systemHygiene.totalOrphanedKeys = telemetry.orphanedKeys.length;

    return {
      globalSummary,
      nodes,
      systemHygiene,
      telemetry,
      drift,
      lifecycleFootprint,
    };
  }
}

export const auditEngineService = new AuditEngineService();
