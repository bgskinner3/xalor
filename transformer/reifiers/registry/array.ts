// transformer/reifiers/registry/array.ts
import ts from 'typescript';
import { registerReifier } from './core';
import { isObjectTypeGuard, isTypeReference, isTupleType } from '../../utils';
import type { TSolidShape } from '../../../shared';

// TODO: OPTIMIZE
registerReifier((type, checker, next, ctx) => {
  // 🛡️ Guard 1: Instantly exit if this isn't an object type flag
  if (!isObjectTypeGuard(type)) return undefined;

  const objectFlags = type.objectFlags;

  // 🔍 1. TUPLE SUB-CLASSIFICATION MINING
  if (objectFlags & ts.ObjectFlags.Tuple) {
    // 🛡️ Guard 2: Safely narrow to TypeReference using our predicate guard instead of an 'as' cast
    if (!isTypeReference(type)) return undefined;

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
    // Guard 3: Prove the target is a valid TupleType structure before reading metrics
    const isTuple = isObjectTypeGuard(targetType) && isTupleType(targetType);
    const minLengthValue = isTuple ? targetType.minLength : 0;
    const hasRestValue = isTuple ? targetType.hasRestElement : false;

    // Resolve the first element type safely using array indices without casting overrides
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

  // 📦 2. STANDARD GENERIC ARRAY FALLBACK
  if (checker.isArrayType(type)) {
    if (!isTypeReference(type)) return undefined;

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

  return undefined;
});
