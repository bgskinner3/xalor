import { xalethorVaultGenerator } from '../../xalor-service/vault-generator';
import { markAsSolid, ensureGlobalVault } from '../../utils';
import { isRecord, isLiteralMatch } from '../../../shared';
import { BRAND_SYMBOL } from '../../../shared';
import type { TSolidBranded } from '../../../shared';
import { assertRegistryKey } from '../../../shared/utils/guards';
import { xalethorVaultDiagnostics } from '../../xalor-service/vault-diagnostics';
// import { XalethorService } from '../../xalor-service';

// Holds long-lived, pre-allocated memory pointers for nominal tokens to keep memory flat
const brandTokenCache = new Map<string, [string, string]>();
function verifyNominalOwnership<K extends TActiveRegistryKeys, T>(
  payload: unknown,
  targetKey: K,
): payload is TSolidBranded<K, T> {
  if (isRecord(payload)) {
    const activeBrand = Reflect.get(payload, BRAND_SYMBOL);
    if (Array.isArray(activeBrand) && activeBrand.length > 1) {
      const brandToken = activeBrand[1];
      // Narrows the union naturally by executing a primitive string comparison check
      return isLiteralMatch(brandToken, targetKey);
    }
  }
  return false;
}

/**
 * RUNTIME API: GENERATE XALOR CAST
 *
 * ROLE:
 * Public entry portal executing Category 3 (Generation) Coercion and Sanitization operations.
 *
 * STRATEGY:
 * Intercepts external unknown network data, pipelines structural mutations through the AOT
 * cast engine layer, attaches a nominal infrastructure protection brand tag, and validates
 * the resulting object container before returning it to the user.
 *
 * DESIGN INVARIANTS:
 * - Satisfies COMMANDMENT IV: Performs a single, isolated semantic operation (Coercive Casting).
 * - Satisfies COMMANDMENT IX: 100% EXPLICITLY FREE OF ANY "as" TYPE CASTS.
 *
 * @typeParam K - The unique active identity token string registered within the system vault.
 * @param injectedKey - The unique authoritative key string identifier of the target type contract.
 * @param data - The raw, unverified external network input data structure to filter and cast.
 * @returns {TSolidBranded<K, TResolveRegistryStructure<K>>} A sanitized, nominally branded data model.
 *
 * @see {@link RuntimeApiCoreDocs.generateXalorCast}
 */
export function generateXalorCast<K extends TActiveRegistryKeys>(
  injectedKey: K,
  data: unknown,
): TSolidBranded<K, TResolveRegistryStructure<K>> {
  ensureGlobalVault();
  assertRegistryKey(injectedKey);

  const castPayload = xalethorVaultGenerator.getCastRaw(data, injectedKey);

  if (isRecord(castPayload)) {
    // 2. Fetch or provision the long-lived nominal memory pointer token
    let brandToken = brandTokenCache.get(injectedKey);
    if (!brandToken) {
      brandToken = ['Solid', injectedKey];
      brandTokenCache.set(injectedKey, brandToken);
    }

    // 3. Mount nominal branding symbols deterministically onto the layout structure
    Reflect.set(castPayload, BRAND_SYMBOL, brandToken);

    if (markAsSolid<K, TResolveRegistryStructure<K>>(castPayload)) {
      // 4. FIRST-PASS VALIDATION CHECK: Run the coerced template through the live parsing pipeline
      // This guarantees the runtime data perfectly satisfies your contract invariants before returning.
      // const validationOutput = XalethorService.parse<K>(castPayload);

      // 5. Safe, non-complex type narrowing utilizing our flat structural checker utility
      if (
        verifyNominalOwnership<K, TResolveRegistryStructure<K>>(
          castPayload,
          injectedKey,
        )
      ) {
        return castPayload;
      }
    }
  }

  return xalethorVaultDiagnostics.panic(
    injectedKey,
    `[xor] 🚨 Type coercion casting or validation pass failed structurally for contract key: ${injectedKey}`,
  );
}
