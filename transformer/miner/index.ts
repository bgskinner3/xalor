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
  isRuntimeAPICall,
} from '../utils';
import type { Visitor, Node } from 'typescript';
import { resolveAndRegisterType } from './resolve-and-register';
import { markAsPure } from '../utils';
import type { TSolidShape } from '../../shared';
import type { TMinerCorParams } from '../types';
import { XalorRoutesService, xalorCentralContext } from '../service';
/**
 * theMiner
 * 🪐 THE AUTHORITATIVE PLATFORM VISITOR ORCHESTRATOR
 *
 * PURPOSE:
 * A high-speed, low-level Abstract Syntax Tree (AST) node walker that intercepts, parses,
 * and transforms custom telemetry macro expressions. Dynamically bridges declarative type
 * extractions with live runtime API code transformations.
 *
 * STRATEGY:
 * Cooperates with a stateless, guard-driven traffic routing architecture to execute a
 * flawless Twin-Pass Compilation model without doubling AST recursion or resource costs:
 *
 * - PASS 1 (INGEST_REGISTRY): The engine crawls the source trees to discover macro blueprints
 *   cross-files first. If a registration target matches, it resolves type geometry inline to fully
 *   hydrate the global schema database, then returns the original structure untouched. If a runtime API
 *   matches, it registers the current filename into a target set for Pass 2 and short-circuits.
 *
 * - PASS 2 (REIFY_RUNTIME): The engine re-enters only the files logged into the target set with a 100%
 *   complete, safe database context in RAM. It bypasses macros and injects fully compiled reification
 *   arguments into your runtime calls, allowing TypeScript to link semantic symbols automatically.
 *
 * - WATCH MODE (STANDARD_INLINE): If daily watch loops run, all multi-pass flags drop away cleanly.
 *   The engine cascades past the compilation guards, executing both macro extractions and runtime
 *   arguments rewrites inline inside a single, high-velocity pass.
 *
 * DESIGN INVARIANT:
 * Satisfies Commandment I (Single Source of Truth) and Commandment VIII (Internal Efficiency).
 * Runs entirely point-free on the V8 context thread using fast index-cached operations, preserving
 * blistering watch velocities with absolute zero dynamic heap array mutations.
 */
export function theMiner({
  program,
  context,
  sourceFile,
}: TMinerCorParams): Visitor {
  const { isIngestRegistryMode, isReifyRuntimeMode, isStandardInlineMode } =
    XalorRoutesService.resolveXalorLifecycle();
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
    // TODO: Rsolve complie issue to avoid dual loop
    // TODO: === that is register first then apply api second.
    if (isRegisterTarget(target)) {
      const { keyName, shapeType } = target;

      if (!isReifyRuntimeMode && !isStandardInlineMode)
        return visitEachChild(node, visitor, context);

      /* prettier-ignore */
      const symbol = shapeType.aliasSymbol || shapeType.getSymbol();
      const declarationNode = symbol?.declarations?.[0] ?? node;
      const shape: TSolidShape = resolveAndRegisterType({
        keyName,
        shapeType,
        node: declarationNode,
        callNode: node,
        sourceFile,
        checker,
      });

      /* prettier-ignore */
      const updatedCall = solidVisitorProcessor({ node, sourceFile, factory, target, shape });

      return markAsPure(updatedCall);
    }
    if (
      isIngestRegistryMode &&
      !isStandardInlineMode &&
      isRuntimeAPICall(target)
    ) {
      xalorCentralContext.addTargetedRuntimeFile(sourceFile.fileName);
    }
    if (
      isIngestRegistryMode &&
      !isStandardInlineMode &&
      !isRegisterTarget(target)
    ) {
      return visitEachChild(node, visitor, context);
    }

    // PATH Generate: generateXalor
    if (isGenerateTarget(target)) {
      /* prettier-ignore */
      const updatedCall = solidVisitorProcessor({ node, sourceFile, factory, target });
      if (isReifyRuntimeMode) {
        console.log(`🔄 [Xalor CLI] Generated Type Key: '${target.keyName}'`);
      }
      return markAsPure(updatedCall);
    }
    // PATH Validate: validateXalor
    if (isValidateTarget(target)) {
      /* prettier-ignore */
      const updatedCall = solidVisitorProcessor({ node, sourceFile, factory, target });
      if (isReifyRuntimeMode) {
        console.log(`🧼 [Xalor CLI] Validated Type Key: '${target.keyName}'`);
      }
      return markAsPure(updatedCall);
    }
    // PATH Transform: transformXalor
    if (isTransformerTarget(target)) {
      /* prettier-ignore */
      const updatedCall = solidVisitorProcessor({ node, sourceFile, factory, target });
      if (isReifyRuntimeMode) {
        console.log(`🔀 [Xalor CLI] Transformed Type Key: '${target.keyName}'`);
      }
      return markAsPure(updatedCall);
    }
    return visitEachChild(node, visitor, context);
  };
  return visitor;
}
