// /transformer/mappers/processor-mapper.ts
import { generateShapeAST } from '../../reifiers';
import { IS_SOLID_CONFIG_ITEMS } from '../../../shared';
import type { CallExpression, NodeFactory, Expression } from 'typescript';
import type { TRegisterRawPayload, IBaseProcessorPayload } from '../../types';
import type { TSolidShape, TGeneratorXalorModes } from '../../../shared';

export function formatRegistration(
  raw: TRegisterRawPayload,
  node: CallExpression,
  factory: NodeFactory,
  areaString?: string,
  shape?: TSolidShape,
): Expression[] {
  if (!raw || !shape) return [...node.arguments];

  const metadataExpression = factory.createObjectLiteralExpression([
    /* prettier-ignore */ factory.createPropertyAssignment('key', factory.createStringLiteral(raw.keyName)),
    /* prettier-ignore */ factory.createPropertyAssignment('area',factory.createStringLiteral(areaString ?? '')),
    /* prettier-ignore */ factory.createPropertyAssignment('version', factory.createStringLiteral(IS_SOLID_CONFIG_ITEMS.solidVersion)),
    /* prettier-ignore */ factory.createPropertyAssignment('shape', generateShapeAST(factory, shape)),
  ]);
  return node.arguments.length === 0
    ? [metadataExpression]
    : [node.arguments[0], metadataExpression];
}

export function formatGenerationArgs<T extends IBaseProcessorPayload>(
  _mode: TGeneratorXalorModes,
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');

  return node.arguments.length > 0
    ? [...node.arguments, keyLiteral]
    : [keyLiteral];
}
