// transformer/reifiers/registry/objects.ts
import ts from 'typescript';
import { registerReifier, maxObjectProperties } from './core';
import type { TReifyCTX } from '../../types';
import type { TSolidObjectRawShape } from '../../../shared';

/**
 * STRUCTURAL REIFIER (OBJECTS & INTERFACES)
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
// TODO: OPTIMIZE
registerReifier((type, checker, next, ctx) => {
  const flags = type.getFlags();

  // Accept both standard Object types and Intersection layouts since intersections bake down flat here
  const isObjectLayout = (flags & ts.TypeFlags.Object) !== 0;
  const isIntersectionLayout = (flags & ts.TypeFlags.Intersection) !== 0;
  if (!isObjectLayout && !isIntersectionLayout) return undefined;

  // Commandment V — Graph Integrity Rule: Circular Loop Identification Shield
  if (ctx.seen.has(type)) {
    return {
      kind: 'reference',
      name: type.getSymbol()?.getName() || 'CircularReference',
    };
  }
  ctx.seen.add(type);

  const shapeProperties: Record<string, TSolidObjectRawShape> = {};

  // CRITICAL ARCHITECTURE: Fetching properties straight from the resolved TypeChecker slice
  // completely flattens intersections and unrolls utility equations like TDeepMerge natively.
  const coreProperties = checker.getPropertiesOfType(type);

  // Commandment VIII — Zero-allocation mathematical limit clamp replacing heap-thrashing array slicing
  const totalProps = coreProperties.length;
  const loopLimit =
    totalProps > maxObjectProperties ? maxObjectProperties : totalProps;

  for (let i = 0; i < loopLimit; i++) {
    const prop = coreProperties[i];
    if (!prop) continue;

    // CONTEXT-AWARE RESOLUTION LAYER:
    // We explicitly locate the declaration node of the property to read its type
    // relative to the active call-site context. This forces the compiler to run its internal
    // generic substitution program first, extracting precise primitives instead of 'any'.
    const propDeclaration =
      prop.valueDeclaration ||
      (prop.declarations ? prop.declarations[0] : undefined);

    const propType = propDeclaration
      ? checker.getTypeOfSymbolAtLocation(prop, propDeclaration)
      : checker.getDeclaredTypeOfSymbol(prop);

    // 🛡️ EXCLUSIVE PROPERTY FILTER (For TXOR/Conditionals):
    // If a generic utility evaluates an exclusive field to 'never', it means that field
    // is explicitly forbidden in this specific structural variant path. We bypass registering
    // it in our properties map entirely so it matches our flat runtime layout expectations.
    if (propType.getFlags() & ts.TypeFlags.Never) {
      continue;
    }

    const propName = prop.getName();
    const isQuestionMarkOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0;

    const hasExplicitUndefinedValue = propType.isUnion()
      ? propType.types.some(
          (subType) => (subType.getFlags() & ts.TypeFlags.Undefined) !== 0,
        )
      : (propType.getFlags() & ts.TypeFlags.Undefined) !== 0;

    const childCtx: TReifyCTX = {
      depth: ctx.depth + 1,
      maxDepth: ctx.maxDepth,
      fragments: ctx.fragments,
      parentKey: `${ctx.parentKey}.${propName}`,
      seen: ctx.seen,
    };

    shapeProperties[propName] = {
      shape: next(propType, childCtx),
      optional: isQuestionMarkOptional,
      name: propName,
      requiresKeyPresence: !isQuestionMarkOptional && hasExplicitUndefinedValue,
    };
  }

  return {
    kind: 'object',
    properties: shapeProperties,
  };
});
