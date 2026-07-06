import ts from 'typescript';
import xalorTransformerPlugin from '../../transformer'; // Strict ESM extension [IX]
import { bootstrapEnvContext } from '../utils/index';
import { vacuumExitBuild } from '../utils';
import fs from 'fs';
import path from 'path';
/**
 * runVacuumCommand
 * 🧹 STAGE 2 PURGE: AUTOMATED PREBUILD CONDUIT
 *
 * ROLE:
 * Runs automatically as an early-stage prebuild gate. It sweeps the entire workspace,
 * validates type graphs, and sheds all development-only metrics to insulate your system
 * from framework compilation issues (Next.js/Vite) before they initialize [1.1].
 */
export function runVacuumCommand(projectRootPath: string) {
  /* prettier-ignore */
  const configPath = bootstrapEnvContext({ projectRootPath, cliMode: 'vacuum'});

  const readResult = ts.readConfigFile(configPath, ts.sys.readFile);
  if (readResult.error) {
    console.error(
      `❌ [Xalor CLI Error]: Failed to read tsconfig.json configuration.`,
    );
    process.exit(1);
  }
  /* prettier-ignore */
  const parsedConfig = ts.parseJsonConfigFileContent(readResult.config, ts.sys, projectRootPath);

  const modifiedOptions: ts.CompilerOptions = {
    ...parsedConfig.options,
    noEmit: false,
    emitDeclarationOnly: false,
    ignoreDeprecations: '6.0',
    incremental: false,
    composite: false,
    tsBuildInfoFile: undefined,
  } as ts.CompilerOptions;

  if ('plugins' in modifiedOptions) {
    delete modifiedOptions.plugins;
  }

  const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: modifiedOptions,
    projectReferences: parsedConfig.projectReferences,
  });

  const localTargetedFilesSet = new Set<string>();

  const ingestEmitResult = program.emit(
    undefined,
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

  console.log(
    `✨ Ingestion pass complete. Isolated ${localTargetedFilesSet.size} targeted file tracks from local envelope:\n` +
      `   ↳ [ ${[...localTargetedFilesSet].join(', ')} ]`,
  );

  console.log(
    '🪐 [Xalor CLI] Phase 2: Materializing code injections inline...',
  );

  const reifyEmitResult = program.emit(
    undefined,
    (fileName, text) => {
      fs.mkdirSync(path.dirname(fileName), { recursive: true });
      fs.writeFileSync(fileName, text, 'utf-8');
    },
    undefined,
    false,
    {
      before: [
        xalorTransformerPlugin(program, {
          compilationPhase: 'REIFY_RUNTIME',
        }),
      ],
    },
  );

  diagnosticsList.push(...reifyEmitResult.diagnostics);
  // ========================================================================
  // DEDUPLICATED DIAGNOSTICS PERFORMANCE LEDGER
  // Aggregates pre-emit structural errors, pass 1 metadata warnings,
  // and pass 2 code-generation diagnostics into a single unified array channel!
  // ========================================================================
  diagnosticsList.push(...ts.getPreEmitDiagnostics(program));

  diagnosticsList.forEach((diagnostic) => {
    if (diagnostic !== undefined) {
      console.log(
        `⚠️ [TS Build Note]: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
      );
    }
  });

  vacuumExitBuild();

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
