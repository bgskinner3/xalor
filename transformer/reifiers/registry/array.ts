// transformer/reifiers/registry/array.ts
import { registerReifier } from './core';
import {
  isObjectTypeGuard,
  isTypeReference,
  isTupleType,
  isArrayType,
} from '../../utils';
import type { TSolidShape } from '../../../shared';
import { ObjectFlags, ElementFlags } from 'typescript';
import type { TReifyCTX } from '../../types';
import type { TypeChecker, TypeReference, Type } from 'typescript';

/**
 * TUPLE SUB-CLASSIFICATION MINER
 * Processes a fixed-length or variadic Tuple Type structure.
 */
function reifyTuple(
  type: TypeReference,
  checker: TypeChecker,
  next: (type: Type, ctx: TReifyCTX) => TSolidShape,
  ctx: TReifyCTX,
): TSolidShape {
  const typeArguments = checker.getTypeArguments(type) || [];
  const fallbackItemType = checker.getAnyType ? checker.getAnyType() : type;

  const len = typeArguments.length;
  const itemsBuffer: TSolidShape[] = [];

  for (let i = 0; i < len; i++) {
    const element = typeArguments[i];
    if (element) {
      itemsBuffer.push(
        next(element, {
          ...ctx,
          depth: ctx.depth + 1,
          parentKey: `${ctx.parentKey}[${i}]`,
        }),
      );
    }
  }

  const targetType = type.target;

  const isTuple = isObjectTypeGuard(targetType) && isTupleType(targetType);
  const minLengthValue = isTuple ? targetType.minLength : 0;

  const hasRestValue = isTuple
    ? (targetType.combinedFlags &
        (ElementFlags.Variable | ElementFlags.Rest)) !==
      0
    : false;

  const firstArg = typeArguments[0];
  const itemsShape = firstArg
    ? next(firstArg, ctx)
    : next(fallbackItemType, ctx);

  return {
    kind: 'array',
    items: itemsShape,
    elementShapes: itemsBuffer,
    minLength: minLengthValue,
    hasRest: hasRestValue,
  };
}

/**
 * STANDARD GENERIC ARRAY FALLBACK
 * Processes standard generic structures like T[] or Array<T>.
 */
function reifyArray(
  type: TypeReference,
  checker: TypeChecker,
  next: (type: Type, ctx: TReifyCTX) => TSolidShape,
  ctx: TReifyCTX,
): TSolidShape {
  const typeArgs = checker.getTypeArguments(type) || [];
  const firstArg = typeArgs[0];
  const itemType =
    firstArg ?? (checker.getAnyType ? checker.getAnyType() : type);

  return {
    kind: 'array',
    items: next(itemType, {
      ...ctx,
      depth: ctx.depth + 1,
      parentKey: `${ctx.parentKey}[]`,
    }),
    elementShapes: undefined,
    minLength: 0,
    hasRest: false,
  };
}
/**
 * REIFIER DISPATCH CHANNEL (The Collection Boundary Router)
 *
 * ROLE:
 * Build-time entry gatehouse for the collection reifier pipeline. It catches, splits,
 * and routes array-like TypeScript types into specialized data layouts.
 *
 * STRATEGY:
 * Employs an optimized bitwise pre-filter pass over native `type.objectFlags` flags.
 * If a type matches a bitwise `Tuple` flag, it narrows the layout to a `TypeReference`
 * and handles it inside a separate V8-inlinable frame (`reifyTuple`). If it identifies
 * a standard index signature array container, it calls `reifyArray` point-free. Both lanes
 * propagate computed shapes back up to the master orchestrator loop stack frame, yielding
 * `undefined` to bypass validation gracefully if unhandled.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation Rule) and Commandment VIII (Internal Efficiency).
 * By splitting crowded recursive evaluation streams into single-purpose functions, it unlocks
 * microsecond-fast native JIT inlining without creating temporary wrapper objects on the heap.
 */
registerReifier((type, checker, next, ctx) => {
  if (!isObjectTypeGuard(type)) return undefined;

  const objectFlags = type.objectFlags;
  if (objectFlags & ObjectFlags.Tuple) {
    if (!isTypeReference(type)) return undefined;
    return reifyTuple(type, checker, next, ctx);
  }

  if (isArrayType(type)) {
    if (!isTypeReference(type)) return undefined;
    return reifyArray(type, checker, next, ctx);
  }
  return undefined;
});

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * TODO: IMPLEMENT TUPLES UING MAC AND MIN LENGTH
 */
