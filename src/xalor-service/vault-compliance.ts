import { ensureGlobalVault } from '../utils';
import type {
  TSolidError,
  TSolidVaultMap,
  TXalorAuditReport,
  TXalorIssue,
  TRuntimeApiErrorRules,
  TValidationContext,
  TSolidShape,
} from '../../shared';
import {
  serialize,
  getCallerLocation,
  isObject,
  isNull,
  isFunction,
  isString,
  yieldFiltered,
  hasKey,
  isLiteralMatch,
  ObjectUtils,
  isUndefined,
  isLiteralShape,
} from '../../shared';
import {
  IS_SOLID_CONFIG_ITEMS,
  RUNTIME_API_MESSAGE_KEYWORD_RULES,
  REGEX_PATTERNS,
  errorReportService,
} from '../../shared';
import { XalethorVaultKeeper } from './vault-keeper';
import { SHAPE_VALIDATION_MAPPER } from '../mappers';
import { xalorLog } from '../../shared/service/logger-service';

export class XalethorVaultCompliance {
  private static messageKeywordRules = RUNTIME_API_MESSAGE_KEYWORD_RULES;

  private static get vault(): TSolidVaultMap {
    return ensureGlobalVault();
  }
  private static get errorVault(): TSolidVaultMap['errors'] {
    return ensureGlobalVault().errors;
  }

  // ============================================================================
  // 💎 CONTEXT & RECURSION MANAGEMENT
  // ============================================================================
  public static createInitialContext(key?: string): TValidationContext {
    return {
      seen: new Map(),
      path: '$',
      errors: [],
      currentKey: key,
      depth: 0,
    };
  }

  public static has(key: string): boolean {
    return (
      this.vault.references.has(key) &&
      this.vault.manifest.has(key) &&
      this.vault.registry.has(key)
    );
  }

  public static validateKey(key: string): void {
    if (!this.has(key)) {
      throw new Error(
        `[xalor] 🚨 MISSING BLUEPRINT: The key "${key}" is not registered in the Vault. ` +
          `Ensure you have a build-time isXalor<'${key}', Type>() call.`,
      );
    }
  }

  // ============================================================================
  // ⚡ ORCHESTRATION ENTRY POINT
  // ============================================================================
  public static validateShapeByKey(data: unknown, key: string): boolean {
    const shape = this.vault.blueprints.get(key);
    if (!shape) return false;

    this.vault.errors.delete(key);
    const ctx = this.createInitialContext(key);

    const isValid = this.validateShape(data, shape, ctx);

    if (!isValid) {
      this.vault.errors.set(key, ctx.errors);
    }
    return isValid;
  }

  /**
   * Recursive execution loop. Tracks depth limits and memory references.
   */
  public static validateShape(
    data: unknown,
    shape: TSolidShape,
    ctx: TValidationContext,
  ): boolean {
    const { reifyLimit } = IS_SOLID_CONFIG_ITEMS;
    if (ctx.depth > reifyLimit.maxDepth) return false;

    if (isObject(data) && !isNull(data)) {
      let seenShapes = ctx.seen.get(data);
      if (seenShapes?.has(shape)) return true;

      if (!seenShapes) {
        seenShapes = new Set([shape]);
        ctx.seen.set(data, seenShapes);
      } else {
        seenShapes.add(shape);
      }
    }

    const validator = SHAPE_VALIDATION_MAPPER[shape.kind];
    if (!isFunction(validator)) {
      throw new Error(
        `[xalor] 🚨 Unsupported shape kind: "${shape.kind}". ` +
          `Check your Bunker version against the current Engine.`,
      );
    }

    ctx.depth++;
    const result = validator(data, shape, ctx);
    ctx.depth--;
    return result;
  }
  // ============================================================================
  // 🚨 ERROR HARVESTING & REPORTING
  // ============================================================================
  public static reportError(
    ctx: TValidationContext,
    expected: string | TSolidShape,
    received: unknown,
  ): false {
    const runtimeCaller = getCallerLocation({ preferredIndex: 4 });
    const manifest = ctx.currentKey
      ? XalethorVaultKeeper.peek('manifest', ctx.currentKey)
      : undefined;

    // Cleanly fall back if a headless validation bypass runs without a registration entry
    const originArea = manifest ? manifest.area : 'unknown:0:0';

    ctx.errors.push({
      key: ctx.currentKey || 'unknown',
      path: ctx.path,
      message: `Validation failed at ${ctx.path}`,
      expected: serialize(expected),
      received: serialize(received),
      area: runtimeCaller,
      origin: originArea,
    });

    return false;
  }

  // ============================================================================
  // 🛰️ DIAGNOSTICS & AUDITING
  // ============================================================================
  public static getErrors(key: string): TSolidError[] {
    return this.errorVault.get(key) ?? [];
  }

  public static clearErrors(key?: string): void {
    if (key) this.errorVault.delete(key);
    else this.errorVault.clear();
  }

  public static panic(key: string, customMessage?: string): never {
    const report = this.formatReport(key);
    const finalMessage =
      report ||
      `[xalor] 🚨 ${customMessage || 'Assertion failure'} for key: ${key}`;
    this.clearErrors(key);
    throw new Error(finalMessage);
  }

