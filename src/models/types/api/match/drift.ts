import type {
  TSolidBranded,
  TExtractRegistryKeyName,
  TResolveInstanceGraph,
  TFlattenStructure,
  TDeepDotPaths,
} from '../../../../../shared';
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
    value: TResolveModernInstance<D>,
  ) => TResolveModernInstance<D>;

  // 🎯 PHASE 2 / ANCESTRAL PASS: Processes yesterday's layouts within yesterday's types
  readonly v1_ancestor: (
    value: TResolveAncestralInstance<D>,
  ) => TResolveAncestralInstance<D>;

  // 🎯 PHASE 4 / CIRCUIT BREAKER: Receives the raw record, returns a valid modern shape
  readonly default?: (
    rawPayload: TResolveDriftReturnConstraint<D>,
  ) => TResolveDriftReturnConstraint<D>;
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

/**
 *
 *
 *
 *
 *
 *
 *
 *
 */
// type TSealedPartial<T> = {
//   [K in keyof T]?: T[K];
// } & {
//   [K in keyof T as never]: never;
// };
//  type TStrictEra<Expected, Actual> = Expected & {
//   [K in keyof Actual]: K extends keyof Expected ? Actual[K] : never;
// };
// type TEnforceExact<Expected, Actual> = Expected & {
//   [K in keyof Actual]: K extends keyof Expected ? Actual[K] : never;
// };
// type TStrictReturn<Expected, Actual> = Expected & {
//   [K in keyof Actual]: K extends keyof Expected ? Actual[K] : never;
// };
/**
 * MATCH: DRIFT EXECUTOR PARAMETERS TUPLE
 * Explicit, positionally aligned array frame layout matching your Loop 2 rewriter output.
 */
// export type TXalorDriftArgs<K extends TActiveDriftRegistryKeys> = [
//   payload: unknown,
//   ctx: IXalorDriftContext<K>,
//   injectedKey?: K,
// ];

/**
 * MATCH: CENTRALIZED DRIFT EXECUTOR PUBLIC API SIGNATURE
 */
// export type TXalorDriftExecutor = <K extends TActiveDriftRegistryKeys>(
//   ...args: TXalorDriftArgs<K>
// ) => TApplyNominalBrand<K, TResolveDriftReturnConstraint<K>>;
// export type TEnforceContextPerimeter<T, ObjectLiteral> = {
//   [K in keyof ObjectLiteral]: K extends keyof T ? ObjectLiteral[K] : never;
// };
