// transformer/utils/collision-guard.ts
import { XalorRoutesService, xalorCentralContext } from '../../service';
import { XalorInvalidTypeError, TransformerReportService } from '../../error';
import type { TCollisionGuardParams } from '../../types';

export function validateCollisionBorders(
  params: TCollisionGuardParams,
): boolean {
  /* prettier-ignore */
  const { keyName, activeAreaString, activeAnchorString, currentActiveAbsoluteFile } = params;

  const executeMode = XalorRoutesService.xalorCLIMode();
  const isWatch = executeMode === 'watch' || executeMode === 'studio';

  // 1. Query long-lived session variables and transient blacklist pointers point-free
  const { sessionRegistry, activePassKeys, blacklistedKeys } =
    xalorCentralContext.context;

  // 🪐 THE ANCHORED DELETION SHIELD INTERCEPTOR
  // 🟢 FIXED: If this UUID key name has already been blacklisted during this compilation pass frame,
  // short-circuit instantly! This completely blocks any multi-pass re-addition attempts.
  if (blacklistedKeys.has(keyName)) {
    return true;
  }

  // Standardize the active file path string token natively
  const relativeProjectKey = XalorRoutesService.getProjectRelativeKey(
    currentActiveAbsoluteFile,
  );

  // ========================================================================
  // 🪐 INTEGRATED INTERCEPT LANE A: CROSS-FILE REGISTER HIJACKS
  // ========================================================================
  const registryFileKeys = Object.keys(sessionRegistry);
  const registryLen = registryFileKeys.length;

  for (let i = 0; i < registryLen; i++) {
    const activeScanPath = registryFileKeys[i];
    if (activeScanPath === undefined || activeScanPath === relativeProjectKey) {
      continue;
    }

    const targetFileSlice = sessionRegistry[activeScanPath];
    if (targetFileSlice === undefined) continue;

    const existingKeyClaim = targetFileSlice.keys[keyName];
    if (existingKeyClaim !== undefined) {
      // The In-Memory Ghost Key Clearance
      if (activePassKeys.has(keyName) && !activePassKeys.has(keyName)) {
        xalorCentralContext.deleteFromSessionRegistry({
          keyName,
          filePath: existingKeyClaim.filePath,
        });
        continue;
      }

      const crossFileFailure = {
        rule: 'terminal_contradiction',
        message:
          `CROSS-FILE COLLISION: Unique identifier key "${keyName}" has been claimed by multiple files!\n` +
          `First Claimed By: [${activeScanPath} ↳ ${existingKeyClaim.area}]\n` +
          `Attempted Hijack: [${relativeProjectKey} ↳ ${activeAreaString}]\n` +
          `Action: Xalor requires unique global keys. Change the target literal string key name.`,
      } as const;

      // 🪐 THE WATCH-MODE SELF-CLEANING Handshake:
      if (isWatch) {
        const coloredAnsiPanelText =
          TransformerReportService.generateTerminalPanel({
            keyName,
            fileLocation: currentActiveAbsoluteFile,
            message: crossFileFailure.message,
            rule: crossFileFailure.rule,
            mode: executeMode,
          });

        console.warn(coloredAnsiPanelText);

        // 🟢 FIXED: Lock this key down inside the blacklist collection BEFORE mutating state!
        // This permanently bars the compiler from allowing this duplicate key to re-register.
        xalorCentralContext.addBlacklistKey(keyName);

        // 🟢 FIXED: Clean out the duplicate from both the global key registry map
        // AND your session bidirectional lookup maps cleanly in RAM.
        xalorCentralContext.deleteGlobalAndSession({
          keyName,
          filePath: currentActiveAbsoluteFile,
        });

        return true;
      }

      // 🛑 PRODUCTION SYSTEM LAWS: Hard throw to stop compile and vacuum passes instantly
      throw new XalorInvalidTypeError(
        keyName,
        currentActiveAbsoluteFile,
        crossFileFailure,
        executeMode,
      );
    }
  }

  // ========================================================================
  // 🪐 INTEGRATED INTERCEPT LANE B: SAME-FILE COPY-PASTE DUPLICATIONS
  // ========================================================================
  const currentFileSlice = sessionRegistry[relativeProjectKey];
  if (currentFileSlice === undefined) {
    return false;
  }

  const historicalKeyMatch = currentFileSlice.keys[keyName];

  if (historicalKeyMatch !== undefined) {
    if (historicalKeyMatch.anchor !== activeAnchorString) {
      const sameFileFailure = {
        rule: 'terminal_contradiction',
        message:
          `SAME-FILE DUPLICATION: Key "${keyName}" is duplicated inside the same file boundary context!\n` +
          `First Declared: [${historicalKeyMatch.area} ↳ ${historicalKeyMatch.anchor}]\n` +
          `Duplicated At: [${activeAreaString} ↳ ${activeAnchorString}]\n` +
          `Action: Unique tracking boundaries require distinct string identifiers to avoid cache drifting.`,
      } as const;

      // 🪐 THE WATCH-MODE SELF-CLEANING Handshake:
      if (isWatch) {
        const coloredAnsiPanelText =
          TransformerReportService.generateTerminalPanel({
            keyName,
            fileLocation: currentActiveAbsoluteFile,
            message: sameFileFailure.message,
            rule: sameFileFailure.rule,
            mode: executeMode,
          });

        console.warn(coloredAnsiPanelText);

        // 🟢 FIXED: Lock this key down inside the blacklist collection BEFORE mutating state!
        xalorCentralContext.addBlacklistKey(keyName);

        // 🟢 FIXED: Evict the duplicated same-file tracking keys out of both global registries
        // and session twin-maps simultaneously to prevent database cache corruption.
        xalorCentralContext.deleteGlobalAndSession({
          keyName,
          filePath: currentActiveAbsoluteFile,
        });

        return true;
      }

      throw new XalorInvalidTypeError(
        keyName,
        currentActiveAbsoluteFile,
        sameFileFailure,
        executeMode,
      );
    }
  }

  return false;
}
