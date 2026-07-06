import ts from 'typescript';
import xalorTransformerPlugin from '../../transformer'; // Strict ESM extension [IX]
import { bootstrapEnvContext } from '../utils/index';
import { XalorRoutesService } from '../../transformer/service';
import * as fs from 'fs';
// import { vacuumExitBuild } from '../utils';

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
  const pathRoot = XalorRoutesService.resolveXalorPaths();

  const rawJsonString = fs.readFileSync(pathRoot.vaultFile, 'utf-8');
  const obj = JSON.parse(rawJsonString);

  console.log(obj);
  console.log('HERE BITCH');
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

  // vacuumExitBuild(projectRootPath);
  setTimeout(() => {
    console.log(
      `\n\x1b[32m✅ [Xalor CLI] Workspace snapshot vacuumed, synced, and locked successfully!\x1b[0m\n`,
    );

    // 🧼 Secure, clean process termination with zero data corruption
    process.exit(0);
  }, 20);
}

// what we keep
/**
 blueprints: The flat, content-addressable structural shape matrix (sh_*). Required to run the actual property-matching checks.
 references: The lookups mapping your string constants ("swedishFish") to their shape hashes.
driftTracking: The lineage registry mapping your drift tokens ("TOKEN") directly to their current and ancestral validation keys.

 */

// // ====================================================================================
// // NATIVE ASYNC TICK BUFFER
// // ====================================================================================
// // Because the final file's persistenceGate triggers an async write operation, we pass
// // execution to a single event loop tick. This allows the background I/O thread pool
// // to cleanly finish writing the database to disk before our process closes.
// setTimeout(() => {
//   console.log(
//     '\n✅ [Xalor CLI] Workspace snapshot synced and locked successfully!\n',
//   );
//   process.exit(0);
// }, 20);
// import ts from 'typescript';
// import xalorTransformerPlugin from '../../transformer'; // Strict ESM extension [IX]
// import { bootstrapEnvContext } from '../utils/index';
// import { vacuumExitBuild } from '../utils';
// import { resolveXalorPaths, fsContext } from '../../shared';
// import { promises as fsPromises } from 'fs';
// /**
//  * runVacuumCommand
//  * 🧹 STAGE 2 PURGE: AUTOMATED PREBUILD CONDUIT
//  *
//  * ROLE:
//  * Runs automatically as an early-stage prebuild gate. It sweeps the entire workspace,
//  * validates type graphs, and sheds all development-only metrics to insulate your system
//  * from framework compilation issues (Next.js/Vite) before they initialize [1.1].
//  */
// export async function runVacuumCommand(projectRootPath: string): Promise<void> {
//   /* prettier-ignore */
//   const configPath = bootstrapEnvContext({ projectRootPath, cliMode: 'vacuum'});

//   // 1. Ingest compiler parameters from disk natively
//   const readResult = ts.readConfigFile(configPath, ts.sys.readFile);
//   if (readResult.error) {
//     console.error(
//       `\x1b[31m❌ [Xalor CLI Error]: Failed to read tsconfig.json configuration.\x1b[0m`,
//     );
//     process.exit(1);
//   }

//   const parsedConfig = ts.parseJsonConfigFileContent(
//     readResult.config,
//     ts.sys,
//     projectRootPath,
//   );

// const modifiedOptions: ts.CompilerOptions = {
// ...parsedConfig.options,
// noEmit: false, // Enforced false to unlock your custom AST transformer execution loops! [1.1]
// emitDeclarationOnly: false,
// ignoreDeprecations: '6.0',
// skipLibCheck: true,
// };

//   if ('plugins' in modifiedOptions) {
//     delete modifiedOptions.plugins;
//   }

//   // 2. Instantiate a standard single-pass TypeScript compiler program context tree
//   const program = ts.createProgram({
//     rootNames: parsedConfig.fileNames,
//     options: modifiedOptions,
//     projectReferences: parsedConfig.projectReferences,
//   });

//   const localTargetedFilesSet = new Set<string>();

