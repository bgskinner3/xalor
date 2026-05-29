// transformer/transformer-compiler/resolvers.ts
import ts from 'typescript';
import {
  TRANSFORMER_EXECUTE_MODES,
  SENTRY_TRIGGER_NAMES,
} from '../../shared/constants';
import type { TXalorLifecycleContext, TModePriorityRule } from '../types';
import type { TTransformerExecuteMode } from '../../shared';
import { XalorRoutesService, xalorCentralContext } from '../service';
import { executeVaultMutation } from '../lifecycle';
/**
 * resolveTransformerBootAnchor
 *
 * ROLE:
 * Master Boot-Time Path Anchor Factory.
 *
 * STRATEGY:
 * 1. FILTERING: Filters out type definition files and node_modules blocks to locate a true local application file.
 * 2. DETERMINISM: Falls back gracefully to process.cwd() if the compiler host program hasn't loaded files yet.
 * 3. PACKING: Calculates paths exactly once and returns both structures in a single high-speed payload.
 */
export function resolveTransformerBootAnchor(
  compilerFactoryProgram: ts.Program,
) {
  const validAppFile = compilerFactoryProgram
    .getSourceFiles()
    .find(
      (file) =>
        !file.isDeclarationFile && !file.fileName.includes('node_modules'),
    );

  const sampleFile = validAppFile ? validAppFile.fileName : process.cwd();
  const runtimePaths = XalorRoutesService.resolveXalorPaths(sampleFile);

  return {
    sampleFile,
    runtimePaths,
  };
}

/**
 * determineTransformerExecuteMode
 *
 * ROLE:
 * Central Invariant Mode Router. Resolves the prioritized single execution path.
 *
 * TIMING PRIORITIZATION:
 * 1. Test environments execute using local watch timelines.
 * 2. Vacuum overrides dev reporting layers for clean production baking.
 * 3. Watch takes dev precedence over single local compile runs.
 */
// TODO: add Studio
export function determineTransformerExecuteMode(
  lifecycle: TXalorLifecycleContext,
): TTransformerExecuteMode {
  // If running an explicit automated test suite, fall back to mock watch loop behavior
  if (lifecycle.isTestEnvironment) {
    return TRANSFORMER_EXECUTE_MODES.watch;
  }

  // Linear priority mapping array evaluating mode criteria switchlessly
  const priorityRules: readonly TModePriorityRule[] = [
    /* prettier-ignore */ { guard: lifecycle.isProductionVacuumMode, mode: TRANSFORMER_EXECUTE_MODES.vacuum },
    /* prettier-ignore */ { guard: lifecycle.isWatchMode,            mode: TRANSFORMER_EXECUTE_MODES.watch },
    /* prettier-ignore */ { guard: lifecycle.isOneShotCompileMode,   mode: TRANSFORMER_EXECUTE_MODES.compile },
  ];

  // High-speed array scan locating the first active matching environment parameter flag match
  const matchedRule = priorityRules.find((rule) => rule.guard);

  // Default fallback assignment: if no environment flags are provided, assume standard single compile run
  return matchedRule ? matchedRule.mode : TRANSFORMER_EXECUTE_MODES.compile;
}
/**
 *
 * ROLE:
 * Performance Bailout / First-Pass Filter.
 *
 * STRATEGY:
 * Uses 'sentryTriggers' (isXalor, toXalor) to perform a raw string search.
 * This avoids the astronomical cost of AST walking for files that
 * don't interact with the library.
 */
export function shouldProcessFile(file: ts.SourceFile): boolean {
  return SENTRY_TRIGGER_NAMES.some((apiTokenName) => {
    return file.text.includes(apiTokenName);
  });
}
/**
 * HANDLE EMPTY FILE WIPEOUT
 *
 * ROLE:
 * Upfront Performance Bailout & Registry Purge.
 *
 * STRATEGY:
 * Inspects raw file characters before any parsing happens. If the file is completely
 * empty, it immediately checks the twin-map history, purges obsolete cache records from
 * RAM, and returns true to signal that standard mining should be bypassed.
 */
export function handleEmptyFileWipeout(
  sourceFile: ts.SourceFile,
  currentFileAbsolute: string,
): boolean {
  if (!sourceFile.text || sourceFile.text.trim().length === 0) {
    const historicalSession =
      xalorCentralContext.getCurrentSessionPath(currentFileAbsolute);

    if (historicalSession) {
      console.log(
        `🧹 [Xalor Clear Loop] Empty file wipeout triggered for: ${sourceFile.fileName}`,
      );

      for (const staleKey in historicalSession.keys) {
        if (Reflect.has(historicalSession.keys, staleKey)) {
          const payload = xalorCentralContext.globalKeyRegistry.get(staleKey);

          executeVaultMutation({
            mode: 'delete',
            keyName: staleKey,
            payload,
          });
        }
      }
    }
    return true;
  }
  return false;
}
