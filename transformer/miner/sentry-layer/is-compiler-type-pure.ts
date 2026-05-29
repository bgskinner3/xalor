import ts from 'typescript';
import {
  isObjectTypeGuard,
  isUnionType,
  isIntersectionType,
  isTypeReference,
} from '../../utils';

/**
 * isCompilerTypePure
 * 🛰️ THE COMPILER-LEVEL PURITY GATEKEEPER (Cyclic Defused Edition)
 *
 * ROLE:
 * Analyzes raw ts.Type symbols directly off the AST context before reification.
 * Intercepts native closures, function handles, and raw JS unique symbols.
 *
 * STRATEGY:
 * Tracks evaluated ts.Type references point-free inside a stack Set context frame.
 * If a type is re-encountered, it flags an active circular dependency cyclic link,
 * short-circuiting recursion immediately to shield the V8 call stack from RangeErrors.
 */
export function isCompilerTypePure(
  type: ts.Type,
  checker: ts.TypeChecker,
  visitedTypes: Set<ts.Type> = new Set<ts.Type>(),
): boolean {
  if (visitedTypes.has(type)) {
    return true;
  }

  const flags = type.getFlags();

  // DETECT RAW FORBIDDEN COMPILED PRIMITIVES
  if (
    (flags & ts.TypeFlags.ESSymbol) !== 0 ||
    (flags & ts.TypeFlags.ESSymbolLike) !== 0
  ) {
    return false;
  }

  // THE STRUCTURAL ARRAY CONTAINER SHIELD
  const isNativeArray = checker.isArrayType(type);
  const isNativeTuple =
    (flags & ts.TypeFlags.Object) !== 0 && checker.isTupleType?.(type);

  if (isNativeArray || isNativeTuple) {
    if (isTypeReference(type)) {
      const typeArguments = checker.getTypeArguments(type);
      const argLen = typeArguments.length;

      for (let i = 0; i < argLen; i++) {
        const arg = typeArguments[i];
        if (
          arg !== undefined &&
          !isCompilerTypePure(arg, checker, visitedTypes)
        ) {
          return false;
        }
      }
    }
    return true;
  }

  //  HIGH-PRECISION CALL SIGNATURE BARRIER FOR REGULAR OBJECTS
  if (
    (flags & ts.TypeFlags.Object) !== 0 &&
    type.getCallSignatures().length > 0
  ) {
    return false;
  }

  visitedTypes.add(type);

  // ========================================================================
  // B. RECURSIVE UNION SECTOR SWEEP
  // ========================================================================
  if (isUnionType(type)) {
    const constituents = type.types;
    const len = constituents.length;
    for (let i = 0; i < len; i++) {
      const childType = constituents[i];
      if (
        childType !== undefined &&
        !isCompilerTypePure(childType, checker, visitedTypes)
      ) {
        visitedTypes.delete(type);
        return false;
      }
    }
    visitedTypes.delete(type);
    return true;
  }

  // ========================================================================
  // C. RECURSIVE INTERSECTION SECTOR SWEEP
  // ========================================================================
  if (isIntersectionType(type)) {
    const constituents = type.types;
    const len = constituents.length;
    for (let i = 0; i < len; i++) {
      const childType = constituents[i];
      if (
        childType !== undefined &&
        !isCompilerTypePure(childType, checker, visitedTypes)
      ) {
        visitedTypes.delete(type);
        return false;
      }
    }
    visitedTypes.delete(type);
    return true;
  }

  // ========================================================================
  // D. STANDARD OBJECT & RECURSIVE PROPERTY SECTOR SWEEP
  // ========================================================================
  if (isObjectTypeGuard(type)) {
    if (isTypeReference(type)) {
      const typeArguments = checker.getTypeArguments(type);
      const argLen = typeArguments.length;
      for (let i = 0; i < argLen; i++) {
        const arg = typeArguments[i];
        if (
          arg !== undefined &&
          !isCompilerTypePure(arg, checker, visitedTypes)
        ) {
          visitedTypes.delete(type);
          return false;
        }
      }
    }

    const symbols = type.getProperties();
    const symbolLen = symbols.length;

    for (let i = 0; i < symbolLen; i++) {
      const sym = symbols[i];
      if (sym === undefined) continue;

      const key = sym.getName();
      if (key.startsWith('_') || key.startsWith('$')) {
        visitedTypes.delete(type);
        return false;
      }

      const targetDeclarationNode =
        sym.valueDeclaration !== undefined
          ? sym.valueDeclaration
          : sym.declarations !== undefined && sym.declarations.length > 0
            ? sym.declarations[0] // Isolate index 0 safely
            : undefined;

      if (targetDeclarationNode === undefined) {
        continue;
      }

      const propType = checker.getTypeOfSymbolAtLocation(
        sym,
        targetDeclarationNode,
      );
      if (
        propType !== undefined &&
        !isCompilerTypePure(propType, checker, visitedTypes)
      ) {
        visitedTypes.delete(type);
        return false;
      }
    }
  }

  visitedTypes.delete(type);
  return true;
}
