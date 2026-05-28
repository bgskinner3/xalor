// transformer/utils/cud-handler.ts

import type { TCudExecutionMode } from '../../shared/types';
import { CUD_EXECUTION_MODES } from '../../shared';
import type {
  TEvaluateCUDMutationParams,
  TExecuteCUDMutationParams,
} from '../types';
import { xalorCentralContext, XalorRoutesService } from '../service';
import {
  resolveModifiedKeyName,
  isRegistryModified,
  isManifestModified,
  isBlueprintModified,
} from '../utils';

/**
 * 📢 THE STYLIZED TERMINAL PRINTER
 */
function printCudLog(mode: TCudExecutionMode, keyName: string): void {
  const DIAGNOSTIC_STRATEGY_MAPPER: Record<TCudExecutionMode, () => void> = {
    create: () => console.log(`✨ [Xalor CLI] Added Type Key: '${keyName}'`),
    update: () => console.log(`🔄 [Xalor CLI] Updated Type Key: '${keyName}'`),
    delete: () => console.log(`❌ [Xalor CLI] Removed Type Key: '${keyName}'`),
    noop: () => {
      // 🚀 THE UNCHANGED BYPASS CELL:
      // Does absolutely nothing. Stays completely quiet and skips map churns!
    },
  } satisfies Record<TCudExecutionMode, () => void>;

  const activePrintStrategy = DIAGNOSTIC_STRATEGY_MAPPER[mode];
  if (activePrintStrategy) {
    activePrintStrategy();
  }
}
/**
 * 🪐 THE CENTRAL CONDITION DETERMINATOR
 *
 * ROLE:
 * Central presence-based change-detection radar scanner.
 *
 * STRATEGY:
 * Cross-examines incoming type footprints against the long-lived process cache
 * to determine if an operation represents a brand-new Creation, a structural Update,
 * or a completely stable Unchanged state ('noop').
 */
export function determineCUDMode({
  keyName: newKeyName,
  newTypeName,
  newSymbolName,
  newArea,
  newFilePath,
  newAnchor,
  newShape,
}: TEvaluateCUDMutationParams): TCudExecutionMode {
  // Attempt a direct hit lookup (assuming the key name did NOT change)
  let existingPayload = xalorCentralContext.globalKeyRegistry.get(newKeyName);
  let isKeyModified: boolean;

  // =========================================================================
  // STEP 1 & 2: RESOLVE IDENTITY (NAME CHANGE VS TRUE CREATE)
  // =========================================================================
  if (!existingPayload) {
    existingPayload = Array.from(
      xalorCentralContext.globalKeyRegistry.values(),
    ).find(
      (record) =>
        record.filePath === newFilePath && record.symbolName === newSymbolName,
    );
    if (!existingPayload) return CUD_EXECUTION_MODES.create;

    isKeyModified = true;
  } else {
    // If found directly, check if the interior key property structurally drifted
    const oldKeyName = existingPayload.key ?? 'unknown';
    const migrationCheck = resolveModifiedKeyName(oldKeyName, newKeyName);
    isKeyModified = migrationCheck.isModified;
  }

  // =========================================================================
  // STEP 3: EVALUATE INTERNAL DATA DRIFT
  // =========================================================================
  // 3. QUESTION 3: Compare internal structures using the recovered vault payload
  /* prettier-ignore */
  const isRegUpdated = isRegistryModified({ existingPayload, newTypeName, newSymbolName });
  /* prettier-ignore */
  const isManiUpdated = isManifestModified({ existingPayload, newArea, newFilePath, newAnchor });
  /* prettier-ignore */
  const isBlueprintUpdated = isBlueprintModified(existingPayload, newShape);
  /* prettier-ignore */
  const isInternalDataChanged = isRegUpdated || isManiUpdated || isBlueprintUpdated;

  if (isKeyModified || isInternalDataChanged) {
    return CUD_EXECUTION_MODES.update;
  }
  // =========================================================================
  // STEP 4: NOOP BYPASS
  // =========================================================================
  // 4. QUESTION 4: Complete match. Key is the same, internal payload is unchanged.
  return CUD_EXECUTION_MODES.noop;
}

/**
 * 🪐 THE UMBRELLA CUD MUTATOR HUB
 * executeVaultMutation
 *
 * ROLE:
 * The single source of truth for all memory mutations and logging side effects.
 *
 * STRATEGY:
 * Routes the finalized mode token through an object literal execution dictionary,
 * executing map side-effects and terminal logs simultaneously.
 */
