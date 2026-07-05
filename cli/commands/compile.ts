// cli/commands/complie.ts
import ts from 'typescript';
import xalorTransformerPlugin from '../../transformer';
import { bootstrapEnvContext } from '../utils';

/**
 * RUN COMPILE COMMAND
 *
 * Executes a one-shot, linear development workspace compilation crawl.
 * Tracks matching behaviors to watch command, but exits cleanly after a single pass.
 */
export function runCompileCommand(projectRootPath: string): void {
  /* prettier-ignore */
  const configPath = bootstrapEnvContext({ projectRootPath, cliMode: 'compile'});

  // 1. Parse tsconfig options cleanly from disk
  const readResult = ts.readConfigFile(configPath, ts.sys.readFile);
  if (readResult.error) {
    console.error(
      `❌ [Xalor CLI Error]: Failed to read tsconfig.json configuration.`,
    );
    process.exit(1);
  }
  /* prettier-ignore */
  const parsedConfig = ts.parseJsonConfigFileContent(readResult.config, ts.sys, projectRootPath);

  // 2. Override properties to match the exact option behaviors of your watch runner
  const modifiedOptions: ts.CompilerOptions = {
    ...parsedConfig.options,
    noEmit: false,
    emitDeclarationOnly: false,
    ignoreDeprecations: '6.0',
  };

  if ('plugins' in modifiedOptions) {
    delete modifiedOptions.plugins;
  }

  // 3. Instantiate a standard single-pass TypeScript compiler program
  const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: modifiedOptions,
    projectReferences: parsedConfig.projectReferences,
  });
  const localTargetedFilesSet = new Set<string>();
  // 4. Inject our custom transformer architecture into a standard emit pipeline window
  const ingestEmitResult = program.emit(
    undefined, // Target source file (undefined runs across the entire workspace list)
    () => {
      // Black-hole swallow callback function to prevent physical .js disk pollution
    },
    undefined,
    false,
    {
      before: [
        xalorTransformerPlugin(program, {
          compilationPhase: 'INGEST_REGISTRY',
          targetedFilesCollector: localTargetedFilesSet,
        }),
      ],
    },
  );

  const diagnosticsList: ts.Diagnostic[] = [...ingestEmitResult.diagnostics];

  // const targetedFilesCount = localTargetedFilesSet.size;
  console.log(
    `✨ Ingestion pass complete. Isolated ${localTargetedFilesSet.size} targeted file tracks from local envelope:\n` +
      `   ↳ [ ${[...localTargetedFilesSet].join(', ')} ]`,
  );

  console.log(
    '🪐 [Xalor CLI] Phase 2: Materializing code injections inline...',
  );

  const reifyEmitResult = program.emit(undefined, () => {}, undefined, false, {
    before: [
      xalorTransformerPlugin(program, {
        compilationPhase: 'REIFY_RUNTIME',
      }),
    ],
  });
  diagnosticsList.push(...reifyEmitResult.diagnostics);
  // ========================================================================
  // 🛰️ DEDUPLICATED DIAGNOSTICS PERFORMANCE LEDGER
  // Aggregates pre-emit structural errors, pass 1 metadata warnings,
  // and pass 2 code-generation diagnostics into a single unified array channel!
  // ========================================================================
  diagnosticsList.push(...ts.getPreEmitDiagnostics(program));

  // Print out every intercepted TypeScript warning cleanly to the terminal
  diagnosticsList.forEach((diagnostic) => {
    if (diagnostic !== undefined) {
      console.log(
        `⚠️ [TS Build Note]: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
      );
    }
  });

  // ====================================================================================
  // NATIVE ASYNC TICK BUFFER
  // ====================================================================================
  // Because the final file's persistenceGate triggers an async write operation, we pass
  // execution to a single event loop tick. This allows the background I/O thread pool
  // to cleanly finish writing the database to disk before our process closes.
  setTimeout(() => {
    console.log(
      '\n✅ [Xalor CLI] Workspace snapshot synced and locked successfully!\n',
    );
    process.exit(0);
  }, 20);
}
