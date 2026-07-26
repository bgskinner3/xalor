import type {
  TSolidBranded,
  TExtractRegistryKeyName,
  TSolidShape,
} from '../../../../../shared';
import type { TXalorMatchDriftKeys } from '../../error-types';
import type { IXalorDriftContext } from './drift';
// ====================================================================
// ====================================================================
// DRIFT TYPES
// ====================================================================
// ====================================================================

/**
 * RETUNR TYPE FOR RUNTIME API
 */
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
 * Safe Verification Handshake:
 * Extract the exact target model string literal type purely out of your drift registry.
 * This bypasses variable type widening, matching TApplyNominalBrand exactly!
 */
export type TTargetKeyName<K extends TActiveDriftRegistryKeys> =
  object extends ISolidDriftRegistry
    ? string
    : K extends keyof ISolidDriftRegistry
      ? TExtractRegistryKeyName<ISolidDriftRegistry[K]['current']>
      : string;
// =============================================================================
// =============================================================================
// XALOR DRIFT SERVICE TYPE FUNCTIONS
// =============================================================================
// =============================================================================
export type TMissingKeysStructure = {
  readonly required: string[];
  readonly optional: string[];
};

// ====================================================================
// ====================================================================
// ====================================================================
// DRIFT DEFAULT Types
// ====================================================================
// ====================================================================
// ====================================================================
export type TDriftFillMode =
  'defaultFill' | 'mockFill' | 'castFill' | 'custom' | 'none';

export type TDriftBuildMapper = {
  /* prettier-ignore */ readonly defaultFill: (shape: TSolidShape, workingFrame: Record<string, unknown>, depth?: number) => Record<string, unknown>;
  /* prettier-ignore */ readonly mockFill: (shape: TSolidShape, workingFrame: Record<string, unknown>, depth?: number) => Record<string, unknown>;
  /* prettier-ignore */ readonly castFill: (shape: TSolidShape, workingFrame: Record<string, unknown>, depth?: number) => Record<string, unknown>;
};
// ====================================================================
// ====================================================================
// ====================================================================
// DRIFT ERROR Types
// ====================================================================
// ====================================================================
// ====================================================================
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
