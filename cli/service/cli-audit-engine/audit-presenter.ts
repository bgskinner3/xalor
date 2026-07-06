import type { IXalorAuditPayload } from '../../models';
import { yieldItems } from '../../../shared/utils';
import { xalorLog } from '../../../shared';
import type { TLoggerTheme } from '../../../shared/types';

export class AuditPresenterService {
  private mainBlockTheme: TLoggerTheme = 'naked';
  private footerBlockTheme: TLoggerTheme = 'naked';

  private toKbString = (bytes: number): string => (bytes / 1024).toFixed(2);
  private toPctString = (ratio: number): string => (ratio * 100).toFixed(1);

  private storageCompSection(summary: IXalorAuditPayload['summary']) {
    const savingsPercentage = this.toPctString(summary.casCompressionRatio);
    const sizeInKb = this.toKbString(summary.totalDatabaseDiskBytes);
    // ------------------------------------------------------------------------
    // 1. STORAGE MANAGEMENT & COMPILER SPEED PANEL (Dark Slate Contrast Block)
    // ------------------------------------------------------------------------
    /* prettier-ignore */ xalorLog.logLine(' 📦 STORAGE COMPACTION & SPEED SUMMARY',  this.mainBlockTheme, true);
    /* prettier-ignore */ xalorLog.panelRow('User Registration Keys', summary.totalRegisteredKeys,  this.mainBlockTheme);
    /* prettier-ignore */ xalorLog.panelRow('Deduplicated CAS Nodes', summary.totalUniqueFingerprints,  this.mainBlockTheme);
    /* prettier-ignore */ xalorLog.panelRow('Vault Compact Ratio', `${savingsPercentage}% Storage Deduplication`,  this.mainBlockTheme, 'success');
    /* prettier-ignore */ xalorLog.panelRow('Database Disk Volume', `${sizeInKb} KB`,  this.mainBlockTheme);
    /* prettier-ignore */ xalorLog.panelRow('Compiler Trace Latency', `${summary.compileTimeOverheadMs} ms`,  this.mainBlockTheme, 'info');
    /* prettier-ignore */ xalorLog.divider('-',  this.mainBlockTheme);
  }
  private systemHygieneSection(
    hygiene: IXalorAuditPayload['hygiene'],
    summary: IXalorAuditPayload['summary'],
  ) {
    /* prettier-ignore */
    const textColor = hygiene.totalCriticalDepthWarnings > 0 ? 'error' : 'default';
    // ------------------------------------------------------------------------
    // 2. SYSTEM HYGIENE & SAFETY ALARMS PANEL (Dark Slate Contrast Block)
    // ------------------------------------------------------------------------
    /* prettier-ignore */ xalorLog.logLine(' 🚨 GRAPH SAFETY & HYGIENE STATUS', this.mainBlockTheme, true);
    /* prettier-ignore */ xalorLog.panelRow('Critical Depth Alarms', `${hygiene.totalCriticalDepthWarnings} Warnings (>10 Layers)`, this.mainBlockTheme, textColor);
    /* prettier-ignore */ xalorLog.panelRow('System Deepest Apex', `${summary.highestGraphDepthRecorded} / 10 Layers`, this.mainBlockTheme);
    /* prettier-ignore */ xalorLog.panelRow('Stale Orphaned Keys', `${hygiene.totalOrphanedKeys} Inactive Hooks`, this.mainBlockTheme);

    if (hygiene.depthWarnings.length > 0) {
      /* prettier-ignore */ xalorLog.logLine('  ⚠️  ACTIVE CEILING VIOLATIONS:', this.mainBlockTheme, true, 'warning');
      for (const warnItem of yieldItems(hygiene.depthWarnings)) {
        /* prettier-ignore */ xalorLog.logLine(`   [ALARM] Key '${warnItem.typeKey}' breaches threshold at depth: ${warnItem.currentDepth}`, this.mainBlockTheme, false, 'warning');
      }
    }
    /* prettier-ignore */ xalorLog.divider('-', this.mainBlockTheme);
  }

