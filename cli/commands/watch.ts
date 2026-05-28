// src/cli/commands/watch.ts
// src/cli/commands/watch.ts
import ts from 'typescript';
import xalorTransformerPlugin from '../../transformer';
import { XALOR_CLI_STATUS_MESSAGES, isKeyInObject } from '../../shared';
import { CliDebouncer } from '../utils';

/**
 * RUN WATCH COMMAND
 *
 * Orchestrates a production-grade, low-overhead native TypeScript watch program.
 * Programmatically overrides option sets and strips duplicate plugin parameters to block double-execution loops.
 */
export function runWatchCommand(projectRootPath: string): void {
  console.log('\n====================================================');
  console.log('🛰️ [Xalor CLI] STARTING REAL-TIME REFLECTION RUNNER...');
  console.log(`📂 Working Path Anchor: ${projectRootPath}`);
  console.log('====================================================\n');

  process.env.XALOR_CLI_WATCH = 'true';

  const configPath = ts.findConfigFile(
    projectRootPath,
    ts.sys.fileExists,
    'tsconfig.json',
  );

  if (!configPath) {
    console.error(
      '❌ [Xalor CLI Error]: Unable to locate a valid tsconfig.json in project root.',
    );
    process.exit(1);
  }

  // ====================================================================================
  // 🛡️ SELF-DESTRUCT TRACKING PRIMITIVES (GIT CHECKOUT BASELINE RULES)
  // ====================================================================================
  let rapidSaveChainCount = 0;
  let lastTriggerTimestamp = Date.now();

  // 🚀 INITIALIZE AUTO-SAVE BUFFER: Seed with a type-safe function shell matching our target hook signature
  const emitDebouncer = new CliDebouncer<
    [ts.EmitAndSemanticDiagnosticsBuilderProgram]
  >((program) => {
    program.emit();
  }, 300);

  const customCreateProgram: ts.CreateProgram<
    ts.EmitAndSemanticDiagnosticsBuilderProgram
  > = (
    rootNames,
    options,
    host,
    oldProgram,
    configFileParsingDiagnostics,
    projectReferences,
  ) => {
    // 🚀 THE DUAL-EMIT BLOCKADE REMOVAL:
    // We explicitly strip out the "plugins" array allocation from the compiler choices!
    // This stops TypeScript from auto-loading your transformer plugin via tsconfig.json,
    // ensuring our custom transformers array pass below is the ONLY execution path running.
    const cleanOptions = { ...options };
    if (isKeyInObject('plugins')(cleanOptions)) {
      delete cleanOptions.plugins;
    }

    const modifiedOptions = {
      ...cleanOptions,
      noEmit: false,
      emitDeclarationOnly: false,
      ignoreDeprecations: '6.0',
    };

    const builderProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram(
      rootNames,
      modifiedOptions,
      host,
      oldProgram,
      configFileParsingDiagnostics,
      projectReferences,
    );

    const underlyingProgram = builderProgram.getProgram();
    const originalEmit = underlyingProgram.emit;

    underlyingProgram.emit = (
      targetSourceFile,
      _writeFile,
      cancellationToken,
      emitOnlyDtsFiles,
      _customTransformers,
    ) => {
      const silentWriteFile: ts.WriteFileCallback = () => {
        // Black-hole swallow callback function to prevent physical .js disk pollution
      };
      return originalEmit(
        targetSourceFile,
        silentWriteFile,
        cancellationToken,
        emitOnlyDtsFiles,
        {
          before: [xalorTransformerPlugin(underlyingProgram)],
        },
      );
    };

    return builderProgram;
  };

  const watchCompilerHost = ts.createWatchCompilerHost(
    configPath,
    undefined,
    ts.sys,
    customCreateProgram,
    (diagnostic) => {
      console.log(
        `⚠️ [TS Compiler Diagnostic]: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
      );
    },
    (statusDiagnostic) => {
      const mappedLog = XALOR_CLI_STATUS_MESSAGES[statusDiagnostic.code];
      if (mappedLog) {
        console.log(mappedLog);
      }
    },
  );

  const originalAfterProgramCreate = watchCompilerHost.afterProgramCreate;

  // ====================================================================================
  // 🛰️ DEBOUNCED PROGRAM LIFE CYCLE HOOK
  // ====================================================================================
  watchCompilerHost.afterProgramCreate = (builderProgram) => {
    // 🛡️ COMPUTE MASS MUTATION DELTAS
    const executionTime = Date.now();
    const cycleDeltaTime = executionTime - lastTriggerTimestamp;
    lastTriggerTimestamp = executionTime;

    // Increment chain tracking metric on every micro-trigger pass
    rapidSaveChainCount += 1;

    // EVALUATION: If more than 5 program builds fire back-to-back under 150ms apart,
    // a git branch switch or automated tool is modifying multiple files concurrently.
    if (rapidSaveChainCount > 5 && cycleDeltaTime < 150) {
      /* prettier-ignore */
      console.log('\n======================================================================');
      /* prettier-ignore */
      console.log('🚨 [Xalor Guard] ABNORMAL VOLATILE FILESYSTEM MUTATION CHAIN DETECTED!');
      /* prettier-ignore */
      console.log('👉 Context: Active Git branch checkout or upstream batch merge in progress.');
      /* prettier-ignore */
      console.log('🔒 Action: Safely freezing in-memory records and aborting watch daemon...');
      /* prettier-ignore */
      console.log('======================================================================\n');

      // Terminate the watcher immediately to seal memory structures from corrupt half-baked entries
      process.exit(0);
    }

    // 1. Update the execution closure with the freshest compiler program instance layout context
    emitDebouncer.updateFunction((activeProgram) => {
      // Reset chain values back to initial baseline rules once edits safely settle down
      rapidSaveChainCount = 0;

      activeProgram.emit();
      if (originalAfterProgramCreate) {
        originalAfterProgramCreate(activeProgram);
      }
    });

    // 2. Trigger the debounced window counter passing our updated compile target argument
    emitDebouncer.trigger(builderProgram);
  };

  ts.createWatchProgram(watchCompilerHost);
}

// export function runWatchCommand(projectRootPath: string): void {
//   console.log('\n====================================================');
//   console.log('🛰️ [Xalor CLI] STARTING REAL-TIME REFLECTION RUNNER...');
//   console.log(`📂 Working Path Anchor: ${projectRootPath}`);
//   console.log('====================================================\n');

//   process.env.XALOR_CLI_WATCH = 'true';

//   const configPath = ts.findConfigFile(
//     projectRootPath,
//     ts.sys.fileExists,
//     'tsconfig.json',
//   );

//   if (!configPath) {
//     console.error(
//       '❌ [Xalor CLI Error]: Unable to locate a valid tsconfig.json in project root.',
//     );
//     process.exit(1);
//   }

//   const customCreateProgram: ts.CreateProgram<
//     ts.EmitAndSemanticDiagnosticsBuilderProgram
//   > = (
//     rootNames,
//     options,
//     host,
//     oldProgram,
//     configFileParsingDiagnostics,
//     projectReferences,
//   ) => {
//     // 🚀 THE DUAL-EMIT BLOCKADE REMOVAL:
//     // We explicitly strip out the "plugins" array allocation from the compiler choices!
//     // This stops TypeScript from auto-loading your transformer plugin via tsconfig.json,
//     // ensuring our custom transformers array pass below is the ONLY execution path running.
//     const cleanOptions = { ...options };
//     if ('plugins' in cleanOptions) {
//       delete cleanOptions.plugins;
//     }

//     const modifiedOptions = {
//       ...cleanOptions,
//       noEmit: false,
//       emitDeclarationOnly: false,
//       ignoreDeprecations: '6.0',
//     };

//     const builderProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram(
//       rootNames,
//       modifiedOptions,
//       host,
//       oldProgram,
//       configFileParsingDiagnostics,
//       projectReferences,
//     );

//     const underlyingProgram = builderProgram.getProgram();
//     const originalEmit = underlyingProgram.emit;

//     underlyingProgram.emit = (
//       targetSourceFile,
//       _writeFile,
//       cancellationToken,
//       emitOnlyDtsFiles,
//       _customTransformers,
//     ) => {
//       const silentWriteFile: ts.WriteFileCallback = () => {
//         // Black-hole swallow callback function to prevent physical .js disk pollution
//       };

//       return originalEmit(
//         targetSourceFile,
//         silentWriteFile,
//         cancellationToken,
//         emitOnlyDtsFiles,
//         {
//           before: [xalorTransformerPlugin(underlyingProgram)],
//         },
//       );
//     };

//     return builderProgram;
//   };

//   const watchCompilerHost = ts.createWatchCompilerHost(
//     configPath,
//     undefined,
//     ts.sys,
//     customCreateProgram,
//     (diagnostic) => {
//       console.log(
//         `⚠️ [TS Compiler Diagnostic]: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
//       );
//     },
//     (statusDiagnostic) => {
//       const mappedLog = XALOR_CLI_STATUS_MESSAGES[statusDiagnostic.code];
//       if (mappedLog) {
//         console.log(mappedLog);
//       }
//     },
//   );

//   const originalAfterProgramCreate = watchCompilerHost.afterProgramCreate;

//   watchCompilerHost.afterProgramCreate = (builderProgram) => {
//     builderProgram.emit();

//     if (originalAfterProgramCreate) {
//       originalAfterProgramCreate(builderProgram);
//     }
//   };

//   ts.createWatchProgram(watchCompilerHost);
// }
