// models/guards/transformer/nodes.ts
import ts from 'typescript';
import { SENTRY_TRIGGER_NAMES } from '../../shared';

/**
 * # IS SOLID CALL #####
 * Identifies the 'isSolid' function call within the AST.
 * ======
 * This is the primary "Trigger" for the Miner. When this is found,
 * the transformer begins reifying the attached types into Solid Shapes.
 * ===
 * (Identity Verification):
 * We don't just check the name 'isSolid'. We use the TypeChecker to verify
 * that the call belongs to our library. If a developer defines a local
 * function with the same name (Shadowing), this guard will return 'false'
 * to prevent accidental transformation of non-library code.
 */
export function isSolidCall(
  node: ts.Node,
  checker?: ts.TypeChecker,
): node is ts.CallExpression {
  if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression))
    return false;

  const triggers: Readonly<string[]> = SENTRY_TRIGGER_NAMES;
  const functionName = node.expression.text;

  if (!triggers.includes(functionName)) return false;

  if (checker) {
    const symbol = checker.getSymbolAtLocation(node.expression);
    const declaration = symbol?.valueDeclaration;

    if (declaration && ts.isFunctionDeclaration(declaration)) {
      const declFile = declaration.getSourceFile().fileName;
      const callFile = node.getSourceFile().fileName;

      /**
       * If the function is declared in the SAME file where it's called,
       * it is a "Fake" or "Shadow" function. We skip it.
       *
       * If they differ, it's an external import (our Library),
       * so we trigger the Miner.
       */
      if (declFile === callFile) {
        return false;
      }
    }
  }

  return true;
}
