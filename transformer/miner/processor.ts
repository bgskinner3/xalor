// transformer/miner/processor.ts
import type { CallExpression, Expression } from 'typescript';
import type { TProcessorTarget } from '../types';
import { PROCESSOR_REWRITE_MAPPER } from '../mappers';
import {
  isGenerateTarget,
  isValidateTarget,
  isTransformerTarget,
  isRegisterTarget,
  isMatchTarget,
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
    /* prettier-ignore */
    finalArgs = PROCESSOR_REWRITE_MAPPER['xalor.register'](
      target, node, factory, areaString, shape,
    );
  }

  /* prettier-ignore */
  if (isGenerateTarget(target)) finalArgs = PROCESSOR_REWRITE_MAPPER[target.apiName](target, node, factory);
  /* prettier-ignore */
  if (isValidateTarget(target)) finalArgs = PROCESSOR_REWRITE_MAPPER[target.apiName](target, node, factory);
  /* prettier-ignore */
  if (isTransformerTarget(target)) finalArgs = PROCESSOR_REWRITE_MAPPER[target.apiName](target, node, factory);

  if (isMatchTarget(target)) {
    finalArgs = PROCESSOR_REWRITE_MAPPER[target.apiName](target, node, factory);
  }

  // 🎯 THE CANONICAL TRANSITION: Wipe out the type arguments slot!
  // By passing 'undefined' instead of 'node.typeArguments', you signal the compiler
  // that type reification is complete. This forces it to serialize your inline bytecode arrays.
  return factory.updateCallExpression(
    node,
    node.expression,
    undefined, // 🚀 Erases type parameters (<'USER_ACCOUNT'>) completely from output JavaScript!
    finalArgs, // Native injection arrays committed cleanly
  );
}
// export function solidVisitorProcessor({
//   node,
//   sourceFile,
//   factory,
//   target,
//   shape,
// }: TProcessorTarget): CallExpression {
//   let finalArgs: Expression[] = [];

//   if (isRegisterTarget(target)) {
//     const nodeStartPosition = node.getStart(sourceFile);
//     const areaString = getFormattedPosition(sourceFile, nodeStartPosition);

//     /* prettier-ignore */
//     finalArgs = PROCESSOR_REWRITE_MAPPER['xalor.register']( target, node, factory, areaString, shape,);
//   }

//   /* prettier-ignore */
//   if (isGenerateTarget(target)) finalArgs = PROCESSOR_REWRITE_MAPPER[target.apiName](target, node, factory);

//   /* prettier-ignore */
//   if (isValidateTarget(target)) finalArgs = PROCESSOR_REWRITE_MAPPER[target.apiName](target, node, factory);

//   /* prettier-ignore */
//   if (isTransformerTarget(target)) finalArgs = PROCESSOR_REWRITE_MAPPER[target.apiName](target, node, factory);

//   if (isMatchTarget(target)) {
//     finalArgs = PROCESSOR_REWRITE_MAPPER[target.apiName](target, node, factory);
//   }

//   return factory.updateCallExpression(
//     node,
//     node.expression,
//     node.typeArguments,
//     finalArgs,
//   );
// }
