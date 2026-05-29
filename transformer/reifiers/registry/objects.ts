// transformer/reifiers/registry/objects.ts
import ts from 'typescript';
import type { Symbol, TypeChecker, Type } from 'typescript';
import { registerReifier, maxObjectProperties } from './core';
import type { TReifyCTX, TReifyObjectPropertiesConfig } from '../../types';
import type { TSolidObjectRawShape } from '../../../shared';

/**
 * Determines if the layout is an object or an intersection type.
 */
function isObjectOrIntersectionLayout(type: Type): boolean {
  const flags = type.getFlags();
  return (flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection)) !== 0;
}

/**
 * permitsUndefined
 * EXPLICIT UNDEFINED VALUE DETECTOR
 *
 * ROLE:
 * Determines if a property type natively or union-wise permits an undefined value.
 * Utilizes an optimized indexed linear loop to skip dynamic callback heap allocations.
 */
function permitsUndefined(type: Type): boolean {
  if (type.isUnion()) {
    const constituents = type.types;
    const len = constituents.length;

    for (let i = 0; i < len; i++) {
      const subType = constituents[i];
      /* prettier-ignore */
      if (subType !== undefined && (subType.getFlags() & ts.TypeFlags.Undefined) !== 0) {
        return true;
      }
    }
    return false;
  }

  return (type.getFlags() & ts.TypeFlags.Undefined) !== 0;
}
/**
 * resolvePropertyType
 * CONTEXT-AWARE POSITION RESOLVER
 *
 * ROLE:
 * Safely resolves the context-aware type of a symbol based on its declaration node
 * to guarantee that internal TypeScript generic substitution programs execute correctly.
 */
function resolvePropertyType(symbol: Symbol, checker: TypeChecker): Type {
  /* prettier-ignore */
  const declaration = symbol.valueDeclaration !== undefined
    ? symbol.valueDeclaration
    : (symbol.declarations !== undefined && symbol.declarations.length > 0)
      ? symbol.declarations[0]
      : undefined;

  return declaration !== undefined
    ? checker.getTypeOfSymbolAtLocation(symbol, declaration)
    : checker.getDeclaredTypeOfSymbol(symbol);
}
/**
 * reifyObjectProperties
 * STRUCTURAL PROPERTY EXTRACTION ENGINE
 *
 * ROLE:
 * Flattens object intersection trees and unrolls property mapping schemas point-free.
 */
function reifyObjectProperties(
  params: TReifyObjectPropertiesConfig,
): Record<string, TSolidObjectRawShape> {
  const { type, checker, next, ctx, maxObjectProperties } = params;
  const shapeProperties: Record<string, TSolidObjectRawShape> = {};

  const coreProperties = checker.getPropertiesOfType(type);
  const totalProps = coreProperties.length;

  const loopLimit =
    totalProps > maxObjectProperties ? maxObjectProperties : totalProps;

  for (let i = 0; i < loopLimit; i++) {
    const prop = coreProperties[i];
    if (prop === undefined) continue;

    const propType = resolvePropertyType(prop, checker);

    if ((propType.getFlags() & ts.TypeFlags.Never) !== 0) {
      continue;
    }

    const propName = prop.getName();
    const isQuestionMarkOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
    const hasExplicitUndefinedValue = permitsUndefined(propType);

    // Reconstruct the immutable path child context point-free
    const CHILD_CTX: TReifyCTX = {
      depth: ctx.depth + 1,
      maxDepth: ctx.maxDepth,
      fragments: ctx.fragments,
      parentKey: `${ctx.parentKey}.${propName}`,
      seen: ctx.seen,
    } satisfies TReifyCTX;

    shapeProperties[propName] = {
      shape: next(propType, CHILD_CTX),
      optional: isQuestionMarkOptional,
      name: propName,
      requiresKeyPresence: !isQuestionMarkOptional && hasExplicitUndefinedValue,
    };
  }

  return shapeProperties;
}

/**
 * CENTRAL OBJECT REIFIER PIPELINE REGISTER
 *
 * This module handles the registration of complex structures:
 * - Interfaces, Type Literals, and Class shapes.
 *
 *  RECURSION MANAGEMENT:
 * It utilizes the 'seen' Set to detect circular references. When a
 * loop is detected, it emits a 'reference' kind, preventing
 * infinite crawls and enabling the "Ambient Database" to link
 * types together via named pointers.
 */
