import type { TSolidError } from '../../shared';
import {
  getCallerLocation,
  isObject,
  isNull,
  isString,
  isLiteralMatch,
  isUndefined,
  isNumber,
  isKeyOfObject,
} from '../../shared';
import {
  isShapeOfKind,
  isValidSolidShape,
} from '../../shared/shape-domain/guards';
import { REGEX_PATTERNS } from '../../shared/constants';
import { xalethorVaultKeeper } from './vault-keeper';
import type {
  TRuntimeApiErrorKeys,
  TRuntimeApiContext,
  TRuntimeApiErrorRules,
  TXalorAuditReport,
  TXalorIssue,
  TErrorReportTemplate,
  TRuntimeShapeValidationErrorKey,
} from '../models/types';
import {
  RUNTIME_API_RULE_MAPPER,
  RUNTIME_SHAPE_VALIDATION_ERRORS,
  RULE_KIND_MAPPER,
  RUNTIME_LOGGER_DESIGN_SPECTRUM,
  INVERTED_RULE_KEYS_MAP,
  RECEIVED_TOKEN_FALLBACK_MAP,
} from '../models/constants';
import { xalethorVaultValidation } from './vault-validation';

class XalethorVaultDiagnostics {
  private runtimeLoggerDesign = RUNTIME_LOGGER_DESIGN_SPECTRUM;

  /**
   * Parses expected blueprint constraints down to clean terminal descriptions.
   */
  private parseExpectedValue(expected: unknown): string {
    /* prettier-ignore */
    if (isString(expected)) return expected.replace(REGEX_PATTERNS.removeQuotes, '')

    if (isValidSolidShape(expected)) {
      if (isShapeOfKind('primitive')(expected)) return expected.type;
      if (isShapeOfKind('literal')(expected)) return String(expected.value);
      return JSON.stringify(expected);
    }
    return '';
  }
  /**
   * Translates incoming invalid data values down to standardized diagnostic reports.
   * COMPLIANCE: 100% Type-Safe. Uses point-free map selections to clear conditional cascades.
   */
  private parseReceivedValue(received: unknown): string {
    if (isNull(received)) return 'null';

    if (isString(received)) {
      return RECEIVED_TOKEN_FALLBACK_MAP[received] ?? received;
    }
    return JSON.stringify(received);
  }
  /**
   * Reassembles a dot-notation path breadcrumb string from a raw stack array on demand.
   * COMPLIANCE: Modern point-free .reduce() accumulator has zero impact on valid-path performance.
   */
  private assemblePathFromStack(stack: readonly (string | number)[]): string {
    if (stack.length === 0) return '$';

    return stack.reduce<string>((path, part) => {
      if (isUndefined(part)) return path;

      if (isNumber(part)) return `${path}[${part}]`;

      /* prettier-ignore */
      if (part.startsWith('Map(') || part.startsWith('[')) return `${path}${part}`;

      if (path === '$') return `${path}${part}`;

      return `${path}.${part}`;
    }, '$');
  }

  private convertGuardRuleToKey(rule: string): rule is TRuntimeApiErrorRules {
    if (!isKeyOfObject(INVERTED_RULE_KEYS_MAP)(rule)) return false;

    const discoveredMatchKey = INVERTED_RULE_KEYS_MAP[rule];

    const uppercaseComparisonKey = rule.toUpperCase().replace(/_/g, '_');
    return isLiteralMatch(uppercaseComparisonKey, discoveredMatchKey);
  }

  private evaluateRuleKind(
    errorKey: string | TRuntimeShapeValidationErrorKey,
  ): TRuntimeApiErrorRules {
    return RULE_KIND_MAPPER[errorKey] || 'primitive_mismatch';
  }
  /**
   * Monomorphic error string lookup mapping.
   * Resolves the runtime message functions completely outside the hot data lane.
   */
  /* prettier-ignore */
  private  getRuntimeErrorMessage(typeKey: TRuntimeApiErrorKeys, ctx: TRuntimeApiContext): string {
    const errorMapper = RUNTIME_API_RULE_MAPPER;
    if (errorMapper === undefined || errorMapper[typeKey] === undefined) {
      return `STRUCTURAL CONTRACT FAILURE: Validation gate violation at '${ctx.path}'.`;
    }
    return errorMapper[typeKey].message(ctx);
  }

  private runtimeErrorReportTemplate(ctx: TErrorReportTemplate): string {
    const { keyName, errorDetails } = ctx;
    const c = this.runtimeLoggerDesign;

    const header = `\n${c.red}${c.bold}[xalor] 🛑 SOLIDITY BREAK: "${keyName}"${c.reset}\n`;
    const bodyBuffer: string[] = [];
    const count = errorDetails.length;

    for (let i = 0; i < count; i++) {
      const item = errorDetails[i];
      if (item === undefined) continue;

      const frame = [
        // ✨ Swapped item.err.path to use our clean, pre-compiled item.pathString
        ` ${c.cyan}➔ Path:${c.reset} ${c.bold}${item.pathString}${c.reset}`,
        ` ${c.textLightGreen}Expected:${c.reset} ${item.cleanExpected}`,
        ` ${c.textLightRed}Received:${c.reset} ${item.cleanReceived}`,
        ` ${c.gray}─────────────────────────────────────────────────────────────${c.reset}`,
        ` ${c.bold}💎 Type Definition (Source Link):${c.reset}`,
        ` ${c.cyan}↳ ${item.originGps}${c.reset}`,
        ` ${c.bold}⚡ Runtime Call Site (Invocation Link):${c.reset}`,
        ` ${c.cyan}↳ ${item.callerGps}${c.reset}`,
      ].join('\n');

      bodyBuffer.push(frame);
    }

    const separator = `\n\n${c.gray} =============================================================${c.reset}\n\n`;
    const body = bodyBuffer.join(separator);
    return `${header}${body}\n`;
  }

