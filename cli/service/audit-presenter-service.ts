import type { IXalorAuditPayload } from '../models';
import { yieldItems } from '../../shared/utils';
import { XalorLoggerService } from '../../shared';

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
    const pkg = lifecycleFootprint.physicalPackageMetrics;

    // ========================================================================
    // 🪐 THE FLIPPED CORE THEME MATRIX CONFIGURATION
    // ========================================================================
    // If a breaking drift changes the system safety state, fallback directly to 'crimson' emergency blocks.
    // Otherwise: The main computational block receives the premium dark slate theme ('contrast'),
    // while the footer area flips to mirror the light-gray container backdrop layer ('standard').
    const mainBlockTheme = drift.hasBreakingChanges ? 'crimson' : 'contrast';
    const footerBlockTheme = drift.hasBreakingChanges ? 'crimson' : 'standard';

    XalorLoggerService.logLine('', 'naked'); // Cushion header spacing break
    XalorLoggerService.banner('Xalor Operational Profiler Report Ledger', mainBlockTheme, 'boxed');

    // ------------------------------------------------------------------------
    // 1. STORAGE MANAGEMENT & COMPILER SPEED PANEL (Dark Slate Contrast Block)
    // ------------------------------------------------------------------------
    const savingsPercentage = (summary.casCompressionRatio * 100).toFixed(1);
    const sizeInKb = (summary.totalDatabaseDiskBytes / 1024).toFixed(2);

    XalorLoggerService.logLine(' 📦 STORAGE COMPACTION & SPEED SUMMARY', mainBlockTheme, true);
    XalorLoggerService.panelRow('User Registration Keys', summary.totalRegisteredKeys, mainBlockTheme);
    XalorLoggerService.panelRow('Deduplicated CAS Nodes', summary.totalUniqueFingerprints, mainBlockTheme);
    XalorLoggerService.panelRow('Vault Compact Ratio', `${savingsPercentage}% Storage Deduplication`, mainBlockTheme, 'success');
    XalorLoggerService.panelRow('Database Disk Volume', `${sizeInKb} KB`, mainBlockTheme);
    XalorLoggerService.panelRow('Compiler Trace Latency', `${summary.compileTimeOverheadMs} ms`, mainBlockTheme, 'info');
    XalorLoggerService.divider('-', mainBlockTheme);

    // ------------------------------------------------------------------------
    // 2. SYSTEM HYGIENE & SAFETY ALARMS PANEL (Dark Slate Contrast Block)
    // ------------------------------------------------------------------------
    XalorLoggerService.logLine(' 🚨 GRAPH SAFETY & HYGIENE STATUS', mainBlockTheme, true);
    XalorLoggerService.panelRow('Critical Depth Alarms', `${hygiene.totalCriticalDepthWarnings} Warnings (>10 Layers)`, mainBlockTheme, hygiene.totalCriticalDepthWarnings > 0 ? 'error' : 'default');
    XalorLoggerService.panelRow('System Deepest Apex', `${summary.highestGraphDepthRecorded} / 10 Layers`, mainBlockTheme);
    XalorLoggerService.panelRow('Stale Orphaned Keys', `${hygiene.totalOrphanedKeys} Inactive Hooks`, mainBlockTheme);

    if (hygiene.depthWarnings.length > 0) {
      XalorLoggerService.logLine('  ⚠️  ACTIVE CEILING VIOLATIONS:', mainBlockTheme, true, 'warning');
      for (const warnItem of yieldItems(hygiene.depthWarnings)) {
        XalorLoggerService.logLine(`   [ALARM] Key '${warnItem.typeKey}' breaches threshold at depth: ${warnItem.currentDepth}`, mainBlockTheme, false, 'warning');
      }
    }
    XalorLoggerService.divider('-', mainBlockTheme);

    // ------------------------------------------------------------------------
    // 3. RUNTIME METADATA EVAPORATION & DISTRIBUTION PACK METRICS (Dark Slate Contrast Block)
    // ------------------------------------------------------------------------
    const devKb = (lifecycleFootprint.developmentCacheBytes / 1024).toFixed(2);
    const prodKb = (lifecycleFootprint.productionEstimatedBytes / 1024).toFixed(2);
    const savedKb = (lifecycleFootprint.netBytesEvaporated / 1024).toFixed(2);
    const efficiency = (lifecycleFootprint.evaporationEfficiencyRatio * 100).toFixed(1);

    XalorLoggerService.logLine(' 🧼 LIFECYCLE METADATA EVAPORATION DELTAS', mainBlockTheme, true);
    XalorLoggerService.panelRow('Dev Environment Cache', `${devKb} KB`, mainBlockTheme);
    XalorLoggerService.panelRow('Bare-Metal Prod Bundle', `${prodKb} KB`, mainBlockTheme);
    XalorLoggerService.panelRow('Metadata Volume Cleansed', `${savedKb} KB`, mainBlockTheme, 'success');
    XalorLoggerService.panelRow('Trim Efficiency Rating', `${efficiency}% Fat Stripped Away`, mainBlockTheme);
    XalorLoggerService.divider('-', mainBlockTheme);

    XalorLoggerService.logLine(' 📦 PHYSICAL DISTRIBUTION PACKAGE SIZE', mainBlockTheme, true);
    if (pkg.isMissingManifest) {
      XalorLoggerService.logLine('  ❌ NPM Pack Sizing Status : CRITICAL PRE-FLIGHT MANIFEST ERROR', mainBlockTheme, true, 'error');
    } else {
      const bundleKb = (pkg.bundleSizeBytes / 1024).toFixed(2);
      const installKb = (pkg.estimatedInstallFootprintBytes / 1024).toFixed(2);
      XalorLoggerService.panelRow('Unpacked Bundle Sizing', `${bundleKb} KB (dist/ output structures)`, mainBlockTheme);
      XalorLoggerService.panelRow('Production Dependencies', `${pkg.productionDependenciesCount} active module hooks`, mainBlockTheme);
      XalorLoggerService.panelRow('Projected Install Footprint', `${installKb} KB (node_modules scale)`, mainBlockTheme, 'info');
    }
    XalorLoggerService.divider('-', mainBlockTheme);

    // ------------------------------------------------------------------------
    // 4. RUNTIME HOOKS & TELEMETRY INSIGHTS PANEL (Dark Slate Contrast Block)
    // ------------------------------------------------------------------------
    XalorLoggerService.logLine(' 📡 RUNTIME HOOKS & TELEMETRY INSIGHTS', mainBlockTheme, true);
    XalorLoggerService.panelRow('Dead Code Orphan Count', `${telemetry.orphanedKeys.length} Unreferenced Keys`, mainBlockTheme);
    XalorLoggerService.logLine('  ⚡ Strategy Call Breakdown :', mainBlockTheme, true);

    for (const item of yieldItems(telemetry.strategyDistribution)) {
      XalorLoggerService.logLine(`     ${item.strategyToken.padEnd(10)} -> ${item.invocationCount} static invocation instances`, mainBlockTheme);
    }

    if (telemetry.orphanedKeys.length > 0) {
      XalorLoggerService.logLine('  🗑️  ORPHANED TYPE KEYS DETECTED (SAFE TO DELETE):', mainBlockTheme, true, 'warning');
      for (const orphanKey of yieldItems(telemetry.orphanedKeys)) {
        XalorLoggerService.logLine(`   [ORPHAN] Contract key '${orphanKey}' is dead weight (0 bundle references).`, mainBlockTheme, false, 'warning');
      }
    }
    XalorLoggerService.divider('-', mainBlockTheme);

    // ------------------------------------------------------------------------
    // 5. CONTRACT DRIFT SECURITY RADAR REPORT (Dark Slate Contrast Block)
    // ------------------------------------------------------------------------
    XalorLoggerService.logLine(' 🛰️  API CONTRACT DRIFT STATUS', mainBlockTheme, true);
    XalorLoggerService.panelRow('Breaking Drifts Tripped', drift.hasBreakingChanges ? '🚨 BREACHED (HALT DEPLOYMENT)' : '✅ CLEAN BASES', mainBlockTheme, drift.hasBreakingChanges ? 'error' : 'success');
    XalorLoggerService.panelRow('Mutation Delta Records', `${drift.mutations.length} Tracked Changes`, mainBlockTheme);

    if (drift.mutations.length > 0) {
      XalorLoggerService.logLine('  📋 DETECTED STRUCTURAL EVOLUTIONS:', mainBlockTheme, true);
      for (const mutationItem of yieldItems(drift.mutations)) {
        XalorLoggerService.logLine(`   [${mutationItem.changeType}] Path '${mutationItem.propertyPath}' in Key '${mutationItem.typeKey}':`, mainBlockTheme, true);
        XalorLoggerService.logLine(`     ↳ ${mutationItem.description}`, mainBlockTheme, false, 'info');
      }
    }

    // ========================================================================
    // 🪐 REVERSED FOOTER SECTION (Light-Gray Standard Block)
    // ========================================================================
    // Closing off the dark slate main section cleanly before moving to the footer area
    XalorLoggerService.divider('═', footerBlockTheme);
    
    // Begin the light-gray inverted footer block row highlights
    XalorLoggerService.logLine(
      ' ✅ [Xalor CLI] Audit stream execution cycle successfully finished.', 
      footerBlockTheme, 
      true, 
      'success' // Your neon emerald green pops vividly inside the light-gray row block
    );

    const documentationLink = XalorLoggerService.formatTerminalLink(
      'https://github.com', 
      'View Detailed Engine Telemetry Manual'
    );

    XalorLoggerService.logLine(
      ` 🪐 Studio Docs: ${documentationLink}`, 
      footerBlockTheme, 
      true, 
      'info' // Your electric cyan blue links align perfectly inside the light-gray container
    );

    XalorLoggerService.divider('═', footerBlockTheme);
    XalorLoggerService.logLine('', 'naked'); // Trailing line spacing cushion
  }
  // public static renderReportTables(payload: IXalorAuditPayload): void {
  //   const { summary, hygiene, telemetry, lifecycleFootprint, drift } = payload;
  //   const pkg = lifecycleFootprint.physicalPackageMetrics;

  //   // Dynamically change our overall canvas block theme based on system safety status
  //   const visualTheme = drift.hasBreakingChanges ? 'crimson' : 'standard';

  //   // ========================================================================
  //   // 🪐 THE COLORIZED SQUARE MATERIALIZATION LIFECYCLE
  //   // ========================================================================
  //   XalorLoggerService.logLine('', 'naked'); // Cushion header spacing break
  //   XalorLoggerService.banner('Xalor Operational Profiler Report Ledger', visualTheme, 'boxed');

  //   // ------------------------------------------------------------------------
  //   // 1. STORAGE MANAGEMENT & COMPILER SPEED PANEL
  //   // ------------------------------------------------------------------------
  //   const savingsPercentage = (summary.casCompressionRatio * 100).toFixed(1);
  //   const sizeInKb = (summary.totalDatabaseDiskBytes / 1024).toFixed(2);

  //   XalorLoggerService.logLine(' 📦 STORAGE COMPACTION & SPEED SUMMARY', visualTheme, true);
  //   XalorLoggerService.panelRow('User Registration Keys', summary.totalRegisteredKeys, visualTheme);
  //   XalorLoggerService.panelRow('Deduplicated CAS Nodes', summary.totalUniqueFingerprints, visualTheme);
  //   XalorLoggerService.panelRow('Vault Compact Ratio', `${savingsPercentage}% Storage Deduplication`, visualTheme, 'success');
  //   XalorLoggerService.panelRow('Database Disk Volume', `${sizeInKb} KB`, visualTheme);
  //   XalorLoggerService.panelRow('Compiler Trace Latency', `${summary.compileTimeOverheadMs} ms`, visualTheme, 'info');
  //   XalorLoggerService.divider('-', visualTheme);

  //   // ------------------------------------------------------------------------
  //   // 2. SYSTEM HYGIENE & SAFETY ALARMS PANEL
  //   // ------------------------------------------------------------------------
  //   XalorLoggerService.logLine(' 🚨 GRAPH SAFETY & HYGIENE STATUS', visualTheme, true);
  //   XalorLoggerService.panelRow('Critical Depth Alarms', `${hygiene.totalCriticalDepthWarnings} Warnings (>10 Layers)`, visualTheme, hygiene.totalCriticalDepthWarnings > 0 ? 'error' : 'default');
  //   XalorLoggerService.panelRow('System Deepest Apex', `${summary.highestGraphDepthRecorded} / 10 Layers`, visualTheme);
  //   XalorLoggerService.panelRow('Stale Orphaned Keys', `${hygiene.totalOrphanedKeys} Inactive Hooks`, visualTheme);

  //   if (hygiene.depthWarnings.length > 0) {
  //     XalorLoggerService.logLine('  ⚠️  ACTIVE CEILING VIOLATIONS:', visualTheme, true, 'warning');
  //     for (const warnItem of yieldItems(hygiene.depthWarnings)) {
  //       XalorLoggerService.logLine(`   [ALARM] Key '${warnItem.typeKey}' breaches threshold at depth: ${warnItem.currentDepth}`, visualTheme, false, 'warning');
  //     }
  //   }
  //   XalorLoggerService.divider('-', visualTheme);

  //   // ------------------------------------------------------------------------
  //   // 3. RUNTIME METADATA EVAPORATION & DISTRIBUTION PACK METRICS
  //   // ------------------------------------------------------------------------
  //   const devKb = (lifecycleFootprint.developmentCacheBytes / 1024).toFixed(2);
  //   const prodKb = (lifecycleFootprint.productionEstimatedBytes / 1024).toFixed(2);
  //   const savedKb = (lifecycleFootprint.netBytesEvaporated / 1024).toFixed(2);
  //   const efficiency = (lifecycleFootprint.evaporationEfficiencyRatio * 100).toFixed(1);

  //   XalorLoggerService.logLine(' 🧼 LIFECYCLE METADATA EVAPORATION DELTAS', visualTheme, true);
  //   XalorLoggerService.panelRow('Dev Environment Cache', `${devKb} KB`, visualTheme);
  //   XalorLoggerService.panelRow('Bare-Metal Prod Bundle', `${prodKb} KB`, visualTheme);
  //   XalorLoggerService.panelRow('Metadata Volume Cleansed', `${savedKb} KB`, visualTheme, 'success');
  //   XalorLoggerService.panelRow('Trim Efficiency Rating', `${efficiency}% Fat Stripped Away`, visualTheme);
  //   XalorLoggerService.divider('-', visualTheme);

  //   XalorLoggerService.logLine(' 📦 PHYSICAL DISTRIBUTION PACKAGE SIZE', visualTheme, true);
  //   if (pkg.isMissingManifest) {
  //     XalorLoggerService.logLine('  ❌ NPM Pack Sizing Status : CRITICAL PRE-FLIGHT MANIFEST ERROR', visualTheme, true, 'error');
  //   } else {
  //     const bundleKb = (pkg.bundleSizeBytes / 1024).toFixed(2);
  //     const installKb = (pkg.estimatedInstallFootprintBytes / 1024).toFixed(2);
  //     XalorLoggerService.panelRow('Unpacked Bundle Sizing', `${bundleKb} KB (dist/ output structures)`, visualTheme);
  //     XalorLoggerService.panelRow('Production Dependencies', `${pkg.productionDependenciesCount} active module hooks`, visualTheme);
  //     XalorLoggerService.panelRow('Projected Install Footprint', `${installKb} KB (node_modules scale)`, visualTheme, 'info');
  //   }
  //   XalorLoggerService.divider('-', visualTheme);

  //   // ------------------------------------------------------------------------
  //   // 4. RUNTIME HOOKS & TELEMETRY INSIGHTS PANEL
  //   // ------------------------------------------------------------------------
  //   XalorLoggerService.logLine(' 📡 RUNTIME HOOKS & TELEMETRY INSIGHTS', visualTheme, true);
  //   XalorLoggerService.panelRow('Dead Code Orphan Count', `${telemetry.orphanedKeys.length} Unreferenced Keys`, visualTheme);
  //   XalorLoggerService.logLine('  ⚡ Strategy Call Breakdown :', visualTheme, true);

  //   // Commandment VIII: Zero-allocation lazy iterator loop pass over distribution lists
  //   for (const item of yieldItems(telemetry.strategyDistribution)) {
  //     XalorLoggerService.logLine(`     ${item.strategyToken.padEnd(10)} -> ${item.invocationCount} static invocation instances`, visualTheme);
  //   }

  //   if (telemetry.orphanedKeys.length > 0) {
  //     XalorLoggerService.logLine('  🗑️  ORPHANED TYPE KEYS DETECTED (SAFE TO DELETE):', visualTheme, true, 'warning');
  //     for (const orphanKey of yieldItems(telemetry.orphanedKeys)) {
  //       XalorLoggerService.logLine(`   [ORPHAN] Contract key '${orphanKey}' is dead weight (0 bundle references).`, visualTheme, false, 'warning');
  //     }
  //   }
  //   XalorLoggerService.divider('-', visualTheme);

  //   // ------------------------------------------------------------------------
  //   // 5. CONTRACT DRIFT SECURITY RADAR REPORT
  //   // ------------------------------------------------------------------------
  //   XalorLoggerService.logLine(' 🛰️  API CONTRACT DRIFT STATUS', visualTheme, true);
  //   XalorLoggerService.panelRow('Breaking Drifts Tripped', drift.hasBreakingChanges ? '🚨 BREACHED (HALT DEPLOYMENT)' : '✅ CLEAN BASES', visualTheme, drift.hasBreakingChanges ? 'error' : 'success');
  //   XalorLoggerService.panelRow('Mutation Delta Records', `${drift.mutations.length} Tracked Changes`, visualTheme);

  //   if (drift.mutations.length > 0) {
  //     XalorLoggerService.logLine('  📋 DETECTED STRUCTURAL EVOLUTIONS:', visualTheme, true);
  //     for (const mutationItem of yieldItems(drift.mutations)) {
  //       XalorLoggerService.logLine(`   [${mutationItem.changeType}] Path '${mutationItem.propertyPath}' in Key '${mutationItem.typeKey}':`, visualTheme, true);
  //       XalorLoggerService.logLine(`     ↳ ${mutationItem.description}`, visualTheme, false, 'info');
  //     }
  //   }

  //   // ========================================================================
  //   // 🪐 FOOTER SECTION
  //   // ========================================================================
  //  XalorLoggerService.divider('═', 'contrast');

  //   XalorLoggerService.logLine(
  //     ' ✅ [Xalor CLI] Audit stream execution cycle successfully finished.',
  //     'contrast',
  //     true,
  //     'success' // Renders neon green text perfectly framed over your dark slate backdrop
  //   );

  //   const documentationLink = XalorLoggerService.formatTerminalLink(
  //     'https://github.com',
  //     'View Detailed Engine Telemetry Manual'
  //   );

  //   XalorLoggerService.logLine(
  //     ` 🪐 Studio Docs: ${documentationLink}`,
  //     'contrast',
  //     true,
  //     'info' // Renders bright electric cyan links on top of the dark slate background
  //   );

  //   XalorLoggerService.divider('═', 'contrast');
  //   XalorLoggerService.logLine('', 'naked');
  // }
}