//   // ========================================================================
//   // 🔬 PASS 1: INGESTION SWEEP (PURE RAM METADATA GATHERING)
//   // ========================================================================
//   console.log(
//     '🪐 [Xalor Vacuum] Pass 1: Ingesting complete workspace metadata graph...',
//   );
//   program.emit(
//     undefined,
//     () => {
//       /* 🕳️ Black-hole swallow callback function to prevent physical .js disk pollution */
//     },
//     undefined,
//     false,
//     {
//       before: [
//         xalorTransformerPlugin(program, {
//           compilationPhase: 'INGEST_REGISTRY',
//           targetedFilesCollector: localTargetedFilesSet,
//         }),
//       ],
//     },
//   );

//   console.log(
//     ` ✨ Ingestion pass complete. Isolated ${localTargetedFilesSet.size} targeted tracks.`,
//   );

//   // ========================================================================
//   // 🟢 THE INTERMEDIATE ASYNC FLUSH GATEWAY (REPAIRS THE UNTERMINATED STRING BUG)
//   //
//   // Instead of letting the transformer write out data tracking points blindly,
//   // we capture the populated memory maps from your global xalorCentralContext RAM
//   // store, and use an explicit, fully-awaited async promise write to lock the file
//   // before Pass 2 ever triggers. This eliminates disk thread contention completely [1.1]!
//   // ========================================================================
//   const paths = resolveXalorPaths(projectRootPath);
//   const res = await fsContext.readText(fsContext.envPaths.vaultFile);
//   const devSnapshot = JSON.parse(res);

//   try {
//     // Await the asynchronous write completely to freeze line progress until disk I/O settles [VIII]
//     await fsPromises.writeFile(
//       paths.vaultFile,
//       JSON.stringify(currentMemoryRegistryState),
//       'utf-8',
//     );
//     console.log(
//       ` ↳ \x1b[32mActive development data cache successfully flushed to vaultFile asynchronously.\x1b[0m`,
//     );
//   } catch (writeErr) {
//     console.error(
//       `\x1b[31m🚨 Fatal: Failed to persist volatile memory matrix to disk.\x1b[0m`,
//       writeErr,
//     );
//     process.exit(1);
//   }

//   // ========================================================================
//   // 🔬 PASS 2: MATERIALIZATION SWEEP (REIFY_RUNTIME)
//   // ========================================================================
//   console.log('🪐 [Xalor CLI] Pass 2: Materializing code injections inline...');

//   const reifyEmitResult = program.emit(undefined, () => {}, undefined, false, {
//     before: [
//       xalorTransformerPlugin(program, {
//         compilationPhase: 'REIFY_RUNTIME',
//       }),
//     ],
//   });

//   // 3. Enforce zero-tolerance boundary validation safety
//   const diagnosticsList = [
//     ...reifyEmitResult.diagnostics,
//     ...ts.getPreEmitDiagnostics(program),
//   ];
//   let hasErrors = false;

//   diagnosticsList.forEach((diagnostic) => {
//     if (diagnostic !== undefined) {
//       if (diagnostic.category === ts.DiagnosticCategory.Error) hasErrors = true;
//       console.log(
//         `⚠️  [TS Build Note]: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
//       );
//     }
//   });

//   if (hasErrors) {
//     console.error(
//       '\n🚨 HARD CRASH: Structural compile or type infractions detected. Production compilation blocked.\n',
//     );
//     process.exit(1);
//   }

//   try {
//     // 4. Await your optimized static production asset creation point-free
//     await vacuumExitBuild(projectRootPath);

//     console.log(
//       '\n\x1b[32m✅ [Xalor CLI] Workspace snapshot vacuumed, synced, and locked successfully!\x1b[0m\n',
//     );
//     process.exit(0);
//   } catch (error) {
//     console.error(
//       `\n\x1b[31m🚨 FATAL DISPATCH EXCEPTION:\x1b[0m ${(error as Error).message}\n`,
//     );
//     process.exit(1);
//   }
// }
