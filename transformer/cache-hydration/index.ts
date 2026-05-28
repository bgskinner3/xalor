// transformer/context/bootloader.ts
import * as fs from 'fs';
import { isString, isVaultSyncPayload } from '../../shared/utils/guards';
import { processGenesisHydration } from '../../shared';
import { XalorRoutesService } from '../service';
import { deployBaseline } from './deployer';
import type { TGlobalKeyRegistry, TSessionRegistry } from '../types';
import type { TXalorResolvedPaths } from '../../shared';
// Track execution statistics globally at the module level
let loadedNumber: number = 0;

/**
 * hydrateCacheIntoRegistries
 * 🌊 CONTEXT BOOTLOADER HYDRATION WORKER
 *
 * ROLE:
 * Reads the persistent JSON database from disk and seamlessly reconstructs
 * the in-memory global registry maps and the nested session tracking cache.
 *
 * STRATEGY:
 * Loads the bunker payload synchronously on startup. It loops over the active keys
 * and maps their scalar properties back into the flat `globalKeyRegistry`.
 * Simultaneously, it populates your path-path isolated `sessionRegistry` by nesting
 * coordinates under their respective file paths to ready the rename-detection engine.
 *
 * FALLBACK SAFETY MODEL:
 * If no cache file exists on disk, it aborts silently and gracefully, letting the
 * system build a fresh context from scratch instead of crashing your process.
 */
export function hydrateCacheToRegistries(
  pathsOrSampleFile: TXalorResolvedPaths | string,
  globalKeyRegistry: TGlobalKeyRegistry,
  sessionRegistry: TSessionRegistry,
): void {
  loadedNumber += 1;
  console.log('BOOTLOADER loaded ===>', loadedNumber, 'TIMES');
  /* prettier-ignore */
  const paths = isString(pathsOrSampleFile) ? XalorRoutesService.resolveXalorPaths(pathsOrSampleFile) : pathsOrSampleFile;

  // ⚡ PHASE 1: Deploy physical folder infrastructure safely
  deployBaseline(paths);

  if (!fs.existsSync(paths.vaultFile)) return;

  // ========================================================
  // STREAM AND HYDREATE
  // ========================================================
  try {
    const rawFileBytes = fs.readFileSync(paths.vaultFile, 'utf-8');

    // Execute your custom functional hydration pipeline pass
    processGenesisHydration(rawFileBytes, (metadata) => {
      // Safely narrow parameter boundaries using your custom user-defined predicates
      if (isVaultSyncPayload(metadata)) {
        globalKeyRegistry.set(metadata.key, metadata);

        /* prettier-ignore */
        const projectKey = XalorRoutesService.getProjectRelativeKey(metadata.filePath);
        if (!sessionRegistry[projectKey]) {
          sessionRegistry[projectKey] = {};
        }

        sessionRegistry[projectKey][metadata.key] = {
          area: metadata.area,
          anchor: metadata.anchor,
          filePath: metadata.filePath,
        };
      } else {
        // Fallback trace for invalid metadata shapes to satisfy Commandment VI
        const structuralKeyTrace =
          metadata && typeof metadata === 'object' && 'key' in metadata
            ? String((metadata as Record<string, unknown>).key)
            : 'unknown_key';

        console.error(
          `[Xalor:Genesis] 🚨 Hydration boundary breach: Payload for key "${structuralKeyTrace}" is missing required parameters.`,
        );
      }
    });
  } catch (error) {
    // Absorb unexpected parsing crashes quietly so your watch loop never dies
    console.warn(
      '[xalor:boot] 🚨 Safe evacuation on broken data string stream: ',
      error,
    );
  }
}
