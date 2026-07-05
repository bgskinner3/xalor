// transformer/reifiers/reify-type.ts
import type { Type, TypeChecker } from 'typescript';
import { REIFIERS } from './registry/index';
import type { TSolidShape } from '../../shared';
import type { TReifyDispatcherBuild, TReifyCTX } from '../types';
import { internShape } from './interning';
import { shapeKindUtilsService } from '../../shared';
/**
 * Context Factory Replacement Utility
 */
/**
 * Context Factory Replacement Utility
 * Provision isolated tracking frames on the heap for every unique top-level reification pass.
 */
export function createFreshReifyCTX(
  maxDepthLimit: number,
  initialKey: string = 'root',
): TReifyCTX {
  return {
    depth: 0,
    maxDepth: maxDepthLimit,
    fragments: new Map<string, TSolidShape>(),
    parentKey: initialKey,
    seen: new Set<Type>(),
  };
}
interface IHardenedReifyCTX extends TReifyCTX {
  readonly _isCutOverride?: boolean;
}

/**
 * reifyType
 * THE DE-RECURSIVE TYPE UNROLLER (Atomic Cut Pass)
 */
export function reifyType({
  type,
  checker,
  ctx,
}: TReifyDispatcherBuild): TSolidShape {
  // Step A: Dynamic Context Gate Recovery
  const activeCtx = ctx !== undefined ? ctx : createFreshReifyCTX(25, 'root');
  const hardenedCtx: IHardenedReifyCTX = activeCtx;

  // ========================================================================
  // RADAR LOOP INTERCEPTOR
  // Catch vertical self-referential cyclic graph chains right at the gateway!
  // ========================================================================
  if (hardenedCtx.seen.has(type)) {
    const symbol = type.getSymbol() ?? type.aliasSymbol;
    const fallbackNodeName =
      symbol !== undefined ? symbol.getName() : 'RecursiveFragment';
    return { kind: 'reference', name: `lazy:${fallbackNodeName}` };
  }

  // ========================================================================
  // SHIELD B: GLOBAL INSTANCEOF CHECKER
  // ========================================================================
  const symbol = type.getSymbol() ?? type.aliasSymbol;
  if (symbol !== undefined) {
    const symbolName = symbol.getName();
    const cleanSymbolName = symbolName.replace(/Constructor$/, '');

    if (shapeKindUtilsService.isKnownInstanceKey(cleanSymbolName)) {
      return {
        kind: 'instanceof',
        name: cleanSymbolName,
      };
    }
  }

  const fullyQualifiedName = checker
    .typeToString(type)
    .replace(/Constructor$/, '');
  if (shapeKindUtilsService.isKnownInstanceKey(fullyQualifiedName)) {
    return {
      kind: 'instanceof',
      name: fullyQualifiedName,
    };
  }

  // ========================================================================
  // 🛡️ SHIELD C: HARD DEPTH CHOPPER & INTERNING MACHINE
  // ========================================================================
  if (
    hardenedCtx.depth >= hardenedCtx.maxDepth &&
    !hardenedCtx._isCutOverride
  ) {
    const fragmentKey = `${hardenedCtx.parentKey}$d${hardenedCtx.depth}`;

    // Allocate a completely fresh, detached tracking context frame on the heap
    const tailCtx: IHardenedReifyCTX = {
      depth: 0, // Reset depth physics completely
      maxDepth: hardenedCtx.maxDepth,
      fragments: hardenedCtx.fragments,
      parentKey: fragmentKey,
      seen: new Set<Type>(),
      _isCutOverride: true,
    } satisfies IHardenedReifyCTX;

    // Recurse safely back to the main door. Shield C will be bypassed on the
    // next frame, forcing runReifierLoop to execute with our reset tailCtx object!
    const tailShape = reifyType({ type, checker, ctx: tailCtx });

    // Save the chopped component fragment to the ambient repository ledger
    hardenedCtx.fragments.set(fragmentKey, tailShape);

    // Return a clean shallow named reference pointer link shape token immediately
    return { kind: 'reference', name: fragmentKey };
  }

  // Record this active node path into our current tracking context stack frame safely
  hardenedCtx.seen.add(type);

  // Execute the underlying pluggable middleware parsing loop
  const result = runReifierLoop(type, checker, hardenedCtx);

  // Clean the reference loop trace layer for this isolated horizontal branch context cleanly
  hardenedCtx.seen.delete(type);

  // Filter out duplicates and return the content-addressable storage snapshot identifier
  return internShape(result);
}

/**
 * runReifierLoop

 */
function runReifierLoop(
  type: Type,
  checker: TypeChecker,
  ctx: TReifyCTX,
): TSolidShape {
  const totalReifiers = REIFIERS.length;

  for (let i = 0; i < totalReifiers; i++) {
    const reifier = REIFIERS[i];
    if (reifier === undefined) continue;

    // Before descending into any sub-property type, we build an immutable child context
    // carrying an incremented depth count.
    const result = reifier(
      type,
      checker,
      (t, nextCtx) => {
        // Enforce context chain propagation. If the reifier middleware strips out
        // our context wrapper parameters, fall back straight to our active tracker loop.
        const activeNextCtx = nextCtx !== undefined ? nextCtx : ctx;
        const childCtx: TReifyCTX = {
          ...activeNextCtx,
          depth: activeNextCtx.depth + 1, // Enforces our depth law guard line cleanly!
        } satisfies TReifyCTX;
        return reifyType({ type: t, checker, ctx: childCtx });
      },
      ctx,
    );

    if (result !== undefined) {
      return result;
    }
  }

  return { kind: 'primitive', type: 'unknown' };
}
