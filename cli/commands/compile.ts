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

  const parsedConfig = ts.parseJsonConfigFileContent(
    readResult.config,
    ts.sys,
    projectRootPath,
  );

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

  console.log('🔍 Analyzing files and initializing abstract syntax trees...');

  // 3. Instantiate a standard single-pass TypeScript compiler program
  const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: modifiedOptions,
    projectReferences: parsedConfig.projectReferences,
  });

  // 4. Inject our custom transformer architecture into a standard emit pipeline window
  const emitResult = program.emit(
    undefined, // Target source file (undefined runs across the entire workspace list)
    () => {
      // Black-hole swallow callback function to prevent physical .js disk pollution
    },
    undefined,
    false,
    {
      before: [xalorTransformerPlugin(program)],
    },
  );

  // 5. Output warnings or notices if found during the crawl pass
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  diagnostics.forEach((diagnostic) => {
    console.log(
      `⚠️ [TS Build Note]: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
    );
  });

  console.log('💾 Freezing workspace metadata and flushing cache registers...');

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
