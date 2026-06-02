import type { ICLIConfig } from '../models';
import { AuditPresenterService } from '../service';
import { auditEngineService } from '../service/cli-audit-engine';
import { sanitizeFlags } from '../utils';
/**
 * RUN AUDIT COMMAND
 * ROLE: Primary CLI workload worker coordinating the type-graph audit process lifecycle.
 * STRATEGY: Switches presentation channels dynamically based on user feature flags.
 * Bypasses string console log panels completely if a JSON readout stream is requested.
 */
export async function runAuditCommand(
  projectRoot: string,
  flags?: ICLIConfig['flags'],
): Promise<void> {
  const sanitizedFlags = sanitizeFlags(flags);
  if (!sanitizedFlags.json) {
    console.log(`\n📊 [Xalor CLI] Initiating Macro Operational Profiler...`);
    console.log(`📂 Target Workspace Anchor: ${projectRoot}`);
    console.log(
      `🔧 Self-Healing Mode (--fix): ${sanitizedFlags.fix ? 'ACTIVE' : 'DISABLED'}\n`,
    );
  }

  try {
    const fixedFlagResolved = sanitizedFlags.fix ? true : false;
    const auditPayload = await auditEngineService.executeFullAuditRun({
      fix: fixedFlagResolved,
    });

    // 2. RETRIEVE METRICS VALIDATION CEILING
    if (auditPayload.summary.totalRegisteredKeys === 0) {
      if (!sanitizedFlags.json) {
        console.warn(
          `⚠️  [Xalor Audit Warning]: No active type registration keys found on disk.`,
        );
        console.warn(
          `💡 Ensure you have run 'xalor compile' to build your vault database first.\n`,
        );
      } else {
        // Emit a valid, empty JSON string context block to satisfy automated terminal parsers
        console.log(JSON.stringify({ error: 'NO_ACTIVE_REGISTRATION_KEYS' }));
      }
      return;
    }

    // =========================================================================
    // 🪐 INTERCEPT STEP 4: DYNAMIC FLOW ROUTER DISTRIBUTION
    // =========================================================================
    if (sanitizedFlags.json) {
      // Stream raw, minified, machine-readable JSON string data directly to standard output
      console.log(JSON.stringify(auditPayload));
    } else {
      // Fall back cleanly to painting your high-fidelity human-readable console panels
      AuditPresenterService.renderReportTables(auditPayload);
    }

    // 5. ENFORCE BUILD LIFECYCLE BOUNDARY CEILING
    if (auditPayload.drift.hasBreakingChanges) {
      process.exit(1);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown compilation exception.';

    if (!sanitizedFlags.json) {
      console.error(
        `❌ [Xalor Catastrophic Audit Failure]: Engine pipeline crashed: ${message}\n`,
      );
    } else {
      console.log(JSON.stringify({ error: 'PIPELINE_CRASH', message }));
    }

    process.exit(1);
  }
}
