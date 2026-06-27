import ts from 'typescript';
import xalorTransformerPlugin from '../../../transformer';
import { XALOR_CLI_STATUS_MESSAGES, isKeyInObject } from '../../../shared';
/**
 * XALOR COMPILER HOST FACTORY
 *
 * Programmatically constructs and isolates a native TypeScript watch compiler host.
 * Intercepts the underlying program emit pass to embed the AOT AST transformer
 * while maintaining a black-hole sink for physical JavaScript code pollution.
 */
export function createXalorWatchHost(
  configPath: string,
  onProgramCreateHook: (
    program: ts.EmitAndSemanticDiagnosticsBuilderProgram,
  ) => void, // 🎯 FIXED: Removed the stale emitDebouncer parameter completely!
): ts.WatchCompilerHostOfConfigFile<ts.EmitAndSemanticDiagnosticsBuilderProgram> {
  // 👈 🎯 THE FIX: Uses the authentic public compiler interface contract!

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

    // Intercept emitter loop to inject the custom Xalor AST metadata engine
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
        { before: [xalorTransformerPlugin(underlyingProgram)] },
      );
    };

    return builderProgram;
  };

  const host = ts.createWatchCompilerHost(
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

  host.afterProgramCreate = (builderProgram) => {
    onProgramCreateHook(builderProgram);
  };

  return host;
}
