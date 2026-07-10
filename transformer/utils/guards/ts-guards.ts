// models/guards/transformer/types.ts
import type {
  Type,
  StringLiteralType,
  NumberLiteralType,
  UnionType,
  ObjectType,
  TypeReference,
  InterfaceType,
  IntersectionType,
} from 'typescript';
import ts from 'typescript';
/**
 * IS LITERAL TYPE (STRING)
 * Narrows a Type to a hardcoded string literal (e.g., "admin" | "user").
 */
export function isStringLiteralType(type: Type): type is StringLiteralType {
  return type.isStringLiteral();
}
/**
 * IS LITERAL TYPE (NUMBER)
 * Narrows a Type to a hardcoded number literal (e.g., 1 | 2 | 3).
 */
export function isNumberLiteralType(type: Type): type is NumberLiteralType {
  return type.isNumberLiteral();
}
/**
 *  IS UNION TYPE
 * Identifies 'or' types (A | B). Triggers the Union Reifier to
 * map all possible constituents into the blueprint.
 */
export function isUnionType(type: Type): type is UnionType {
  return type.isUnion();
}
/**
 * IS INTERSECTION TYPE
 * Identifies 'and' types (A & B). Essential for detecting Branded Types
 * and merged Interface metadata.
 */
// export function isIntersectionType(type: Type): boolean {
//   return (type.getFlags() & ts.TypeFlags.Intersection) !== 0;
// }
// export function isIntersectionType(type: Type): type is ts.IntersectionType {
//   return (type.getFlags() & ts.TypeFlags.Intersection) !== 0;
// }
export function isIntersectionType(type: Type): type is IntersectionType {
  return type.isIntersection();
}
/**
 * IS TEMPLATE MAPPED TYPE
 * Safe guard to determine if a type is a mapped type containing dynamic template keys.
 * Satisfies Commandment IX by avoiding 'as any' assertions.
 */
/* prettier-ignore */
export function isTemplateMappedType(type: ts.Type): type is ts.ObjectType {

  if ((type.getFlags() & ts.TypeFlags.Object) !== 0) {
    const objectType = type as ts.ObjectType;
  
    if ((objectType.objectFlags & ts.ObjectFlags.Mapped) !== 0) {
      return 'templateFlags' in objectType;
    }
  }
  return false;
}
/**
 *IS OBJECT TYPE
 * Detects structural types like Interfaces, Classes, or Type Literals.
 * Narrows the type to an ObjectType to allow access to properties/symbols.
 */
export function isObjectType(type: Type): boolean {
  return !!(type.getFlags() & ts.TypeFlags.Object);
}

export function isObjectTypeGuard(type: Type): type is ObjectType {
  return (type.getFlags() & ts.TypeFlags.Object) !== 0;
}
/**
 * IS CLASS OR INTERFACE TYPE GUARD
 * Narrows a baseline ts.Type down to an explicit, property-probed ts.InterfaceType.
 * Captures explicit class and interface declaration structures natively.
 */
export function isClassOrInterfaceType(type: Type): type is InterfaceType {
  return type.isClassOrInterface();
}
/**
 * IS AMBIENT PLATFORM TYPE
 * Determines if a type originates from native compiler declarations (lib.d.ts).
 * Crucial for stopping recursive inspectors from falling into platform prototype chains.
 */
export function isAmbientPlatformType(type: Type): boolean {
  const symbol = type.getSymbol() ?? type.aliasSymbol;
  if (!symbol) return false;

  const declarations = symbol.getDeclarations();
  if (!declarations || declarations.length === 0) return false;

  return declarations.some((d) => d.getSourceFile().isDeclarationFile);
}
/**
 * IS TYPE REFERENCE
 * Detects generic references (e.g., Array<T>, Map<K,V>) or named interfaces.
 * This is the gateway to resolving deep dependencies and recursive structures.
 */
export function isTypeReference(type: Type): type is TypeReference {
  if (isObjectTypeGuard(type)) {
    return (type.objectFlags & ts.ObjectFlags.Reference) !== 0;
  }
  return false;
}
/**
 * IS TUPLE TYPE TYPE GUARD
 * Probes the internal declaration target property to safely isolate a ts.TupleType.
 */
export function isTupleType(target: ts.ObjectType): target is ts.TupleType {
  return (target.objectFlags & ts.ObjectFlags.Tuple) !== 0;
}

/**
 * IS ARRAY TYPE
 * Narrows a Type to a TypeReference representing an Array without a type checker.
 */
export function isArrayType(type: Type): type is TypeReference {
  if ((type.flags & ts.TypeFlags.Object) === 0) return false;

  if (!isObjectTypeGuard(type)) return false;

  if ((type.objectFlags & ts.ObjectFlags.Reference) === 0) return false;

  return type.getSymbol()?.getName() === 'Array';
}
