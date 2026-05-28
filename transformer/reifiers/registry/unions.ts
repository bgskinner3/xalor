// transformer/reifiers/registry/unions.ts
import ts from 'typescript';
import {
  isStringLiteralType,
  isNumberLiteralType,
  isUnionType,
} from '../../utils';
import { registerReifier, maxUnionVariants } from './core';
/**
 * Extracts literal values without using 'any' or 'as'.
 */
export function getUnionValues(type: ts.Type): (string | number | boolean)[] {
  const values: (string | number | boolean)[] = [];

  // Helper to process individual parts of a union safely
  const processType = (t: ts.Type) => {
    if (isStringLiteralType(t) || isNumberLiteralType(t)) {
      values.push(t.value);
    } else if (t.getFlags() & ts.TypeFlags.BooleanLiteral) {
      const name = (t as { intrinsicName?: string }).intrinsicName;
      if (name === 'true') values.push(true);
      if (name === 'false') values.push(false);
    }
  };

  if (isUnionType(type)) {
    type.types.forEach(processType);
  } else {
    processType(type);
  }

  return values;
}

/**
 * Generates the JS check: [vals].includes(value)
 * Uses strict mapping for AST node generation.
 */
export function createUnionCheck(
  f: ts.NodeFactory,
  val: ts.Expression,
  values: (string | number | boolean)[],
): ts.CallExpression {
  const nodes = values.map((v) => {
    if (typeof v === 'string') return f.createStringLiteral(v);
    if (typeof v === 'number') return f.createNumericLiteral(v);
    return v ? f.createTrue() : f.createFalse();
  });

  return f.createCallExpression(
    f.createPropertyAccessExpression(
      f.createArrayLiteralExpression(nodes),
      f.createIdentifier('includes'),
    ),
    undefined,
    [val],
  );
}

registerReifier((type, _checker, next, ctx) => {
  if (!type.isUnion()) return undefined;

  const variants = type.types.slice(0, maxUnionVariants);

  return {
    kind: 'union',
    values: variants.map((t) => next(t, ctx)),
  };
});
