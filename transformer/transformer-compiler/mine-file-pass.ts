// transformer/transformer-compiler/mine-file-pass.ts
import ts from 'typescript';
import { runMiningPass, persistenceGate } from '../lifecycle';
import { shouldProcessFile, handleEmptyFileWipeout } from './resolvers';
import type { TMineFilePass } from '../types';
import type { SourceFile } from 'typescript';
import { XalorInvalidTypeError } from '../miner/type-resolver';
import { isInstanceOf } from '../../shared';
import { XalorRoutesService } from '../service';

export function executeFileMiningPass({
  program,
  context,
  sourceFile,
  bridgeDir,
}: TMineFilePass): SourceFile {
  try {
    const currentFileAbsolute = ts.sys.resolvePath(sourceFile.fileName);

    // ====================================================================================
    // 📭 BRANCH A: THE VOID SHIELD (Empty File Guard)
    // ====================================================================================
    // Executes cache purges in memory and fast-tracks the blank file directly to the flusher
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
  } catch (error) {
    const lifecycle = XalorRoutesService.resolveXalorLifecycle();

    // ========================================================================
    // CONDITION PATH A: CONTROLLED STRUCTURAL TYPE RULE VIOLATIONS
    // ========================================================================
    if (isInstanceOf(error, XalorInvalidTypeError)) {
      // 🛑 PRODUCTION SYSTEM LAWS: Stop compile and vacuum operations immediately by throwing to the parent runner
      if (lifecycle.isOneShotCompileMode || lifecycle.isProductionVacuumMode) {
        throw error;
      }

      // ⚠️ WATCH MODE DECORATION: Dev watch loop intercepts the violation beautifully without crashing the thread process
      const { rule, message } = error.failure;

      console.warn(
        '\n======================================================================',
      );
      console.warn('🛑 [Xalor Type Validator] REGISTER INTENT REJECTED');
      console.warn(`📂 Broken File Target: ${sourceFile.fileName}`);
      console.warn(`🏷️ Rule Broken: ${rule.toUpperCase()}`);
      console.warn(`💥 Details: ${message}`);
      console.warn(
        '🔒 Action: Aborted cache commit for this node. Watcher remaining active.',
      );
      console.warn(
        '======================================================================\n',
      );

      return sourceFile; // Returns clean file, safely bypassing database map cache writes for this pass
    }

    // ========================================================================
    // CONDITION PATH B: UNEXPECTED INTERNAL SYSTEM FAULTS (e.g., Catastrophic Breakdowns)
    // ========================================================================
    // 🛑 PRODUCTION SYSTEM LAWS: Stop compile and vacuum operations immediately by throwing to the parent runner
    if (lifecycle.isOneShotCompileMode || lifecycle.isProductionVacuumMode) {
      throw error;
    }

    const rawMessage = isInstanceOf(error, Error)
      ? error.message
      : 'Unknown AST compilation anomaly.';

    console.log(
      '\n======================================================================',
    );
    console.log('⚠️ [Xalor Shield] INTERCEPTED UNCAUGHT MECHANICAL FAULT');
    console.log(`📂 Broken File Target: ${sourceFile.fileName}`);
    console.log(`💥 Diagnostic Message: ${rawMessage}`);
    console.log(
      '🔒 Action: Safeguarding compiler thread process. Watch thread remaining ALIVE.',
    );
    console.log(
      '======================================================================\n',
    );

    return sourceFile;
  }
}
