import {
  getCallerLocation,
  isInstanceOf,
  isStringFunction,
  isUndefined,
} from '../../shared';
import {
  REPORT_SERVICE_MODE_ROUTER,
  COMPILER_DIAGNOSTIC_FALLBACKS,
} from '../constants';
import type {
  TReportServiceContext,
  TCompilerAnomalyKey,
  TLogAnomalyParams,
  THeaderModes,
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
    const targetVisualMode: THeaderModes = this.MODE_ROUTER[mode] ?? 'soft';
    /* prettier-ignore */ const ruleLabel = rule && rule.length > 0 ? rule.toUpperCase() : 'GENERAL_FAULT';

    const visualTheme = targetVisualMode === 'hard' ? 'crimson' : 'standard';

    const invocationCallSite = getCallerLocation();

    /* prettier-ignore */ const interactiveFileLink = xalorLog.formatTerminalLink(fileLocation, fileLocation);
    /* prettier-ignore */ const interactiveCallSiteLink = xalorLog.formatTerminalLink(invocationCallSite, invocationCallSite);
    return xalorLog.ATSErrorTemplate({
      keyName,
      ruleLabel,
      fileLink: interactiveFileLink,
      callSiteLink: interactiveCallSiteLink,
      messagePayload: message,
      theme: visualTheme,
    });
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
