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
    //  declaration: true,
    ignoreDeprecations: '6.0',
    incremental: false,
    composite: false,
    tsBuildInfoFile: undefined,
  } satisfies ts.CompilerOptions;

  if ('plugins' in modifiedOptions) {
    delete modifiedOptions.plugins;
  }

  const productionOnlyFileNames = parsedConfig.fileNames.filter((fileName) => {
    // Normalize path separators to ensure cross-platform safety (Windows vs Unix)
    const normalizedPath = fileName.replace(/\\/g, '/');

    // 🪓 THE AXE: Drop any file paths that live inside the hidden .xalor sandbox
    return !normalizedPath.includes('/.xalor/');
  });

  // Pass your clean production-only array directly to your program builder
  const program = ts.createProgram({
    rootNames: productionOnlyFileNames, // 🪐 The compiler now ONLY builds pristine application files!
    options: modifiedOptions,
    projectReferences: parsedConfig.projectReferences,
  });
  // const program = ts.createProgram({
  //   rootNames: parsedConfig.fileNames,
  //   options: modifiedOptions,
  //   projectReferences: parsedConfig.projectReferences,
  // });

  const localTargetedFilesSet = new Set<string>();
  const diagnosticsList: ts.Diagnostic[] = [];

  // ========================================================================
  // PASS 1: THE INGESTION SWEEP (Mining & Metadata Crawling)
  // ========================================================================
  console.log(
    '🪐 [Xalor CLI] Pass 1: Crawling AST to extract native type geometries...',
  );
  const ingestEmitResult = program.emit(
    undefined,
    () => {
      /* Black-hole callback: Prevent premature physical file writes */
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
  diagnosticsList.push(...ingestEmitResult.diagnostics);

  console.log(
    `✨ Ingestion complete. Isolated ${localTargetedFilesSet.size} targeted tracks from local envelope:\n` +
      `  ↳ [ ${[...localTargetedFilesSet].join(', ')} ]`,
  );

  // ========================================================================
  // PASS 2: THE INJECTION ROUTINE (Pointer Argument Transformation)
  // ========================================================================
  console.log(
    '🪐 [Xalor CLI] Pass 2: Transforming runtime calls to flat string identifiers...',
  );
  const injectEmitResult = program.emit(
    undefined,
    (fileName, text) => {
      // 🚀 FIXED: Capture the compiled JS text from memory and write it to disk!
      // This ensures your production files are saved right before vacuumExitBuild runs.
      fs.mkdirSync(path.dirname(fileName), { recursive: true });
      fs.writeFileSync(fileName, text, 'utf-8');
    },
    undefined,
    false,
    {
      before: [
        xalorTransformerPlugin(program, {
          compilationPhase: 'VACUUM_STRIP',
        }),
      ],
    },
  );
  diagnosticsList.push(...injectEmitResult.diagnostics);

  // ========================================================================
  // DIAGNOSTICS & TELEMETRY LEDGER EVALUATION
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
  globalThis.__XALOR_COMPILE_LOCK__ = true;
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
