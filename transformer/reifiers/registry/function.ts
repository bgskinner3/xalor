import { registerReifier } from './core';
import ts from 'typescript';
function permitsUndefined(type: ts.Type): boolean {
  if (type.isUnion()) {
    const constituents = type.types;
    const len = constituents.length;
    for (let i = 0; i < len; i++) {
      const subType = constituents[i];
      if (
        subType !== undefined &&
        (subType.getFlags() & ts.TypeFlags.Undefined) !== 0
      ) {
        return true;
      }
    }
    return false;
  }
  return (type.getFlags() & ts.TypeFlags.Undefined) !== 0;
}
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

  const sig = signatures[0]!;

  const parameters = sig.getParameters().map((symbol) => {
    const decl = symbol.valueDeclaration;
    const paramType = decl
      ? checker.getTypeOfSymbolAtLocation(symbol, decl)
      : checker.getAnyType();

    const isParamOptional = (symbol.flags & ts.SymbolFlags.Optional) !== 0;
    const hasExplicitUndefinedValue = permitsUndefined(paramType);

    return {
      name: symbol.getName(),
      optional: isParamOptional,
      requiresKeyPresence: !isParamOptional,
      allowsExplicitUndefined: hasExplicitUndefinedValue,
      shape: next(paramType, {
        ...ctx,
        depth: ctx.depth + 1,
        parentKey: `${ctx.parentKey}.${symbol.getName()}`,
        seen: ctx.seen,
      }),
    };
  });

  // Extract and compile the return type shape natively
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
// registerReifier((type, checker, next, ctx) => {
//   const signatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call);

//   if (!signatures.length) return undefined;

//   const sig = signatures[0];
//   const parameters = sig.getParameters().map((symbol) => {
//     const decl = symbol.valueDeclaration;
//     const paramType = decl
//       ? checker.getTypeOfSymbolAtLocation(symbol, decl)
//       : checker.getAnyType();

//     return {
//       name: symbol.getName(),
//       optional: (symbol.flags & ts.SymbolFlags.Optional) !== 0,
//       shape: next(paramType, {
//         ...ctx,
//         depth: ctx.depth + 1,
//         parentKey: `${ctx.parentKey}.${symbol.getName()}`,
//         seen: ctx.seen,
//       }),
//     };
//   });

//   // return type
//   const returnType = sig.getReturnType();

//   const returnShape = next(returnType, {
//     ...ctx,
//     depth: ctx.depth + 1,
//     parentKey: `${ctx.parentKey}.return`,
//     seen: ctx.seen,
//   });

//   return {
//     kind: 'function',
//     parameters,
//     returnType: returnShape,
//   };
// });
