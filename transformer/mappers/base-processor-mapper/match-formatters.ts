import type { CallExpression, NodeFactory, Expression } from 'typescript';
import type { TMatchXalorModes } from '../../../shared';
import type { IBaseProcessorPayload } from '../../types';
import { MATCH_PROCESSOR_MAPPER } from '../match-processor-mapper';

/**
 * ## formatTransformationArgs — Transformation Node Argument Arranger
 */
export function formatMatchArgs<T extends IBaseProcessorPayload>(
  mode: TMatchXalorModes,
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  const targetedHandler = MATCH_PROCESSOR_MAPPER[mode];
  if (targetedHandler && raw.keyName) {
    return targetedHandler({ keyName: raw.keyName }, node, factory);
  }

  const tokenLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');

  return node.arguments.length > 0
    ? [...node.arguments, tokenLiteral]
    : [tokenLiteral];
}
