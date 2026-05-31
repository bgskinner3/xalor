import ts from 'typescript';
import { xalorCentralContext } from '../service/context-service';
import type { TTraversalSentryConfig } from '../types';
/**
 * isLastFileInProgramQueue
 * 🛰️ FILE BOUNDARY CHECK GUARD
 *
 * ROLE:
 * Returns true if the currently scanned source file matches the absolute
 * last index element slot in the compiler program's file array queue.
 */
export function isLastFileInProgramQueue(
  program: ts.Program,
  currentFile: ts.SourceFile,
): boolean {
  const allFiles = program.getSourceFiles();
  const totalFilesCount = allFiles.length;

  if (totalFilesCount === 0) return false;

  const finalFileNode = allFiles[totalFilesCount - 1];
  if (finalFileNode === undefined) return false;
  const isLastFile = finalFileNode.fileName === currentFile.fileName;
  if (isLastFile) {
    console.log('========================================================');
    console.log('LIST', xalorCentralContext.context.targetedFilesSet);
    console.log('========================================================');
    console.log(finalFileNode.fileName, 'FINALNODE');
    console.log(currentFile.fileName, 'currentFile');
    console.log('========================================================');
  }
  return isLastFile;
}

export function triggerEndOfTraversalFlush(
  config: TTraversalSentryConfig,
): void {
  const { program, context, currentSourceFile, activePassRoutine, bridgeDir } =
    config;

  // 1. Rigorous Boundary Guard: Early escape bailout if we haven't hit the end of the line yet
  if (!isLastFileInProgramQueue(program, currentSourceFile)) return;
  console.log(
    `\n✨ [Xalor Engine] Last file queue boundary encountered: "${currentSourceFile.fileName}"`,
  );
  console.log(
    '   ↳ Flipping internal compilation phase to initiate runtime materialization...',
  );

  // 2. Safely shift the short-memory class instance phase tracking variable down-wire
  xalorCentralContext.setCompilationPhase('REIFY_RUNTIME');

  // 3. Extract the unique, deduplicated file paths collected during Phase 1 Macro Ingestion
  const targetPathsSet = xalorCentralContext.targetedRuntimeFilesSet;
  console.log(
    `📡 [Xalor Engine] Re-visiting ${targetPathsSet.size} active runtime file paths in-memory...`,
  );

  // ========================================================================
  // 🪐 THE ZERO-LOOP NATIVE RE-ENTRY PIPELINE
  // 🟢 FIXED: Uses native .forEach() array traversal to update your compiler's
  // internal cache footprints point-free without spinning any custom command loops!
  // ========================================================================
  targetPathsSet.forEach((targetFilePath) => {
    const cachedSourceFileInstance = program.getSourceFile(targetFilePath);

    if (cachedSourceFileInstance !== undefined) {
      // Force an immediate Pass 2 reification sweep through your existing mapper routine execution paths
      const reifiedFileAST = activePassRoutine({
        program,
        bridgeDir,
        sourceFile: cachedSourceFileInstance,
        context,
      });

      // Use a safe native memory property synchronization payload pass to assign the reified AST back to the compiler memory cache pool
      Object.assign(cachedSourceFileInstance, reifiedFileAST);

      console.log(
        `      ⚡ Code injection successfully materialized inside cache: ${targetFilePath}`,
      );
    }
  });

  // 4. SANITIZATION CLEANUP GATES: Snap states back to protect adjacent watch modes
  xalorCentralContext.setCompilationPhase('STANDARD_INLINE');
  xalorCentralContext.resetTargetedRuntimeFiles();

  console.log(
    '✅ In-transformer twin-pass compilation lifecycle successfully sealed.\n',
  );
}
