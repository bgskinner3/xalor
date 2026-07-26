import { xalethorCoreService } from '../../xalor-service';
import { markAsSolid, ensureGlobalVault } from '../../utils';
import { BRAND_SYMBOL } from '../../../shared';
import type {
  TSolidSafeParseSuccess,
  TSolidSafeParseFailure,
} from '../../models/types';
import {
  isDefined,
  isRecord,
  assertRegistryKey,
} from '../../../shared/utils/guards';
import type { TExpandUnionStructure } from '../../../shared';

// 🏎️ THE ZERO-ALLOCATION BRAND CACHE MATRIX
// Holds long-lived, pre-allocated memory pointers for your nominal tokens
const brandTokenCache = new Map<string, [string, string]>();

/**
 * RUNTIME API: VALIDATE XALOR SAFE PARSE
 *
 * Synchronously processes data ingress contracts without exception trapping.
 * Evaluates raw incoming physical data shapes instantly against precompiled Vault
 * registry blueprints and returns a zero-overhead discriminated union payload structure.
 *
 * COMPLIANCE METRICS:
 * - COMMANDMENT I & III: Resolves structural contracts exclusively via the pre-compiled Registry.
 * - COMMANDMENT IV: Performs a single, isolated semantic operation (Synchronous Zero-Exception Parsing).
 * - COMMANDMENT VIII: Zero runtime strategy exceptions or stack-unwinding middleman frameworks.
 * - COMMANDMENT IX: Zero 'any' variables, zero unchecked assertions, and zero 'switch' branching.
 *
 * @example
 * ```ts
 * const parseResult = validateXalorSafeParse(rawPayload, 'USER_ACCOUNT');
 * if (parseResult.success) {
 *   console.log(parseResult.data.username); // Nominally branded!
 * }
 * ```
 *
 * @see {@link RuntimeApiCoreDocs.validateXalorSafeParse}
 */
export function validateXalorSafeParse<K extends TActiveRegistryKeys>(
  data: unknown,
  injectedKey?: K,
): TExpandUnionStructure<TSolidSafeParseSuccess<K> | TSolidSafeParseFailure> {
  ensureGlobalVault();
  assertRegistryKey(injectedKey);

  if (!isDefined(data) || !isDefined(injectedKey)) {
    return {
      success: false,
      data: null,
      errors: [
        {
          key: injectedKey,
          pathSnapshot: [],
          errorKey: 'OBJECT_VALIDATION_TYPE_MISMATCH',
          received: data,
        },
      ],
    };
  }

  const evaluation = xalethorCoreService.validateShapeByKeySafe(
    data,
    injectedKey,
  );

  if (evaluation.isValid && isRecord(data)) {
    let brandToken = brandTokenCache.get(injectedKey);
    if (!brandToken) {
      brandToken = ['Solid', injectedKey];
      brandTokenCache.set(injectedKey, brandToken);
    }

    Reflect.set(data, BRAND_SYMBOL, brandToken);

    if (markAsSolid<K, TResolveRegistryStructure<K>>(data)) {
      return {
        success: true,
        data: data,
        errors: null,
      };
    }
  }

  return {
    success: false,
    data: null,
    errors: evaluation.errors ?? [],
  };
}
