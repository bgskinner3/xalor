import type {
  TResolveInstanceGraph,
  TFlattenStructure,
  TDeepDotPaths,
  TPrettify,
} from '../../../../../shared';
import type { TXalorMatchDriftKeys } from '../../error-types';
import type { TDriftFillMode } from './base-types';
// import { BRAND_SYMBOL } from '../../../../../shared';
type TCollapseKeyTooltip<T> = keyof ISolidRegistry | T;
type TOnlyRequiredKeys<T> = {
  [K in keyof T as object extends Pick<T, K> ? never : K]: T[K];
};
// ====================================================================
// SECTION 1: CORE SCHEMA GRAPH RESOLUTION ENGINE
// ====================================================================

type TResolveCurrentDriftKey<D extends TActiveDriftRegistryKeys> =
  object extends ISolidDriftRegistry
    ? keyof ISolidRegistry
    : D extends keyof ISolidDriftRegistry
      ? TCollapseKeyTooltip<ISolidDriftRegistry[D]['current']>
      : keyof ISolidRegistry;

type TResolveAncestralDriftKey<D extends TActiveDriftRegistryKeys> =
  object extends ISolidDriftRegistry
    ? keyof ISolidRegistry
    : D extends keyof ISolidDriftRegistry
      ? ISolidDriftRegistry[D]['v1_ancestor'] extends ISolidDriftRegistry[D]['current']
        ? never
        : TCollapseKeyTooltip<ISolidDriftRegistry[D]['v1_ancestor']>
      : keyof ISolidRegistry;

/* prettier-ignore */
export type TResolveModernInstance<K extends TActiveDriftRegistryKeys> = TResolveInstanceGraph<
  K extends keyof ISolidDriftRegistry
    ? ISolidDriftRegistry[K]['current'] extends keyof ISolidRegistry
      ? ISolidRegistry[ISolidDriftRegistry[K]['current']]
      : ISolidDriftRegistry[K]['current']
    : never
>;

/* prettier-ignore */
export type TResolveAncestralInstance<K extends TActiveDriftRegistryKeys> = TResolveInstanceGraph<
  K extends keyof ISolidDriftRegistry
    ? ISolidDriftRegistry[K]['v1_ancestor'] extends keyof ISolidRegistry
      ? ISolidRegistry[ISolidDriftRegistry[K]['v1_ancestor']]
      : ISolidDriftRegistry[K]['v1_ancestor']
    : never
>;

/* prettier-ignore */
export type TResolveDriftReturnConstraint<K extends TActiveDriftRegistryKeys> = TFlattenStructure<
  TResolveModernInstance<K> & Partial<TResolveAncestralInstance<K>>
>;
// ====================================================================
// SECTION 2: TELEMETRY HOOK & INTERCEPTOR PAYLOADS
// ====================================================================
export interface IXalorSystemDriftPayload {
  readonly rule: TXalorMatchDriftKeys;
  readonly customMessage?: string;
}

export interface IXalorCustomDriftPayload {
  readonly rule?: never;
  readonly customMessage: string;
}

/**
 * 🎯 UNIFIED ERROR CONTRACT
 * Enforces an authoritative system ledger rule by default unless explicitly overridden.
 */
/* prettier-ignore */
export type TXalorDriftErrorPayload<
  T extends IXalorSystemDriftPayload | IXalorCustomDriftPayload = IXalorSystemDriftPayload,
> = T;
/* prettier-ignore */
export type TXalorDriftErrorHandler = <
  T extends IXalorSystemDriftPayload | IXalorCustomDriftPayload = IXalorSystemDriftPayload,
>(
  payload: TXalorDriftErrorPayload<T>,
) => void;

// ====================================================================
// SECTION 3: RECOVERY & AUTOMATED FILLING MATRICES
// ====================================================================

export interface IXalorAutomatedFillContext {
  /** @default 'defaultFill' */
  readonly mode: TDriftFillMode;
  readonly customFill?: never;
}

export interface IXalorCustomFillContext<D extends TActiveDriftRegistryKeys> {
  readonly mode: 'custom';
  readonly customFill: TOnlyRequiredKeys<TResolveDriftReturnConstraint<D>>;
}

export type TDefaultTestConfig<D extends TActiveDriftRegistryKeys> =
  IXalorAutomatedFillContext | IXalorCustomFillContext<D>;
// ====================================================================
// SECTION 4: UNIFIED PORTAL PARAMETER CONTEXT (THE BLUEPRINT)
// ====================================================================
/**
 * 🛡️ MATCH: AUTOMATED DRIFT INFRASTRUCTURE PARAMETERS CONTRACT
 * Centralized governance parameter specification managing Phase 1, Phase 2,
 * Phase 3, and Phase 4 execution lanes point-free.
 */
export interface IXalorDriftContext<D extends TActiveDriftRegistryKeys> {
  /* prettier-ignore */ readonly currentKey: TResolveCurrentDriftKey<D>;
  /* prettier-ignore */ readonly ancestralKey: TResolveAncestralDriftKey<D>;

  /* prettier-ignore */ readonly strict?: boolean;
  /* prettier-ignore */ readonly omit?: TDeepDotPaths<TResolveModernInstance<D>>[];

