import ts from 'typescript';
import {
  isTypeReference,
  isObjectTypeGuard,
  isUnionType,
  isIntersectionType,
  isClassOrInterfaceType,
} from '../../utils'; // Adjust paths to match your shared utilities
import type { TPrintGhostStructure } from '../../types';

/**
 * executeUnrollPass
 * 🪐 THE STATIC UNROLLING MACHINE (Cyclic Defused Edition)
 *
 * ROLE:
 * Pure, stateless execution loop that unwinds shapes recursively on the stack
 * into readable string contracts without instantiating temporary objects on the heap.
 *
 * STRATEGY:
 * Tracks evaluated ts.Type references point-free inside a stack Set context frame.
 * If a type is re-encountered inside its own lineage branch, it short-circuits
 * locally and injects an explicit circular marker token string, completely
 * shielding the V8 engine call stack frames from RangeError collapses.
 */
function executeUnrollPass(
  type: ts.Type,
  checker: ts.TypeChecker,
  node: ts.Node,
  visitedTypes: Set<ts.Type> = new Set<ts.Type>(),
): string {
  // 🪐 THE INTEGRATED INLINE CYCLIC INTERCEPTOR
  if (visitedTypes.has(type)) {
    const symbol = type.aliasSymbol || type.getSymbol();
    const typeNameLabel = symbol !== undefined ? symbol.getName() : 'Circular';

    // This provides beautiful structural clarity on hover cards without triggering a syntax crash.
    return `TXalorCyclicToken<"${typeNameLabel}">`;
  }

  // Record this type reference as active in the current path stack frame branch
  visitedTypes.add(type);

  // ========================================================================
  // 🪐 1. ARRAY TYPE UNROLLING PASS
  // ========================================================================
  if (checker.isArrayType(type) && isTypeReference(type)) {
    const typeArgs = checker.getTypeArguments(type);
    const itemString =
      typeArgs && typeArgs.length > 0
        ? executeUnrollPass(typeArgs[0], checker, node, visitedTypes)
        : 'unknown';

    visitedTypes.delete(type);
    return `${itemString}[]`;
  }

  // ========================================================================
  // 🪐 2. UNION TYPE UNROLLING PASS
  // ========================================================================
  if (isUnionType(type)) {
    const constituents = type.types;
    const unionLen = constituents.length;
    const unionStringTokens: string[] = [];

    for (let i = 0; i < unionLen; i++) {
      const variant = constituents[i];
      if (variant !== undefined) {
        unionStringTokens.push(
          executeUnrollPass(variant, checker, node, visitedTypes),
        );
      }
    }

    visitedTypes.delete(type);
    return unionStringTokens.join(' | ');
  }

  // ========================================================================
  // 🪐 3. OBJECT / INTERFACE / INTERSECTION TYPE UNROLLING PASS
  // ========================================================================
  const isClassOrInterface = isClassOrInterfaceType(type);
  const isObject = isObjectTypeGuard(type);
  const isIntersection = isIntersectionType(type);

  if (isClassOrInterface || isObject || isIntersection) {
    if (isTypeReference(type)) {
      const typeArguments = checker.getTypeArguments(type);
      const argLen = typeArguments.length;
      if (argLen > 0) {
        const genericArgBuffer: string[] = [];
        for (let i = 0; i < argLen; i++) {
          const arg = typeArguments[i];
          if (arg !== undefined) {
            genericArgBuffer.push(
              executeUnrollPass(arg, checker, node, visitedTypes),
            );
          }
        }
        const symbol = type.aliasSymbol || type.getSymbol();
        const genericBaseName =
          symbol !== undefined ? symbol.getName() : 'Anonymous';

        visitedTypes.delete(type);
        return `${genericBaseName}<${genericArgBuffer.join(', ')}>`;
      }
    }

    const coreProperties = checker.getPropertiesOfType(type);
    const propLen = coreProperties.length;

    // Commandment VIII — Zero allocation immutable token buffering
    const structuralTokenBuffer: string[] = [];

    for (let i = 0; i < propLen; i++) {
      const p = coreProperties[i];
      if (p === undefined) continue;

      const pDeclaration = p.valueDeclaration || p.declarations?.[0];
      const pType = pDeclaration
        ? checker.getTypeOfSymbolAtLocation(p, pDeclaration)
        : checker.getDeclaredTypeOfSymbol(p);

      if ((pType.getFlags() & ts.TypeFlags.Never) !== 0) {
        continue;
      }

      const isOptional =
        (p.getFlags() & ts.SymbolFlags.Optional) !== 0 ? '?' : '';

      // Pass the active visited set context frame down through the recursive child properties loop
      const structure = executeUnrollPass(pType, checker, node, visitedTypes);

      structuralTokenBuffer.push(`${p.getName()}${isOptional}: ${structure};`);
    }

    visitedTypes.delete(type);
    return `{ ${structuralTokenBuffer.join(' ')} }`;
  }

  // ========================================================================
  // 🪐 4. PRIMITIVE PRIMITIVE LEAF NODES (Default Fallback Pass)
  // ========================================================================
  // Clear from cache memory before exiting this final evaluation scope frame safely
  visitedTypes.delete(type);
  return checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation);
}

/**
 * printGhostStructure
 * 🛰️ TOOLING GEAR: GHOST TYPE STRINGIFIER
 */
export function printGhostStructure(params: TPrintGhostStructure): string {
  const { type, checker, node } = params;

  return executeUnrollPass(type, checker, node, new Set<ts.Type>());
}
