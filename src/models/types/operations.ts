import type {
  TSolidBranded,
  TDeepMerge,
  TRecursiveReadonly,
  TExtractRegistryKeyName,
} from '../../../shared';
import type { TGeneratorXalorModes } from '../../../shared';
import { BRAND_SYMBOL } from '../../../shared';
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
// TRANSFORM XALOR API TYPES
// ====================================================================
// ====================================================================
// ====================================================================
// ====================================================================
/**
 *
 *
 *
 * @key dataOne - The baseline target object graph retrieved from memory, state, or database storage
 * @key dataTwo - The incoming secondary partial delta payload patch containing property overrides
 * @key pick - Optional: Explicit root-field extraction retention list (Zod-like pick)
 * @key omit - Optional: Root property exclusion pruning list (Zod-like omit)
 * @key map -
 *
 */
export interface IXalorMergeContext<T> {
  readonly dataOne: unknown;
  readonly dataTwo: unknown;
  readonly pick?: Array<keyof T | string>;
  readonly omit?: Array<keyof T | string>;
  readonly map?: Partial<{
    [K in keyof T]: (value: T[K], parentGraph: Readonly<Partial<T>>) => T[K];
  }>;
}

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
// MATCH DRIFT TYPES
// ====================================================================
// ====================================================================

/**
 *  AUTOMATED DRIFT INFRASTRUCTURE PARAMETERS CONTRACT
 *
 * Progressive disclosure matrix enabling backward-compatible version matching.
 * Uses strict registry index lookups to guarantee 100% autocomplete safety.
 *
 * @template D - Inferred centralized Evolution tracking namespace token key.
 * @template R - Inferred custom application return type computed by your closures.
 * @key currentKey - Active Production Target Key. Checked by the compiler to ensure it matches the modern string token stored inside your registry!
 * @key ancestralKey - Historical Target Key. Checked by the compiler to ensure it matches the legacy string token stored inside your registry!
 * @key strict - Forces a strict validation pass, rejecting payloads that contain extra unmapped attributes.
 * @key prune - Automatically purges legacy-only parameters from the final output frame after upcasting.
 * @key current - Active Release Lane Handler. Takes your pristine, current production structure with full code completion!
 * @key v1_ancestor - Ancestor Migration Bridge Handler. STRONGLY TYPED MATRIX MATCH: Pulls fields straight from yesterday's registered schema definition. Tapping 'value.' instantly opens full autocomplete!
 * @key default - The absolute fallback catch-all circuit breaker lane handler
 *
 */
export interface IXalorDriftContext<D extends keyof ISolidDriftRegistry, R> {
  /* prettier-ignore */ readonly currentKey: TExtractRegistryKeyName<ISolidDriftRegistry[D]['current']>;
  /* prettier-ignore */ readonly ancestralKey?: TExtractRegistryKeyName<ISolidDriftRegistry[D]['v1_ancestor']>;
  /* prettier-ignore */ readonly strict?: boolean;
  /* prettier-ignore */ readonly prune?: boolean;
  /* prettier-ignore */ readonly current: (value: ISolidDriftRegistry[D]['current']) => R;
  /* prettier-ignore */ readonly v1_ancestor: (value: ISolidDriftRegistry[D]['v1_ancestor']) => R;
  /* prettier-ignore */ readonly default: () => R;
}

/**
 * NOMINAL BRAND COMPILER ATTACHER
 *
 * ROLE:
 * Isolates the nominal branding intersection calculations away from function signatures.
 *
 * STRATEGY:
 * Evaluates the final computed shape 'R'. If 'R' perfectly matches a named type inside
 * your main registry, it appends the framework metadata tag. Otherwise, it yields a clean object.
 */
/* prettier-ignore */
type TApplyNominalBrand<R> = R & (TExtractRegistryKeyName<R> extends never 
  ? object 
  : { readonly [BRAND_SYMBOL]: ['Solid', TExtractRegistryKeyName<R>] }
);

/**
 * CATEGORY 5 MATCH: CENTRALIZED DRIFT EXECUTOR
 *
 * ROLE:
 * Clean, positionally aligned signature format ready for AOT compile-time rewrites.
 */
/* prettier-ignore */
export type TXalorDriftExecutor = <
  K extends keyof ISolidDriftRegistry,
  R extends Partial<ISolidDriftRegistry[K]['current']> = ISolidDriftRegistry[K]['current'],
>(
  payload: unknown,
  ctx: IXalorDriftContext<K, R>,
  targetLiveKeyStr?: keyof ISolidRegistry,
  targetOldKeyStr?: keyof ISolidRegistry,
  injectedKey?: K,
) => TApplyNominalBrand<R>;
