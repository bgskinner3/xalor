import { XalethorService } from '../xalor-service';
import type {
  TTransformStrategyEngine,
  TTransformContext,
  TFlattenDataContext,
  TMergeContext,
  TRenameContext,
  TPickOmitContext,
} from '../models/types';
import type { TTransformXalorModes } from '../../shared';

/**
 * RUNTIME API: TRANSFORM XALOR
 *
 * Executes high-performance structural mutation sweeps across strongly typed data contracts.
 * Coordinates 'pick', 'omit', 'rename', 'merge', and 'flatten' operations directly in-memory.
 *
 * @example
 * ```ts
 *  transformXalor<"REGISTERED_KEY", 'mode'>(ctx?: {...})
 * //// MODES: 'pick', 'omit', 'rename', 'merge', and 'flatten'
 * ```
 *
 * @see {@link RuntimeApiDocs.transformXalor}
 */
export function transformXalor<
  K extends keyof ISolidRegistry,
  _M extends 'pick',
>(ctx: TPickOmitContext<K>): ISolidRegistry[K]; // OVERLOAD 1: (pick)
export function transformXalor<
  K extends keyof ISolidRegistry,
  _M extends 'omit',
>(ctx: TPickOmitContext<K>): ISolidRegistry[K]; // OVERLOAD 2: THE STRUCTURAL EXCLUSION LANE (omit)
export function transformXalor<
  K extends keyof ISolidRegistry,
  _M extends 'rename',
>(ctx: TRenameContext): ISolidRegistry[K]; // OVERLOAD 3: THE NOMINAL ALIGNMENT LANE (rename)
export function transformXalor<
  K extends keyof ISolidRegistry,
  _M extends 'merge',
>(ctx: TMergeContext): ISolidRegistry[K]; // OVERLOAD 4: THE ENTITY AGGREGATION LANE (merge)
export function transformXalor<
  _K extends keyof ISolidRegistry,
  _M extends 'flatten',
>(ctx: TFlattenDataContext): Record<string, string | number | boolean>; // OVERLOAD 5: THE MATRIX DECOMPRESSION LANE (flatten)
export function transformXalor<
  K extends keyof ISolidRegistry,
  M extends TTransformXalorModes,
>(
  injectedKey?: K,
  injectedMode?: M,
  ctx?: TTransformContext<K, M>,
): ISolidRegistry[K] | Record<string, string | number | boolean> | void {
  if (!injectedKey || !injectedMode || !ctx) {
    throw new Error(
      `[xalor] 🚨 GATEWAY BLOCK: 'transformXalor' executed without compiled metadata properties.\n` +
        `Ensure your build-time transformer plugin is active.`,
    );
  }
  const activeShape = XalethorService.blueprintVault(injectedKey);
  if (!activeShape) {
    throw new Error(
      `[xalor] 🚨 Transformation failed: Blueprint missing from Vault for key: ${injectedKey}`,
    );
  }
  const TRANSFORMATION_MODES: TTransformStrategyEngine<K> = {
    pick: (_key, context) => {
      const { keys, data } = context;
      const stringKeysCollection = keys.map(String);
      const activeFilterSet = new Set<string>(stringKeysCollection);
      /* prettier-ignore */ return XalethorService.executePickSanitizer(data, activeShape, activeFilterSet);
    },
    omit: (_key, context) => {
      const { keys, data } = context;
      const stringKeysCollection = keys.map(String);
      const activeFilterSet = new Set<string>(stringKeysCollection);
      /* prettier-ignore */ return XalethorService.executeOmitSanitizer(data, activeShape, activeFilterSet);
    },
    rename: (_key, context) => {
      const { data, mappings } = context;
      /* prettier-ignore */ return XalethorService.executeRenameSanitizer(data, activeShape, mappings);
    },
    merge: (_key, context) => {
      const { dataOne, dataTwo } = context;
      /* prettier-ignore */ return XalethorService.executeMergeSanitizer(dataOne, dataTwo, activeShape);
    },
    flatten: (_key, context) => {
      const { data } = context;
      /* prettier-ignore */ return XalethorService.executeFlattenSanitizer(data, activeShape);
    },
  } satisfies TTransformStrategyEngine<K>;

  return TRANSFORMATION_MODES[injectedMode](injectedKey, ctx);
}