  /**
   * Generates an inline ANSI-styled terminal layout report by processing an error stream array.
   * COMPLIANCE: Pure, state-free processing pipeline with zero global side-effects.
   */
  private formatReportFromStream(
    key: string,
    errors: readonly TSolidError[],
  ): string {
    const errorCount = errors.length;
    if (errorCount === 0) return '';

    const dynamicErrorPayload: Array<{
      err: TSolidError;
      originGps: string;
      callerGps: string;
      cleanExpected: string;
      cleanReceived: string;
      ruleKey: TRuntimeApiErrorRules;
      mappedMessage: string;
      pathString: string;
    }> = [];

    const runtimeCaller = getCallerLocation({ preferredIndex: 4 });
    const manifest = xalethorVaultKeeper.peek('manifest', key);
    const originArea = manifest ? manifest.area : 'unknown:0:0';

    for (let i = 0; i < errorCount; i++) {
      const err = errors[i];
      if (err === undefined) continue;

      const resolvedRuleKind = this.evaluateRuleKind(err.errorKey);
      if (!this.convertGuardRuleToKey(resolvedRuleKind)) continue;

      const uppercaseComparisonKey = INVERTED_RULE_KEYS_MAP[resolvedRuleKind];

      const config = RUNTIME_SHAPE_VALIDATION_ERRORS[err.errorKey];
      const cleanExpected = err.shapeContext
        ? this.parseExpectedValue(err.shapeContext)
        : config
          ? config.expected('')
          : 'undefined';

      const cleanReceived =
        err.errorKey === 'INSTANCEOF_VALIDATION_PROTOTYPE_MISMATCH'
          ? isObject(err.received) && err.received !== null
            ? err.received.constructor.name
            : typeof err.received
          : this.parseReceivedValue(err.received);

      // ✨ Synchronized: Access your clean pathSnapshot array pointer slice
      const computedPathString = this.assemblePathFromStack(err.pathSnapshot);

      const mapperCtx: TRuntimeApiContext = {
        path: computedPathString,
        expected: cleanExpected,
        received: cleanReceived,
      };

      const resolvedApiLog = this.getRuntimeErrorMessage(
        uppercaseComparisonKey,
        mapperCtx,
      );
      const humanReadableMessage = resolvedApiLog
        ? resolvedApiLog
        : `STRUCTURAL CONTRACT FAILURE: Verification failed at position '${mapperCtx.path}'.`;

      dynamicErrorPayload.push({
        err,
        originGps: originArea,
        callerGps: runtimeCaller,
        cleanExpected,
        cleanReceived,
        ruleKey: resolvedRuleKind,
        mappedMessage: humanReadableMessage,
        pathString: computedPathString,
      });
    }

    return this.runtimeErrorReportTemplate({
      keyName: key,
      errorDetails: dynamicErrorPayload,
    });
  }

  // ================================================================================
  // ================================================================================
  // PUBLIC METHODS FOR XalethorService
  // ================================================================================
  // ================================================================================
  /**
   * Backward-compatible stateful report wrapper.
   */
  public formatReport(key: string, errors?: readonly TSolidError[]): string {
    return this.formatReportFromStream(
      key,
      errors ?? xalethorVaultValidation.getErrors(key),
    );
  }
  /**
   * Reconstructs standard diagnostics trace structures from an isolated validation execution pass.
   */
  public compileAuditReport(
    targetKey: string,
    isValid: boolean,
    rawErrors: readonly TSolidError[],
  ): TXalorAuditReport {
    if (isValid || !rawErrors || rawErrors.length === 0) {
      return { valid: true, issues: [] };
    }

    const issues: TXalorIssue[] = [];
    const errorCount = rawErrors.length;

    for (let i = 0; i < errorCount; i++) {
      const err = rawErrors[i];
      if (err === undefined || err.key !== targetKey) continue;

      const rule = this.evaluateRuleKind(err.errorKey);
      const config = RUNTIME_SHAPE_VALIDATION_ERRORS[err.errorKey];

      let expectedStr = '';
      if (err.shapeContext) {
        expectedStr = this.parseExpectedValue(err.shapeContext);
      } else if (config) {
        expectedStr = config.expected('');
      }

      issues.push({
        path: this.assemblePathFromStack(err.pathSnapshot),
        rule,
        expected: expectedStr,
        received: this.parseReceivedValue(err.received),
      });
    }

    return { valid: issues.length === 0, issues };
  }

  public panic(key: string, customMessage?: string): never {
    const globalErrorsLedger = xalethorVaultValidation.getErrors(key);

    const primaryError: TSolidError | undefined =
      globalErrorsLedger !== undefined && globalErrorsLedger.length > 0
        ? globalErrorsLedger[globalErrorsLedger.length - 1]
        : undefined;

    if (primaryError !== undefined) {
      const pathLocation = Array.isArray(primaryError.pathSnapshot)
        ? primaryError.pathSnapshot.join('.')
        : '$ROOT';

      const finalMessage =
        `[xalor] 🚨 Validation panic for key: "${primaryError.errorKey}". ` +
        `Field location: "${pathLocation}" failed type/constraint checks with value payload: ${JSON.stringify(primaryError.received)}`;

      throw new Error(finalMessage);
    }

    throw new Error(
      `[xalor] 🚨 ${customMessage || 'Assertion failure'} for key: ${key}`,
    );
  }
}

export const xalethorVaultDiagnostics = new XalethorVaultDiagnostics();