registerReifier((type, checker, next, ctx) => {
  if (!isObjectOrIntersectionLayout(type)) return undefined;

  if (ctx.seen.has(type)) {
    return {
      kind: 'reference',
      name: type.getSymbol()?.getName() || 'CircularReference',
    };
  }

  ctx.seen.add(type);

  /* prettier-ignore */
  const shapeProperties = reifyObjectProperties({ type, checker, next, ctx, maxObjectProperties });

  return {
    kind: 'object',
    properties: shapeProperties,
  };
});

// // transformer/reifiers/registry/objects.ts
// import ts from 'typescript';
// import { registerReifier, maxObjectProperties } from './core';
// import type { TReifyCTX } from '../../types';
// import type { TSolidObjectRawShape } from '../../../shared';

// /**
//  * STRUCTURAL REIFIER (OBJECTS & INTERFACES)
//  *
//  * This module handles the registration of complex structures:
//  * - Interfaces, Type Literals, and Class shapes.
//  *
//  *  RECURSION MANAGEMENT:
//  * It utilizes the 'seen' Set to detect circular references. When a
//  * loop is detected, it emits a 'reference' kind, preventing
//  * infinite crawls and enabling the "Ambient Database" to link
//  * types together via named pointers.
//  */
// // TODO: OPTIMIZE
// registerReifier((type, checker, next, ctx) => {
//   const flags = type.getFlags();

//   // Accept both standard Object types and Intersection layouts since intersections bake down flat here
//   const isObjectLayout = (flags & ts.TypeFlags.Object) !== 0;
//   const isIntersectionLayout = (flags & ts.TypeFlags.Intersection) !== 0;
//   if (!isObjectLayout && !isIntersectionLayout) return undefined;

//   // Commandment V — Graph Integrity Rule: Circular Loop Identification Shield
//   if (ctx.seen.has(type)) {
//     return {
//       kind: 'reference',
//       name: type.getSymbol()?.getName() || 'CircularReference',
//     };
//   }
//   ctx.seen.add(type);

//   const shapeProperties: Record<string, TSolidObjectRawShape> = {};

//   // CRITICAL ARCHITECTURE: Fetching properties straight from the resolved TypeChecker slice
//   // completely flattens intersections and unrolls utility equations like TDeepMerge natively.
//   const coreProperties = checker.getPropertiesOfType(type);

//   // Commandment VIII — Zero-allocation mathematical limit clamp replacing heap-thrashing array slicing
//   const totalProps = coreProperties.length;
//   const loopLimit =
//     totalProps > maxObjectProperties ? maxObjectProperties : totalProps;

//   for (let i = 0; i < loopLimit; i++) {
//     const prop = coreProperties[i];
//     if (!prop) continue;

//     // CONTEXT-AWARE RESOLUTION LAYER:
//     // We explicitly locate the declaration node of the property to read its type
//     // relative to the active call-site context. This forces the compiler to run its internal
//     // generic substitution program first, extracting precise primitives instead of 'any'.
//     const propDeclaration =
//       prop.valueDeclaration ||
//       (prop.declarations ? prop.declarations[0] : undefined);

//     const propType = propDeclaration
//       ? checker.getTypeOfSymbolAtLocation(prop, propDeclaration)
//       : checker.getDeclaredTypeOfSymbol(prop);

//     // 🛡️ EXCLUSIVE PROPERTY FILTER (For TXOR/Conditionals):
//     // If a generic utility evaluates an exclusive field to 'never', it means that field
//     // is explicitly forbidden in this specific structural variant path. We bypass registering
//     // it in our properties map entirely so it matches our flat runtime layout expectations.
//     if (propType.getFlags() & ts.TypeFlags.Never) {
//       continue;
//     }

//     const propName = prop.getName();
//     const isQuestionMarkOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0;

//     const hasExplicitUndefinedValue = propType.isUnion()
//       ? propType.types.some(
//           (subType) => (subType.getFlags() & ts.TypeFlags.Undefined) !== 0,
//         )
//       : (propType.getFlags() & ts.TypeFlags.Undefined) !== 0;

//     const childCtx: TReifyCTX = {
//       depth: ctx.depth + 1,
//       maxDepth: ctx.maxDepth,
//       fragments: ctx.fragments,
//       parentKey: `${ctx.parentKey}.${propName}`,
//       seen: ctx.seen,
//     } satisfies TReifyCTX;

//     shapeProperties[propName] = {
//       shape: next(propType, childCtx),
//       optional: isQuestionMarkOptional,
//       name: propName,
//       requiresKeyPresence: !isQuestionMarkOptional && hasExplicitUndefinedValue,
//     };
//   }

//   return {
//     kind: 'object',
//     properties: shapeProperties,
//   };
// });
