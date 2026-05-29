import ts from 'typescript';
import {
  isObjectTypeGuard,
  isUnionType,
  isIntersectionType,
  isTypeReference,
} from '../../utils'; // Adjust paths to your type guards location

/**
 * isCompilerTypePure
 * 🛰️ THE COMPILER-LEVEL PURITY GATEKEEPER
 *
 * ROLE:
 * Analyzes raw ts.Type symbols directly off the AST context before reification.
 * Intercepts native closures, runtime function handles, and raw JS unique symbols.
 */
export function isCompilerTypePure(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  const flags = type.getFlags();

  // ========================================================================
  // 🪐 A. INTERCEPT RAW FORBIDDEN COMPILED PRIMITIVES
  // ========================================================================
  // If the node represents an internal compiler 'ESSymbol' (unique symbol)
  // or a raw execution 'ESSymbolLike', reject it completely.
  if (
    (flags & ts.TypeFlags.ESSymbol) !== 0 ||
    (flags & ts.TypeFlags.ESSymbolLike) !== 0
  ) {
    return false;
  }

  // If a developer tries to register an executable function macro or closure block
  if (
    (flags & ts.TypeFlags.Object) !== 0 &&
    type.getCallSignatures().length > 0
  ) {
    return false;
  }

  // ========================================================================
  // 🪐 B. RECURSIVE UNION SECTOR SWEEP
  // ========================================================================
  if (isUnionType(type)) {
    const constituents = type.types;
    const len = constituents.length;
    for (let i = 0; i < len; i++) {
      const childType = constituents[i];
      if (childType !== undefined && !isCompilerTypePure(childType, checker)) {
        return false;
      }
    }
    return true;
  }

  // ========================================================================
  // 🪐 C. RECURSIVE INTERSECTION SECTOR SWEEP
  // ========================================================================
  if (isIntersectionType(type)) {
    const constituents = type.types;
    const len = constituents.length;
    for (let i = 0; i < len; i++) {
      const childType = constituents[i];
      if (childType !== undefined && !isCompilerTypePure(childType, checker)) {
        return false;
      }
    }
    return true;
  }

  // ========================================================================
  // 🪐 D. OBJECT & GENERIC TYPE REFERENCE SECTOR SWEEP
  // ========================================================================
  if (isObjectTypeGuard(type)) {
    // If it's a generic type reference (e.g. Array<T>, Record<K, V>), inspect arguments
    if (isTypeReference(type)) {
      const typeArguments = checker.getTypeArguments(type);
      const argLen = typeArguments.length;
      for (let i = 0; i < argLen; i++) {
        const arg = typeArguments[i];
        if (arg !== undefined && !isCompilerTypePure(arg, checker)) {
          return false;
        }
      }
    }

    // Inspect individual object properties mapping definitions line-by-line
    const symbols = type.getProperties();
    const symbolLen = symbols.length;

    for (let i = 0; i < symbolLen; i++) {
      const sym = symbols[i];
      if (sym === undefined) continue;

      const key = sym.getName();
      // Enforce the prefix boundary layout rules right inside the type parser
      if (key.startsWith('_') || key.startsWith('$')) {
        return false;
      }

      // 🟢 FIXED: Safe, statement-driven node resolution bypassing unsafe non-null optional assertions entirely!
      const targetDeclarationNode =
        sym.valueDeclaration !== undefined
          ? sym.valueDeclaration
          : sym.declarations !== undefined && sym.declarations.length > 0
            ? sym.declarations[0]
            : undefined;

      // If the node cannot be isolated, skip parsing this implicit symbol line to prevent engine crashes
      if (targetDeclarationNode === undefined) {
        continue;
      }

      const propType = checker.getTypeOfSymbolAtLocation(
        sym,
        targetDeclarationNode,
      );
      if (propType !== undefined && !isCompilerTypePure(propType, checker)) {
        return false;
      }
    }
  }

  return true; // Type structure contains completely pure data types
}
