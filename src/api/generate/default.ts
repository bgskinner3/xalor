import { XalethorService } from '../../xalor-service';
import { markAsSolid } from '../../utils';
import { isRecord, assertRegistryKey } from '../../../shared/utils/guards';
import { BRAND_SYMBOL } from '../../../shared';
import type { TSolidBranded } from '../../../shared';

/**
 * RUNTIME API: GENERATE XALOR DEFAULT (v0 MVP Clean Edition)
 *
 * @api generation
 * @mode default
 *
 * Public entry portal executing Category 3 (Generation) Default operations.
 * Instantly instantiates a type contract blueprint pre-populated with safe primitives.
 *
 * DESIGN INVARIANTS:
 * - Satisfies COMMANDMENT II: The string generic <K> is stripped and injected as a runtime argument.
 * - Satisfies COMMANDMENT IV: Performs a single, isolated semantic operation (Fallback Generation).
 * - Satisfies COMMANDMENT IX: Zero 'any' variables, zero type escape hatch assertions.
 *
 * @example
 * ```ts
 * const emptyUserForm = xalor.default<'USER_ACCOUNT'>();
 * console.log(emptyUserForm.username); // "" -> Zero undefined reference crashes!
 * ```
 * @see {@link RuntimeApiCoreDocs.generateXalorDefault}
 */
export function generateXalorDefault<K extends keyof ISolidRegistry>(
  injectedKey?: K,
): TSolidBranded<K, ISolidRegistry[K]> {
  assertRegistryKey(injectedKey);

  const defaultTemplate = XalethorService.produceDefault(injectedKey);

  if (isRecord(defaultTemplate)) {
    Reflect.set(defaultTemplate, BRAND_SYMBOL, ['Solid', injectedKey]);

    if (markAsSolid<K, ISolidRegistry[K]>(defaultTemplate))
      return defaultTemplate;
  }

  throw new Error(
    `[xalor] 🚨 Fallback template generation failed structurally for contract key: ${injectedKey}`,
  );
}
