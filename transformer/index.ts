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
import { isLastFileInProgramQueue } from './utils/traversal-sentry';

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
): ts.TransformerFactory<ts.SourceFile> {
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
      isLastFileInProgramQueue(program, sourceFile);

      return activePassRoutine({
        program,
        bridgeDir,
        sourceFile,
        context,
      });
    };
  };
}
//  * xalorRegistryIngestionPass
//  * 🛰️ GLOBAL AST EXPLORATION SYSTEM
//  *
//  * ROLE:
//  * Sweeps a SourceFile node tree to discover and extract macro declarations,
//  * populating the central type registry database *prior* to runtime evaluation.
//  */
// export function xalorRegistryIngestionPass(program: ts.Program) {
//   const typeChecker = program.getTypeChecker();

//   return (sourceFile: ts.SourceFile): void => {
//     function visitNode(node: ts.Node): void {
//       // 🪐 MATCH ENTRY GATEWAY: Intercept CallExpressions matching 'registerXalor'
//       if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
//         if (node.expression.text === 'registerXalor') {

//           // Extract your type strings and schema structures point-free here
//           // e.g., globalKeyRegistry.set(extractedKeyToken, parsedSchemaBlob);
//           console.log(`   ✅ Ingested macro token key declaration: ${node.getText()}`);
//         }
//       }

//       // Fast recursive stacked traversal pass across children nodes natively
//       ts.forEachChild(node, visitNode);
//     }

//     visitNode(sourceFile);
//   };
// }
// export default function xalorTransformerPlugidn(
//   compilerFactoryProgram: ts.Program,
// ): ts.TransformerFactory<ts.SourceFile> {
//   return (context: ts.TransformationContext) => {
//     // Fetch the authoritative list of all source files in the program queue
//     const programSourceFiles = compilerFactoryProgram.getSourceFiles();
//     const totalFilesCount = programSourceFiles.length;

//     // Resolve the absolute last file name in the project queue to use as our exit flag anchor
//     const lastFileNameInQueue =
//       programSourceFiles[totalFilesCount - 1]?.fileName ?? '';

//     return (sourceFile: ts.SourceFile): ts.SourceFile => {
//       const checker = compilerFactoryProgram.getTypeChecker();

//       // ========================================================================
//       // 🪐 PASS 1: EXPLORATION SWEEP (Always Runs Inline First)
//       // Forces the context phase to 'INGEST_REGISTRY' to harvest macros cross-files
//       // and logs files that contain runtime APIs into the Targeted File Set.
//       // ========================================================================
//       xalorCentralContext.setCompilationPhase('INGEST_REGISTRY');
//       const pass1MinerVisitor = theMiner({
//         program: compilerFactoryProgram,
//         context,
//         sourceFile,
//       });

//       // Complete the exploration walk over the current file text nodes completely as normal
//       const crawledSourceFile = ts.visitNode(
//         sourceFile,
//         pass1MinerVisitor,
//       ) as ts.SourceFile;

//       // ========================================================================
//       // 🪐 THE END-OF-TRAVERSAL DISCOVERY SENTRY
//       // Check if the current file being processed is the absolute last file in the queue!
//       // ========================================================================
//       if (crawledSourceFile.fileName === lastFileNameInQueue) {
//         console.log(
//           `\n✨ [Xalor Engine] Traversal queue completed. Flipping phase to execute materialization...`,
//         );

//         // A. Flip the context phase to runtime code reification
//         xalorCentralContext.setCompilationPhase('REIFY_RUNTIME');

//         // B. Extract the unique file paths collected across the entire project sweep
//         const targetPathsCollection =
//           xalorCentralContext.targetedRuntimeFilesSet;
//         console.log(
//           `📡 Re-visiting ${targetPathsCollection.size} active runtime file paths in-memory...`,
//         );

//         // C. 🟢 THE RE-ENTRY SUB-TRAVERSAL LOOP:
//         // Instead of calling program.emit again in the CLI, we force a localized
//         // AST sub-pass directly over the targeted files right inside the thread frame!
//         targetPathsCollection.forEach((targetFilePath) => {
//           const targetSourceFileInstance =
//             compilerFactoryProgram.getSourceFile(targetFilePath);

//           if (targetSourceFileInstance !== undefined) {
//             // Instantiate a fresh Pass 2 reification visitor for this specific target
//             const pass2ReifierVisitor = theMiner({
//               program: compilerFactoryProgram,
//               context,
//               sourceFile: targetSourceFileInstance,
//             });

//             // Force an immediate in-memory node-injection sweep over the target file's AST
//             const reifiedFileAST = ts.visitNode(
//               targetSourceFileInstance,
//               pass2ReifierVisitor,
//             ) as ts.SourceFile;

//             // Update the compiler's internal memory cache node with your newly reified, code-injected file.
//             // When TypeScript outputs the files to disk a few milliseconds later, your injections write perfectly!
//             Object.assign(targetSourceFileInstance, reifiedFileAST);

//             console.log(
//               `      ⚡ Code injection successfully materialized inside: ${targetFilePath}`,
//             );
//           }
//         });

//         // D. SANITIZATION CLEANUP GATES
//         xalorCentralContext.setCompilationPhase('STANDARD_INLINE');
//         xalorCentralContext.resetTargetedRuntimeFiles();
//         console.log(
//           '✅ In-transformer twin-pass compilation lifecycle successfully completed.\n',
//         );
//       }

//       // Return the processed file structure safely down the emission pipeline
//       return crawledSourceFile;
//     };
//   };
// }
