import type { CallExpression, NodeFactory, Expression } from 'typescript';
import type { TTransformXalorModes } from '../../../shared';
import type { IBaseProcessorPayload } from '../../types';

export function formatTransformationArgs<T extends IBaseProcessorPayload>(
  mode: TTransformXalorModes,
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');
  const modeLiteral = factory.createStringLiteral(mode);

  return node.arguments.length > 0
    ? [...node.arguments, keyLiteral, modeLiteral]
    : [keyLiteral, modeLiteral];
}
