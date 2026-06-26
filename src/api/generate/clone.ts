import { XalethorService } from '../../xalor-service';
import { markAsSolid } from '../../utils';
import { isRecord } from '../../../shared/utils/guards';
import { BRAND_SYMBOL } from '../../../shared';
import type { TSolidBranded } from '../../../shared';

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
  // 1. Enforce strict parameter presence to protect system boundaries (Commandment V)
  if (!injectedKey) {
    throw new Error(
      `[xalor] 🚨 GATEWAY BLOCK: 'generateXalorClone' executed without compiled metadata properties.`,
    );
  }

  // 2. Delegate straight to your circular-safe service layer copy worker
  const clonePayload = XalethorService.produceClone(data, injectedKey);

  // 3. Leverage strict native type guard to safely attach the nominal brand mapping (Commandment IX)
  if (isRecord(clonePayload)) {
    // 4. Hydrate your unique runtime BRAND_SYMBOL directly onto the freshly minted object container
    Reflect.set(clonePayload, BRAND_SYMBOL, ['Solid', injectedKey]);

    // 5. Pass through a safe phantom type narrower gate instead of an explicit cast to verify type layout
    if (markAsSolid<K, ISolidRegistry[K]>(clonePayload)) {
      return clonePayload;
    }
  }

  throw new Error(
    `[xalor] 🚨 Deep structural cloning failed for contract key: ${injectedKey}`,
  );
}
