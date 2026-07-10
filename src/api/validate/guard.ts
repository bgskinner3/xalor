import { buildValidationTools, markAsSolid } from '../../utils';
import type { TTypeGuard, TSolidBranded } from '../../../shared';
import { BRAND_SYMBOL } from '../../../shared';
import { assertRegistryKey } from '../../../shared/utils/guards';
/**
 * RUNTIME API: VALIDATE XALOR GUARD
 *
 * Generates an isolated, stateless type predicate closure to narrow incoming network
 * data streams at runtime boundaries with zero allocation strategy switchboards.
 *
 * COMPLIANCE METRICS:
 * - COMMANDMENT I & III: Resolves structural contracts exclusively via the pre-compiled Registry.
 * - COMMANDMENT IV: Performs a single, isolated semantic operation (Type Guard Generation).
 * - COMMANDMENT VIII: Zero runtime strategy allocations or nested middleman traversal layers.
 * - COMMANDMENT IX: Zero 'any' variables, zero 'as' type assertions, and zero 'switch' branching.
 *
 * @example
 * ```ts
 * const isUserValid = validateXalorGuard('USER_ACCOUNT');
 * if (isUserValid(rawPayload)) {
 *   console.log(rawPayload.username); // Safely narrowed and branded!
 * }
 * ```
 *
 * @see {@link RuntimeApiCoreDocs.validateXalorGuard}
 */
export function validateXalorGuard<K extends TActiveRegistryKeys>(
  injectedKey?: K,
): TSolidBranded<K, TTypeGuard<TResolveRegistryStructure<K>>> {
  assertRegistryKey(injectedKey);

  const { guard } = buildValidationTools(injectedKey);

  const runtimeGuard = (v: unknown): v is TResolveRegistryStructure<K> => {
    return guard(v) && markAsSolid<K, TResolveRegistryStructure<K>>(v);
  };

  Reflect.set(runtimeGuard, BRAND_SYMBOL, ['Solid', injectedKey]);

  if (markAsSolid<K, TTypeGuard<TResolveRegistryStructure<K>>>(runtimeGuard)) {
    return runtimeGuard;
  }

  throw new Error(
    `[xalor] 🚨 Nominal brand application failed for key: ${injectedKey}`,
  );
}
