import { XalethorService } from '../xalor-service';
import type {
  TValidateXalorReturn,
  TTValidateStrategyEngine,
} from '../models/types';
import { buildValidationTools, markAsSolid } from '../utils';
import type {
  TTypeGuard,
  TXalorAuditReport,
  TValidateXalorModes,
  TSolidBranded,
} from '../../shared';

/**
 * RUNTIME API: VALIDATE XALOR
 *
 * Generates automated validation closures to narrow incoming network data streams at runtime boundaries.
 * Verifies payload layouts against your content-addressable JSON vault with near-zero allocation footprints.
 *
 *
 * @example
 * ```ts
 *  validateXalor<"REGISTERED_KEY", 'mode'>(data: unknown)
 * //// MODES: 'guard', 'assert', 'parse', 'parseAsync', and 'audit'
 * ```
 *
 * @see {@link RuntimeApiDocs.validateXalor}
 */
export function validateXalor<
  K extends keyof ISolidRegistry,
  _M extends 'guard',
>(): TSolidBranded<K, TTypeGuard<ISolidRegistry[K]>>; // OVERLOAD 1: THE GUARD
export function validateXalor<
  K extends keyof ISolidRegistry,
  _M extends 'assert',
>(data: unknown): asserts data is ISolidRegistry[K]; //  OVERLOAD 2: THE ASSERTION
export function validateXalor<
  K extends keyof ISolidRegistry,
  _M extends 'parse',
>(data: unknown): TSolidBranded<K, ISolidRegistry[K]>; // OVERLOAD 3: THE PARSER
export function validateXalor<
  K extends keyof ISolidRegistry,
  _M extends 'parseAsync',
>(data: unknown): TSolidBranded<K, Promise<ISolidRegistry[K]>>; // OVERLOAD 4: THE ASYNC PARSER
export function validateXalor<
  _K extends keyof ISolidRegistry,
  _M extends 'audit',
>(data: unknown): TXalorAuditReport; // OVERLOAD 5: THE AUDIT
// --- IMPLEMENTATION ---
export function validateXalor<
  K extends keyof ISolidRegistry,
  M extends TValidateXalorModes,
>(injectedKey?: K, mode?: M, data?: unknown): TValidateXalorReturn<K, M> {
  if (!injectedKey || !mode) {
    throw new Error(
      `[xalor] 🚨 GATEWAY BLOCK: 'validateXalor' executed without compiled metadata properties.\n` +
        `Ensure your build-time transformer plugin is active.`,
    );
  }

  const VALIDATOR_MODES: TTValidateStrategyEngine<K> = {
    guard: (key) => {
      const { guard } = buildValidationTools(key);

      const runtimeGuard: TTypeGuard<ISolidRegistry[K]> = (
        v: unknown,
      ): v is ISolidRegistry[K] => {
        return guard(v) && markAsSolid<K, ISolidRegistry[K]>(v);
      };

      return runtimeGuard;
    },

    assert: (key, val) => {
      const { assert } = buildValidationTools(key);
      return assert(val);
    },

    parse: (key, val) => {
      if (XalethorService.validateShape(val, key)) {
        if (markAsSolid<K, ISolidRegistry[K]>(val)) {
          return val;
        }
      }
      return XalethorService.panic(key);
    },

    parseAsync: async (key, val) => {
      return Promise.resolve(val).then((_val) => {
        if (XalethorService.validateShape(_val, key)) {
          if (markAsSolid<K, ISolidRegistry[K]>(_val)) return _val;
        }
        return Promise.reject(
          new Error(
            `[xalor] Async parser validation failed for blueprint key: ${key}`,
          ),
        );
      });
    },

    audit: (key, val) => {
      const isValid = XalethorService.validateShape(val, key);
      const rawErrors = XalethorService.getKeyErrors(key);

      return XalethorService.auditReport(key, isValid, rawErrors);
    },
  } satisfies TTValidateStrategyEngine<K>;

  return VALIDATOR_MODES[mode](injectedKey, data);
}