/**
 * 
 const STATIC_NEVER_TERMINAL_SHAPE: TSolidShape = {
  kind: 'primitive',
  type: 'never',
};

const STATIC_ANY_ARRAY_FALLBACK_SHAPE: {
  readonly kind: 'array';
  readonly items: TSolidShape;
  readonly minLength: number;
  readonly hasRest: boolean;
  readonly elementShapes?: readonly TSolidShape[];
} = {
  kind: 'array',
  items: { kind: 'primitive', type: 'any' },
  elementShapes: undefined,
  minLength: 0,
  hasRest: false,
};
export function reifyTuple(
  type: TypeReference,
  checker: TypeChecker,
  next: (type: Type, ctx: TReifyCTX) => TSolidShape,
  ctx: TReifyCTX,
): TSolidShape {
  const targetType = type.target;

  // 1. Strict Gateway Escape Guard
  if (!isObjectTypeGuard(targetType) || !isTupleType(targetType)) {
    return reifyArray(type, checker, next, ctx);
  }

  // ============================================================================
  // ⚡ LAYER 0: RECURSIVE TRANSFORMER CYCLE BREAKOUT
  // ============================================================================
  if (ctx.seen.has(type)) {
    return {
      kind: 'array',
      items: STATIC_ANY_ARRAY_FALLBACK_SHAPE.items,
      elementShapes: undefined,
      minLength: 0,
      hasRest: false,
    };
  }
  ctx.seen.add(type);

  const typeArguments = checker.getTypeArguments(type) || [];
  const len = typeArguments.length;
  const itemsBuffer: TSolidShape[] = [];

  // Positional elements unrolling pass
  for (let i = 0; i < len; i++) {
    const element = typeArguments[i];
    if (element !== undefined) {
      itemsBuffer.push(
        next(element, {
          ...ctx,
          depth: ctx.depth + 1,
          parentKey: `${ctx.parentKey}[${i}]`,
        }),
      );
    }
  }

  let hasRestValue = false;
  let restShape: TSolidShape | undefined = undefined;
  const minLengthValue = targetType.minLength || 0;
  const elementFlags = targetType.elementFlags || [];

  // Scan positional indices to pinpoint the true Rest element type allocation
  for (let i = 0; i < len; i++) {
    const flags = elementFlags[i] || 0;
    if ((flags & (ElementFlags.Rest | ElementFlags.Variadic)) !== 0) {
      hasRestValue = true;
      const restType = typeArguments[i];
      if (restType !== undefined) {
        restShape = next(restType, {
          ...ctx,
          depth: ctx.depth + 1,
          parentKey: `${ctx.parentKey}[...rest]`,
        });
      }
      break;
    }
  }

  // Remove tracking token upon clean stack wind-down
  ctx.seen.delete(type);

  const itemsShape: TSolidShape =
    hasRestValue && restShape !== undefined
      ? restShape
      : STATIC_NEVER_TERMINAL_SHAPE;

  return {
    kind: 'array',
    items: itemsShape,
    elementShapes: itemsBuffer,
    minLength: minLengthValue,
    hasRest: hasRestValue,
  };
}
export function reifyArray(
  type: TypeReference,
  checker: TypeChecker,
  next: (type: Type, ctx: TReifyCTX) => TSolidShape,
  ctx: TReifyCTX,
): TSolidShape {
  const typeArgs = checker.getTypeArguments(type) || [];
  const firstArg = typeArgs[0];

  // If the array element argument is missing or matches the array container itself,
  // immediately return our top-level hoisted static fallback blueprint matrix!
  if (firstArg === undefined || firstArg === type) {
    return STATIC_ANY_ARRAY_FALLBACK_SHAPE;
  }

  // ============================================================================
  // ⚡ LAYER 0: RECURSIVE REIFIER TRACK SEPARATION
  // ============================================================================
  if (ctx.seen.has(type)) {
    return STATIC_ANY_ARRAY_FALLBACK_SHAPE;
  }
  ctx.seen.add(type);

  const compiledItems = next(firstArg, {
    ...ctx,
    depth: ctx.depth + 1,
    parentKey: `${ctx.parentKey}[]`,
  });

  ctx.seen.delete(type);

  return {
    kind: 'array',
    items: compiledItems,
    elementShapes: undefined,
    minLength: 0,
    hasRest: false,
  };
}
 */
