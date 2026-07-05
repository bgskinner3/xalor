// transformer/reifiers/registry/branded.ts
import { isObjectType, isStringLiteralType } from '../../utils';
import { registerReifier } from './core';
import type { Type } from 'typescript';
import { getIntersectionParts } from './intersection';
import type { TSolidShape } from '../../../shared/shape-domain';
/**
 * Extracts the brand name from an Intersection type safely.
 * Example: string & { __brand: "UserId" } -> "UserId"
 */
registerReifier((type, checker, next, ctx) => {
  const parts = getIntersectionParts(type);

  if (!parts.length) return undefined;

  let brandName: string | undefined;
  const baseParts: Type[] = [];

  for (const part of parts) {
    if (isObjectType(part)) {
      const brandProp = checker.getPropertyOfType(part, '__brand');

      if (brandProp && brandProp.valueDeclaration) {
        const propType = checker.getTypeOfSymbolAtLocation(
          brandProp,
          brandProp.valueDeclaration,
        );

        if (isStringLiteralType(propType)) {
          brandName = propType.value;
          continue;
        }
      }
    }

    baseParts.push(part);
  }

  if (!brandName) return undefined;

  const baseShape =
    baseParts.length === 1
      ? next(baseParts[0], ctx)
      : ({
          kind: 'intersection',
          values: baseParts.map((t) => next(t, ctx)),
        } satisfies TSolidShape);

  return {
    kind: 'branded',
    name: brandName,
    base: baseShape,
  } satisfies TSolidShape;
});
