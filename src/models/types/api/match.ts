import type {
  TDeepMerge,
  TRecursiveReadonly,
  TExtractRegistryKeyName,
  TResolveInstanceGraph,
} from '../../../../shared';
import { BRAND_SYMBOL } from '../../../../shared';

// ====================================================================
// ====================================================================
// Composite TYPES
// ====================================================================
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
// DRIFT TYPES
// ====================================================================
// ====================================================================
/**
 * TITLE: DRIFT RETURN TYPE RESOLVER CONSTRAINT
 *
 * DESCRIPTION:
 * Centrally isolates the complex generic type reification return calculation bounds.
 * Maps your current production schema tokens down to their mutable, partial, and
 * fully aligned instance graph footprints natively, satisfying Commandment IX.
 *
 * @template K - The authoritative evolution tracking namespace token literal key.
 */
export type TResolveDriftReturnConstraint<K extends keyof ISolidDriftRegistry> =
  Partial<TResolveInstanceGraph<ISolidDriftRegistry[K]['current']>>;

/**
 *  MATCH: AUTOMATED DRIFT INFRASTRUCTURE PARAMETERS CONTRACT
 *
 * Progressive disclosure matrix enabling backward-compatible version matching.
 * Uses strict registry index lookups to guarantee 100% autocomplete safety.
 *
 * @template D         - Inferred centralized Evolution tracking namespace token key.
 * @template R         - Inferred custom application return type computed by your closures.
 * @property currentKey  - Active Production Target Key. Checked by the compiler to ensure it matches the modern string token stored inside your registry!
 * @property ancestralKey - Historical Target Key. Enforced purely through the static type graph to ensure it matches the legacy string token stored inside your registry, AND strictly prohibits cross-collision configurations by transforming into 'never' if assigned identically to today's active production key!
 * @property strict       - Forces a strict validation pass, rejecting payloads that contain extra unmapped attributes.
 * @property prune        - Automatically purges legacy-only parameters from the final output frame after upcasting.
 * @property current      - Active Release Lane Handler. Takes your pristine, current production structure with full code completion!
 * @property v1_ancestor  - Ancestor Migration Bridge Handler. STRONGLY TYPED MATRIX MATCH: Pulls fields straight from yesterday's registered schema definition. Tapping 'value.' instantly opens full autocomplete!
 * @property default      - The absolute fallback catch-all circuit breaker lane handler.
 */
export interface IXalorDriftContext<D extends keyof ISolidDriftRegistry, R> {
  /* prettier-ignore */
  readonly currentKey: TExtractRegistryKeyName<ISolidDriftRegistry[D]['current']>;
  /* prettier-ignore */
  readonly ancestralKey?: TExtractRegistryKeyName<ISolidDriftRegistry[D]['v1_ancestor']> extends TExtractRegistryKeyName<ISolidDriftRegistry[D]['current']> 
    ? never 
    : TExtractRegistryKeyName<ISolidDriftRegistry[D]['v1_ancestor']>;
  /* prettier-ignore */
  readonly strict?: boolean;
  /* prettier-ignore */
  readonly prune?: boolean;
  /* prettier-ignore */
  readonly current: (value: TResolveInstanceGraph<ISolidDriftRegistry[D]['current']>) => TResolveDriftReturnConstraint<D> & R;
  /* prettier-ignore */
  readonly v1_ancestor: (value: TResolveInstanceGraph<ISolidDriftRegistry[D]['v1_ancestor']>) => TResolveDriftReturnConstraint<D> & R;
  /* prettier-ignore */
  readonly default: () => TResolveDriftReturnConstraint<D> & R;
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
 *
 * @template R - The inferred raw computed object format arriving from application closures.
 */
export type TApplyNominalBrand<R> = R &
  (TExtractRegistryKeyName<R> extends never
    ? object
    : { readonly [BRAND_SYMBOL]: ['Solid', TExtractRegistryKeyName<R>] });

/**
 * MATCH: DRIFT EXECUTOR PARAMETERS TUPLE
 *
 * A rigid, positionally aligned parameter structure that defines the exact array frame data matrix.
 * This type unifies the signature contract between the AOT compilation layer and the runtime ports.
 *
 * @index 0 payload     - The raw, unverified incoming runtime payload container instance.
 * @index 1 ctx         - The developer-facing layout configuration matrix and handler closures.
 * @index 2 injectedKey - The authoritative evolution token string tracking identifier hardcoded by the compiler.
 */
export type TXalorDriftArgs<
  K extends keyof ISolidDriftRegistry,
  R extends TResolveDriftReturnConstraint<K> = TResolveDriftReturnConstraint<K>,
> = [payload: unknown, ctx: IXalorDriftContext<K, R>, injectedKey?: K];
/**
 *  MATCH: CENTRALIZED DRIFT EXECUTOR
 *
 * ROLE:
 * Clean, positionally aligned signature format ready for AOT compile-time rewrites.
 *
 * STRATEGY:
 * Provides a highly secure generic gateway used by the internal compilation pass
 * to safely track telemetry tokens while enforcing strict complete-model boundaries.
 */
/* prettier-ignore */
export type TXalorDriftExecutor = <
  K extends keyof ISolidDriftRegistry,
  R extends TResolveDriftReturnConstraint<K> = TResolveDriftReturnConstraint<K>,
>(
  ...args: TXalorDriftArgs<K, R>
) => TApplyNominalBrand<R>;
/**
 * COMPILATION BOUNDARY GUARD
 *
 * ROLE:
 * Anti-collision circuit breaker gating mechanism protecting local call-sites.
 *
 * STRATEGY:
 * Verifies if the incoming token K matches a valid, registered evolution branch.
 * If a developer types a rogue key or attempts an unmapped fallback declaration,
 * the context parameter instantly implodes into 'never' to block compilation.
 *
 * @template K       - The generic string tracking token literal evaluated at the call-site.
 * @template Context - The runtime operational layout mapping config contract passed to the function.
 */

export type TEnforceDriftUniqueness<K, Context> =
  K extends keyof ISolidDriftRegistry ? Context : never;
