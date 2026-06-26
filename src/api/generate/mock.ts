import { XalethorService } from '../../xalor-service';
import { markAsSolid } from '../../utils';
import { isRecord } from '../../../shared/utils/guards';
import { BRAND_SYMBOL } from '../../../shared';
import type { TSolidBranded } from '../../../shared';

/**
 * RUNTIME API: GENERATE XALOR MOCK
 *
 * @example
 * ```ts
 * const fakeUser = generateXalorMock('USER_ACCOUNT');
 * console.log(fakeUser.username); // "abcde12345" -> Random high-entropy data string!
 * ```
 * @see {@link RuntimeApiCoreDocs.generateXalorMock}
 */
export function generateXalorMock<K extends keyof ISolidRegistry>(
  injectedKey: K,
): TSolidBranded<K, ISolidRegistry[K]> {
  // 1. Enforce strict parameter presence to protect system boundaries (Commandment V)
  if (!injectedKey) {
    throw new Error(
      `[xalor] 🚨 GATEWAY BLOCK: 'generateXalorMock' executed without compiled metadata properties.\n` +
        `Ensure your build-time transformer plugin is active.`,
    );
  }

  // 2. Extract clean, randomized, high-entropy object structure directly from your authoritative service layer
  const mockPayload = XalethorService.produceMock(injectedKey);

  // 3. Leverage strict native type guard to safely attach the nominal brand mapping (Commandment IX)
  if (isRecord(mockPayload)) {
    // 4. Hydrate your unique runtime BRAND_SYMBOL directly onto the freshly minted object container
    Reflect.set(mockPayload, BRAND_SYMBOL, ['Solid', injectedKey]);

    // 5. Pass through a safe phantom type narrower gate instead of an explicit cast to verify type layout
    if (markAsSolid<K, ISolidRegistry[K]>(mockPayload)) {
      return mockPayload;
    }
  }

  throw new Error(
    `[xalor] 🚨 Simulated mock generation failed structurally for contract key: ${injectedKey}`,
  );
}
