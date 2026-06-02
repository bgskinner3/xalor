import {
  // ANSI_COLOR_CODES,
  getCallerLocation,
  isInstanceOf,
  isStringFunction,
  isUndefined,
  yieldItems,
} from '../../shared';
import {
  REPORT_SERVICE_MODE_ROUTER,
  COMPILER_DIAGNOSTIC_FALLBACKS,
} from '../constants';
import type {
  TReportServiceContext,
  TCompilerAnomalyKey,
  TLogAnomalyParams,
} from '../types';
import { xalorLog } from '../../shared';

/**
 * TransformerReportService
 * THE COMPILER DIAGNOSTIC SCRIBE
 *
 * ROLE:
 * An isolated stateless printing service dedicated entirely to turning raw build-time
 * rule violations into highly descriptive, formatted terminal console blocks.
 */
export class TransformerReportService {
  // ===============================================================================================================
  // ===============================================================================================================
  // ===============================================================================================================
  // PRIVATE METHODS
  // ===============================================================================================================
  // ===============================================================================================================
  // ===============================================================================================================
  private static readonly MODE_ROUTER = REPORT_SERVICE_MODE_ROUTER;

  public static generateTerminalPanel(ctx: TReportServiceContext): string {
    const { keyName, fileLocation, message, rule, mode } = ctx;
    // 1. Resolve your visual mode token cleanly through the router dictionary mapping pass [INDEX]
    const targetVisualMode = this.MODE_ROUTER[mode] ?? 'soft';
    /* prettier-ignore */ const ruleLabel = rule && rule.length > 0 ? rule.toUpperCase() : 'GENERAL_FAULT';

    const visualTheme = targetVisualMode === 'hard' ? 'crimson' : 'standard';

    const invocationCallSite = getCallerLocation();

    /* prettier-ignore */ const interactiveFileLink = xalorLog.formatTerminalLink(fileLocation, fileLocation);
    /* prettier-ignore */ const interactiveCallSiteLink = xalorLog.formatTerminalLink(invocationCallSite, invocationCallSite);
    const buffer: string[] = [];

    /* prettier-ignore */ buffer.push(xalorLog.getLogLine('', 'naked'));
    /* prettier-ignore */ buffer.push(xalorLog.getBanner(`[Xalor Alert] ${ruleLabel.toUpperCase()}`, visualTheme));
    /* prettier-ignore */ buffer.push(xalorLog.getPanelRow('Target Key Name', keyName, visualTheme, 'warning'));
    /* prettier-ignore */ buffer.push(xalorLog.getPanelRow('Rule Category Track', ruleLabel, visualTheme, 'error'));
    /* prettier-ignore */ buffer.push(xalorLog.getDivider('-', visualTheme));
    /* prettier-ignore */ buffer.push(xalorLog.getLogLine(`  💎 Type Definition (Source Link):`, visualTheme, true));
    /* prettier-ignore */ buffer.push(xalorLog.getLogLine(`  ↳ ${interactiveFileLink}`, visualTheme, false, 'info'));
    /* prettier-ignore */ buffer.push(xalorLog.getLogLine(`  ⚡ Runtime Call Site (Invocation Link):`, visualTheme, true));
    /* prettier-ignore */ buffer.push(xalorLog.getLogLine(`  ↳ ${interactiveCallSiteLink}`, visualTheme, false, 'info'));
    /* prettier-ignore */ buffer.push(xalorLog.getDivider('-', visualTheme));
    /* prettier-ignore */ buffer.push(xalorLog.getLogLine(`  💥 Error Details:`, visualTheme, true));

    const messageLines = message.split(/\r?\n/);
    for (const rawLine of yieldItems(messageLines)) {
      /* prettier-ignore */ buffer.push(xalorLog.getLogLine(`     ${rawLine.trim()}`, visualTheme));
    }

    /* prettier-ignore */ buffer.push(xalorLog.getDivider('═', visualTheme));
    /* prettier-ignore */ buffer.push(xalorLog.getLogLine('', 'naked'));

    return buffer.join('\n');
  }

  /**
   * getErrorMessage
   * THE STRUCTURAL NORMALIZATION RESOLVER
   *
   * ROLE:
   * Safely isolates error string extraction metrics. It intercepts raw exceptions,
   * maps them point-free to your template fallbacks dictionary, and resolves
   * clean contextual layouts switchlessly without heap allocation churn.
   */
  public static getErrorMessage(
    compilerKey: TCompilerAnomalyKey,
    error?: unknown,
  ): string {
    // 1. Isolate the raw underlying error text point-free
    const rawExceptionString = isInstanceOf(error, Error)
      ? error.message
      : String(error ?? '');

    const config = COMPILER_DIAGNOSTIC_FALLBACKS[compilerKey];
    if (isUndefined(config)) {
      return rawExceptionString.length > 0
        ? rawExceptionString
        : 'An unrecognized compiler anomaly occurred.';
    }
    const template = config.messageTemplate;

    return isStringFunction(template)
      ? template(rawExceptionString.length > 0 ? rawExceptionString : undefined)
      : template;
  }

  public static logAnomaly(params: TLogAnomalyParams): void {
    const { keyName, fileLocation, error, mode } = params;

    // Direct O(1) fallback rule extraction
    const ruleToken =
      COMPILER_DIAGNOSTIC_FALLBACKS[keyName]?.rule ?? 'general_fault';

    const finalizedMessage = this.getErrorMessage(keyName, error);

    const panelText = this.generateTerminalPanel({
      keyName,
      fileLocation,
      message: finalizedMessage,
      rule: ruleToken,
      mode,
    });

    const targetVisualMode = this.MODE_ROUTER[mode];
    if (targetVisualMode === 'hard') {
      process.stderr.write(panelText);
    } else {
      console.warn(panelText);
    }
  }
}
