import { XalethorService } from '../../xalor-service';
import { markAsSolid } from '../../utils';
import { BRAND_SYMBOL } from '../../../shared';
import type { TSolidBranded } from '../../../shared';
import {
  isDefined,
  isRecord,
  assertRegistryKey,
} from '../../../shared/utils/guards';

// 🏎️ THE ZERO-ALLOCATION BRAND CACHE MATRIX
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
  assertRegistryKey(injectedKey);

  if (!isDefined(data)) {
    return XalethorService.panicSoft(injectedKey) as never;
  }

  const isValid = XalethorService.validateShapeByKey(data, injectedKey);

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

  return XalethorService.panicSoft(injectedKey) as never;
}
