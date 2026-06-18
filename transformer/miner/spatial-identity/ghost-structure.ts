import ts from 'typescript';
import {
  isTypeReference,
  isObjectTypeGuard,
  isUnionType,
  isIntersectionType,
  isClassOrInterfaceType,
} from '../../utils'; // Adjust paths to match your shared utilities
import type { TPrintGhostStructure } from '../../types';
import { shapeKindUtilsService } from '../../../shared';
/**
 * executeUnrollPass
 * 🪐 THE STATIC UNROLLING MACHINE (Instance & Cyclic Shield Edition)
 */
function executeUnrollPass(
  type: ts.Type,
  checker: ts.TypeChecker,
  node: ts.Node,
  visitedTypes: Set<ts.Type> = new Set<ts.Type>(),
): string {
  // 🪐 THE INTEGRATED INLINE CYCLIC INTERCEPTOR
  // Catch vertical self-referential graph tracks instantly and break recursion!
  if (visitedTypes.has(type)) {
    const symbol = type.aliasSymbol || type.getSymbol();
    const typeNameLabel = symbol !== undefined ? symbol.getName() : 'Circular';
    return `TXalorCyclicToken<"${typeNameLabel}">`;
  }

  // ========================================================================
  // 🏛️ STEP 1: GLOBAL INSTANCE TERMINAL SHIELD
  // ========================================================================
  const symbol = type.getSymbol() ?? type.aliasSymbol;
  if (symbol !== undefined) {
    const symbolName = symbol.getName();
    const cleanSymbolName = symbolName.replace(/Constructor$/, '');
    if (shapeKindUtilsService.isKnownInstanceKey(cleanSymbolName)) {
      return cleanSymbolName;
    }
  }

  const fullyQualifiedName = checker.typeToString(
    type,
    node,
    ts.TypeFormatFlags.NoTruncation,
  );
  const cleanQualifiedName = fullyQualifiedName.replace(/Constructor$/, '');

  if (
    fullyQualifiedName.startsWith('Promise<') ||
    fullyQualifiedName.startsWith('PromiseLike<')
  ) {
    return 'Promise<unknown>';
  }
  if (shapeKindUtilsService.isKnownInstanceKey(cleanQualifiedName)) {
    return cleanQualifiedName;
  }

  // ========================================================================
  // 🪐 1. ARRAY TYPE UNROLLING PASS
  // ========================================================================
  if (checker.isArrayType(type) && isTypeReference(type)) {
    const typeArgs = checker.getTypeArguments(type);

    // Allocate isolated tracing context for the array item type branch
    const childVisited = new Set<ts.Type>(visitedTypes);
    childVisited.add(type);

    const itemString =
      typeArgs && typeArgs.length > 0
        ? executeUnrollPass(typeArgs[0], checker, node, childVisited)
        : 'unknown';
    return `${itemString}[]`;
  }

  // ========================================================================
  // 🪐 2. UNION TYPE UNROLLING PASS
  // ========================================================================
  if (isUnionType(type)) {
    const constituents = type.types;
    const unionLen = constituents.length;
    const unionStringTokens: string[] = [];

    // Allocate isolated tracing context for the union constituents branch
    const childVisited = new Set<ts.Type>(visitedTypes);
    childVisited.add(type);

    for (let i = 0; i < unionLen; i++) {
      const variant = constituents[i];
      if (variant !== undefined) {
        unionStringTokens.push(
          executeUnrollPass(variant, checker, node, childVisited),
        );
      }
    }
    return unionStringTokens.join(' | ');
  }

  // ========================================================================
  // 🪐 3. OBJECT / INTERFACE / INTERSECTION TYPE UNROLLING PASS
  // ========================================================================
  const isClassOrInterface = isClassOrInterfaceType(type);
  const isObject = isObjectTypeGuard(type);
  const isIntersection = isIntersectionType(type);

  if (isClassOrInterface || isObject || isIntersection) {
    // Separate pure functional call handlers from structural data object tables
    if (type.getCallSignatures().length > 0) {
      const funcSymbol = type.getSymbol() ?? type.aliasSymbol;
      const funcLabelName =
        funcSymbol !== undefined ? funcSymbol.getName() : 'Function';
      return `TXalorCyclicToken<"${funcLabelName}">`;
    }

    if (isTypeReference(type)) {
      const typeArguments = checker.getTypeArguments(type);
      const argLen = typeArguments.length;
      if (argLen > 0) {
        const genericArgBuffer: string[] = [];
        const childVisited = new Set<ts.Type>(visitedTypes);
        childVisited.add(type);

        for (let i = 0; i < argLen; i++) {
          const arg = typeArguments[i];
          if (arg !== undefined) {
            genericArgBuffer.push(
              executeUnrollPass(arg, checker, node, childVisited),
            );
          }
        }
        const symbolObj = type.aliasSymbol || type.getSymbol();
        const genericBaseName =
          symbolObj !== undefined ? symbolObj.getName() : 'Anonymous';
        return `${genericBaseName}<${genericArgBuffer.join(', ')}>`;
      }
    }

    const coreProperties = checker.getPropertiesOfType(type);
    const propLen = coreProperties.length;
    const structuralTokenBuffer: string[] = [];

    // 🟢 FIXED: We allocate a fresh, isolated branch cache frame for our properties sweep loop.
    // Sibling properties cannot contaminate or mutate each other's ancestry vertical history!
    const loopVisited = new Set<ts.Type>(visitedTypes);
    loopVisited.add(type);

    for (let i = 0; i < propLen; i++) {
      const p = coreProperties[i];
      if (p === undefined) continue;

      const pName = p.getName();
      if (pName.startsWith('_') || pName.startsWith('$')) continue;

      const pDeclaration = p.valueDeclaration || p.declarations?.[0];
      const pType = pDeclaration
        ? checker.getTypeOfSymbolAtLocation(p, pDeclaration)
        : checker.getDeclaredTypeOfSymbol(p);

      if ((pType.getFlags() & ts.TypeFlags.Never) !== 0) {
        continue;
      }

      const isOptional =
        (p.getFlags() & ts.SymbolFlags.Optional) !== 0 ? '?' : '';

      // Pass the isolated vertical branch context down through the property crawl stream safely
      const structure = executeUnrollPass(pType, checker, node, loopVisited);
      structuralTokenBuffer.push(`${pName}${isOptional}: ${structure};`);
    }

    return `{ ${structuralTokenBuffer.join(' ')} }`;
  }

  // ========================================================================
  // 🪐 4. PRIMITIVE PRIMITIVE LEAF NODES (Default Fallback Pass)
  // ========================================================================
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
// /**
//  * executeUnrollPass
//  * 🪐 THE STATIC UNROLLING MACHINE (Cyclic Defused Edition)
//  *
//  * ROLE:
//  * Pure, stateless execution loop that unwinds shapes recursively on the stack
//  * into readable string contracts without instantiating temporary objects on the heap.
//  *
//  * STRATEGY:
//  * Tracks evaluated ts.Type references point-free inside a stack Set context frame.
//  * If a type is re-encountered inside its own lineage branch, it short-circuits
//  * locally and injects an explicit circular marker token string, completely
//  * shielding the V8 engine call stack frames from RangeError collapses.
//  */
// function executeUnrollPass(
//   type: ts.Type,
//   checker: ts.TypeChecker,
//   node: ts.Node,
//   visitedTypes: Set<ts.Type> = new Set<ts.Type>(),
// ): string {
//   // 🪐 THE INTEGRATED INLINE CYCLIC INTERCEPTOR
//   if (visitedTypes.has(type)) {
//     const symbol = type.aliasSymbol || type.getSymbol();
//     const typeNameLabel = symbol !== undefined ? symbol.getName() : 'Circular';

//     // This provides beautiful structural clarity on hover cards without triggering a syntax crash.
//     return `TXalorCyclicToken<"${typeNameLabel}">`;
//   }

//   // Record this type reference as active in the current path stack frame branch
//   visitedTypes.add(type);

//   // ========================================================================
//   // 🪐 1. ARRAY TYPE UNROLLING PASS
//   // ========================================================================
//   if (checker.isArrayType(type) && isTypeReference(type)) {
//     const typeArgs = checker.getTypeArguments(type);
//     const itemString =
//       typeArgs && typeArgs.length > 0
//         ? executeUnrollPass(typeArgs[0], checker, node, visitedTypes)
//         : 'unknown';

//     visitedTypes.delete(type);
//     return `${itemString}[]`;
//   }

//   // ========================================================================
//   // 🪐 2. UNION TYPE UNROLLING PASS
//   // ========================================================================
//   if (isUnionType(type)) {
//     const constituents = type.types;
//     const unionLen = constituents.length;
//     const unionStringTokens: string[] = [];

//     for (let i = 0; i < unionLen; i++) {
//       const variant = constituents[i];
//       if (variant !== undefined) {
//         unionStringTokens.push(
//           executeUnrollPass(variant, checker, node, visitedTypes),
//         );
//       }
//     }

//     visitedTypes.delete(type);
//     return unionStringTokens.join(' | ');
//   }

//   // ========================================================================
//   // 🪐 3. OBJECT / INTERFACE / INTERSECTION TYPE UNROLLING PASS
//   // ========================================================================
//   const isClassOrInterface = isClassOrInterfaceType(type);
//   const isObject = isObjectTypeGuard(type);
//   const isIntersection = isIntersectionType(type);

//   if (isClassOrInterface || isObject || isIntersection) {
//     if (isTypeReference(type)) {
//       const typeArguments = checker.getTypeArguments(type);
//       const argLen = typeArguments.length;
//       if (argLen > 0) {
//         const genericArgBuffer: string[] = [];
//         for (let i = 0; i < argLen; i++) {
//           const arg = typeArguments[i];
//           if (arg !== undefined) {
//             genericArgBuffer.push(
//               executeUnrollPass(arg, checker, node, visitedTypes),
//             );
//           }
//         }
//         const symbol = type.aliasSymbol || type.getSymbol();
//         const genericBaseName =
//           symbol !== undefined ? symbol.getName() : 'Anonymous';

//         visitedTypes.delete(type);
//         return `${genericBaseName}<${genericArgBuffer.join(', ')}>`;
//       }
//     }

//     const coreProperties = checker.getPropertiesOfType(type);
//     const propLen = coreProperties.length;

//     // Commandment VIII — Zero allocation immutable token buffering
//     const structuralTokenBuffer: string[] = [];

//     for (let i = 0; i < propLen; i++) {
//       const p = coreProperties[i];
//       if (p === undefined) continue;

//       const pDeclaration = p.valueDeclaration || p.declarations?.[0];
//       const pType = pDeclaration
//         ? checker.getTypeOfSymbolAtLocation(p, pDeclaration)
//         : checker.getDeclaredTypeOfSymbol(p);

//       if ((pType.getFlags() & ts.TypeFlags.Never) !== 0) {
//         continue;
//       }

//       const isOptional =
//         (p.getFlags() & ts.SymbolFlags.Optional) !== 0 ? '?' : '';

//       // Pass the active visited set context frame down through the recursive child properties loop
//       const structure = executeUnrollPass(pType, checker, node, visitedTypes);

//       structuralTokenBuffer.push(`${p.getName()}${isOptional}: ${structure};`);
//     }

//     visitedTypes.delete(type);
//     return `{ ${structuralTokenBuffer.join(' ')} }`;
//   }

//   // ========================================================================
//   // 🪐 4. PRIMITIVE PRIMITIVE LEAF NODES (Default Fallback Pass)
//   // ========================================================================
//   // Clear from cache memory before exiting this final evaluation scope frame safely
//   visitedTypes.delete(type);
//   return checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation);
// }

// /**
//  * printGhostStructure
//  * 🛰️ TOOLING GEAR: GHOST TYPE STRINGIFIER
//  */
// export function printGhostStructure(params: TPrintGhostStructure): string {
//   const { type, checker, node } = params;

//   return executeUnrollPass(type, checker, node, new Set<ts.Type>());
// }
