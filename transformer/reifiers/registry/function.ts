import { registerReifier } from './core';
import ts from 'typescript';

/**
 * FUNCTION REIFIER (Call Signature Extractor)
 *
 * Converts callable TypeScript types into:
 * - parameter shapes
 * - return shape
 */
registerReifier((type, checker, next, ctx) => {
  const signatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call);

  if (!signatures.length) return undefined;

  const sig = signatures[0];
  const parameters = sig.getParameters().map((symbol) => {
    const decl = symbol.valueDeclaration;
    const paramType = decl
      ? checker.getTypeOfSymbolAtLocation(symbol, decl)
      : checker.getAnyType();

    return {
      name: symbol.getName(),
      optional: (symbol.flags & ts.SymbolFlags.Optional) !== 0,
      shape: next(paramType, {
        ...ctx,
        depth: ctx.depth + 1,
        parentKey: `${ctx.parentKey}.${symbol.getName()}`,
        seen: ctx.seen,
      }),
    };
  });

  // return type
  const returnType = sig.getReturnType();

  const returnShape = next(returnType, {
    ...ctx,
    depth: ctx.depth + 1,
    parentKey: `${ctx.parentKey}.return`,
    seen: ctx.seen,
  });

  return {
    kind: 'function',
    parameters,
    returnType: returnShape,
  };
});
