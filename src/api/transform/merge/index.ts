import { xalethorCoreService } from '../../../xalor-service';
import { markAsSolid, ensureGlobalVault } from '../../../utils';
import { assertRegistryKey } from '../../../../shared/utils/guards';
import type { TXalorMergeContexts } from '../../../models/types';
import { isRecord, BRAND_SYMBOL } from '../../../../shared';
import type { TSolidBranded } from '../../../../shared';
import { xalethorVaultDiagnostics } from '../../../xalor-service/vault-diagnostics';

// Holds long-lived, pre-allocated memory pointers for nominal tokens to keep memory flat
const brandTokenCache = new Map<string, [string, string]>();

/**
 * RUNTIME API: TRANSFORM XALOR MERGE
 *
 * Synchronously executes a single-pass deep object mutation. Blends baseline fields
 * with patch modifications and applies root filters while preserving nominal brand stamps.
 *
 * NOTE: Object Two (`ctx.dataTwo`) takes absolute overwrite preference over Object One.
 *
 * @see {@link RuntimeApiCoreDocs.transformXalorMerge}
 *
 */
export function transformXalorMerge<K extends TActiveRegistryKeys>(
  ctx: TXalorMergeContexts<TResolveRegistryStructure<K>>,
  injectedKey?: K,
): TSolidBranded<K, TResolveRegistryStructure<K>> {
  ensureGlobalVault();
  assertRegistryKey(injectedKey);

  // 1. Commandment VI Compliance: Verify AOT metadata exists via your native vault service
  const activeShape = xalethorCoreService.blueprintVault(injectedKey);

  if (!ctx || !activeShape) {
    return xalethorVaultDiagnostics.panic(
      injectedKey,
      `[xalor] 🚨 GATEWAY BLOCK: 'transformXalorMerge' executed without compiled metadata properties.\n` +
        `Ensure your build-time transformer plugin is active for key: ${injectedKey}`,
    );
  }

  // 2. Pass the options context down. Prune-and-fill fallbacks are resolved dynamically by the engine loop.
  const resultPayload = xalethorCoreService.executeMergeSanitizer<K>(
    ctx,
    injectedKey,
  );

  if (isRecord(resultPayload)) {
    let brandToken = brandTokenCache.get(injectedKey);
    if (!brandToken) {
      brandToken = ['Solid', injectedKey];
      brandTokenCache.set(injectedKey, brandToken);
    }

    Reflect.set(resultPayload, BRAND_SYMBOL, brandToken);

    if (markAsSolid<K, TResolveRegistryStructure<K>>(resultPayload)) {
      /* prettier-ignore */
      const finalBrandedPayload: TSolidBranded<K, TResolveRegistryStructure<K>> = resultPayload;
      return finalBrandedPayload;
    }
  }

  return xalethorVaultDiagnostics.panic(
    injectedKey,
    `[xalor] 🚨 Evolution layer merge failed structurally for contract key: ${injectedKey}`,
  );
}
