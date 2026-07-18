import { xalethorVaultGenerator } from '../../xalor-service/vault-generator';
import { markAsSolid, ensureGlobalVault } from '../../utils';
import { assertRegistryKey } from '../../../shared/utils/guards';
import { BRAND_SYMBOL, isRecord, hasKey } from '../../../shared';
import type { TSolidBranded } from '../../../shared';
import { xalethorVaultDiagnostics } from '../../xalor-service/vault-diagnostics';

// Holds long-lived, pre-allocated memory pointers for nominal tokens to keep memory flat
const brandTokenCache = new Map<string, [string, string]>();

/**
 * RUNTIME API: GENERATE XALOR MOCK
 *
 * Public entry portal executing Category 3 (Generation) Mock operations.
 * Instantiates a type contract blueprint populated with realistic random data.
 *
 * DESIGN INVARIANTS:
 * - Satisfies COMMANDMENT IV: Performs a single, isolated semantic operation (Mock Generation).
 * - Satisfies COMMANDMENT IX: 100% EXPLICITLY FREE OF ANY "as" TYPE CASTS.
 *
 * @example
 * ```ts
 * const fakeUser = generateXalorMock('USER_ACCOUNT');
 * console.log(fakeUser.username); // "abcde12345" -> Random high-entropy data string!
 * ```
 * @see {@link RuntimeApiCoreDocs.generateXalorMock}
 */
export function generateXalorMock<
  K extends TActiveRegistryKeys = TActiveRegistryKeys,
>(injectedKey?: K): TSolidBranded<K, TResolveRegistryStructure<K>> {
  ensureGlobalVault();
  assertRegistryKey(injectedKey);

  const mockPayload = xalethorVaultGenerator.getMockRaw(injectedKey);

  if (isRecord(mockPayload)) {
    let brandToken = brandTokenCache.get(injectedKey);
    if (!brandToken) {
      brandToken = ['Solid', injectedKey];
      brandTokenCache.set(injectedKey, brandToken);
    }

    Reflect.set(mockPayload, BRAND_SYMBOL, brandToken);

    if (markAsSolid<K, TResolveRegistryStructure<K>>(mockPayload)) {
      if (isRecord(mockPayload) && hasKey(BRAND_SYMBOL)(mockPayload)) {
        return mockPayload;
      }
    }
  }

  return xalethorVaultDiagnostics.panic(
    injectedKey,
    `[xalor] 🚨 Simulated mock generation or validation pass failed structurally for contract key: ${injectedKey}`,
  );
}
