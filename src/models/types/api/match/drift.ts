import type {
  TResolveInstanceGraph,
  TFlattenStructure,
  TDeepDotPaths,
  TDeepRequiredFill,
} from '../../../../../shared';
import type { TXalorMatchDriftKeys } from '../../error-types';
import type { TDriftFillMode } from './base-types';
// import { BRAND_SYMBOL } from '../../../../../shared';
type TCollapseKeyTooltip<T> = keyof ISolidRegistry | T;

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
  readonly mode?: Exclude<TDriftFillMode, 'custom'>;
  readonly customFill?: never;
}

export interface IXalorCustomFillContext<D extends TActiveDriftRegistryKeys> {
  readonly mode: 'custom';
  readonly customFill: TDeepRequiredFill<TResolveDriftReturnConstraint<D>>;
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