  /* prettier-ignore */ readonly current: (value: TResolveDriftReturnConstraint<D>) => TResolveDriftReturnConstraint<D>;
  /* prettier-ignore */ readonly v1_ancestor: (value: TResolveAncestralInstance<D>) => TResolveAncestralInstance<D>;

  /* prettier-ignore */ readonly default?: TDefaultTestConfig<D>;
  /* prettier-ignore */ readonly onError?: TXalorDriftErrorHandler;
}

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// ====================================================================
// DRIFT TYPES (THE CERTIFIED COMPILATION MATRIX)
// ====================================================================

// export type TResolveModernInstance<K extends TActiveDriftRegistryKeys> =
//   TResolveInstanceGraph<
//     K extends keyof ISolidDriftRegistry
//       ? ISolidDriftRegistry[K]['current'] extends keyof ISolidRegistry
//         ? ISolidRegistry[ISolidDriftRegistry[K]['current']]
//         : ISolidDriftRegistry[K]['current']
//       : never
//   >;

// export type TResolveAncestralInstance<K extends TActiveDriftRegistryKeys> =
//   TResolveInstanceGraph<
//     K extends keyof ISolidDriftRegistry
//       ? ISolidDriftRegistry[K]['v1_ancestor'] extends keyof ISolidRegistry
//         ? ISolidRegistry[ISolidDriftRegistry[K]['v1_ancestor']]
//         : ISolidDriftRegistry[K]['v1_ancestor']
//       : never
//   >;

// export type TResolveDriftReturnConstraint<K extends TActiveDriftRegistryKeys> =
//   TFlattenStructure<
//     TResolveModernInstance<K> & Partial<TResolveAncestralInstance<K>>
//   >;
// ====================================================================
// DRIFT OnError Types
// ====================================================================
// interface IXalorSystemDriftPayload {
//   readonly rule: TXalorMatchDriftKeys;
//   readonly customMessage?: string;
// }

// // 🎨 The Custom Override Shape: Rule is locked out. Custom message is mandatory.
// interface IXalorCustomDriftPayload {
//   readonly rule?: never;
//   readonly customMessage: string;
// }

// /**
//  * 🎯 The Unified Payload Definition
//  * Defaults explicitly to the System ledger shape if no specific variant type parameter is passed.
//  */
// type TXalorDriftErrorPayload<
//   T extends IXalorSystemDriftPayload | IXalorCustomDriftPayload =
//     IXalorSystemDriftPayload,
// > = T;

// ====================================================================
// DRIFT DEFAULT TYPES
// ====================================================================

// // Variant A: Automated Filling Core Lanes
// export interface IXalorAutomatedFillContext {
//   readonly mode: TDriftFillMode;
//   readonly customFill?: never; // Explicitly locked out
// }

// // Variant B: Custom Filling Lane (Opens a mandatory required-properties sub-object literal)
// export interface IXalorCustomFillContext<D extends TActiveDriftRegistryKeys> {
//   readonly mode: 'custom';
//   readonly customFill: TOnlyRequiredKeys<TResolveDriftReturnConstraint<D>>;
// }

/**
 * MATCH: AUTOMATED DRIFT INFRASTRUCTURE PARAMETERS CONTRACT
 */
// export interface IXalorDriftContext<D extends TActiveDriftRegistryKeys> {
//   readonly currentKey: object extends ISolidDriftRegistry
//     ? keyof ISolidRegistry
//     : D extends keyof ISolidDriftRegistry
//       ? TCollapseKeyTooltip<ISolidDriftRegistry[D]['current']>
//       : keyof ISolidRegistry;

//   readonly ancestralKey: object extends ISolidDriftRegistry
//     ? keyof ISolidRegistry
//     : D extends keyof ISolidDriftRegistry
//       ? ISolidDriftRegistry[D]['v1_ancestor'] extends ISolidDriftRegistry[D]['current']
//         ? never
//         : TCollapseKeyTooltip<ISolidDriftRegistry[D]['v1_ancestor']>
//       : keyof ISolidRegistry;

//   readonly strict?: boolean;
//   readonly omit?: TDeepDotPaths<TResolveModernInstance<D>>[];

//   // 🎯 PHASE 1 / HOT PATH: Processes modern payloads cleanly
//   readonly current: (
//     value: TResolveDriftReturnConstraint<D>,
//   ) => TResolveDriftReturnConstraint<D>;

//   // 🎯 PHASE 2 / ANCESTRAL PASS: Processes yesterday's layouts within yesterday's types
//   readonly v1_ancestor: (
//     value: TResolveAncestralInstance<D>,
//   ) => TResolveAncestralInstance<D>;

//   // 🎯 PHASE 4 / CIRCUIT BREAKER: Receives the raw record, returns a valid modern shape
//   // readonly default?: (
//   //   rawPayload: TResolveDriftReturnConstraint<D>,
//   // ) => TResolveDriftReturnConstraint<D>;

//   readonly default?: IXalorAutomatedFillContext | IXalorCustomFillContext<D>;

//   readonly onError?: <
//     T extends IXalorSystemDriftPayload | IXalorCustomDriftPayload =
//       IXalorSystemDriftPayload,
//   >(
//     payload: TXalorDriftErrorPayload<T>,
//   ) => void;
// }
