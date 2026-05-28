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

/**
 * FILES
 * transformer/index.ts
 * transformer/lifecycle/index.ts
 * transformer/lifecycle/persistence-gate.ts
 *
 * ----
 * transformer/miner/index.ts
//  * transformer/miner/processor.ts
//  * transformer/miner/ghost-structures.ts
//  * transformer/utils/paths-resolver.ts
//  * transformer/utils/vault-serializer.ts
 * transformer/emitters/intellisense-bridge.ts
 */
/**
 * 🪐 THE ARCHITECTURAL COMPILER TRACKS SINGLE SOURCE OF TRUTH
 *
 * 1. WATCH DEV MODE (Stage 1B: Continuous Dev Reflection)
 *    - Triggered By: `process.env.XALOR_CLI_WATCH === 'true'`
 *    - Behavior: Runs an incremental background watch loop daemon process. Mines metadata,
 *      updates your long-lived memory registries, and writes IDE files continuously.
 *    - Error Law: Suppresses process crashes on duplicate key collisions to protect uptime.
 *
 * 2. COMPILE DEV MODE (One-Shot Local Sync Pass)
 *    - Triggered By: `process.env.XALOR_CLI_COMPILE === 'true'`
 *    - Behavior: Executes a complete single-pass workspace compilation crawl. Mines metadata,
 *      updates registries, and commits a final schema snapshot to disk before process exit.
 *    - Error Law: Triggers a hard `process.exit(1)` block instantly on duplicate key errors.
 *
 * 3. JEST TEST RADAR MODE (Virtualized Mock Environment)
 *    - Triggered By: `process.env.NODE_ENV === 'test'`
 *    - Behavior: Bypasses physical hard drive file-writing lookups entirely. Hydrates mock
 *      structures straight into Jest's global RAM space via native microsecond allocations.
 *    - Timing Law: Flushes state changes instantly on individual file saves rather than waiting for completion loops.
 *
 * -----------------------------------------------------------------------------------------
 * ARCHITECTURE MAP TRACKING INDEX:
 * [✓] transformer/index.ts                  - Master Gateway Router Switchboard
 * [ ] transformer/lifecycle/index.ts        - Simple Module Export Intersect Drawer
 * [ ] transformer/lifecycle/persistence-gate.ts - Compilation End-Gate Flow Router
 * [✓] transformer/miner/index.ts            - Core AST Ingestion Invariant Switchboard
 * [✓] transformer/miner/processor.ts        - Mechanical Visitor Expression Argument Rewriter
 * [✓] transformer/miner/ghost-structures.ts  - Pure String Symbol Print Engine
 * [ ] transformer/utils/paths-resolver.ts    - Pure Stateless Project Directory Calculator
 * [ ] transformer/utils/vault-serializer.ts  - Pure Stateless JSON Disk Cache File Writer
 * [ ] transformer/emitters/intellisense-bridge.ts - Text Emitter Definitions Formatting Generator
 */

export default function xalorTransformerPlugin(
  compilerFactoryProgram: ts.Program,
): ts.TransformerFactory<ts.SourceFile> {
  const lifecycle = XalorRoutesService.resolveXalorLifecycle();

  // 2. 🚀 THE CENTRAL OVERHAUL STEP: Derive the single, unmovable string execution track token!
  /* prettier-ignore */ const executeMode: TTransformerExecuteMode = determineTransformerExecuteMode(lifecycle);

  /* prettier-ignore */ const { sampleFile, runtimePaths } = resolveTransformerBootAnchor(
    compilerFactoryProgram,
  );
  const activeBootRoutine = BOOT_MODE_STRATEGY_MAPPER[executeMode];
  if (activeBootRoutine) {
    activeBootRoutine({ sampleFile, runtimePaths });
  }
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile): ts.SourceFile => {
      const { bridgeDir } = XalorRoutesService.resolveXalorPaths(
        sourceFile.fileName,
      );
      // 🧠 THE EPHEMERAL TRACKER MATRIX:
      // Instantiates a short-lived Set dedicated strictly to capturing keys discovered
      // inside THIS single file during THIS specific save-triggered compilation frame run.
      xalorCentralContext.resetActivePassKeys();
      xalorCentralContext.resetFileCounters(sourceFile.fileName);
      // Invoke your high-speed structural predicate guard to extract the living program program host safely
      const program = isGetProgram(context)
        ? context.getProgram()
        : compilerFactoryProgram;

      // Invoke your context generator factory to pack everything into your unified root payload container
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
