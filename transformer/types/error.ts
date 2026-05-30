import type { TTransformerExecuteMode } from '../../shared';
import { XALOR_INVALID_TYPE_COMPLIANCE_RULE_KEYS } from '../constants';
/**
 * TReportServiceContext
 * 🪐 OMNI-REPORTER DATA MATRIX
 *
 * ROLE:
 * A flattened, loosely bound parameters contract allowing ANY build-time,
 * route, or file-system error type to utilize the universal ANSI board scribe.
 */
export type TReportServiceContext = {
  readonly keyName: string;
  readonly fileLocation: string;
  readonly message: string;
  readonly rule?: string;
  readonly mode: TTransformerExecuteMode;
};

export type THeaderModes = 'hard' | 'watch' | 'soft';
export type TModeRouterModes = Exclude<TTransformerExecuteMode, 'clear'>;
export type TModeRouter = Record<TModeRouterModes, THeaderModes>;

/**
 * TXALORCOMPLIANCERULEKEYS
 * The refined literal string union type matching your active build-time error categories.
 */
export type TXalorComplianceRuleKeys =
  (typeof XALOR_INVALID_TYPE_COMPLIANCE_RULE_KEYS)[number];

/**
 * TXALOR TYPE GUARD FAILURE DIAGNOSTIC
 *
 * ROLE:
 * A strict immutable data contract capturing precise build-time validation faults.
 * It maps structural type anomalies directly to isolated error categories.
 *
 * WHY:
 * Satisfies Commandment VI (Determinism & Traceability). By explicitly categorizing
 * the failure rule with a clear message, it enables the compiler engine to halt
 * and output a zero-allocation, highly precise diagnostic trace back to the developer.
 */
export type TXalorTypeGuardFailure = {
  readonly rule: TXalorComplianceRuleKeys;
  readonly message: string;
};

export type TXalorErrorFormatVariant = 'original' | 'formatted';

export type TCompilerAnomalyKey =
  | 'COMPILER_MECHANICAL_FAULT'
  | 'GENESIS_HYDRATION_FAULT'
  | 'VAULT_FLUSH_IO_FAULT'
  | 'AST_GENERATION_ANOMALY'
  | 'UNKNOWN_API_TRIGGER'
  | 'COLD_START_INFRASTRUCTURE_FAULT'
  | 'TEMPLATE_SEED_FAULT'
  | 'GENESIS_STREAM_FAULT'
  | 'REGISTRATION_REJECTED_BREACH';

export type TDiagnosticFallbackConfig = {
  readonly rule: string;
  readonly messageTemplate: string | ((dynamicValue?: string) => string);
};

export type TCompilerDiagnosticMapper = Record<
  TCompilerAnomalyKey,
  TDiagnosticFallbackConfig
>;

export type TLogAnomalyParams = {
  readonly keyName: TCompilerAnomalyKey;
  readonly fileLocation: string;
  readonly error?: unknown;
  readonly mode: TTransformerExecuteMode;
};
