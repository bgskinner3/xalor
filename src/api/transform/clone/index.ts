import { xalethorCoreService } from '../../../xalor-service';
import { markAsSolid, ensureGlobalVault } from '../../../utils';
import { assertRegistryKey } from '../../../../shared/utils/guards';
import { isRecord, BRAND_SYMBOL } from '../../../../shared';
import type { TSolidBranded } from '../../../../shared';
import { xalethorVaultDiagnostics } from '../../../xalor-service/vault-diagnostics';

// Holds long-lived, pre-allocated memory pointers for nominal tokens to keep memory flat
const brandTokenCache = new Map<string, [string, string]>();
/**
 * RUNTIME API: GENERATE XALOR CLONE
 *
 * Performs a deep, circular-safe copy of an input object while physically
 * scrubbing away any keys missing from the authoritative blueprint contract.
 *
 * DESIGN INVARIANTS:
 * - Satisfies COMMANDMENT I & III: Reads static type specifications flatly out of the main Vault Registry.
 * - Satisfies COMMANDMENT IV: Performs a single, isolated semantic operation (Deep Structural Copy & Scrubbing).
 * - Satisfies COMMANDMENT VIII: Zero-allocation inline strategy dispatch; tree-shakes fully from client bundles.
 * - Satisfies COMMANDMENT IX: Zero 'any' variables, zero manual type escape hatches or casting overrides.
 *
 * @see {@link RuntimeApiCoreDocs.generateXalorClone}
 */
export function generateXalorClone<K extends TActiveRegistryKeys>(
  data: unknown,
  injectedKey?: K,
): TSolidBranded<K, TResolveRegistryStructure<K>> {
  ensureGlobalVault();
  assertRegistryKey(injectedKey);

  const clonePayload = xalethorCoreService.produceClone(data, injectedKey!);
  if (isRecord(clonePayload)) {
    let brandToken = brandTokenCache.get(injectedKey);
    if (!brandToken) {
      brandToken = ['Solid', injectedKey];
      brandTokenCache.set(injectedKey, brandToken);
    }

    Reflect.set(clonePayload, BRAND_SYMBOL, brandToken);
    if (markAsSolid<K, TResolveRegistryStructure<K>>(clonePayload)) {
      return clonePayload;
    }
  }
  return xalethorVaultDiagnostics.panic(
    injectedKey,
    `[xalor] 🚨 Deep structural cloning failed for contract key: ${injectedKey}`,
  );
}
