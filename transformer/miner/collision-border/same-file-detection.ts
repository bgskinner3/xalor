import { xalorCentralContext } from '../../service';
import type { TFilePathParams } from '../../types';
import { errorReportService } from '../../../shared';

// ========================================================================
// 🪐 INTEGRATED INTERCEPT LANE B: SAME-FILE LOCAL COPY-PASTE DETECTION
//
// ROLE:
// Drills directly inside the current isolated file slice memory drawer to
// catch developers copy-pasting an identical literal key name on separate lines.
//
// STRATEGY:
// Performs a lightning-fast O(1) hash property lookup inside the local
// keys index mapping records dictionary array context sheet.
// If the key string token physically exists but its structural GPS position
// anchor reference code differs, it marks a definitive line conflict breach,
// short-circuiting the pass to defend memory maps layout integrity.
// ========================================================================

export function sameFileDetection(params: TFilePathParams) {
  /* prettier-ignore */
  const { keyName, relativeProjectKey, isWatch, currentActiveAbsoluteFile, executeMode } = params;
  /* prettier-ignore */
  const { sessionRegistry, activePassKeys } = xalorCentralContext.context;

  const currentFileSlice = sessionRegistry[relativeProjectKey];
  if (currentFileSlice === undefined) return false;

  const historicalKeyMatch = currentFileSlice.keys[keyName];
  if (historicalKeyMatch !== undefined) {
    if (historicalKeyMatch.anchor !== params.activeAnchorString) {
      if (isWatch && !activePassKeys.has(keyName)) {
        xalorCentralContext.deleteFromSessionRegistry({
          keyName,
          filePath: currentActiveAbsoluteFile,
        });
        return false;
      }
      const ctx = {
        keyName,
        historicalArea: historicalKeyMatch.area,
        historicalAnchor: historicalKeyMatch.anchor,
        activeArea: params.activeAreaString,
        activeAnchor: params.activeAnchorString,
      };

      const mapper = errorReportService.getAreaErrorMapper(
        'TRANSFORMER_COLLISION_SAME_FILE',
      );

      const finalizedMessageText = mapper['message'](ctx);

      // 🖨️ WATCH MODE NON-BLOCKING ALERT LOGGING
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
      const coloredAnsiPanelText = errorReportService.generateTerminalPanel({
        keyName,
        fileLocation: currentActiveAbsoluteFile,
        message: finalizedMessageText,
        rule: mapper.rule,
        mode: executeMode,
      });

      console.warn(coloredAnsiPanelText);

      process.exit(0);
    }
  }

  return false;
}
