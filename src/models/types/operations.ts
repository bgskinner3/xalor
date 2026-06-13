import type {
  TTypeGuard,
  TSolidBranded,
  TXalorAuditReport,
  TDeepKeyOf,
  TDeepMerge,
  TRecursiveReadonly,
  TRecursivePartial,
  TPrettify,
  TDeepWriteable,
} from '../../../shared';
import type {
  TGeneratorXalorModes,
  TValidationXalorModes,
  TTransformXalorModes,
  TMatchXalorModes,
} from '../../../shared';

// ====================================================================
// ====================================================================
// ====================================================================
// ====================================================================
// GENERATOR XALOR API TYPES
// ====================================================================
// ====================================================================
// ====================================================================
// ====================================================================

export type TGenerateXalorResultMap<K extends keyof ISolidRegistry> = {
  default: TSolidBranded<K, ISolidRegistry[K]>;
  mock: TSolidBranded<K, ISolidRegistry[K]>;
  clone: TSolidBranded<K, ISolidRegistry[K]>;
  cast: TSolidBranded<K, ISolidRegistry[K]>;
};
export type TGenerateXalorStrategyEngine<K extends keyof ISolidRegistry> = {
  readonly [P in TGeneratorXalorModes]: (
    k: K,
    d: unknown,
  ) => TGenerateXalorResultMap<K>[P];
};
export type TGenerateXalorReturn<
  K extends keyof ISolidRegistry,
  M extends TGeneratorXalorModes,
> = TGenerateXalorResultMap<K>[M];

// ====================================================================
// ====================================================================
// ====================================================================
// ====================================================================
// VALIDATE XALOR API TYPES
// ====================================================================
// ====================================================================
// ====================================================================
// ====================================================================

export type TValidateXalorResultMap<K extends keyof ISolidRegistry> = {
  guard: TTypeGuard<ISolidRegistry[K]>;
  assert: void;
  parse: ISolidRegistry[K];
  parseAsync: Promise<ISolidRegistry[K]>;
  audit: TXalorAuditReport;
};
export type TValidateXalorReturn<
  K extends keyof ISolidRegistry,
  M extends TValidationXalorModes,
> = TValidateXalorResultMap<K>[M];

export type TTValidateStrategyEngine<K extends keyof ISolidRegistry> = {
  readonly [Mode in TValidationXalorModes]: (
    k: K,
    d: unknown,
  ) => TValidateXalorResultMap<K>[Mode];
};
// ====================================================================
// ====================================================================
// ====================================================================
// ====================================================================
// TRANSFORM XALOR API TYPES
// ====================================================================
// ====================================================================
// ====================================================================
// ====================================================================

/**
 * INDIVIDUAL TRANSFORM MODE PARAMETERS
 *
 * ROLE:
 * Isolated property structural contracts defining distinct data mutation configurations.
 *
 * DESIGN SPECIFICATIONS:
 * Satisfies Commandment IV (Operation Isolation). Separating user-land property parameters
 * blocks ensures that each transformation vector holds explicit, type-safe data criteria
 * without loose shared interface pollution holes.
 */
export type TPickOmitContext<K extends keyof ISolidRegistry> = {
  readonly data: unknown;
  readonly keys: readonly TDeepKeyOf<ISolidRegistry[K]>[];
};

export type TMergeContext = {
  readonly dataOne: unknown;
  readonly dataTwo: unknown;
};
export type TFlattenDataContext = {
  readonly data: unknown;
};
// ----------------------------------------------------------------------------------------------------
/**
 * AUTOMATED PARAMETERS LOOKUP DICTIONARY
 *
 * ROLE:
 * Single source of truth index ledger linking strategy tokens to narrow context blocks.
 */
export type TTransformXalorParamMap<K extends keyof ISolidRegistry> = {
  readonly pick: TPickOmitContext<K>;
  readonly omit: TPickOmitContext<K>;
  // readonly rename: TRenameContext;
  readonly merge: TMergeContext;
  readonly flatten: TFlattenDataContext;
};
/**
 * AUTOMATED OUTPUTS LOOKUP DICTIONARY
 *
 * ROLE:
 * Single source of truth index ledger linking strategy tokens to narrow resulting structures.
 */
