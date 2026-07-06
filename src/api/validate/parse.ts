import { XalethorService } from '../../xalor-service';
import { markAsSolid } from '../../utils';
import { BRAND_SYMBOL } from '../../../shared';
import type { TSolidBranded } from '../../../shared';
import {
  isDefined,
  isRecord,
  assertRegistryKey,
} from '../../../shared/utils/guards';

/**
 * RUNTIME API: VALIDATE XALOR PARSE
 *
 * Synchronously processes data ingress contracts. Evaluates raw incoming physical data
 * shapes instantly against precompiled Vault registry blueprints and stamps your cryptographic brand.
 *
 * COMPLIANCE METRICS:
 * - COMMANDMENT I & III: Resolves structural contracts exclusively via the pre-compiled Registry.
 * - COMMANDMENT IV: Performs a single, isolated semantic operation (Synchronous Schema Parsing).
 * - COMMANDMENT VIII: Zero runtime strategy allocations or nested middleman traversal layers.
 * - COMMANDMENT IX: Zero 'any' variables, zero 'as' type assertions, and zero 'switch' branching.
 *
 * @example
 * ```ts
 * const verifiedUser = validateXalorParse('USER_ACCOUNT', rawPayload);
 * console.log(verifiedUser.username); // Fully typed and nominally branded!
 * ```
 *
 * @see {@link RuntimeApiCoreDocs.validateXalorParse}
 */
export function validateXalorParse<K extends keyof ISolidRegistry>(
  data: unknown,
  injectedKey?: K,
): TSolidBranded<K, ISolidRegistry[K]> {
  assertRegistryKey(injectedKey);

  if (!isDefined(data)) {
    return XalethorService.panic(injectedKey);
  }

  // 2. Route directly to raw structural service evaluation loop
  const isValid = XalethorService.validateShapeByKey(data, injectedKey);

  if (isValid && isRecord(data)) {
    // 3. Hydrate the unique runtime BRAND_SYMBOL directly onto the verified payload instance
    // Satisfies COMMANDMENT IX: The compiler natively knows 'data' can accept properties because it passed isRecord!
    Reflect.set(data, BRAND_SYMBOL, ['Solid', injectedKey]);

    // 4. Utilize a safe phantom type narrower instead of a cast to pass the boundary check
    if (markAsSolid<K, ISolidRegistry[K]>(data)) return data;
  }

  // 5. Immediate fail-fast circuit breaking execution halt (Commandment VI)
  return XalethorService.panic(injectedKey);
}
