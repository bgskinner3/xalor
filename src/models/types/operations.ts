import type {
  TSolidBranded,
  TDeepMerge,
  TRecursiveReadonly,
} from '../../../shared';
import type { TGeneratorXalorModes } from '../../../shared';

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

export interface IXalorMergeContext<T> {
  /** The baseline target object graph retrieved from memory, state, or database storage */
  readonly dataOne: unknown;
  /** The incoming secondary partial delta payload patch containing property overrides */
  readonly dataTwo: unknown;
  /** Optional: Explicit root-field extraction retention list (Zod-like pick) */
  readonly pick?: Array<keyof T | string>;

  /** Optional: Root property exclusion pruning list (Zod-like omit) */
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
// MAIN MAPPER SETUP
// ====================================================================
// ====================================================================
/* prettier-ignore */
// export type TMatchXalorResultMap<SingleKey extends keyof ISolidRegistry, CompositeKeys extends TMax8CompositeKeys> = {
//   readonly composite: ResolveCompositeIntersection<CompositeKeys>;
//   readonly reduce: TDeepWriteable<ISolidRegistry[SingleKey]>;
//   readonly intent: TPrettify<ISolidRegistry[SingleKey]>;
//   readonly drift: TPrettify<TRecursivePartial<ISolidRegistry[SingleKey]>>;
// };
// /* prettier-ignore */
// export type TMatchXalorReturn<
//   K extends keyof ISolidRegistry,
//   M extends TMatchXalorModes,
//   CompositeKeys extends TMax8CompositeKeys = readonly [],
// > = TMatchXalorResultMap<K,M extends 'composite' ? CompositeKeys : readonly []>[M];

// /* prettier-ignore */
// export type TMatchStrategyEngine<K extends keyof ISolidRegistry,CompositeKeys extends TMax8CompositeKeys = readonly []> = {
//   readonly [Mode in TMatchXalorModes]: (
//     key: Mode extends 'composite' ? CompositeKeys : K,
//     payload: unknown,
//   ) => TMatchXalorResultMap<Mode extends 'composite' ? never : K,Mode extends 'composite' ? CompositeKeys : readonly []>[Mode];
// };
