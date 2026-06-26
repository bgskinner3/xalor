import { XalethorService } from '../../xalor-service';
import { markAsSolid } from '../../utils';
import { isRecord } from '../../../shared/utils/guards';
import type { IXalorMergeContext } from '../../models/types/operations';
import { BRAND_SYMBOL } from '../../../shared';
import type { TSolidBranded } from '../../../shared';

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
export function transformXalorMerge<K extends keyof ISolidRegistry>(
  injectedKey: K,
  ctx: IXalorMergeContext<ISolidRegistry[K]>,
): TSolidBranded<K, ISolidRegistry[K]> {
  // 1. Enforce strict parameter presence to protect system boundaries (Commandment V)
  if (!injectedKey || !ctx) {
    throw new Error(
      `[xalor] 🚨 GATEWAY BLOCK: 'transformXalorMerge' executed without compiled metadata properties.\n` +
        `Ensure your build-time transformer plugin is active.`,
    );
  }
  const activeShape = XalethorService.blueprintVault(injectedKey);
  if (!activeShape) {
    throw new Error(
      `[xalor] 🚨 Transformation failed: Blueprint missing from Vault for key: ${injectedKey}`,
    );
  }

  // 🚀 THE CORRECTION: Point directly to your modernized class handler method!
  const resultPayload = XalethorService.executeMergeSanitizer<K>(ctx);

  if (isRecord(resultPayload)) {
    Reflect.set(resultPayload, BRAND_SYMBOL, ['Solid', injectedKey]);

    if (markAsSolid<K, ISolidRegistry[K]>(resultPayload)) {
      return resultPayload;
    }
  }

  throw new Error(
    `[xalor] 🚨 Evolution layer merge failed structurally for contract key: ${injectedKey}`,
  );
}
/**
 * NOTES: ADVANCED ROADMAP METRICS (V2/V3 Moonshot Engineering Vectors)
 *
 * - [ ] Inline Cryptographic PII Masking Gateway (`ctx.mask`):
 *       Automatically mask sensitive data strings or evaluate hash closures over fields
 *       before sending assets to downstream application logs or network sockets.
 *
 * - [ ] RFC 6902 State Differential Telemetry Outputs (`ctx.patch`):
 *       Allow the mutation engine to yield formal JSON-patch modification descriptions,
 *       enabling real-time WebSocket state streaming with near-zero bundle footprints.
 *
 * - [ ] Distributed Optimistic Reconciliation Strategy Handler (`ctx.reconcile`):
 *       Incorporate vector-clock reconciliation triggers directly inside your property
 *       loops to resolve online/offline data collisions smoothly right at runtime.
 */
