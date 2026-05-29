import {
  ANSI_COLOR_CODES,
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
  THeaderModes,
  TReportServiceContext,
  TCompilerAnomalyKey,
  TLogAnomalyParams,
} from '../types';

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

  private static ansiColorCodes = ANSI_COLOR_CODES;
  private static readonly MODE_ROUTER = REPORT_SERVICE_MODE_ROUTER;
  // 🟢 OPTIMIZED: Pre-calculated header lines mapped point-free to avoid execution variables allocations
  private static readonly HEADER_MATRIX: Record<THeaderModes, string> = {
    hard: `${ANSI_COLOR_CODES.red}${ANSI_COLOR_CODES.bold}❌ [Xalor Build Blocked] CRITICAL INVARIANT RULE BREACH${ANSI_COLOR_CODES.reset}`,
    watch: `${ANSI_COLOR_CODES.yellow}${ANSI_COLOR_CODES.bold}⚠️  [Xalor Type Validator] REGISTER INTENT REJECTED${ANSI_COLOR_CODES.reset}`,
    soft: `${ANSI_COLOR_CODES.cyan}${ANSI_COLOR_CODES.bold}ℹ️  [Xalor Diagnostic Info] SYSTEM NOTIFICATION${ANSI_COLOR_CODES.reset}`,
  };

  // 🟢 OPTIMIZED: Pre-calculated footer strings matching your exact semantic state divisions perfectly
  private static readonly FOOTER_MATRIX: Record<THeaderModes, string> = {
    hard: `  ${ANSI_COLOR_CODES.red}🛑 Action:${ANSI_COLOR_CODES.reset} ${ANSI_COLOR_CODES.bold}Terminating compilation process immediately to protect integrity.${ANSI_COLOR_CODES.reset}`,
    watch: `  ${ANSI_COLOR_CODES.green}🔒 Action:${ANSI_COLOR_CODES.reset} ${ANSI_COLOR_CODES.gray}Aborted cache commit for this node. Watcher remaining active.${ANSI_COLOR_CODES.reset}`,
    soft: `  ${ANSI_COLOR_CODES.blue}ℹ️  Action:${ANSI_COLOR_CODES.reset} ${ANSI_COLOR_CODES.gray}System notification logged successfully. Core parameters untouched.${ANSI_COLOR_CODES.reset}`,
  };
  // ===============================================================================================================
  // ===============================================================================================================
  // ===============================================================================================================
  // PUBLIC METHODS
  // ===============================================================================================================
  // ===============================================================================================================
  // ===============================================================================================================

  public static generateTerminalPanel(ctx: TReportServiceContext): string {
    const { keyName, fileLocation, message, rule, mode } = ctx;
    const ansiColors = this.ansiColorCodes;

    const targetVisualMode = this.MODE_ROUTER[mode];

    const statusHeader = this.HEADER_MATRIX[targetVisualMode];
    const statusFooter = this.FOOTER_MATRIX[targetVisualMode];

    const invocationCallSite = getCallerLocation();

    /* prettier-ignore */
    const ruleLabel = !isUndefined(rule) && rule.length > 0 ? rule.toUpperCase() : 'GENERAL_FAULT';

    const reportBuffer: string[] = [
      `\n${ansiColors.gray}┌────────────────────────────────────────────────────────────────────────────┐${ansiColors.reset}`,
      `  ${statusHeader}`,
      `  ${ansiColors.cyan}➔ Target Key:${ansiColors.reset} ${ansiColors.bold}${keyName}${ansiColors.reset}`,
      `  ${ansiColors.red}➔ Rule Category:${ansiColors.reset} ${ansiColors.magenta}${ansiColors.bold}${ruleLabel}${ansiColors.reset}`,
      `  ${ansiColors.gray}├────────────────────────────────────────────────────────────────────────────┤${ansiColors.reset}`,
      `  ${ansiColors.bold}💎 Type Definition (Source Link):${ansiColors.reset}`,
      `    ${ansiColors.cyan}↳ ${fileLocation}${ansiColors.reset}`,
      `  ${ansiColors.bold}⚡ Runtime Call Site (Invocation Link):${ansiColors.reset}`,
      `    ${ansiColors.cyan}↳ ${invocationCallSite}${ansiColors.reset}`,
      `  ${ansiColors.gray}├────────────────────────────────────────────────────────────────────────────┤${ansiColors.reset}`,
      `  ${ansiColors.bold}💥 Error Details:${ansiColors.reset}`,
      `    ${ansiColors.yellow}${message.replace(/\n/g, '\n    ')}${ansiColors.reset}`,
      `   ${statusFooter}`,
      `${ansiColors.gray}└────────────────────────────────────────────────────────────────────────────┘${ansiColors.reset}\n`,
    ];

    return reportBuffer.join('\n');
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

  /**
   * logAnomaly
   * CENTRAL LOGGING GATEWAY
   *
   * ROLE:
   * Stateless printing endpoint that automatically normalizes text and pipes
   * beautifully formatted ANSI border panels cleanly straight to console streams.
   */
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
