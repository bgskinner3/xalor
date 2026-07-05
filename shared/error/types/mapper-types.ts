import type {
  TCompilerDiagnosticRules,
  TCompilerDiagnosticKeys,
  TXalorMatchDriftKeys,
  TXalorMatchDriftRules,
  TCollisionBorderRules,
  TTypeComplianceKeys,
  TTypeComplianceRules,
  TRuntimeApiErrorKeys,
  TRuntimeApiErrorRules,
  TRuntimeApiContext,
  TSameFileCollisionCtx,
  TCrossFileCollisionCtx,
} from './const-types';

// ================================================================================
// ================================================================================
// MAPPER ERROR CONFIG TYPES
// ================================================================================
// ================================================================================
type TTypeResolverRuleConfig = {
  readonly rule: TTypeComplianceRules;
  readonly errorArea: 'transformer_type_resolver';
  readonly message: (keyName: string, aliasName?: string) => string;
};
/* prettier-ignore */
type TCollisionBorderFailureConfig<T> = {
  readonly rule: TCollisionBorderRules;
  readonly errorArea: 'transformer_collision_cross_file' | 'transformer_collision_same_file';
  readonly message: (ctx: T) => string;
};

type TDiagnosticFallbackConfig = {
  readonly rule: TCompilerDiagnosticRules;
  readonly errorArea: 'transformer_diagnostic_compiler';
  readonly message: string | ((dynamicValue?: string) => string);
};

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

// ================================================================================
// ================================================================================
// MAPPER ERROR TYPES
// ================================================================================
// ================================================================================

/* prettier-ignore */
export type TTypeResolverRuleMapper = Record<TTypeComplianceKeys, TTypeResolverRuleConfig>;

/* prettier-ignore */
export type TCompilerDiagnosticMapper = Record<TCompilerDiagnosticKeys, TDiagnosticFallbackConfig>;

/* prettier-ignore */
export type TRuntimeApiErrorMapper = Record<TRuntimeApiErrorKeys, TRuntimeApiConfig>

/* prettier-ignore */
export type TXalorMatchDriftErrorMapper = Record<TXalorMatchDriftKeys, TXalorMatchDriftErrorConfig>

export type TCollisionBorderFailureMapper = {
  readonly SAME_FILE: TCollisionBorderFailureConfig<TSameFileCollisionCtx>;
  readonly CROSS_FILE: TCollisionBorderFailureConfig<TCrossFileCollisionCtx>;
};

// ================================================================================
// ================================================================================
// MAPPER CORE TYPES
// ================================================================================
// ================================================================================

export type TCoreMapperType = {
  TRANSFORMER_DIAGNOSTIC_COMPILER: TCompilerDiagnosticMapper;
  RUNTIME_API: TRuntimeApiErrorMapper;
  TRANSFORMER_COLLISION_SAME_FILE: TCollisionBorderFailureConfig<TSameFileCollisionCtx>;
  TRANSFORMER_COLLISION_CROSS_FILE: TCollisionBorderFailureConfig<TCrossFileCollisionCtx>;
  TRANSFORMER_TYPE_RESOLVER: TTypeResolverRuleMapper;
  RUNTIME_MATCH_DRIFT: TXalorMatchDriftErrorMapper;
};
