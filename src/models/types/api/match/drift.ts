import type {
  TSolidBranded,
  TExtractRegistryKeyName,
  TResolveInstanceGraph,
  TFlattenStructure,
  TDeepDotPaths,
} from '../../../../../shared';
import type { TXalorMatchDriftKeys } from '../../error-types';
// import { BRAND_SYMBOL } from '../../../../../shared';
type TCollapseKeyTooltip<T> = keyof ISolidRegistry | T;

// ====================================================================
// ====================================================================
// DRIFT TYPES
// ====================================================================
// ====================================================================

// ====================================================================
// DRIFT TYPES (THE CERTIFIED COMPILATION MATRIX)
// ====================================================================

export type TResolveModernInstance<K extends TActiveDriftRegistryKeys> =
  TResolveInstanceGraph<
    K extends keyof ISolidDriftRegistry
      ? ISolidDriftRegistry[K]['current'] extends keyof ISolidRegistry
        ? ISolidRegistry[ISolidDriftRegistry[K]['current']]
        : ISolidDriftRegistry[K]['current']
      : never
  >;

export type TResolveAncestralInstance<K extends TActiveDriftRegistryKeys> =
  TResolveInstanceGraph<
    K extends keyof ISolidDriftRegistry
      ? ISolidDriftRegistry[K]['v1_ancestor'] extends keyof ISolidRegistry
        ? ISolidRegistry[ISolidDriftRegistry[K]['v1_ancestor']]
        : ISolidDriftRegistry[K]['v1_ancestor']
      : never
  >;

export type TResolveDriftReturnConstraint<K extends TActiveDriftRegistryKeys> =
  TFlattenStructure<
    TResolveModernInstance<K> & Partial<TResolveAncestralInstance<K>>
  >;
// ====================================================================
// DRIFT OnError Types
// ====================================================================
interface IXalorSystemDriftPayload {
  readonly rule: TXalorMatchDriftKeys;
  readonly customMessage?: string;
}

// 🎨 The Custom Override Shape: Rule is locked out. Custom message is mandatory.
interface IXalorCustomDriftPayload {
  readonly rule?: never;
  readonly customMessage: string;
}
/**
 * 🚨 DEFINITIVE DRIFT ERROR STRUCTURAL MATRIX
 * Formats the strict, positional parameter payload blueprint for the error backbone.
 */
export interface IDriftErrorParams<K extends TActiveDriftRegistryKeys> {
  readonly ctx?: IXalorDriftContext<K>;
  readonly injectedKey?: K | string;
  readonly ruleKey?: TXalorMatchDriftKeys;
  readonly customContextMessage?: string;
  readonly caughtError?: unknown;
}

/**
 * 🛠️ CENTRALIZED ERROR INTERCEPTOR SIGNATURE
 * Evaluates parameter objects point-free across standard dynamic gateways.
 */
export type TDriftErrorInterceptor = <
  K extends TActiveDriftRegistryKeys = TActiveDriftRegistryKeys,
>(
  params: IDriftErrorParams<K>,
) => never;

/**
 * 🎯 The Unified Payload Definition
 * Defaults explicitly to the System ledger shape if no specific variant type parameter is passed.
 */
type TXalorDriftErrorPayload<
  T extends IXalorSystemDriftPayload | IXalorCustomDriftPayload =
    IXalorSystemDriftPayload,
> = T;
/**
 * MATCH: AUTOMATED DRIFT INFRASTRUCTURE PARAMETERS CONTRACT
 */
export interface IXalorDriftContext<D extends TActiveDriftRegistryKeys> {
  readonly currentKey: object extends ISolidDriftRegistry
    ? keyof ISolidRegistry
    : D extends keyof ISolidDriftRegistry
      ? TCollapseKeyTooltip<ISolidDriftRegistry[D]['current']>
      : keyof ISolidRegistry;

  readonly ancestralKey: object extends ISolidDriftRegistry
    ? keyof ISolidRegistry
    : D extends keyof ISolidDriftRegistry
      ? ISolidDriftRegistry[D]['v1_ancestor'] extends ISolidDriftRegistry[D]['current']
        ? never
        : TCollapseKeyTooltip<ISolidDriftRegistry[D]['v1_ancestor']>
      : keyof ISolidRegistry;

  readonly strict?: boolean;
  readonly omit?: TDeepDotPaths<TResolveModernInstance<D>>[];

  // 🎯 PHASE 1 / HOT PATH: Processes modern payloads cleanly
  readonly current: (
    value: TResolveDriftReturnConstraint<D>,
  ) => TResolveDriftReturnConstraint<D>;

  // 🎯 PHASE 2 / ANCESTRAL PASS: Processes yesterday's layouts within yesterday's types
  readonly v1_ancestor: (
    value: TResolveAncestralInstance<D>,
  ) => TResolveAncestralInstance<D>;

  // 🎯 PHASE 4 / CIRCUIT BREAKER: Receives the raw record, returns a valid modern shape
  readonly default?: (
    rawPayload: TResolveDriftReturnConstraint<D>,
  ) => TResolveDriftReturnConstraint<D>;

  readonly onError?: <
    T extends IXalorSystemDriftPayload | IXalorCustomDriftPayload =
      IXalorSystemDriftPayload,
  >(
    payload: TXalorDriftErrorPayload<T>,
  ) => void;
}

export type TApplyNominalBrand<
  D extends TActiveDriftRegistryKeys,
  R,
> = TSolidBranded<
  object extends ISolidDriftRegistry
    ? string
    : D extends keyof ISolidDriftRegistry
      ? TExtractRegistryKeyName<ISolidDriftRegistry[D]['current']>
      : string,
  R
>;
/**
 * 4. Safe Verification Handshake:
 * Extract the exact target model string literal type purely out of your drift registry.
 * This bypasses variable type widening, matching TApplyNominalBrand exactly!
 */
export type TTargetKeyName<K extends TActiveDriftRegistryKeys> =
  object extends ISolidDriftRegistry
    ? string
    : K extends keyof ISolidDriftRegistry
      ? TExtractRegistryKeyName<ISolidDriftRegistry[K]['current']>
      : string;
