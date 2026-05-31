// transformer/index.ts
import './reifiers/registry/index';
import ts from 'typescript';
import type { TTransformerExecuteMode } from '../shared';
import {
  resolveTransformerBootAnchor,
  determineTransformerExecuteMode,
} from './transformer-compiler';
import { PASS_STRATEGY_MAPPER, BOOT_MODE_STRATEGY_MAPPER } from './mappers';
import { isGetProgram } from './utils';
import { xalorCentralContext, XalorRoutesService } from './service';
import type { TXalorTransformerOptions } from './types';

/**
 * THE ARCHITECTURAL COMPILER TRACKS SINGLE SOURCE OF TRUTH
 *
 * 1. WATCH DEV MODE (Stage 1B: Continuous Dev Reflection)
 * - Triggered By: `process.env.XALOR_CLI_WATCH === 'true'`
 * - Behavior: Runs an incremental background watch loop daemon process. Mines metadata,
 *   updates your long-lived memory registries, and writes IDE files continuously.
 * - Error Law: Suppresses process crashes on duplicate key collisions to protect uptime.
 *
 * 2. COMPILE DEV MODE (One-Shot Local Sync Pass)
 * - Triggered By: `process.env.XALOR_CLI_COMPILE === 'true'`
 * - Behavior: Executes a complete single-pass workspace compilation crawl. Mines metadata,
 *   updates registries, and commits a final schema snapshot to disk before process exit.
 * - Error Law: Triggers a hard `process.exit(1)` block instantly on duplicate key errors.
 *
 * 3. JEST TEST RADAR MODE (Virtualized Mock Environment)
 * - Triggered By: `process.env.NODE_ENV === 'test'`
 * - Behavior: Bypasses physical hard drive file-writing lookups entirely. Hydrates mock
 *   structures straight into Jest's global RAM space via native microsecond allocations.
 * - Timing Law: Flushes state changes instantly on individual file saves rather than waiting for completion loops.
 *
 * -----------------------------------------------------------------------------------------
 */
export default function xalorTransformerPlugin(
  compilerFactoryProgram: ts.Program,
  options: TXalorTransformerOptions = {
    compilationPhase: 'STANDARD_INLINE',
    targetedFilesCollector: new Set<string>(),
  },
): ts.TransformerFactory<ts.SourceFile> {
  xalorCentralContext.resetTargetedRuntimeFiles();
  xalorCentralContext.setCompilationPhase(
    options.compilationPhase ?? 'STANDARD_INLINE',
  );
  xalorCentralContext.setTargetedFilesCollector(
    options.targetedFilesCollector ?? new Set<string>(),
  );

  const lifecycle = XalorRoutesService.resolveXalorLifecycle();

  /* prettier-ignore */ const executeMode: TTransformerExecuteMode = determineTransformerExecuteMode(lifecycle);

  /* prettier-ignore */ const { sampleFile, runtimePaths } = resolveTransformerBootAnchor(
    compilerFactoryProgram,
  );

  const activeBootRoutine = BOOT_MODE_STRATEGY_MAPPER[executeMode];
  if (activeBootRoutine) {
    activeBootRoutine({ sampleFile, runtimePaths });
  }

  if (lifecycle.isClearMode) {
    return (_context: ts.TransformationContext) => {
      return (sourceFile: ts.SourceFile): ts.SourceFile => sourceFile;
    };
  }
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile): ts.SourceFile => {
      const { bridgeDir } = XalorRoutesService.resolveXalorPaths(
        sourceFile.fileName,
      );

      // Instantiates a short-lived Set dedicated strictly to capturing keys discovered
      // inside THIS single file during THIS specific save-triggered compilation frame run.
      xalorCentralContext.resetActivePassKeys();
      xalorCentralContext.resetFileCounters(sourceFile.fileName);
      xalorCentralContext.resetBlacklist();
      const program = isGetProgram(context)
        ? context.getProgram()
        : compilerFactoryProgram;

      const activePassRoutine = PASS_STRATEGY_MAPPER[executeMode];

      return activePassRoutine({
        program,
        bridgeDir,
        sourceFile,
        context,
      });
    };
  };
}
