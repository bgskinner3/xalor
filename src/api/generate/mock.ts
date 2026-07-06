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
export function generateXalorMock<K extends TActiveRegistryKeys>(
  injectedKey: K,
): TSolidBranded<K, TResolveRegistryStructure<K>> {
  if (!injectedKey) {
    throw new Error(
      `[xalor] 🚨 GATEWAY BLOCK: 'generateXalorMock' executed without compiled metadata properties.\n` +
        `Ensure your build-time transformer plugin is active.`,
    );
  }

  const mockPayload = XalethorService.produceMock(injectedKey);

  if (isRecord(mockPayload)) {
    Reflect.set(mockPayload, BRAND_SYMBOL, ['Solid', injectedKey]);

    if (markAsSolid<K, TResolveRegistryStructure<K>>(mockPayload)) {
      return mockPayload;
    }
  }

  throw new Error(
    `[xalor] 🚨 Simulated mock generation failed structurally for contract key: ${injectedKey}`,
  );
}
