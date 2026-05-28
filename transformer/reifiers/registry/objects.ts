// transformer/reifiers/registry/objects.ts
import { isObjectType } from '../../utils';
import { registerReifier, maxObjectProperties } from './core';
import { SymbolFlags, TypeFlags } from 'typescript';
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
registerReifier((type, checker, next, ctx) => {
  if (!isObjectType(type)) return undefined;

  if (ctx.seen.has(type)) {
    return {
      kind: 'reference',
      name: type.getSymbol()?.getName() || 'Circular',
    };
  }

  ctx.seen.add(type);

  const shapeProperties: Record<string, TSolidObjectRawShape> = {};
  const properties = checker.getPropertiesOfType(type);
  const propsToProcess = properties.slice(0, maxObjectProperties);

  for (const prop of propsToProcess) {
    const declaration = prop.valueDeclaration || prop.declarations?.[0];
    if (!declaration) continue;

    const propType = checker.getTypeOfSymbolAtLocation(prop, declaration);
    const propName = prop.getName();

    const isQuestionMarkOptional = !!(prop.flags & SymbolFlags.Optional);

    // Initialize the property value directly using an immutable condition expression
    const hasExplicitUndefinedValue = propType.isUnion()
      ? propType.types.some(
          (subType) => (subType.getFlags() & TypeFlags.Undefined) !== 0,
        )
      : (propType.getFlags() & TypeFlags.Undefined) !== 0;

    shapeProperties[propName] = {
      shape: next(propType, {
        ...ctx,
        depth: ctx.depth + 1,
        parentKey: `${ctx.parentKey}.${propName}`,
      }),
      optional: isQuestionMarkOptional,
      name: propName,
      requiresKeyPresence: !isQuestionMarkOptional && hasExplicitUndefinedValue,
    };
  }

  return { kind: 'object', properties: shapeProperties };
});
