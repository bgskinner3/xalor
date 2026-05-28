import { ensureGlobalVault } from '../utils';
import { yieldFiltered, ANSI_COLOR_CODES } from '../../shared';
import type {
  TSolidError,
  TSolidVaultMap,
  TXalorAuditReport,
  TXalorIssue,
  TXalorRuleKind,
} from '../../shared';
import { RULE_KEYWORDS_MAP } from '../mappers';
import {
  isString,
  isObject,
  isNull,
  hasKey,
  AUDITOR_KEYWORDS,
} from '../../shared';

/**
 * XalethorVaultAuditor
 *
 * @see {@link XalorServiceDocs.XalethorVaultAuditor  }
 */
export class XalethorVaultAuditor {
  // ===============================================================================================================
  // ===============================================================================================================
  // ===============================================================================================================
  // PRIVATE METHODS
  // ===============================================================================================================
  // ===============================================================================================================
  // ===============================================================================================================

  private static get errorVault(): TSolidVaultMap['errors'] {
    return ensureGlobalVault().errors;
  }
  private static parseErrorDetails(err: TSolidError) {
    /* prettier-ignore */ const originGps = hasKey('origin')(err)
    ? (hasKey('area')(err.origin) ? String(err.origin.area || 'unknown') : String(err.origin || 'unknown'))
    : 'unknown';

    /* prettier-ignore */ const callerGps = hasKey('area')(err)
    ? (hasKey('area')(err.area) ? String(err.area.area || 'unknown') : String(err.area || 'unknown'))
    : 'unknown';

    /* prettier-ignore */ const cleanExpected = hasKey('expected')(err)
    ? (isString(err.expected) ? err.expected.replace(/["']/g, '') : JSON.stringify(err.expected))
    : 'undefined';

    /* prettier-ignore */ const cleanReceived = hasKey('received')(err)
    ? (err.received === 'missing' ? 'undefined' : JSON.stringify(err.received))
    : 'undefined';

    return { originGps, callerGps, cleanExpected, cleanReceived };
  }
  /**
   * 🌀 PRIVATE STREAMING GENERATOR WORKER
   *
   * ROLE: Coordinates the extraction, resolution, and lazy streaming of errors.
   */
  private static *processStreamingIssues(
    rawErrors: readonly TSolidError[],
    targetKey: string,
  ): Generator<TXalorIssue> {
    const targetedErrorsStream = yieldFiltered(
      rawErrors,
      (err): err is TSolidError =>
        isObject(err) && !isNull(err) && err.key === targetKey,
    );

    for (const errorRecord of targetedErrorsStream) {
      yield {
        path: errorRecord.path || '$.',
        rule: this.evaluateRuleKind(errorRecord),
        expected: this.parseExpectedValue(errorRecord.expected),
        received: this.parseReceivedValue(errorRecord.received),
      };
    }
  }
  /**
   * RECEIVED STRUCTURAL SANITIZER
   *
   * ROLE: Normalizes dynamic types and runtime payloads consistently.
   */
  private static parseReceivedValue(received: unknown): string {
    if (received === 'missing') return 'undefined';
    return isString(received) ? received : JSON.stringify(received);
  }
  /**
   * RULE INTERCEPTION ENGINE
   *
   * ROLE: Runs the allocation-free scanner to classify the exact failure domain.
   */
  private static evaluateRuleKind(err: TSolidError): TXalorRuleKind {
    const messageText = err.message?.toLowerCase() || '';
    const receivedRaw = err.received;
    const cleanReceivedRaw =
      String(receivedRaw)?.replace(/["']/g, '')?.trim()?.toLowerCase() ?? '';

    if (/missing|required/.test(cleanReceivedRaw || messageText))
      return 'missing_property';

    // Keyword Matrix Scan
    for (let i = 0; i < AUDITOR_KEYWORDS.length; i++) {
      const keyword = AUDITOR_KEYWORDS[i];
      if (messageText.includes(keyword)) return RULE_KEYWORDS_MAP[keyword];
    }
    return 'primitive_mismatch';
  }
  private static parseExpectedValue(expected: unknown): string {
    if (isString(expected)) return expected.replace(/["']/g, '');

    if (isObject(expected) && !isNull(expected)) {
      if (
        hasKey('kind')(expected) &&
        expected.kind === 'primitive' &&
        hasKey('type')(expected) &&
        isString(expected.type)
      ) {
        return expected.type;
      }
      /* prettier-ignore */ if (hasKey('type')(expected) && isString(expected.type)) return expected.type;
      /* prettier-ignore */ if (hasKey('value')(expected)) return String(expected.value);
      return JSON.stringify(expected);
    }

    return '';
  }
  // ===============================================================================================================
  // ===============================================================================================================
  // ===============================================================================================================
  // PUBLIC METHODS
  // ===============================================================================================================
  // ===============================================================================================================
  // ===============================================================================================================

  public static getErrors(key: string): TSolidError[] {
    return this.errorVault.get(key) ?? [];
  }
  public static clearErrors(key?: string): void {
    if (key) this.errorVault.delete(key);
    if (!key) this.errorVault.clear();
  }
  /**
   * Internal: Sets the errors for a specific key in the errors map.
   */
  public static setErrors(key: string, errors: TSolidError[]): void {
    this.errorVault.set(key, errors);
  }

  public static record(error: TSolidError): void {
    const currentErrors = this.getErrors(error.key);
    currentErrors.push(error);
    this.setErrors(error.key, currentErrors);
  }

  public static formatReport(key: string): string {
    const errors = this.getErrors(key);
    if (errors.length === 0) return '';

    // Distinctly colored structural headers
    const header = `\n${ANSI_COLOR_CODES.red}${ANSI_COLOR_CODES.bold}[xalor] 🛑 SOLIDITY BREAK: "${key}"${ANSI_COLOR_CODES.reset}\n`;

    const body = errors
      .map((err) => {
        const { originGps, callerGps, cleanExpected, cleanReceived } =
          this.parseErrorDetails(err);

        return [
          `  ${ANSI_COLOR_CODES.cyan}➔ Path:${ANSI_COLOR_CODES.reset}     $.${ANSI_COLOR_CODES.bold}${err.path}${ANSI_COLOR_CODES.reset}`,
          `    ${ANSI_COLOR_CODES.green}Expected:${ANSI_COLOR_CODES.reset} ${cleanExpected}`,
          `    ${ANSI_COLOR_CODES.red}Received:${ANSI_COLOR_CODES.reset} ${ANSI_COLOR_CODES.yellow}${cleanReceived}${ANSI_COLOR_CODES.reset}`,
          `    ${ANSI_COLOR_CODES.gray}─────────────────────────────────────────────────────────────${ANSI_COLOR_CODES.reset}`,
          `    ${ANSI_COLOR_CODES.bold}💎 Type Definition (Source Link):${ANSI_COLOR_CODES.reset}`,
          `    ${ANSI_COLOR_CODES.cyan}↳ ${originGps}${ANSI_COLOR_CODES.reset}`,
          `    ${ANSI_COLOR_CODES.bold}⚡ Runtime Call Site (Invocation Link):${ANSI_COLOR_CODES.reset}`,
          `    ${ANSI_COLOR_CODES.cyan}↳ ${callerGps}${ANSI_COLOR_CODES.reset}`,
        ].join('\n');
      })
      .join(
        `\n\n${ANSI_COLOR_CODES.gray}  =============================================================${ANSI_COLOR_CODES.reset}\n\n`,
      );

    return `${header}${body}\n`;
  }
  public static panic(key: string, customMessage?: string): never {
    const report = this.formatReport(key);

    // 🛡️ If the engine didn't produce a report, create a System Panic message
    const finalMessage =
      report ||
      `[xalor] 🚨 ${customMessage || 'Assertion failure'} for key: ${key}`;

    this.clearErrors(key);
    throw new Error(finalMessage);
  }

  /**
   * 🛰️ PUBLIC REPORT ENGINE COMPILER
   *
   * STRATEGY:
   * Materializes the lazy private generator stream cleanly at the absolute final edge line
   * using `Array.from()` to preserve maximum internal iteration efficiency.
   */
  public static compileAuditReport(
    targetKey: string,
    isValid: boolean,
    rawErrors: readonly TSolidError[],
  ): TXalorAuditReport {
    if (isValid || !rawErrors || rawErrors.length === 0) {
      return { valid: true, issues: [] };
    }
    /* prettier-ignore */ const issues = Array.from(this.processStreamingIssues(rawErrors, targetKey));

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
