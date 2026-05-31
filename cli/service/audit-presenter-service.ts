import type { IXalorAuditPayload } from '../models';
import { yieldItems } from '../../shared/utils';

export class AuditPresenterService {
  /**
   * RENDER REPORT TABLES
   * ROLE: Direct console logger painting individual metric panel categories to stdout.
   *
   * @param payload Pre-compiled, read-only data calculation snapshot payload contract
   */
  /* prettier-ignore */
  public static renderReportTables(payload: IXalorAuditPayload): void {
    const { summary, hygiene, telemetry, lifecycleFootprint, drift } = payload;

    console.log(`======================================================================`);
    console.log(`🪐 XALOR OPERATIONAL PROFILER REPORT LEDGER`);
    console.log(`======================================================================`);

    // 2. STORAGE MANAGEMENT SUMMARY PANEL
    const savingsPercentage = (summary.casCompressionRatio * 100).toFixed(1);
    const sizeInKb = (summary.totalDatabaseDiskBytes / 1024).toFixed(2);
    console.log(`\n📦 STORAGE COMPACTION SUMMARY`);
    console.log(`  • User Registration Keys  : ${summary.totalRegisteredKeys}`);
    console.log(`  • Deduplicated CAS Nodes  : ${summary.totalUniqueFingerprints}`);
    console.log(`  • Vault Compact Ratio     : ${savingsPercentage}% Storage Deduplication`);
    console.log(`  • Database Disk Allocation: ${sizeInKb} KB`);

    // 3. SYSTEM HYGIENE & SAFETY ALARMS PANEL
    console.log(`\n🚨 GRAPH SAFETY & HYGIENE STATUS`);
    console.log(`  • Critical Depth Alarms   : ${hygiene.totalCriticalDepthWarnings} Warnings (>10 Layers)`);
    console.log(`  • System Deepest Apex     : ${summary.highestGraphDepthRecorded} / 10 Layers`);
    console.log(`  • Stale Orphaned Keys     : ${hygiene.totalOrphanedKeys} Inactive Hooks`);

    if (hygiene.depthWarnings.length > 0) {
      console.log(`\n    ⚠️  ACTIVE CEILING VIOLATIONS:`);
      const warningsLength = hygiene.depthWarnings.length;
      for (let i = 0; i < warningsLength; i++) {
        console.log(`      [ALARM] Key '${hygiene.depthWarnings[i].typeKey}' breaches threshold at depth: ${hygiene.depthWarnings[i].currentDepth}`);
      }
    }

    // 4. RUNTIME METADATA EVAPORATION FOOTPRINT
    const devKb = (lifecycleFootprint.developmentCacheBytes / 1024).toFixed(2);
    const prodKb = (lifecycleFootprint.productionEstimatedBytes / 1024).toFixed(2);
    const savedKb = (lifecycleFootprint.netBytesEvaporated / 1024).toFixed(2);
    const efficiency = (lifecycleFootprint.evaporationEfficiencyRatio * 100).toFixed(1);
    console.log(`\n🧼 LIFECYCLE MEMORY EVAPORATION DELTAS`);
    console.log(`  • Dev Environment Cache   : ${devKb} KB`);
    console.log(`  • Bare-Metal Prod Bundle  : ${prodKb} KB`);
    console.log(`  • Metadata Volume Cleansed: ${savedKb} KB`);
    console.log(`  • Trim Efficiency Rating  : ${efficiency}% Fat Stripped Away`);

    // =========================================================================
    // 📡 NEW PANEL: RUNTIME HOOKS & TELEMETRY INSIGHTS (INTEGRATED FROM SPRINT 3)
    // =========================================================================
    console.log(`\n📡 RUNTIME HOOKS & TELEMETRY INSIGHTS`);
    console.log(`  • Dead Code Orphan Count  : ${telemetry.orphanedKeys.length} Unreferenced Keys`);
    
    console.log(`  • Strategy Call Breakdown :`);
    for (const item of yieldItems(telemetry.strategyDistribution)) {
      console.log(`      ⚡ ${item.strategyToken.padEnd(10)} -> ${item.invocationCount} static invocation instances`);
    }

    if (telemetry.orphanedKeys.length > 0) {
      console.log(`\n    🗑️  ORPHANED TYPE KEYS DETECTED (SAFE TO DELETE):`);
      for (const orphanKey of yieldItems(telemetry.orphanedKeys)) {
        console.log(`      [ORPHAN] Contract key '${orphanKey}' is dead weight (0 bundle references).`);
      }
    }

    // 6. CONTRACT DRIFT SECURITY RADAR REPORT
    console.log(`\n🛰️  API CONTRACT DRIFT STATUS`);
    console.log(`  • Breaking Drifts Tripped : ${drift.hasBreakingChanges ? '🚨 BREACHED (HALT DEPLOYMENT)' : '✅ CLEAN BASES'}`);
    console.log(`  • Mutation Delta Records  : ${drift.mutations.length} Tracked Changes`);

    if (drift.mutations.length > 0) {
      console.log(`\n    📋 DETECTED STRUCTURAL EVOLUTIONS:`);
      const mutationsLength = drift.mutations.length;
      for (let m = 0; m < mutationsLength; m++) {
        const item = drift.mutations[m];
        console.log(`      [${item.changeType}] Path '${item.propertyPath}' in Key '${item.typeKey}': ${item.description}`);
      }
    }

    console.log(`\n======================================================================`);
    console.log(`✅ [Xalor CLI] Audit stream execution cycle successfully finished.`);
    console.log(`======================================================================\n`);
  }
}