  private runtimeMetaDataSection(
    lifeCycle: IXalorAuditPayload['lifecycleFootprint'],
  ) {
    const pkg = lifeCycle.physicalPackageMetrics;
    /* prettier-ignore */ const devKb = this.toKbString(lifeCycle.developmentCacheBytes);
    /* prettier-ignore */ const prodKb = this.toKbString(lifeCycle.productionEstimatedBytes);
    /* prettier-ignore */ const savedKb = this.toKbString(lifeCycle.netBytesEvaporated);
    /* prettier-ignore */ const efficiency = this.toPctString(lifeCycle.evaporationEfficiencyRatio);
    /* prettier-ignore */ const bundleKb = pkg.isMissingManifest ? '0.00' : this.toKbString(pkg.bundleSizeBytes);
    /* prettier-ignore */ const installKb = pkg.isMissingManifest ? '0.00' : this.toKbString(pkg.estimatedInstallFootprintBytes);

    // ------------------------------------------------------------------------
    // 3. RUNTIME METADATA EVAPORATION & DISTRIBUTION PACK METRICS (Dark Slate Contrast Block)
    // ------------------------------------------------------------------------
    /* prettier-ignore */ xalorLog.logLine(' 🧼 LIFECYCLE METADATA EVAPORATION DELTAS', this.mainBlockTheme, true);
    /* prettier-ignore */ xalorLog.panelRow('Dev Environment Cache', `${devKb} KB`, this.mainBlockTheme);
    /* prettier-ignore */ xalorLog.panelRow('Bare-Metal Prod Bundle', `${prodKb} KB`, this.mainBlockTheme);
    /* prettier-ignore */ xalorLog.panelRow('Metadata Volume Cleansed', `${savedKb} KB`, this.mainBlockTheme, 'success');
    /* prettier-ignore */ xalorLog.panelRow('Trim Efficiency Rating', `${efficiency}% Fat Stripped Away`, this.mainBlockTheme);
    /* prettier-ignore */ xalorLog.divider('-', this.mainBlockTheme);

    /* prettier-ignore */ xalorLog.logLine(' 📦 PHYSICAL DISTRIBUTION PACKAGE SIZE', this.mainBlockTheme, true);
    if (pkg.isMissingManifest) {
      /* prettier-ignore */ xalorLog.logLine('  ❌ NPM Pack Sizing Status : CRITICAL PRE-FLIGHT MANIFEST ERROR', this.mainBlockTheme, true, 'error');
    } else {
      /* prettier-ignore */ xalorLog.panelRow('Unpacked Bundle Sizing', `${bundleKb} KB (dist/ output structures)`, this.mainBlockTheme);
      /* prettier-ignore */ xalorLog.panelRow('Production Dependencies', `${pkg.productionDependenciesCount} active module hooks`, this.mainBlockTheme);
      /* prettier-ignore */ xalorLog.panelRow('Projected Install Footprint', `${installKb} KB (node_modules scale)`, this.mainBlockTheme, 'info');
    }
    /* prettier-ignore */ xalorLog.divider('-', this.mainBlockTheme);
  }

  private telemetrySection(telemetry: IXalorAuditPayload['telemetry']) {
    // ------------------------------------------------------------------------
    // 4. RUNTIME HOOKS & TELEMETRY INSIGHTS PANEL (Dark Slate Contrast Block)
    // ------------------------------------------------------------------------
    /* prettier-ignore */ xalorLog.logLine(' 📡 RUNTIME HOOKS & TELEMETRY INSIGHTS', this.mainBlockTheme, true);
    /* prettier-ignore */ xalorLog.panelRow('Dead Code Orphan Count', `${telemetry.orphanedKeys.length} Unreferenced Keys`, this.mainBlockTheme);
    /* prettier-ignore */ xalorLog.logLine('  ⚡ Strategy Call Breakdown :', this.mainBlockTheme, true);

    for (const item of yieldItems(telemetry.strategyDistribution)) {
      /* prettier-ignore */ xalorLog.logLine(`     ${item.strategyToken.padEnd(10)} -> ${item.invocationCount} static invocation instances`, this.mainBlockTheme);
    }

    if (telemetry.orphanedKeys.length > 0) {
      /* prettier-ignore */ xalorLog.logLine('  🗑️  ORPHANED TYPE KEYS DETECTED (SAFE TO DELETE):', this.mainBlockTheme, true, 'warning');
      for (const orphanKey of yieldItems(telemetry.orphanedKeys)) {
        /* prettier-ignore */ xalorLog.logLine(`   [ORPHAN] Contract key '${orphanKey}' is dead weight (0 bundle references).`, this.mainBlockTheme, false, 'warning');
      }
    }
    /* prettier-ignore */ xalorLog.divider('-', this.mainBlockTheme);
  }

