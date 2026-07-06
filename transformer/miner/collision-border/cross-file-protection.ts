import { xalorCentralContext } from '../../service';
import type { TFilePathParams } from '../../types';
import { errorReportService, XalorError } from '../../../shared';
// ========================================================================
// 🪐 INTEGRATED INTERCEPT LANE A: CROSS-FILE REGISTRATION HIJACK PROTECTION
//
// ROLE:
// Scans the global session registry graph to ensure the incoming unique UUID
// keyName string has not been claimed by a completely different source file.
//
// STRATEGY:
// Evaluates every active external project-relative file context key slice.
// If a cross-file claim is matched, it runs an in-memory active pass check.
// If the key was legitimately cut-and-pasted (absent from activePassKeys),
// it evicts the old stale ghost cache; if it is actively dual-declared,
// it invokes a hard process halt (production) or updates the blacklist (watch).
// ========================================================================
export function crossFileProtection(params: TFilePathParams): boolean {
  /* prettier-ignore */
  const { keyName, activeAreaString, relativeProjectKey, isWatch, currentActiveAbsoluteFile, executeMode } = params;
  /* prettier-ignore */
  const { sessionRegistry, activePassKeys } = xalorCentralContext.context;

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
      const ctx = {
        keyName,
        initialFilePath: activeScanPath,
        initialArea: existingKeyClaim.area,
        hijackFilePath: relativeProjectKey,
        hijackArea: activeAreaString,
      };
      const mapper = errorReportService.getAreaErrorMapper(
        'TRANSFORMER_COLLISION_CROSS_FILE',
      );
      const finalizedMessageText = errorReportService.resolveCollisionFailure(
        'TRANSFORMER_COLLISION_CROSS_FILE',
        'CROSS_FILE',
        ctx,
      );

      const crossFileFailure = {
        rule: mapper.rule,
        message: finalizedMessageText,
      };
      if (isWatch) {
        const coloredAnsiPanelText = errorReportService.generateTerminalPanel({
          keyName,
          fileLocation: currentActiveAbsoluteFile,
          message: finalizedMessageText,
          rule: mapper.rule,
          mode: executeMode,
        });

        console.warn(coloredAnsiPanelText);

        xalorCentralContext.addBlacklistKey(keyName);

        return true;
      }

      throw XalorError.InvalidType(
        keyName,
        currentActiveAbsoluteFile,
        crossFileFailure,
        executeMode,
      );
    }
  }

  return false;
}
