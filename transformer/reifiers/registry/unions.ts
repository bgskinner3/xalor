// transformer/reifiers/registry/unions.ts
import ts from 'typescript';
import {
  isStringLiteralType,
  isNumberLiteralType,
  isUnionType,
} from '../../utils';
import { registerReifier, maxUnionVariants } from './core';
import type { TSolidShape } from '../../../shared';
import type { TReifyCTX } from '../../types';
import { isString, isNumber } from '../../../shared';
/**
 * Extracts literal values safely without using 'any' or 'as'.
 */
export function getUnionValues(
  type: ts.Type,
): readonly (string | number | boolean)[] {
  const values: (string | number | boolean)[] = [];

  const processType = (t: ts.Type) => {
    if (isStringLiteralType(t) || isNumberLiteralType(t)) {
      values.push(t.value);
    } else if (t.getFlags() & ts.TypeFlags.BooleanLiteral) {
      const intrinsicName = Reflect.get(t, 'intrinsicName');
      if (intrinsicName === 'true') values.push(true);
      if (intrinsicName === 'false') values.push(false);
    }
  };

  if (isUnionType(type)) {
    const constituents = type.types;
    const len = constituents.length;
    for (let i = 0; i < len; i++) {
      const variant = constituents[i];
      if (variant) processType(variant);
    }
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
  values: readonly (string | number | boolean)[],
): ts.CallExpression {
  const len = values.length;
  const nodes: ts.Expression[] = [];

  for (let i = 0; i < len; i++) {
    const v = values[i];
    if (isString(v)) nodes.push(f.createStringLiteral(v));
    else if (isNumber(v)) nodes.push(f.createNumericLiteral(String(v)));
    else if (v === true) nodes.push(f.createTrue());
    else if (v === false) nodes.push(f.createFalse());
  }

  return f.createCallExpression(
    f.createPropertyAccessExpression(
      f.createArrayLiteralExpression(nodes),
      f.createIdentifier('includes'),
    ),
    undefined,
    [val],
  );
}
/**
 * DISTRIBUTIVE UNION REIFIER (The Choice Sharder)
 *
 * ROLE:
 * The primary engine for unrolling logical variance and conditional choice blocks.
 * It intercepts TypeScript union types (`type.isUnion()`) at build-time and maps
 * each constituent branch into a linear option list within the blueprint.
 *
 * STRATEGY:
 * Unwinds complex distributive type equations—such as `TXOR<T, U>`—by looping over
 * its evaluated, call-site conditional variants (`type.types`). It leverages an
 * immutable, pre-allocated `variantsArray` pool combined with a switchless mathematical
 * clamp boundary (`loopLimit`) to capture elements point-free. Each variant receives a
 * separate, path-isolated child context (`childCtx`) to protect branch names.
 *
 * WHY:
 * Satisfies Commandment III (Runtime Consumption Rule) and Commandment VIII
 * (Internal Efficiency). It completely pre-bakes structural branch possibilities
 * into a single flat schema during compilation. This removes the need for expensive
 * logical evaluation engines at runtime, allowing the browser loop to execute
 * blistering, single-pass linear option matching with zero heap mutations.
 */
registerReifier((type, _checker, next, ctx) => {
  if (!type.isUnion()) return undefined;

  const totalVariants = type.types.length;
  const loopLimit =
    totalVariants > maxUnionVariants ? maxUnionVariants : totalVariants;

  const variantsArray: TSolidShape[] = [];

  for (let i = 0; i < loopLimit; i++) {
    const variant = type.types[i];
    if (!variant) continue;

    const CHILD_CTX: TReifyCTX = {
      depth: ctx.depth + 1,
      maxDepth: ctx.maxDepth,
      fragments: ctx.fragments,
      parentKey: `${ctx.parentKey}_union_${i}`,
      seen: ctx.seen,
    } satisfies TReifyCTX;

    variantsArray.push(next(variant, CHILD_CTX));
  }

  return {
    kind: 'union',
    values: variantsArray,
  };
});
