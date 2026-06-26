import { mergeDeep } from '../../shared/utils/deep-operations';
import { isRecord, isFunction } from '../../shared/utils/guards';
import type { IXalorMergeContext } from '../models/types/operations';

export class XalethorVaultTransform {
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
    ctx: IXalorMergeContext<ISolidRegistry[K]>,
  ): unknown {
    // I. Refine loose incoming variables into mutable record tracking contexts safely

    /* prettier-ignore */ const baseRecord: Record<string, unknown> = isRecord(ctx.dataOne) ? ctx.dataOne : {};
    /* prettier-ignore */ const patchRecord: Record<string, unknown> = isRecord(ctx.dataTwo) ? ctx.dataTwo : {};

    // II. Delegate straight to your variadic Axiom-Kit graph aggregator engine portal (Commandment VIII)
    // II. Delegate straight to your variadic Axiom-Kit graph aggregator engine portal (Commandment VIII)
    /* prettier-ignore */
    const rawMergedResult: unknown = mergeDeep(baseRecord, patchRecord);

    // III. Handle root-level masking and mapping options sequentially inside a single processing boundary
    // 🧠 FIXED PROTECTION BOUNDARY GATE (Commandment V Invariant Enforcement):
    // If rawMergedResult yields undefined/null, fallback cleanly to your local baseRecord container!
    const targetPayload = isRecord(rawMergedResult)
      ? rawMergedResult
      : baseRecord;
    const resultPayload: Record<string | symbol, unknown> = targetPayload;

    // HANDLE PICK AND OMITTING OF DATA OBJECT
    /* prettier-ignore */
    if (ctx.pick) this.executeRootPick(resultPayload, ctx.pick);
    /* prettier-ignore */
    if (ctx.omit) this.executeRootOmit(resultPayload, ctx.omit);

    // incorporate mapping LAST to evaluate a fully-masked schema context frame
    /* prettier-ignore */
    if (ctx.map) this.executeRootMap(resultPayload, ctx.map as Record<string, unknown>);

    return resultPayload;
  }
}
