import {
  COMPILER_DIAGNOSTIC_RULE_KEYS,
  COLLISION_BORDER_RULE_KEYS,
  TYPE_COMPLIANCE_RULE_KEYS,
  XALOR_ERROR_AREAS,
  CORE_CONFIG_RULE_KEYS,
} from '../constants';

type TRuleKeys<T extends Record<PropertyKey, string>> = keyof T;

type TRuleValues<T extends Record<PropertyKey, string>> = T[keyof T];
// ================================================================================
// ================================================================================
// COMPILER_DIAGNOSTIC TYPES
// ================================================================================
// ================================================================================
/* prettier-ignore */
export type TCompilerDiagnosticKeys = TRuleKeys<typeof COMPILER_DIAGNOSTIC_RULE_KEYS>;

/* prettier-ignore */
export type TCompilerDiagnosticRules = TRuleValues<typeof COMPILER_DIAGNOSTIC_RULE_KEYS>

// ================================================================================
// ================================================================================
// COLLISION BORDER TYPES
// ================================================================================
// ================================================================================
/* prettier-ignore */
export type TCollisionBorderKeys = TRuleKeys<typeof COLLISION_BORDER_RULE_KEYS>

/* prettier-ignore */
export type TCollisionBorderRules = TRuleValues<typeof COLLISION_BORDER_RULE_KEYS>

export type TSameFileCollisionCtx = {
  readonly keyName: string;
  readonly historicalArea: string;
  readonly historicalAnchor: string;
  readonly activeArea: string;
  readonly activeAnchor: string;
};

export type TCrossFileCollisionCtx = {
  readonly keyName: string;
  readonly initialFilePath: string;
  readonly initialArea: string;
  readonly hijackFilePath: string;
  readonly hijackArea: string;
};
// ================================================================================
// ================================================================================
// TYPE_COMPLIANCE TYPES
// ================================================================================
// ================================================================================
/* prettier-ignore */
export type TTypeComplianceKeys =  TRuleKeys<typeof TYPE_COMPLIANCE_RULE_KEYS>;

/* prettier-ignore */
export type TTypeComplianceRules = TRuleValues<typeof TYPE_COMPLIANCE_RULE_KEYS>;

// ================================================================================
// ================================================================================
//   AREA TYPE KEYS AND RULES TYPES
// ================================================================================
// ================================================================================
/* prettier-ignore */
export type TXalorErrorArea = TRuleKeys<typeof XALOR_ERROR_AREAS>;

/* prettier-ignore */
export type TXalorErrorAreaRule = TRuleValues<typeof XALOR_ERROR_AREAS>;

// ================================================================================
// ================================================================================
//  ALL AREA TYPE KEYS AND RULES TYPES
// ================================================================================
// ================================================================================

export type TCoreConfigRuleKeys = keyof typeof CORE_CONFIG_RULE_KEYS;
