import ts from 'typescript';
import {
  isObjectTypeGuard,
  isUnionType,
  isIntersectionType,
  isTypeReference,
} from '../../utils';
import { shapeKindUtilsService } from '../../../shared';
import { isUndefined } from '../../../shared/utils/guards';

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
  if (visited.has(type)) return true;

  // ========================================================================
  //  GLOBAL INSTANCE TERMINAL SHIELD
  // Prevent the engine from crawling the internal prototype loops of native classes
  // ========================================================================
  const symbol = type.getSymbol() ?? type.aliasSymbol;
  if (!isUndefined(symbol)) {
    const symbolName = symbol.getName();
    const cleanSymbolName = symbolName.replace(/Constructor$/, '');

    if (shapeKindUtilsService.isKnownInstanceKey(cleanSymbolName)) return false;
  }

  /* prettier-ignore */ const fullyQualifiedName = checker.typeToString(type);
  /* prettier-ignore */ const cleanQualifiedName = fullyQualifiedName.replace(/Constructor$/, '');
  /* prettier-ignore */ if (shapeKindUtilsService.isKnownInstanceKey(cleanQualifiedName)) return false;

  // Record this type to track the active depth path retrieval loop
  visited.add(type);

  const flags = type.getFlags();

  // ========================================================================
  // 🪐 STEP 2: FUNCTIONAL SIGNATURE SWEEP
  // ========================================================================
  /* prettier-ignore */
  if ((flags & ts.TypeFlags.Object) !== 0 && type.getCallSignatures().length > 0) {
    const signatures = type.getCallSignatures();
    const { length } = signatures;

    for (let i = 0; i < length; i++) {
      const sig = signatures[i];
      if (isUndefined(sig)) continue;

      // 1. Audit function return types for circular references
      const returnType = checker.getReturnTypeOfSignature(sig);
      /* prettier-ignore */
      if (!isUndefined(returnType) && isTypeRecursive(returnType, checker, visited)) return true;

      // 2. Audit function parameter shapes for circular references
      const parameters = sig.getParameters();
      const { length: paramLen } = parameters;
      for (let j = 0; j < paramLen; j++) {
        const paramSym = parameters[j];
        if (isUndefined(paramSym)) continue;

        const paramDecl =
          paramSym.valueDeclaration ??
          (!isUndefined(paramSym.declarations) &&
          paramSym.declarations.length > 0
            ? paramSym.declarations[0]
            : undefined);

        if (isUndefined(paramDecl)) continue;

        /* prettier-ignore */ const paramType = checker.getTypeOfSymbolAtLocation(paramSym, paramDecl);

        /* prettier-ignore */ if (!isUndefined(paramType) && isTypeRecursive(paramType, checker, visited)) return true;
      }
    }

    visited.delete(type);
    return false;
  }

  // ========================================================================
  // 🪐 3. UNION CONSTITUENTS SWEEP
  // ========================================================================
  if (isUnionType(type)) {
    const constituents = type.types;
    const len = constituents.length;
    for (let i = 0; i < len; i++) {
      const child = constituents[i];
      if (child !== undefined && isTypeRecursive(child, checker, visited)) {
        return true;
      }
    }
    visited.delete(type);
    return false;
  }

  // ========================================================================
  // 🪐 4. INTERSECTION CONSTITUENTS SWEEP
  // ========================================================================
  if (isIntersectionType(type)) {
    const constituents = type.types;
    const len = constituents.length;
    for (let i = 0; i < len; i++) {
      const child = constituents[i];
      /* prettier-ignore */ if (!isUndefined(child) && isTypeRecursive(child, checker, visited)) return true;
    }
    visited.delete(type);
    return false;
  }

  // ========================================================================
  // 🪐 5. OBJECT PROPERTIES EXTRACTION SWEEP
  // ========================================================================
  if (isObjectTypeGuard(type)) {
    if (isTypeReference(type)) {
      const typeArguments = checker.getTypeArguments(type);
      const argLen = typeArguments.length;
      for (let i = 0; i < argLen; i++) {
        const arg = typeArguments[i];
        /* prettier-ignore */ if (!isUndefined(arg) && isTypeRecursive(arg, checker, visited)) return true;
      }
    }

    const properties = type.getProperties();
    const propLen = properties.length;
    for (let i = 0; i < propLen; i++) {
      const sym = properties[i];
      if (sym === undefined) continue;

      const name = sym.getName();
      if (name.startsWith('_') || name.startsWith('$')) {
        continue;
      }

      const targetDecl = !isUndefined(sym.valueDeclaration)
        ? sym.valueDeclaration
        : !isUndefined(sym.declarations) && sym.declarations.length > 0
          ? sym.declarations[0]
          : undefined;

      if (isUndefined(targetDecl)) continue;

      /* prettier-ignore */ const propType = checker.getTypeOfSymbolAtLocation(sym, targetDecl);

      /* prettier-ignore */ if (!isUndefined(propType) && isTypeRecursive(propType, checker, visited)) return true;
    }
  }

  // Clean from memory stack context when exiting this scope layer frame safely
  visited.delete(type);
  return false;
}
