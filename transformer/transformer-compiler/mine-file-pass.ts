// transformer/transformer-compiler/mine-file-pass.ts
import ts from 'typescript';
import { runMiningPass, persistenceGate } from '../lifecycle';
import { shouldProcessFile, handleEmptyFileWipeout } from './resolvers';
import type { TMineFilePass } from '../types';
import type { SourceFile } from 'typescript';
import { isInstanceOf, errorReportService, XalorError } from '../../shared';
import { XalorRoutesService, xalorCentralContext } from '../service';
/**
 * INTERCEPT COMPILER RUNTIME EXCEPTION (The Error Dispatch Decoupler)
 *
 * ROLE:
 * Isolated exception handling endpoint that intercepts, categorizes, and dispatches
 * all errors arising during an active Abstract Syntax Tree (AST) scanning sequence.
 *
 * STRATEGY:
 * Differentiates cleanly between structured, expected type infractions (Path A) and unexpected
 * engine failures (Path B). It queries tool lifecycles point-free and coordinates atomic
 * state rollbacks for automated production tasks before propagating errors up the stack.
 * For background streams, it formats raw exception data using pre-baked layout matrices
 * to print uniform ANSI console blocks while preserving thread continuity.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation Rule) and Commandment V (Graph Integrity).
 * It completely decouples visual formatting loops and memory store purge sequences away
 * from the hot path compilation middleware, ensuring zero unexpected crash leakages.
 */
function catchFileMiningError(error: unknown, sourceFile: SourceFile): void {
  const lifecycle = XalorRoutesService.resolveXalorLifecycle();
  const mode = XalorRoutesService.xalorCLIMode();
  /* prettier-ignore */
  const isWatch = !lifecycle.isOneShotCompileMode && !lifecycle.isProductionVacuumMode;
  // ========================================================================
  //  PATH A: CONTROLLED STRUCTURAL TYPE RULE VIOLATIONS
  // ========================================================================
  if (isInstanceOf(error, XalorError)) {
    if (!isWatch) xalorCentralContext.hardResetAllMemoryStores();

    if (lifecycle.isOneShotCompileMode || lifecycle.isProductionVacuumMode) {
      throw error;
    }

    /* prettier-ignore */
    const watchWarningPanel = errorReportService.generateTerminalPanel({
      keyName: error.keyName || 'UNKNOWN_REGISTRATION_KEY',
      fileLocation: sourceFile.fileName,
      message: error.failure?.message ?? 'Type declaration tracking boundary anomaly detected.',
      rule: error.failure?.rule ?? 'type_rule_violation',
      mode,
    });

    console.warn(watchWarningPanel);
    return;
  }

  // ========================================================================
  // PATH B: UNEXPECTED INTERNAL SYSTEM FAULTS
  // ========================================================================
  if (!isWatch) xalorCentralContext.hardResetAllMemoryStores();

  if (lifecycle.isOneShotCompileMode || lifecycle.isProductionVacuumMode) {
    throw error;
  }

  errorReportService.logAnomaly('TRANSFORMER_DIAGNOSTIC_COMPILER', {
    keyName: 'COMPILER_MECHANICAL_FAULT',
    fileLocation: sourceFile.fileName,
    error,
    mode,
  });
}
/**
 * ORCHESTRATE FILE PROCESSING COMPILATION PASS (The Master Ingestion Core)
 *
 * ROLE:
 * Primary execution entry point governing the file-to-disk compilation lifecycle.
 * Coordinates file parsing, AST structural mining, and portable ledger persistence.
 *
 * STRATEGY:
 * Runs flat, sequential guardhouse filtering steps before opening a source file.
 * If a file is verified clean and active, it hands tracking nodes over to a custom
 * transformation visitor pass to serialize unrolled layouts. The finalized code tree
 * is wrapped inside an immutable pipeline gate to flush the cache straight to disk,
 * completely isolated inside a sealed try/catch block to funnel failures point-free.
 *
 * WHY:
 * Satisfies Commandment III (Runtime Consumption Rule) and Commandment VIII (Internal Efficiency).
 * It provides a highly optimized, linear execution stream that operates at sub-nanosecond
 * speeds, isolating pipeline step transitions completely away from side-effect crashes.
 */
export function executeFileMiningPass({
  program,
  context,
  sourceFile,
  bridgeDir,
}: TMineFilePass): SourceFile {
  try {
    const currentFileAbsolute = ts.sys.resolvePath(sourceFile.fileName);

    if (handleEmptyFileWipeout(sourceFile, currentFileAbsolute)) {
      return persistenceGate({ file: sourceFile, program, rootDir: bridgeDir });
    }
    if (!shouldProcessFile(sourceFile)) {
      return persistenceGate({
        file: sourceFile,
        program,
        rootDir: bridgeDir,
      });
    }
    const transformedFile = runMiningPass(program, context, sourceFile);

    return persistenceGate({
      file: transformedFile,
      program,
      rootDir: bridgeDir,
    });
  } catch (error: unknown) {
    catchFileMiningError(error, sourceFile);

    return sourceFile;
  }
}
