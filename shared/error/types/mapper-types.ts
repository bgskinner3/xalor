import type {
  TCompilerDiagnosticRules,
  TCompilerDiagnosticKeys,
  TCollisionBorderRules,
  TTypeComplianceKeys,
  TTypeComplianceRules,
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

// ================================================================================
// ================================================================================
// MAPPER ERROR TYPES
// ================================================================================
// ================================================================================

/* prettier-ignore */
export type TTypeResolverRuleMapper = Record<TTypeComplianceKeys, TTypeResolverRuleConfig>;

/* prettier-ignore */
export type TCompilerDiagnosticMapper = Record<TCompilerDiagnosticKeys, TDiagnosticFallbackConfig>;

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
  TRANSFORMER_COLLISION_SAME_FILE: TCollisionBorderFailureConfig<TSameFileCollisionCtx>;
  TRANSFORMER_COLLISION_CROSS_FILE: TCollisionBorderFailureConfig<TCrossFileCollisionCtx>;
  TRANSFORMER_TYPE_RESOLVER: TTypeResolverRuleMapper;
};
