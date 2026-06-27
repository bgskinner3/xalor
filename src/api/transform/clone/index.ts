import { XalethorService } from '../../../xalor-service';
import { markAsSolid } from '../../../utils';
import { isRecord, assertRegistryKey } from '../../../../shared/utils/guards';
import { BRAND_SYMBOL } from '../../../../shared';
import type { TSolidBranded } from '../../../../shared';

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
export function generateXalorClone<K extends keyof ISolidRegistry>(
  injectedKey: K,
  data: unknown,
): TSolidBranded<K, ISolidRegistry[K]> {
  assertRegistryKey(injectedKey);

  const clonePayload = XalethorService.produceClone(data, injectedKey);

  if (isRecord(clonePayload)) {
    Reflect.set(clonePayload, BRAND_SYMBOL, ['Solid', injectedKey]);

    if (markAsSolid<K, ISolidRegistry[K]>(clonePayload)) {
      return clonePayload;
    }
  }

  throw new Error(
    `[xalor] 🚨 Deep structural cloning failed for contract key: ${injectedKey}`,
  );
}
