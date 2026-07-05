import type { TTransformerExecuteMode } from '../../cli-domain';
import type {
  TCompilerDiagnosticKeys,
  TTypeComplianceKeys,
  TTypeComplianceRules,
} from './const-types';
import type { TSolidShapeKinds } from '../../shape-domain';

export type THeaderModes = 'hard' | 'watch' | 'soft';
export type TModeRouterModes = Exclude<TTransformerExecuteMode, 'clear'>;
export type TModeRouter = Record<TModeRouterModes, THeaderModes>;

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
export type TLogAnomalyParams = {
  readonly keyName: TCompilerDiagnosticKeys | TTypeComplianceKeys;
  readonly fileLocation: string;
  readonly error?: unknown;
  readonly mode: TTransformerExecuteMode;
};

/**
 * 💎 MESSAGE MANIFEST UTILITY TYPINGS
 *
 * Ensures type safety over all parameter payloads being passed to the message
 * generator templates without allowing raw code logic inside the text ledger.
 */
export type TErrorHandlerParams = {
  path?: string;
  expected?: unknown;
  received?: unknown;
  key?: string;
  kind?: TSolidShapeKinds;
  version?: string;
  msg?: string;
  location?: string;
  error?: unknown;
};

export type TTypeGuardErrorFailure = {
  readonly rule: TTypeComplianceRules;
  readonly message: string;
};