  private driftSection(drift: IXalorAuditPayload['drift']) {
    /* prettier-ignore */ const driftTextColor = drift.hasBreakingChanges ? 'error' : 'success';
    const driftIndicatorText = drift.hasBreakingChanges
      ? '🚨 BREACHED (HALT DEPLOYMENT)'
      : '✅ CLEAN BASES';
    // ------------------------------------------------------------------------
    // 5. CONTRACT DRIFT SECURITY RADAR REPORT (Dark Slate Contrast Block)
    // ------------------------------------------------------------------------
    /* prettier-ignore */ xalorLog.logLine(' 🛰️  API CONTRACT DRIFT STATUS', this.mainBlockTheme, true);
    /* prettier-ignore */ xalorLog.panelRow('Breaking Drifts Tripped', driftIndicatorText, this.mainBlockTheme, driftTextColor);
    /* prettier-ignore */ xalorLog.panelRow('Mutation Delta Records', `${drift.mutations.length} Tracked Changes`, this.mainBlockTheme);
    if (drift.mutations.length > 0) {
      /* prettier-ignore */ xalorLog.logLine('  📋 DETECTED STRUCTURAL EVOLUTIONS:', this.mainBlockTheme, true);
      for (const mutationItem of yieldItems(drift.mutations)) {
        /* prettier-ignore */ xalorLog.logLine(`   [${mutationItem.changeType}] Path '${mutationItem.propertyPath}' in Key '${mutationItem.typeKey}':`, this.mainBlockTheme, true);
        /* prettier-ignore */ xalorLog.logLine(`     ↳ ${mutationItem.description}`, this.mainBlockTheme, false, 'info');
      }
    }
  }

  private loggedFooter() {
    const documentationLink = xalorLog.formatTerminalLink(
      'https://github.com',
      'View Detailed Engine Telemetry Manual',
    );
    /* prettier-ignore */ xalorLog.divider('═', this.footerBlockTheme);
    /* prettier-ignore */ xalorLog.logLine( ' ✅ [Xalor CLI] Audit stream execution cycle successfully finished.', this.footerBlockTheme, true, 'success');

    /* prettier-ignore */ xalorLog.logLine(` 🪐 Studio Docs: ${documentationLink}`, this.footerBlockTheme, true, 'info');

    /* prettier-ignore */ xalorLog.divider('═', this.footerBlockTheme);
    /* prettier-ignore */ xalorLog.logLine('', 'naked');
  }

  public renderReportTables(payload: IXalorAuditPayload): void {
    const { summary, hygiene, lifecycleFootprint, drift, telemetry } = payload;

    this.mainBlockTheme = drift.hasBreakingChanges ? 'crimson' : 'contrast';
    this.footerBlockTheme = drift.hasBreakingChanges ? 'crimson' : 'standard';
    // HEADER LINE
    /* prettier-ignore */ xalorLog.logLine('', 'naked');
    /* prettier-ignore */ xalorLog.banner('Xalor Operational Profiler Report Ledger',  this.mainBlockTheme, 'boxed');

    this.storageCompSection(summary);

    this.systemHygieneSection(hygiene, summary);

    this.runtimeMetaDataSection(lifecycleFootprint);

    this.telemetrySection(telemetry);

    this.driftSection(drift);
    this.loggedFooter();
  }
}
