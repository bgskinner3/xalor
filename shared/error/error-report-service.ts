import {
  REPORT_SERVICE_MODE_ROUTER,
  COMPILER_DIAGNOSTIC_FALLBACKS,
  CORE_MAPPER_TABLE,
  CORE_CONFIG_RULE_KEYS,
} from './constants';
import { xalorLog } from '../service';
import {
  getCallerLocation,
  isStringFunction,
  isUndefined,
  isInstanceOf,
} from '../utils';
import type {
  TReportServiceContext,
  THeaderModes,
  TCoreMapperType,
  TXalorErrorArea,
  TCompilerDiagnosticKeys,
  TTypeComplianceKeys,
  TCollisionBorderKeys,
  TRuntimeApiErrorKeys,
  TRuntimeApiContext,
  TCrossFileCollisionCtx,
  TSameFileCollisionCtx,
  TXalorMatchDriftKeys,
  TLogAnomalyParams,
  TCoreConfigRuleKeys,
} from './types';

// 'original' | 'formatted'

class ErrorReportService {
  private readonly MODE_ROUTER = REPORT_SERVICE_MODE_ROUTER;
  /* prettier-ignore */
  public getAreaErrorMapper<T extends TXalorErrorArea>(name: T): TCoreMapperType[T] {
    return CORE_MAPPER_TABLE[name];
  }

  public getConfigRuleKeys<T extends TCoreConfigRuleKeys>(
    key: T,
  ): (typeof CORE_CONFIG_RULE_KEYS)[T] {
    return CORE_CONFIG_RULE_KEYS[key];
  }

  public generateTerminalPanel(ctx: TReportServiceContext): string {
    const { keyName, fileLocation, message, rule, mode } = ctx;

    /* prettier-ignore */ const targetVisualMode: THeaderModes = this.MODE_ROUTER[mode];
    /* prettier-ignore */ const ruleLabel = rule && rule.length > 0 ? rule.toUpperCase() : 'GENERAL_FAULT';

    // "tests/integration/payload-validation.spec.ts:55:12"
    const invocationCallSite = getCallerLocation();

    /* prettier-ignore */ const interactiveFileLink = xalorLog.formatTerminalLink(fileLocation, fileLocation);
    /* prettier-ignore */ const interactiveCallSiteLink = xalorLog.formatTerminalLink(invocationCallSite, invocationCallSite);
    return xalorLog.ATSErrorTemplate({
      keyName,
      ruleLabel,
      fileLink: interactiveFileLink,
      callSiteLink: interactiveCallSiteLink,
      messagePayload: message,
      theme: targetVisualMode === 'hard' ? 'crimson' : 'standard',
    });
  }
  /* prettier-ignore */
  public getTransformerErrorMessage<TArea extends 'TRANSFORMER_DIAGNOSTIC_COMPILER' | 'TRANSFORMER_TYPE_RESOLVER'>(
    area: TArea,
    compilerKey: TCompilerDiagnosticKeys | TTypeComplianceKeys,
    error?: unknown,
  ): string {
    const rawExceptionString = isInstanceOf(error, Error)
      ? error.message
      : String(error ?? '');

    // Map the keys directly to their structural message property inline without new types
    const errorMapper = this.getAreaErrorMapper<TArea>(area);

    const config = errorMapper[compilerKey];

    if (isUndefined(config)) {
      return rawExceptionString.length > 0
        ? rawExceptionString
        : 'An unrecognized compiler anomaly occurred.';
    }


    return isStringFunction(config.message)
      ? config.message(rawExceptionString.length > 0 ? rawExceptionString : undefined)
      : config.message;
  }

  /* prettier-ignore */ public resolveCollisionFailure(area: 'TRANSFORMER_COLLISION_SAME_FILE',key: TCollisionBorderKeys,context: TSameFileCollisionCtx): string;
  /* prettier-ignore */ public resolveCollisionFailure(area: 'TRANSFORMER_COLLISION_CROSS_FILE',key: TCollisionBorderKeys,context: TCrossFileCollisionCtx): string;
  public resolveCollisionFailure(
    area:
      | 'TRANSFORMER_COLLISION_SAME_FILE'
      | 'TRANSFORMER_COLLISION_CROSS_FILE',
    key: TCollisionBorderKeys,
    context: TSameFileCollisionCtx | TCrossFileCollisionCtx,
  ): string {
    const errorMapper = this.getAreaErrorMapper(area);

    if (isUndefined(errorMapper)) {
      return 'An unrecognized compiler collision anomaly occurred.';
    }

    const config = errorMapper[key];

    if (isUndefined(config)) {
      return 'An unrecognized compiler collision anomaly occurred.';
    }

    return config.message(context);
  }
  // ================================================================================
  // ================================================================================
  // RUNTIME ERRORS
  // ================================================================================
  // ================================================================================
  public getRuntimeErrorMessage(
    typeKey: TRuntimeApiErrorKeys,
    ctx: TRuntimeApiContext,
  ): string {
    /* prettier-ignore */ const errorMapper = this.getAreaErrorMapper('RUNTIME_API');
    return errorMapper[typeKey].message(ctx);
  }

  public getRuntimeDriftError(typeKey: TXalorMatchDriftKeys): string {
    /* prettier-ignore */ const errorMapper = this.getAreaErrorMapper('RUNTIME_MATCH_DRIFT');
    return errorMapper[typeKey].message();
  }
  /* prettier-ignore */
  public logAnomaly<TArea extends 'TRANSFORMER_DIAGNOSTIC_COMPILER' | 'TRANSFORMER_TYPE_RESOLVER'>(area: TArea,params: TLogAnomalyParams): void {
    const { keyName, fileLocation, error, mode } = params;

    // Direct O(1) fallback rule extraction
    const ruleToken =
      COMPILER_DIAGNOSTIC_FALLBACKS[keyName]?.rule ?? 'general_fault';

    const finalizedMessage = this.getTransformerErrorMessage<TArea>(area, keyName, error);

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

export const errorReportService = new ErrorReportService();
