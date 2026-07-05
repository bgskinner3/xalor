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
  return (
    (flags & ts.TypeFlags.Object) !== 0 ||
    (flags & ts.TypeFlags.Intersection) !== 0
  );
}

/**
 * permitsUndefined
 * EXPLICIT UNDEFINED VALUE DETECTOR
 */
function permitsUndefined(type: Type): boolean {
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
 * resolvePropertyType
 * CONTEXT-AWARE POSITION RESOLVER
 */
function resolvePropertyType(symbol: Symbol, checker: TypeChecker): Type {
  const declaration =
    symbol.valueDeclaration !== undefined
      ? symbol.valueDeclaration
      : symbol.declarations !== undefined && symbol.declarations.length > 0
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

  // Utilizes native type checking programs to automatically evaluate
  // and completely unroll intersected property fields flatly
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
 * ROLE:
 * Processes approved interfaces, type literals, and cross-sections,
 * bypassing nominal shortcuts to force full structural extraction.
 */
registerReifier((type, checker, next, ctx) => {
  if (!isObjectOrIntersectionLayout(type)) {
    return undefined;
  }

  const shapeProperties = reifyObjectProperties({
    type,
    checker,
    next,
    ctx,
    maxObjectProperties,
  });

  return {
    kind: 'object',
    properties: shapeProperties,
  };
});
