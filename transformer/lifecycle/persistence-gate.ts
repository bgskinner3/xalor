import type { SourceFile } from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { hydrateIntellisenseBridge } from '../emitters';
import { serializeAndFlushVault } from '../context';
import { executeVaultMutation } from './crud';
import {
  isCompilationLoopTerminated,
  injectTestReifiedBlueprints,
} from './pipeline';
import { xalorCentralContext, XalorRoutesService } from '../service';
import type { TPersistenceGateParams } from '../types';

/**
 * persistenceGate
 * @see {@link TransformerDocs.persistenceGate}
 */
export function persistenceGate({
  file,
  program,
  rootDir,
}: TPersistenceGateParams): SourceFile {
  // 🛰️ THE SYNTAX SHIELD:
  // If the developer is mid-typing and the file has syntax errors, DO NOT run deletion sweeps!
  const diagnostics = program.getSyntacticDiagnostics(file);
  if (diagnostics.length > 0) {
    // Code is structurally broken/incomplete right now. Exit early to protect our memory caches.
    return file;
  }

  const { globalKeyRegistry, activePassKeys } = xalorCentralContext.context;
  const { isDevelopmentPass, isTestEnvironment } =
    XalorRoutesService.resolveXalorLifecycle();
  const currentFileAbsolute = path.resolve(file.fileName);

  // ====================================================================================
  // PASS 1: IMMEDIATE IN-FILE BACKTRACKING (Runs on EVERY file transpile finish)
  // ====================================================================================
  const currentSessionPath =
    xalorCentralContext.getCurrentSessionPath(currentFileAbsolute);

  if (currentSessionPath) {
    // 🎯 🟢 TWIN-MAP REFINE ENTRANCE MARKER:
    // We explicitly call Object.keys() on the sub-matrix `.keys` object drawer to read history!
    Object.keys(currentSessionPath.keys).forEach((key) => {
      const payload = globalKeyRegistry.get(key);
      if (!payload || key.includes('$')) return;

      // If a historically captured key is missing from the fresh visitor harvest set,
      // it means the developer cleanly wiped the registration call from their codebase.
      if (!activePassKeys.has(key)) {
        executeVaultMutation({
          mode: 'delete',
          keyName: key,
          payload,
        });
      }
    });
  }

  // ====================================================================================
  // PASS 2: COMPILATION FLUSH TRANSACTION AND GHOST FILE HARVEST
  // ====================================================================================
  const shouldTriggerFlush = isCompilationLoopTerminated(
    file,
    program,
    globalKeyRegistry,
  );
  const isWatchLoopActive =
    XalorRoutesService.resolveXalorLifecycle().isWatchMode;

  if (shouldTriggerFlush || isWatchLoopActive) {
    if (!isTestEnvironment) {
      const cacheKeySnapshot = Array.from(globalKeyRegistry.keys());
      cacheKeySnapshot.forEach((key) => {
        const payload = globalKeyRegistry.get(key);
        if (!payload) return;

        const payloadAbsoluteFile = path.resolve(
          process.cwd(),
          payload.filePath,
        );
        const fileStillExistsOnDisk = fs.existsSync(payloadAbsoluteFile);

        if (!fileStillExistsOnDisk) {
          executeVaultMutation({
            mode: 'delete',
            keyName: key,
            payload,
          });
        }
      });

      // Commit changes to disk and update intellisense configurations
      serializeAndFlushVault(rootDir).catch((err) => {
        console.error('❌ Asynchronous vault sync failure:', err);
      });

      if (isDevelopmentPass) {
        hydrateIntellisenseBridge(rootDir, globalKeyRegistry);
      }
    }
  }

  if (isTestEnvironment) {
    injectTestReifiedBlueprints(globalKeyRegistry);
  }

  return file;
}
