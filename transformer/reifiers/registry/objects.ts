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
