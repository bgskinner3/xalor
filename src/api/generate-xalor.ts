import { XalethorService } from '../xalor-service';
import type {
  TGenerateXalorReturn,
  TGenerateXalorStrategyEngine,
} from '../models/types';
import type { TSolidBranded } from '../../shared';
import type { TGeneratorXalorModes } from '../../shared/auto';
/**
 * RUNTIME API: GENERATE XALOR
 *
 *  Manufactures or transforms structured payload assets dynamically based on mined type singletons.
 * Evaluates execution strategies across 'default', 'mock', 'clone', and 'cast' operational modes.
 *
 * @example
 * ```ts
 *  generateXalor<"REGISTERED_KEY", 'mode'>(data?: unknown)
 * //// MODES: 'default', 'mock', 'clone', and 'cast'
 * ```
 *
 * @see {@link RuntimeApiDocs.generateXalor}
 */
export function generateXalor<
  K extends keyof ISolidRegistry,
  _M extends 'default',
>(): TSolidBranded<K, ISolidRegistry[K]>; // OVERLOAD 1: THE DEFAULT -
export function generateXalor<
  K extends keyof ISolidRegistry,
  _M extends 'mock',
>(): TSolidBranded<K, ISolidRegistry[K]>; // OVERLOAD 2: THE MOCK
export function generateXalor<
  K extends keyof ISolidRegistry,
  _M extends 'clone',
>(data: unknown): TSolidBranded<K, ISolidRegistry[K]>; // OVERLOAD 3: THE CLONE
export function generateXalor<
  K extends keyof ISolidRegistry,
  _M extends 'cast',
>(data: unknown): TSolidBranded<K, ISolidRegistry[K]>; // OVERLOAD 5: THE CAST
export function generateXalor<
  K extends keyof ISolidRegistry,
  M extends TGeneratorXalorModes,
>(key?: K, mode?: M, data?: unknown): TGenerateXalorReturn<K, M> {
  if (!key || !mode) {
    throw new Error(
      `[xalor] 🚨 GATEWAY BLOCK: 'generateXalor' executed without compiled metadata properties.\n` +
        `Ensure your build-time transformer plugin is active.`,
    );
  }
  const GENERATOR_MODES: TGenerateXalorStrategyEngine<K> = {
    default: (k) => XalethorService.produceDefault(k),

    mock: (k) => XalethorService.produceMock(k),

    clone: (k, d) => XalethorService.produceClone(d, k),

    cast: (k, d) => XalethorService.produceCast(d, k),
  } satisfies TGenerateXalorStrategyEngine<K>;

  return GENERATOR_MODES[mode](key, data);
}
