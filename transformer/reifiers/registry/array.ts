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
    reifyTuple(type, checker, next, ctx);
  }
  if (isArrayType(type)) {
    if (!isTypeReference(type)) return undefined;
    reifyArray(type, checker, next, ctx);
  }
  return undefined;
});

// // transformer/reifiers/registry/array.ts
// import { registerReifier } from './core';
// import {
//   isObjectTypeGuard,
//   isTypeReference,
//   isTupleType,
//   isArrayType,
// } from '../../utils';
// import type { TSolidShape } from '../../../shared';
// import { ObjectFlags, ElementFlags } from 'typescript';

// // TODO: OPTIMIZE
// registerReifier((type, checker, next, ctx) => {
//   // 🛡️ Guard 1: Instantly exit if this isn't an object type flag
//   if (!isObjectTypeGuard(type)) return undefined;

//   const objectFlags = type.objectFlags;

//   // 🔍 1. TUPLE SUB-CLASSIFICATION MINING
//   if (objectFlags & ObjectFlags.Tuple) {
//     // 🛡️ Guard 2: Safely narrow to TypeReference using our predicate guard instead of an 'as' cast
//     if (!isTypeReference(type)) return undefined;

//     const typeArguments = checker.getTypeArguments(type) || [];
//     const fallbackItemType = checker.getAnyType ? checker.getAnyType() : type;

//     const len = typeArguments.length;
//     const itemsBuffer: TSolidShape[] = [];

//     for (let i = 0; i < len; i++) {
//       const element = typeArguments[i];
//       if (element) {
//         itemsBuffer.push(
//           next(element, {
//             ...ctx,
//             depth: ctx.depth + 1,
//             parentKey: `${ctx.parentKey}[${i}]`,
//           }),
//         );
//       }
//     }

//     const targetType = type.target;

//     // Guard 3: Prove the target is a valid TupleType structure before reading metrics
//     const isTuple = isObjectTypeGuard(targetType) && isTupleType(targetType);
//     const minLengthValue = isTuple ? targetType.minLength : 0;

//     // ✅ Fixed: Use combinedFlags bitwise check instead of deprecated hasRestElement
//     const hasRestValue = isTuple
//       ? (targetType.combinedFlags &
//           (ElementFlags.Variable | ElementFlags.Rest)) !==
//         0
//       : false;

//     // Resolve the first element type safely using array indices without casting overrides
//     const firstArg = typeArguments[0];
//     const itemsShape = firstArg
//       ? next(firstArg, ctx)
//       : next(fallbackItemType, ctx);

//     return {
//       kind: 'array',
//       items: itemsShape,
//       elementShapes: itemsBuffer,
//       minLength: minLengthValue,
//       hasRest: hasRestValue,
//     };
//   }

//   // 📦 2. STANDARD GENERIC ARRAY FALLBACK
//   if (isArrayType(type)) {
//     const typeArgs = checker.getTypeArguments(type) || [];
//     const firstArg = typeArgs[0];
//     const itemType =
//       firstArg ?? (checker.getAnyType ? checker.getAnyType() : type);

//     return {
//       kind: 'array',
//       items: next(itemType, {
//         ...ctx,
//         depth: ctx.depth + 1,
//         parentKey: `${ctx.parentKey}[]`,
//       }),
//       elementShapes: undefined,
//       minLength: 0,
//       hasRest: false,
//     };
//   }

//   return undefined;
// });
