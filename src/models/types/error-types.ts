import {
  RUNTIME_API_RULE_KEYS,
  XALOR_MATCH_DRIFT_RULE_KEYS,
  RUNTIME_SHAPE_VALIDATION_ERROR_KEYS,
} from '../constants/configs';
import type { TSolidError } from '../../../shared/types';
import type { TSolidShape } from '../../../shared/shape-domain';

type TRuleKeys<T extends Record<PropertyKey, string>> = keyof T;
type TRuleValues<T extends Record<PropertyKey, string>> = T[keyof T];
// ================================================================================
// ================================================================================
//   RUNTIME_API TYPES
// ================================================================================
// ================================================================================
/* prettier-ignore */
export type TRuntimeApiErrorKeys = TRuleKeys<typeof RUNTIME_API_RULE_KEYS>;

export type TRuntimeApiContext = {
  path: string;
  expected?: string;
  received?: string;
};

// ================================================================================
// ================================================================================
//   XALOR_MATCH_DRIFT TYPES
// ================================================================================
// ================================================================================
/* prettier-ignore */
export type TXalorMatchDriftKeys = TRuleKeys<typeof XALOR_MATCH_DRIFT_RULE_KEYS>;

/* prettier-ignore */
export type TXalorMatchDriftRules = TRuleValues<typeof XALOR_MATCH_DRIFT_RULE_KEYS>;

export type TRuntimeApiErrorRules = TRuleValues<typeof RUNTIME_API_RULE_KEYS>;

type TRuntimeApiConfig = {
  readonly rule: TRuntimeApiErrorRules;
  readonly errorArea: 'runtime_api';
  readonly message: (ctx: TRuntimeApiContext) => string;
};

type TXalorMatchDriftErrorConfig = {
  readonly rule: TXalorMatchDriftRules;
  readonly errorArea: 'runtime_match_drift';
  readonly message: () => string;
};

/* prettier-ignore */
export type TRuntimeApiErrorMapper = Record<TRuntimeApiErrorKeys, TRuntimeApiConfig>

/* prettier-ignore */
export type TXalorMatchDriftErrorMapper = Record<TXalorMatchDriftKeys, TXalorMatchDriftErrorConfig>
/**
 * TXalorIssue
 *
 * @key path - The full dot-notation breadcrumb path matching the payload (e.g., '$.address.zip')
 * @key expected - A human-readable description or stringified representation of the required shape
 * @key received - A stringified JSON or primitive readout of the broken input that was provided
 * @key rule - The specific type-system rule or boundary law that was violated
 *
 * @see {@link GlobalRootTypeDocs.TXalorIssue }
 */
export type TXalorIssue = {
  path: string;
  expected: string;
  received: string;
  rule: TRuntimeApiErrorRules;
};

/**
 * TXalorAuditReport
 *
 * @key valid - Quick flag indicating if the data satisfies the target blueprint
 * @key issues - An array containing deterministic diagnostic traces for each failure found
 *
 * @see {@link GlobalRootTypeDocs.TXalorAuditReport }
 */
export type TXalorAuditReport = {
  valid: boolean;
  issues: TXalorIssue[];
};

export type TErrorReportTemplate = {
  readonly keyName: string;
  readonly errorDetails: Array<{
    readonly err: TSolidError;
    readonly originGps: string;
    readonly callerGps: string;
    readonly cleanExpected: string;
    readonly cleanReceived: string;
  }>;
};

// Optional: Strongly type your error keys using TypeScript utility types
/* prettier-ignore */
export type TRuntimeShapeValidationErrorKey = typeof RUNTIME_SHAPE_VALIDATION_ERROR_KEYS[number];

type TRuntimeShapeValidationError = {
  message: string;
  expected: (str?: string, shape?: TSolidShape) => string;
};

/* prettier-ignore */
export type TRuntimeSHapeValidatorErrorMapper = Record<TRuntimeShapeValidationErrorKey, TRuntimeShapeValidationError>
