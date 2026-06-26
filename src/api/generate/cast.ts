import { XalethorService } from '../../xalor-service';
import { markAsSolid } from '../../utils';
import { isRecord } from '../../../shared/utils/guards';
import { BRAND_SYMBOL } from '../../../shared';
import type { TSolidBranded } from '../../../shared';
/**
 * RUNTIME API: GENERATE XALOR CAST
 *
 * Coerces loose runtime data values cleanly into the exact structural and
 * primitive types demanded by your type blueprint contracts.
 *
 *
 * @see {@link RuntimeApiCoreDocs.generateXalorCast}
 */
export function generateXalorCast<K extends keyof ISolidRegistry>(
  injectedKey: K,
  data: unknown,
): TSolidBranded<K, ISolidRegistry[K]> {
  if (!injectedKey) {
    throw new Error(
      `[xalor] 🚨 GATEWAY BLOCK: 'generateXalorCast' executed without compiled metadata properties.`,
    );
  }

  const castPayload = XalethorService.produceCast(data, injectedKey);

  if (isRecord(castPayload)) {
    Reflect.set(castPayload, BRAND_SYMBOL, ['Solid', injectedKey]);
  }

  if (markAsSolid<K, ISolidRegistry[K]>(castPayload)) {
    return castPayload;
  }

  throw new Error(
    `[xalor] 🚨 Type coercion casting failed structurally for contract key: ${injectedKey}`,
  );
}
