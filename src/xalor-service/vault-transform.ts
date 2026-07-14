import { mergeDeep } from '../../shared/utils/deep-operations';
import { isRecord, isFunction } from '../../shared/utils/guards';
import type { TXalorMergeContext } from '../models/types';
import type { TSolidBranded } from '../../shared';
import { markAsSolid, produceClone } from '../utils';
import { XalethorVaultKeeper } from './vault-keeper';
import { XalethorService } from '.';
export class XalethorVaultTransform {
  // =================================================
  // =================================================
  // MERGE METHODS
  // =================================================
  // =================================================
  private static executeRootPick(
    targetObj: Record<string | symbol, unknown>,
    allowedKeys: Array<string | symbol | number>,
  ): void {
    const pickSet = new Set<string>();

    for (const key of allowedKeys) {
      pickSet.add(String(key));
    }

    for (const key in targetObj) {
      if (Reflect.has(targetObj, key) && !pickSet.has(key)) {
        Reflect.deleteProperty(targetObj, key);
      }
    }
  }

  private static executeRootOmit(
    targetObj: Record<string | symbol, unknown>,
    bannedKeys: Array<string | symbol | number>,
  ): void {
    for (const key of bannedKeys) {
      const keyStr = String(key);
      if (Reflect.has(targetObj, keyStr)) {
        Reflect.deleteProperty(targetObj, keyStr);
      }
    }
  }
  private static executeRootMap(
    targetObj: Record<string | symbol, unknown>,
    mapRegistry: Record<string, unknown>,
  ): void {
    for (const key in mapRegistry) {
      if (Reflect.has(mapRegistry, key)) {
        const customTransformer = mapRegistry[key];

        if (isFunction(customTransformer) && Reflect.has(targetObj, key)) {
          /* prettier-ignore */ const executableProjector = customTransformer as (...args: unknown[]) => unknown;

          /* prettier-ignore */ targetObj[key] = executableProjector(targetObj[key], targetObj);
        }
      }
    }
  }

  public static transformMerge<K extends keyof ISolidRegistry>(
    ctx: TXalorMergeContext<ISolidRegistry[K]>,
  ): unknown {
    // I. Refine loose incoming variables into mutable record tracking contexts safely

    /* prettier-ignore */ const baseRecord: Record<string, unknown> = isRecord(ctx.dataOne) ? ctx.dataOne : {};
    /* prettier-ignore */ const patchRecord: Record<string, unknown> = isRecord(ctx.dataTwo) ? ctx.dataTwo : {};

    const rawMergedResult: unknown = mergeDeep(baseRecord, patchRecord);

    if (isRecord(rawMergedResult)) {
      const resultPayload: Record<string | symbol, unknown> = rawMergedResult;

      /* prettier-ignore */ if (ctx.pick) this.executeRootPick(resultPayload, ctx.pick);

      /* prettier-ignore */ if (ctx.omit) this.executeRootOmit(resultPayload, ctx.omit);

      /* prettier-ignore */ if (ctx.map) this.executeRootMap(resultPayload, ctx.map as Record<string, unknown>);

      return resultPayload;
    }
    return rawMergedResult;
  }

  // =================================================
  // =================================================
  // CLONE METHODS
  // =================================================
  // =================================================
  /* prettier-ignore */
  private static requireShape<K extends keyof ISolidRegistry>(key: K, msg: string) {
    const shape = XalethorVaultKeeper.peek('blueprint', key);

    if (!shape) XalethorService.panic(key, msg);

    return shape;
  }
  /**
   * GET CLONE (The Sanitizer)
   *
   * ROLE: The "Clean Room."
   * Takes raw, untrusted data and returns a deep-copy that is physically
   * guaranteed to only contain properties defined in the TypeScript interface.
   *
   * STRATEGY:
   * - Graph Integrity: Uses internal Map tracking to handle circular references.
   * - Prototype Preservation: Maintains class instances where possible.
   * - Key Scrubbing: Iterates the Blueprint, not the Data, to ensure purity.
   *
   * @param data - The raw input object to be purified.
   * @param key - The unique identifier of the target blueprint.
   */
  public static getClone<K extends keyof ISolidRegistry>(
    data: unknown,
    key: K,
  ): TSolidBranded<K, ISolidRegistry[K]> {
    /* prettier-ignore */ const shape = 
      this.requireShape( key, 'Cloning failed: Blueprint missing from Vault.');

    const cleanData = produceClone(data, shape, new Map());

    if (markAsSolid<K, ISolidRegistry[K]>(cleanData)) return cleanData;

    throw new Error(`[xalor] Failed to brand purified clone for ${key}`);
  }
}
