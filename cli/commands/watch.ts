// src/cli/commands/watch.ts
import ts from 'typescript';
import {
  CliDebouncer,
  bootstrapEnvContext,
  createXalorWatchHost,
} from '../utils';
import { WATCH_THROTTLE_CONFIG } from '../models';

/**
 * RUN WATCH COMMAND
 *
 * Orchestrates a production-grade, low-overhead native TypeScript watch program.
 * Programmatically overrides option sets and strips duplicate plugin parameters to block double-execution loops.
 */
export function runWatchCommand(projectRootPath: string): void {
  const configPath = bootstrapEnvContext({ projectRootPath, cliMode: 'watch' });
  const config = WATCH_THROTTLE_CONFIG['LAID_BACK'];

  let rapidSaveChainCount = 0;
  let lastTriggerTimestamp = Date.now();

  const emitDebouncer = new CliDebouncer<
    [ts.EmitAndSemanticDiagnosticsBuilderProgram]
  >((program) => {
    program.emit();
  }, config.INITIAL_SEED_DELAY_MS);

  // Define your execution hook strategy to handle incoming filesystem mutations
  const handleProgramLifecycleMutation = (
    builderProgram: ts.EmitAndSemanticDiagnosticsBuilderProgram,
    originalDiagnosticReporter?: (
      program: ts.EmitAndSemanticDiagnosticsBuilderProgram,
    ) => void,
  ): void => {
    const executionTime = Date.now();
    const cycleDeltaTime = executionTime - lastTriggerTimestamp;
    lastTriggerTimestamp = executionTime;

    rapidSaveChainCount += 1;

    // 🛡️ Xalor Guard: Git Branch Checkout / Upstream Batch Merge Protection Gate
    if (
      rapidSaveChainCount > config.VOLATILE_CHAIN_HIGH_WATERMARK &&
      cycleDeltaTime < config.VOLATILE_CYCLE_DELTA_FLOOR_MS
    ) {
      /* prettier-ignore */ console.log('\n======================================================================');
      /* prettier-ignore */ console.log('🚨 [Xalor Guard] ABNORMAL VOLATILE FILESYSTEM MUTATION CHAIN DETECTED!');
      /* prettier-ignore */ console.log('👉 Context: Active Git branch checkout or upstream batch merge in progress.');
      /* prettier-ignore */ console.log('🔒 Action: Safely freezing in-memory records and aborting watch daemon...');
      /* prettier-ignore */ console.log('======================================================================\n');
      process.exit(0);
    }

    // ====================================================================================
    // 🎯 THE ADAPTIVE CONDITIONS ENGINE (THE AUTO-SAVE DETECTOR)
    // ====================================================================================
    /* prettier-ignore */ const isAutoSaveIntervalActive = cycleDeltaTime < config.AUTO_SAVE_DETECTION_CEILING_MS;
    /* prettier-ignore */ const optimizedWindowMs = isAutoSaveIntervalActive ? config.AUTO_SAVE_COOLDOWN_PADDING_MS : config.MANUAL_SAVE_COOLDOWN_PADDING_MS;

    // Natively invoke our strongly typed delay update parameter point-free
    emitDebouncer.setDelay(optimizedWindowMs);

    // Update execution context with the latest active compiler program blueprint
    emitDebouncer.updateFunction((activeProgram) => {
      // Reset chain values back to initial baseline rules once edits safely settle down
      rapidSaveChainCount = 0;

      // Execute the custom transformer compilation pass
      activeProgram.emit();
      if (originalDiagnosticReporter) {
        originalDiagnosticReporter(activeProgram);
      }
    });

    emitDebouncer.trigger(builderProgram);
  };

  // Instantiated the watch host cleanly via our decoupled factory function
  const watchCompilerHost = createXalorWatchHost(configPath, (program) => {
    // Extract the original compiler baseline logger function directly on the fly
    const baselineDiagnosticReporter = ts.createWatchCompilerHost(
      configPath,
      undefined,
      ts.sys,
    ).afterProgramCreate;

    handleProgramLifecycleMutation(program, baselineDiagnosticReporter);
  });

  ts.createWatchProgram(watchCompilerHost);
}
