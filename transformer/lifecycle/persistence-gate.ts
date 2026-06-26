// transformer/lifecycle/persistence-gate.ts
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
import type {
  TPersistenceGateParams,
  TBacktrackingSweepParams,
  TFlushAndHarvestParams,
} from '../types';
import { fsContext } from '../../shared/service';

/**
 * PASS 1: IMMEDIATE IN-FILE BACKTRACKING (Runs on EVERY file transpile finish)
 *
 * ROLE:
 * Isolated routine managing immediate, in-file code subtraction tracking sweeps.
 *
 * STRATEGY:
 * Sweeps the previous file session tracker path data. Performs dual-purging passes over
 * standard type registry keys and historical drift tokens simultaneously to evict deleted
 * call sites synchronously right at the file transpile finish frame boundary.
 */
function executeInFileBacktrackingSweep(
  params: TBacktrackingSweepParams,
): void {
  /* prettier-ignore */
  const { currentSessionPath, globalKeyRegistry, activePassKeys, driftRegistry, historicalDrift} = params;

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

  Object.keys(historicalDrift).forEach((evolutionToken) => {
    const diskEntry = historicalDrift[evolutionToken];

    /* prettier-ignore */
    let doesTokenBelongToCurrentFile = Reflect.has(currentSessionPath.keys, diskEntry.currentKey);

    /* prettier-ignore */
    if (!doesTokenBelongToCurrentFile && diskEntry.ancestorKey && diskEntry.ancestorKey !== '') {
      doesTokenBelongToCurrentFile = Reflect.has(
        currentSessionPath.keys,
        diskEntry.ancestorKey,
      );
    }

    if (doesTokenBelongToCurrentFile && !driftRegistry.has(evolutionToken)) {
      xalorCentralContext.deleteFromDriftRegistry(evolutionToken);
    }
  });
}

/**
 * PASS 2: COMPILATION FLUSH TRANSACTION AND GHOST FILE HARVEST
 *
 * ROLE:
 * Isolated routine governing filesystem synchronization and bridge generation loops.
 *
 * STRATEGY:
 * Executes the exact, un-altered linear persistence guards. Evaluates disk presence
 * for active schema tracks, schedules asynchronous cache updates, and triggers out-of-band
 * Intellisense ambient file hydration steps cleanly.
 */
function executeCompilationFlushAndHarvest(
  params: TFlushAndHarvestParams,
): void {
  /* prettier-ignore */
  const { file, program, rootDir, globalKeyRegistry, isTestEnvironment, isDevelopmentPass } = params;

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
}

/**
 * persistenceGate
 *
 * ROLE: Governs the terminal state of the compilation lifecycle. Monitors the arriving file
 * execution stream to intercept the true termination boundary of the compiler pass
 *
 * @see {@link TransformerDocs.persistenceGate}
 */
export function persistenceGate({
  file,
  program,
  rootDir,
}: TPersistenceGateParams): SourceFile {
  //  mid-typing and the file has syntax errors, DO NOT run deletion sweeps!
  const diagnostics = program.getSyntacticDiagnostics(file);

  if (diagnostics.length > 0) return file;

  const { globalKeyRegistry, activePassKeys, driftRegistry } =
    xalorCentralContext.context;
  const { isDevelopmentPass, isTestEnvironment } =
    XalorRoutesService.resolveXalorLifecycle();
  const currentFileAbsolute = path.resolve(file.fileName);

  const rawVaultData = fsContext.ingestVaultSnapshotFromDiskSync();
  const historicalDrift = rawVaultData?.driftTracking || {};

  // ====================================================================================
  // PASS 1: IMMEDIATE IN-FILE BACKTRACKING (Runs on EVERY file transpile finish)
  // ====================================================================================
  const currentSessionPath =
    xalorCentralContext.getCurrentSessionPath(currentFileAbsolute);

  if (currentSessionPath) {
    executeInFileBacktrackingSweep({
      currentSessionPath,
      globalKeyRegistry,
      activePassKeys,
      driftRegistry,
      historicalDrift,
    });
  }

  // ====================================================================================
  // PASS 2: COMPILATION FLUSH TRANSACTION AND GHOST FILE HARVEST
  // ====================================================================================
  executeCompilationFlushAndHarvest({
    file,
    program,
    rootDir,
    globalKeyRegistry,
    isTestEnvironment,
    isDevelopmentPass,
  });

  if (isTestEnvironment) {
    injectTestReifiedBlueprints(globalKeyRegistry);
  }

  return file;
}
