// transformer/miner/processor.ts
import type { CallExpression, Expression } from 'typescript';
import type { TProcessorTarget } from '../types';
import { PROCESSOR_REWRITE_MAPPER } from '../mappers';
import {
  isGenerateTarget,
  isRegisterTarget,
  isValidateTarget,
  isTransformerTarget,
  getFormattedPosition,
} from '../utils';

/**
 * SOLID VISITOR PROCESSOR (The AST Synthesizer)
 *
 * @see {@link TransformerDocs.solidVisitorProcessor}
 */
export function solidVisitorProcessor({
  node,
  sourceFile,
  factory,
  target,
  shape,
}: TProcessorTarget): CallExpression {
  let finalArgs: Expression[] = [];

  if (isRegisterTarget(target)) {
    const nodeStartPosition = node.getStart(sourceFile);

    const areaString = getFormattedPosition(sourceFile, nodeStartPosition);

    /* prettier-ignore */ finalArgs = PROCESSOR_REWRITE_MAPPER.registerXalor( target, node, factory, areaString, shape,);
  }

  if (isGenerateTarget(target)) {
    /* prettier-ignore */ finalArgs = PROCESSOR_REWRITE_MAPPER.generateXalor(target, node, factory);
  }

  if (isValidateTarget(target)) {
    /* prettier-ignore */ finalArgs = PROCESSOR_REWRITE_MAPPER.validateXalor(target, node, factory);
  }

  if (isTransformerTarget(target)) {
    /* prettier-ignore */ finalArgs = PROCESSOR_REWRITE_MAPPER.transformXalor(target, node, factory);
  }

  return factory.updateCallExpression(
    node,
    node.expression,
    node.typeArguments,
    finalArgs,
  );
}
