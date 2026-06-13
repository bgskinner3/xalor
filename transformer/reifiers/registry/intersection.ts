import { TypeFlags } from 'typescript';
import type { Type, IntersectionType } from 'typescript';
import { registerReifier } from './core';

export function getIntersectionParts(type: Type): Type[] {
  if ((type.getFlags() & TypeFlags.Intersection) === 0) return [];

  const t = type as IntersectionType;

  // TS internal field is stable in practice
  return t.types ?? [];
}
/**
 * INTERSECTION REIFIER (Structural Merge Engine)
 *
 * Converts TypeScript intersections (A & B & C)
 * into a flattened TSolidShape intersection node.
 */
registerReifier((type, _checker, next, ctx) => {
  const parts = getIntersectionParts(type);

  if (!parts.length) return undefined;

  return {
    kind: 'intersection',
    values: parts.map((t, i) =>
      next(t, {
        ...ctx,
        depth: ctx.depth + 1,
        parentKey: `${ctx.parentKey}_intersection_${i}`,
      }),
    ),
  };
});
