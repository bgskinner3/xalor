// transformer/miner/index.ts
import { resolveMiningTarget } from './mining-target';
import { solidVisitorProcessor } from './processor';
import { visitEachChild } from 'typescript';
import {
  isSolidCall,
  isRegisterTarget,
  isGenerateTarget,
  isValidateTarget,
  isTransformerTarget,
} from '../utils';
import type { Visitor, Node } from 'typescript';
import { resolveAndRegisterType } from './resolve-and-register';
import { markAsPure } from './resolvers';
import type { TSolidShape } from '../../shared';
import type { TMinerCorParams } from '../types';

export function theMiner({
  program,
  context,
  sourceFile,
  ...rest
}: TMinerCorParams): Visitor {
  const checker = program.getTypeChecker();
  const { factory } = context;
  const visitor: Visitor = (node: Node): Node => {
    if (!isSolidCall(node, checker)) {
      return visitEachChild(node, visitor, context);
    }
    const target = resolveMiningTarget(node, checker);
    if (!target) {
      return visitEachChild(node, visitor, context);
    }
    // 🪐 PATH A: THE REGISTRATION TARGET EXTRACTION LIFECYCLE
    if (isRegisterTarget(target)) {
      const { keyName, shapeType } = target;

      /* prettier-ignore */
      const shape: TSolidShape = resolveAndRegisterType({ keyName, shapeType, node, sourceFile, checker,  ...rest });

      // Rewrite the AST call structure to physically inject the metadata arguments into your bundle
      /* prettier-ignore */
      const updatedCall = solidVisitorProcessor({ node, sourceFile, factory, target, shape });

      return markAsPure(updatedCall);
    }
    // PATH Generate: generateXalor
    if (isGenerateTarget(target)) {
      /* prettier-ignore */
      const updatedCall = solidVisitorProcessor({ node, sourceFile, factory, target });

      return markAsPure(updatedCall);
    }
    // PATH Validate: validateXalor
    if (isValidateTarget(target)) {
      /* prettier-ignore */
      const updatedCall = solidVisitorProcessor({ node, sourceFile, factory, target });

      return markAsPure(updatedCall);
    }
    // PATH Transform: transformXalor
    if (isTransformerTarget(target)) {
      /* prettier-ignore */
      const updatedCall = solidVisitorProcessor({ node, sourceFile, factory, target });

      return markAsPure(updatedCall);
    }
    return visitEachChild(node, visitor, context);
  };
  return visitor;
}
