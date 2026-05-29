// transformer/reifiers/reify-type.ts
import type { Type, TypeChecker } from 'typescript';
import { REIFIERS } from './registry/index';
import type { TSolidShape } from '../../shared';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import type { TReifyDispatcherBuild, TReifyCTX } from '../types';
import { internShape } from './interning';
// TODO: MOVE TO CONST ?
const DEFAULT_REIFY_CTX: TReifyCTX = {
  depth: 0,
  maxDepth: IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth,
  fragments: new Map(),
  parentKey: 'root',
  seen: new Set(),
} satisfies TReifyCTX;

export function reifyType({
  type,
  checker,
  ctx = DEFAULT_REIFY_CTX,
}: TReifyDispatcherBuild): TSolidShape {
  if (ctx.depth >= ctx.maxDepth) {
    const fragmentKey = `${ctx.parentKey}$d${ctx.depth}`;

    const branchedSeenCache = new Set<Type>(ctx.seen);

    const tailCtx: TReifyCTX = {
      depth: 0,
      maxDepth: ctx.maxDepth,
      fragments: ctx.fragments,
      parentKey: fragmentKey,
      seen: branchedSeenCache,
    };

    const tailShape = runReifierLoop(type, checker, tailCtx);
    ctx.fragments.set(fragmentKey, tailShape);

    return { kind: 'reference', name: fragmentKey };
  }

  const result = runReifierLoop(type, checker, ctx);
  return internShape(result);
}
// TODO: OPTIMIZE
function runReifierLoop(
  type: Type,
  checker: TypeChecker,
  ctx: TReifyCTX,
): TSolidShape {
  const totalReifiers = REIFIERS.length;

  for (let i = 0; i < totalReifiers; i++) {
    const reifier = REIFIERS[i];
    if (!reifier) continue;

    const result = reifier(
      type,
      checker,
      (t, nextCtx) => reifyType({ type: t, checker, ctx: nextCtx }),
      ctx,
    );

    if (result) return result;
  }

  return { kind: 'primitive', type: 'unknown' };
}
