import { xalethorVaultValidation } from '../../xalor-service/vault-validation';
import { xalethorVaultDiagnostics } from '../../xalor-service/vault-diagnostics';
import { markAsSolid, ensureGlobalVault } from '../../utils';
import { BRAND_SYMBOL } from '../../../shared';
import type { TSolidBranded } from '../../../shared';
import {
  isDefined,
  isRecord,
  assertRegistryKey,
} from '../../../shared/utils/guards';

// Holds long-lived, pre-allocated memory pointers for your nominal tokens
const brandTokenCache = new Map<string, [string, string]>();

/**
 * RUNTIME API: VALIDATE XALOR PARSE
 *
 * Synchronously processes data ingress contracts. Evaluates raw incoming physical data
 * shapes instantly against precompiled Vault registry blueprints and stamps your cryptographic brand.
 *
 * COMPLIANCE METRICS:
 * - COMMANDMENT I & III: Resolves structural contracts exclusively via the pre-compiled Registry.
 * - COMMANDMENT IV: Performs a single, isolated semantic operation (Synchronous Schema Parsing).
 * - COMMANDMENT VIII: Zero runtime strategy allocations or nested middleman traversal layers.
 * - COMMANDMENT IX: Zero 'any' variables, zero 'as' type assertions, and zero 'switch' branching.
 *
 * @example
 * ```ts
 * const verifiedUser = validateXalorParse('USER_ACCOUNT', rawPayload);
 * console.log(verifiedUser.username); // Fully typed and nominally branded!
 * ```
 *
 * @see {@link RuntimeApiCoreDocs.validateXalorParse}
 */
export function validateXalorParse<K extends TActiveRegistryKeys>(
  data: unknown,
  injectedKey?: K,
): TSolidBranded<K, TResolveRegistryStructure<K>> {
  ensureGlobalVault();
  assertRegistryKey(injectedKey);

  if (!isDefined(data)) {
    return xalethorVaultDiagnostics.panic(injectedKey);
  }

  const isValid = xalethorVaultValidation.validateShapeByKey(data, injectedKey);

  if (isValid && isRecord(data)) {
    let brandToken = brandTokenCache.get(injectedKey);
    if (!brandToken) {
      brandToken = ['Solid', injectedKey];
      brandTokenCache.set(injectedKey, brandToken);
    }

    Reflect.set(data, BRAND_SYMBOL, brandToken);

    if (markAsSolid<K, TResolveRegistryStructure<K>>(data)) {
      return data;
    }
  }

  return xalethorVaultDiagnostics.panic(injectedKey);
}