export function executeVaultMutation({
  mode,
  payload,
  identityArea,
}: TExecuteCUDMutationParams): void {
  const lifecycle = XalorRoutesService.resolveXalorLifecycle();
  // const resolvedKeyName = payload?.key ?? keyName ?? 'unknown';

  const MUTATION_STRATEGY_MAPPER: Record<TCudExecutionMode, () => void> = {
    create: () => {
      if (payload && identityArea) {
        const { key } = payload;
        xalorCentralContext.updateGlobalAndSession(payload);

        // sessionRegistry.set(resolvedKeyName, identityArea);
        if (lifecycle.isDevelopmentPass)
          printCudLog(CUD_EXECUTION_MODES.create, key);
      }
    },
    update: () => {
      if (payload && identityArea) {
        const { key } = payload;
        xalorCentralContext.updateGlobalAndSession(payload);

        if (lifecycle.isDevelopmentPass)
          printCudLog(CUD_EXECUTION_MODES.update, key);
      }
    },
    delete: () => {
      if (payload) {
        const { key, filePath } = payload;
        xalorCentralContext.deleteGlobalAndSession({ keyName: key, filePath });
        // sessionRegistry.delete(resolvedKeyName);
        if (lifecycle.isDevelopmentPass)
          printCudLog(CUD_EXECUTION_MODES.delete, key);
      }
    },
    noop: () => {
      // 🚀 THE UNCHANGED BYPASS CELL: Bypasses modifications completely to protect execution speeds
    },
  } satisfies Record<TCudExecutionMode, () => void>;

  const activeMutationPass = MUTATION_STRATEGY_MAPPER[mode];
  if (activeMutationPass) {
    activeMutationPass();
  }
}

// export function executeVaultMutation({
//   mode,
//   globalKeyRegistry,
//   sessionRegistry,
//   payload,
//   identityArea, // This is your 'newAnchor' string variable being fed in
//   keyName,
// }: TExecuteCUDMutationParams): void {
//   const lifecycle = resolveXalorLifecycle();
//   const resolvedKeyName = payload?.key ?? keyName ?? 'unknown';

//   const MUTATION_STRATEGY_MAPPER: Record<TCudExecutionMode, () => void> = {
//     create: () => {
//       if (payload && identityArea) {
//         globalKeyRegistry.set(resolvedKeyName, payload);
//         sessionRegistry.set(resolvedKeyName, identityArea);
//         if (lifecycle.isDevelopmentPass) printCudLog(CUD_EXECUTION_MODES.create, resolvedKeyName);
//       }
//     },
//     update: () => {
//       if (payload && identityArea) {
//         // --- 🧠 ANCHOR-BASED REVERSE RENAME LOOKUP ---
//         // Find if an old, stale key name currently claims this physical file occurrence index
//         let historicalKeyName: string | null = null;

//         for (const [registeredKey, registeredAnchor] of sessionRegistry.entries()) {
//           if (registeredAnchor === identityArea && registeredKey !== resolvedKeyName) {
//             historicalKeyName = registeredKey;
//             break; // Rename target detected!
//           }
//         }

//         // If an old key was found at this index, delete its old footprint from memory
//         if (historicalKeyName) {
//           globalKeyRegistry.delete(historicalKeyName);
//           sessionRegistry.delete(historicalKeyName);
//           if (lifecycle.isDevelopmentPass) printCudLog(CUD_EXECUTION_MODES.delete, historicalKeyName);
//         }

//         // Commit your new key name and its complete validated payload parameters
//         globalKeyRegistry.set(resolvedKeyName, payload);
//         sessionRegistry.set(resolvedKeyName, identityArea);

//         if (lifecycle.isDevelopmentPass) printCudLog(CUD_EXECUTION_MODES.update, resolvedKeyName);
//       }
//     },
//     delete: () => {
//       globalKeyRegistry.delete(resolvedKeyName);
//       sessionRegistry.delete(resolvedKeyName);
//       if (lifecycle.isDevelopmentPass) printCudLog(CUD_EXECUTION_MODES.delete, resolvedKeyName);
//     },
//     noop: () => {},
//   } satisfies Record<TCudExecutionMode, () => void>;

//   const activeMutationPass = MUTATION_STRATEGY_MAPPER[mode];
//   if (activeMutationPass) {
//     activeMutationPass();
//   }
// }