  private static convertGourdRuleToKey(
    rule: unknown,
  ): rule is Uppercase<TRuntimeApiErrorRules> {
    const runtimeConfig =
      errorReportService.getConfigRuleKeys<'RUNTIME_API'>('RUNTIME_API');
    const key = ObjectUtils.entries(runtimeConfig).find(
      ([_, value]) => value === 'missing_property',
    )?.[0];

    return (
      !isUndefined(key) &&
      isString(rule) &&
      isLiteralMatch(rule.toUpperCase(), key)
    );
  }
  // ============================================================================
  // 🛰️ PUBLIC COMPLIANCE REPORT COMPILER (MAPPER ENRICHED)
  // ============================================================================
  /**
   * Generates an inline ANSI-styled terminal layout report by extracting raw errors,
   * resolving their architectural rules, and enriching them with actionable
   * remediation messages from the RUNTIME_API_RULE_MAPPER.
   */
  public static formatReport(key: string): string {
    const errors = this.getErrors(key);
    if (errors.length === 0) return '';

    const dynamicErrorPayload: Array<{
      err: TSolidError;
      originGps: string;
      callerGps: string;
      cleanExpected: string;
      cleanReceived: string;
      ruleKey: TRuntimeApiErrorRules;
      mappedMessage: string;
    }> = [];

    const errorCount = errors.length;
    for (let i = 0; i < errorCount; i++) {
      const err = errors[i];
      if (err !== undefined) {
        const details = this.parseErrorDetails(err);

        const resolvedRuleKey = this.evaluateRuleKind(err);
        if (!this.convertGourdRuleToKey(resolvedRuleKey)) return '';

        const mapperCtx = {
          path: err.path || '$.',
          expected: details.cleanExpected,
          received: details.cleanReceived,
        };
        const resolvedApiLog = errorReportService.getRuntimeErrorMessage(
          resolvedRuleKey,
          mapperCtx,
        );
        const humanReadableMessage = resolvedApiLog
          ? resolvedApiLog
          : `STRUCTURAL CONTRACT FAILURE: Verification failed at position '${mapperCtx.path}'.`;

        // 5. Commit the fully enriched, ready-to-use data layer structures
        dynamicErrorPayload.push({
          err,
          ...details,
          ruleKey: resolvedRuleKey,
          mappedMessage: humanReadableMessage,
        });
      }
    }

    // 6. Direct delegation to the central layout template compiler
    return xalorLog.runtimeErrorReportTemplate({
      keyName: key,
      errorDetails: dynamicErrorPayload,
    });
  }

  public static compileAuditReport(
    targetKey: string,
    isValid: boolean,
    rawErrors: readonly TSolidError[],
  ): TXalorAuditReport {
    if (isValid || !rawErrors || rawErrors.length === 0) {
      return { valid: true, issues: [] };
    }
    const issues = Array.from(
      this.processStreamingIssues(rawErrors, targetKey),
    );
    return { valid: issues.length === 0, issues };
  }
  // ============================================================================
  // 🔒 PRIVATE COMPLIANCE UTILITIES
  // ============================================================================
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

  private static parseReceivedValue(received: unknown): string {
    if (received === 'missing') return 'undefined';
    return isString(received) ? received : JSON.stringify(received);
  }

  private static parseExpectedValue(expected: unknown): string {
    /* prettier-ignore */ if (isString(expected)) return expected.replace(REGEX_PATTERNS.removeQuotes, '');
    /* prettier-ignore */ if (isObject(expected) && !isNull(expected)) {
      const shape = expected as TSolidShape;
      if (shape.kind === 'primitive') return shape.type;
      if (shape.kind === 'literal') return String(shape.value);
      return JSON.stringify(shape);
    }
    return '';
  }

  // ============================================================================
  // 🔍 DETERMINISTIC RULE CLASSIFICATION MATRIX
  // ============================================================================
  /**
   * Evaluates the exact rule category broken by checking structural signatures
   * inside the error payload without changing the underlying TSolidError type.
   */
  public static evaluateRuleKind(err: TSolidError): TRuntimeApiErrorRules {
    const currentPath = err.path;
    const currentMessage = err.message;
    const currentReceived = err.received;
    const currentExpected = err.expected;

    if (isObject(currentExpected) && !isNull(currentExpected)) {
      const shapeNode: TSolidShape = currentExpected;
      if (isLiteralShape(shapeNode)) return 'literal_mismatch';
    }

    // Exact Value Match Layer (Bypasses allocations from .toLowerCase or .trim)
    /* prettier-ignore */ if (currentReceived === 'missing') return 'missing_property';
    /* prettier-ignore */ if (currentReceived === 'missing_key_presence')    return 'missing_key_presence';
    /* prettier-ignore */ if (currentReceived === 'excess_property')    return 'excess_property';

    // Replaces switch statements and if/else arrays with index traversal loops over constants
    const scanCount = this.messageKeywordRules.length;
    for (let i = 0; i < scanCount; i++) {
      const pair = this.messageKeywordRules[i];
      if (pair !== undefined) {
        const keyword = pair[0];
        const ruleKind = pair[1];
        /* prettier-ignore */ if (currentMessage.includes(keyword))  return ruleKind;
        /* prettier-ignore */ if (isString(currentReceived) && currentReceived.includes(keyword))  return ruleKind;
        /* prettier-ignore */ if (isString(currentExpected) && currentExpected.includes(keyword))  return ruleKind;
      }
    }
    if (currentPath === '$') return 'missing_key_presence';

    return 'primitive_mismatch';
  }
}
