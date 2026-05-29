import ts from 'typescript';
import {
  isObjectTypeGuard,
  isUnionType,
  isIntersectionType,
  isTypeReference,
} from '../../utils';
/**
 * isTypeRecursive
 * 🛰️ THE DEEP CIRCULAR DEPENDENCY RADAR
 *
 * ROLE:
 * Sweeps a raw ts.Type graph structure point-free to check if it contains
 * an active circular dependency or infinite self-referencing cycle.
 */
export function isTypeRecursive(
  type: ts.Type,
  checker: ts.TypeChecker,
  visited: Set<ts.Type> = new Set<ts.Type>(),
): boolean {
  // If this specific type reference has already been encountered in this track branch,
  // it confirms an active circular loop match! Return true immediately.
  if (visited.has(type)) {
    return true;
  }

  // Record this type to track the active depth path
  visited.add(type);

  // 🪐 1. UNION CONSTITUENTS SWEEP
  if (isUnionType(type)) {
    const len = type.types.length;
    for (let i = 0; i < len; i++) {
      const child = type.types[i];
      if (child !== undefined && isTypeRecursive(child, checker, visited)) {
        return true;
      }
    }
    visited.delete(type);
    return false;
  }

  // 🪐 2. INTERSECTION CONSTITUENTS SWEEP
  if (isIntersectionType(type)) {
    const len = type.types.length;
    for (let i = 0; i < len; i++) {
      const child = type.types[i];
      if (child !== undefined && isTypeRecursive(child, checker, visited)) {
        return true;
      }
    }
    visited.delete(type);
    return false;
  }

  // 🪐 3. OBJECT PROPERTIES EXTRACTION SWEEP
  if (isObjectTypeGuard(type)) {
    if (isTypeReference(type)) {
      const typeArguments = checker.getTypeArguments(type);
      const argLen = typeArguments.length;
      for (let i = 0; i < argLen; i++) {
        const arg = typeArguments[i];
        if (arg !== undefined && isTypeRecursive(arg, checker, visited)) {
          return true;
        }
      }
    }

    const properties = type.getProperties();
    const propLen = properties.length;

    for (let i = 0; i < propLen; i++) {
      const sym = properties[i];
      if (sym === undefined) continue;

      // Don't crawl private internal properties
      const name = sym.getName();
      if (name.startsWith('_') || name.startsWith('$')) continue;

      const targetDecl =
        sym.valueDeclaration !== undefined
          ? sym.valueDeclaration
          : sym.declarations !== undefined && sym.declarations.length > 0
            ? sym.declarations[0]
            : undefined;

      if (targetDecl === undefined) continue;

      const propType = checker.getTypeOfSymbolAtLocation(sym, targetDecl);
      if (
        propType !== undefined &&
        isTypeRecursive(propType, checker, visited)
      ) {
        return true;
      }
    }
  }

  // Clean from memory stack context when exiting this scope layer frame safely
  visited.delete(type);
  return false;
}