export type TTransformXalorResultMap<K extends keyof ISolidRegistry> = {
  readonly pick: ISolidRegistry[K];
  readonly omit: ISolidRegistry[K];
  // readonly rename: ISolidRegistry[K];
  readonly merge: ISolidRegistry[K];
  readonly flatten: Record<string, string | number | boolean>;
};
// ----------------------------------------------------------------------------------------------------
/**
 * TYPE-PARAMETERIZED DISCRIMINATED TRANSFORM CONTEXT
 *
 * ROLE:
 * Generically locks down the required parameter payload properties block
 * based on the precise mode literal argument passed to the generic slot.
 *
 * WHY:
 * Satisfies Commandment I and V. Enforces complete compile-time validation for
 * user-land calls like `transformXalor<"KEY", "pick">({ mode: 'pick', data, keys })`,
 * instantly flagging mismatched field keys inside the developer's IDE.
 */
export type TTransformContext<
  K extends keyof ISolidRegistry,
  M extends TTransformXalorModes = TTransformXalorModes,
> = {
  readonly mode: M;
} & TTransformXalorParamMap<K>[M];

/**
 * AUTOMATED DYNAMIC RETURN TYPE DISPATCHER
 *
 * ROLE:
 * Computes and links the precise structural return type based on the active strategy token.
 */
export type TTransformXalorReturn<
  K extends keyof ISolidRegistry,
  M extends TTransformXalorModes,
> = TTransformXalorResultMap<K>[M];

/**
 * AUTOMATED STRATEGY SWITCHBOARD ENGINE CONTRACT
 *
 * ROLE:
 * Links each unique 'Mode' token string key directly to its matching narrow
 * parameter object shape AND narrow output result shape simultaneously.
 *
 */
export type TTransformStrategyEngine<K extends keyof ISolidRegistry> = {
  readonly [Mode in TTransformXalorModes]: (
    key: K,
    ctx: TTransformXalorParamMap<K>[Mode],
  ) => TTransformXalorResultMap<K>[Mode];
};

// ====================================================================
// ====================================================================
// ====================================================================
// ====================================================================
// Match XALOR API TYPES
// ====================================================================
// ====================================================================
// ====================================================================
// ====================================================================
// ------------------------------------------------------------------------

// ====================================================================
// Composite TYPES
// ====================================================================
/* prettier-ignore */
export type ResolveCompositeIntersection<
  KeysTuple extends readonly (keyof ISolidRegistry)[],
  CurrentType = object,
> = KeysTuple extends readonly [
  infer First extends keyof ISolidRegistry,
  ...infer Rest extends readonly (keyof ISolidRegistry)[],
] ? ResolveCompositeIntersection<Rest,TDeepMerge<CurrentType, ISolidRegistry[First]>>
  : TRecursiveReadonly<CurrentType>;

/* prettier-ignore */
export type TMax8CompositeKeys = 
/* prettier-ignore */| readonly []
/* prettier-ignore */| readonly [keyof ISolidRegistry]
/* prettier-ignore */| readonly [keyof ISolidRegistry, keyof ISolidRegistry]
/* prettier-ignore */| readonly [keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry]
/* prettier-ignore */| readonly [keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry]
/* prettier-ignore */| readonly [keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry]
/* prettier-ignore */| readonly [keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry]
/* prettier-ignore */| readonly [keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry]
/* prettier-ignore */| readonly [keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry, keyof ISolidRegistry];

// ====================================================================
// ====================================================================
// MAIN MAPPER SETUP
// ====================================================================
// ====================================================================
/* prettier-ignore */
export type TMatchXalorResultMap<SingleKey extends keyof ISolidRegistry, CompositeKeys extends TMax8CompositeKeys> = {
  readonly composite: ResolveCompositeIntersection<CompositeKeys>;
  readonly reduce: TDeepWriteable<ISolidRegistry[SingleKey]>;
  readonly intent: TPrettify<ISolidRegistry[SingleKey]>;
  readonly drift: TPrettify<TRecursivePartial<ISolidRegistry[SingleKey]>>;
};
/* prettier-ignore */
export type TMatchXalorReturn<
  K extends keyof ISolidRegistry,
  M extends TMatchXalorModes,
  CompositeKeys extends TMax8CompositeKeys = readonly [],
> = TMatchXalorResultMap<K,M extends 'composite' ? CompositeKeys : readonly []>[M];

/* prettier-ignore */
export type TMatchStrategyEngine<K extends keyof ISolidRegistry,CompositeKeys extends TMax8CompositeKeys = readonly []> = {
  readonly [Mode in TMatchXalorModes]: (
    key: Mode extends 'composite' ? CompositeKeys : K,
    payload: unknown,
  ) => TMatchXalorResultMap<Mode extends 'composite' ? never : K,Mode extends 'composite' ? CompositeKeys : readonly []>[Mode];
};
