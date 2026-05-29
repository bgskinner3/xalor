import {
  ANSI_COLOR_CODES,
  getCallerLocation,
  isInstanceOf,
} from '../../shared';
import { REPORT_SERVICE_MODE_ROUTER } from '../constants';
import type { THeaderModes, TReportServiceContext } from '../types';

/**
 * TransformerReportService
 * 🪐 THE COMPILER DIAGNOSTIC SCRIBE
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
    const ruleLabel = rule !== undefined && rule.length > 0 ? rule.toUpperCase() : 'GENERAL_FAULT';

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

  public static getErrorMessage(error: unknown) {
    if (isInstanceOf(error, Error)) return error.message;
    // TODO: complie error messages
    return 'Filesystem access restriction occurred.';
  }
}
