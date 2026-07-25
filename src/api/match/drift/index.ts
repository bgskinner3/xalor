import type {
  TApplyNominalBrand,
  IXalorDriftContext,
  TResolveDriftReturnConstraint,
  TTargetKeyName,
} from '../../../models/types';
import { XalethorService } from '../../../xalor-service';
import { assertDriftRegistryKey } from '../../../../shared';
import { markAsSolid, ensureGlobalVault } from '../../../utils';
import { BRAND_SYMBOL, isRecord } from '../../../../shared';
import { xalethorVaultDiagnostics } from '../../../xalor-service/vault-diagnostics';

// Holds long-lived, pre-allocated memory pointers for nominal tokens to keep memory flat
const brandTokenCache = new Map<string, [string, string]>();

/**
 * PUBLIC RUNTIME API: MATCH XALOR DRIFT
 *
 * Synchronously executes a single-pass backward-compatible type migration gateway.
 * Evaluates raw network payload profiles against historical blueprint ancestors and
 * upcasts them on the fly to match active production contract layout specifications.
 *
 * NOTE: Limits ancestral tracking depth strictly to a maximum ceiling of 1 generation back.
 *
 * @see {@link RuntimeApiCoreDocs.matchXalorDrift}
 * !!! FOR in depth notes on how we designed Drift
 * @see {@link RuntimeApiCoreDocs.matchXalorDriftPlan}
 *
 */
export function matchXalorDrift<K extends TActiveDriftRegistryKeys>(
  payload: unknown,
  ctx: IXalorDriftContext<K>,
  injectedKey?: K,
): TApplyNominalBrand<K, TResolveDriftReturnConstraint<K>> {
  ensureGlobalVault();
  assertDriftRegistryKey(injectedKey);

  if (!injectedKey) {
    return xalethorVaultDiagnostics.panic(
      'UNKNOWN_DRIFT_TOKEN',
      `[xalor] 🚨 GATEWAY BLOCK: 'matchXalorDrift' executed without compiled metadata properties.\n` +
        `Ensure your build-time transformer plugin is active.`,
    );
  }

  const activeShape = XalethorService.driftTrackingVault(injectedKey!);

  if (!ctx || !activeShape) {
    return xalethorVaultDiagnostics.panic(
      injectedKey!,
      `[xalor] 🚨 GATEWAY BLOCK: 'matchXalorDrift' executed without compiled metadata properties.\n` +
        `Ensure your build-time transformer plugin is active for key: ${injectedKey!}`,
    );
  }

  const resultPayload = XalethorService.executeDriftMatcher<K>(
    payload,
    ctx,
    injectedKey!,
  );

  if (isRecord(resultPayload)) {
    const keyString = String(injectedKey);
    let brandToken = brandTokenCache.get(keyString);

    if (!brandToken) {
      brandToken = ['Solid', keyString];
      brandTokenCache.set(keyString, brandToken);
    }

    Reflect.set(resultPayload, BRAND_SYMBOL, brandToken);

    /* prettier-ignore */
    if (markAsSolid<TTargetKeyName<K>, TResolveDriftReturnConstraint<K>>(resultPayload)) {
      return resultPayload; 
    }
  }

  return xalethorVaultDiagnostics.panic(
    injectedKey!,
    `[xalor] 🚨 Evolution layer merge failed structurally for contract key: ${injectedKey}`,
  );
}
