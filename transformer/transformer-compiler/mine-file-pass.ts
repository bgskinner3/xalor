// transformer/transformer-compiler/mine-file-pass.ts
import ts from 'typescript';
import { runMiningPass, persistenceGate } from '../lifecycle';
import { shouldProcessFile, handleEmptyFileWipeout } from './resolvers';
import type { TMineFilePass } from '../types';
import type { SourceFile } from 'typescript';

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
    // ====================================================================================
    // SAFE EMERGENCY ESCAPE HANDSHAKE
    // ====================================================================================

    const rawMessage =
      error instanceof Error
        ? error.message
        : 'Unknown AST compilation anomaly.';

    console.log(
      '\n======================================================================',
    );
    console.log(
      `⚠️  [Xalor Shield] INTERCEPTED TRANSFORMATION EXECUTION FAULT`,
    );
    console.log(`📂 Broken File Target: ${sourceFile.fileName}`);
    console.log(`💥 Diagnostic Message: ${rawMessage}`);
    console.log(
      `🔒 Action: Safeguarding process. Watch thread remaining ALIVE.`,
    );
    console.log(
      '======================================================================\n',
    );

    // Return the untouched source file to the compiler tree so the developer's stream is unbroken
    return sourceFile;
  }
}
