import { xalorCentralContext } from '../../service';
import { XalorInvalidTypeError, TransformerReportService } from '../../error';
import { COLLISION_BORDER_FAILURE_MAPPER } from '../../constants';
import type { TFilePathParams } from '../../types';

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
  const { keyName, activeAreaString, activeAnchorString, relativeProjectKey, isWatch, currentActiveAbsoluteFile, executeMode } = params;

  /* prettier-ignore */
  const { sessionRegistry } = xalorCentralContext.context;

  const currentFileSlice = sessionRegistry[relativeProjectKey];
  if (currentFileSlice === undefined) {
    return false;
  }

  const historicalKeyMatch = currentFileSlice.keys[keyName];

  if (historicalKeyMatch !== undefined) {
    if (historicalKeyMatch.anchor !== activeAnchorString) {
      const mapper = COLLISION_BORDER_FAILURE_MAPPER.SAME_FILE;

      const finalizedMessageText = mapper.message({
        keyName,
        historicalArea: historicalKeyMatch.area,
        historicalAnchor: historicalKeyMatch.anchor,
        activeArea: activeAreaString,
        activeAnchor: activeAnchorString,
      });
      const sameFileFailure = {
        rule: mapper.rule,
        message: finalizedMessageText,
      };
      // 🪐 THE WATCH-MODE SELF-CLEANING Handshake:
      if (isWatch) {
        const coloredAnsiPanelText =
          TransformerReportService.generateTerminalPanel({
            keyName,
            fileLocation: currentActiveAbsoluteFile,
            message: finalizedMessageText,
            rule: mapper.rule,
            mode: executeMode,
          });

        console.warn(coloredAnsiPanelText);

        xalorCentralContext.addBlacklistKey(keyName);

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
