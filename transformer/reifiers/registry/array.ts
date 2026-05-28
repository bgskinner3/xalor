// transformer/reifiers/registry/array.ts
import { registerReifier } from './core';
import { isTypeReference } from '../../utils';
import { ObjectFlags } from 'typescript';
import type { TypeReference } from 'typescript';
registerReifier((type, checker, next, ctx) => {
  const objectFlags = Reflect.get(type, 'objectFlags');

  // 🔍 1. TUPLE SUB-CLASSIFICATION MINING
  // Check if objectFlags carries the native compiler Tuple mask
  if (typeof objectFlags === 'number' && objectFlags & ObjectFlags.Tuple) {
    // Safely extract type arguments using the official Checker API without custom 'as' casts
    const typeReference = type as unknown as TypeReference;
    const typeArguments = checker.getTypeArguments(typeReference) || [];

    // Fall back smoothly to an 'any' token if structural elements are blank
    const fallbackItemType = checker.getAnyType ? checker.getAnyType() : type;

    // Recursively analyze and transform each positional element shape index-by-index
    const elementShapes = typeArguments.map((element, idx) => {
      return next(element, {
        ...ctx,
        depth: ctx.depth + 1,
        parentKey: `${ctx.parentKey}[${idx}]`,
      });
    });

    // Extract length and rest metrics straight out of the compiler target object properties
    const target = Reflect.get(type, 'target');
    const minLength =
      typeof target === 'object' && target !== null
        ? Reflect.get(target, 'minLength')
        : 0;
    const hasRestElement =
      typeof target === 'object' && target !== null
        ? Reflect.get(target, 'hasRestElement')
        : false;

    return {
      kind: 'array',
      items: typeArguments[0]
        ? next(typeArguments[0], ctx)
        : next(fallbackItemType, ctx),
      elementShapes,
      minLength: typeof minLength === 'number' ? minLength : 0,
      hasRest: typeof hasRestElement === 'boolean' ? hasRestElement : false,
    };
  }

  // 📦 2. STANDARD GENERIC ARRAY FALLBACK
  if (checker.isArrayType(type) && isTypeReference(type)) {
    const typeArgs = checker.getTypeArguments(type);
    const itemType = typeArgs[0] ?? checker.getAnyType();

    return {
      kind: 'array',
      items: next(itemType, {
        ...ctx,
        depth: ctx.depth + 1,
        parentKey: `${ctx.parentKey}[]`,
      }),
    };
  }

  return undefined;
});
