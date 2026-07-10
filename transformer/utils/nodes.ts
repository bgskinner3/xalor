// transformer/utils/nodes.ts
import ts from 'typescript';
import { SENTRY_TRIGGER_NAMES } from '../../shared';
import { XalorRoutesService } from '../service';

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
  if (!ts.isCallExpression(node)) return false;

  const expr = node.expression;
  let compoundName: string | undefined = undefined;
  let identifierNode: ts.Identifier | null = null;

  if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression)) {
    if (expr.expression.text === 'xalor' && ts.isIdentifier(expr.name)) {
      compoundName = `xalor.${expr.name.text}`;
      identifierNode = expr.name;
    }
  } else if (ts.isIdentifier(expr)) {
    compoundName = expr.text;
    identifierNode = expr;
  }

  if (!compoundName || !identifierNode) return false;

  const triggers: readonly string[] = SENTRY_TRIGGER_NAMES;
  if (!triggers.includes(compoundName)) return false;

  // Resolve your active execution parameters
  const lifecycle = XalorRoutesService.resolveXalorLifecycle();

  if (
    checker &&
    !lifecycle.isReifyRuntimeMode &&
    !lifecycle.isVacuumStripMode
  ) {
    const symbol = checker.getSymbolAtLocation(identifierNode);
    const declaration = symbol?.valueDeclaration;
    if (
      declaration &&
      (ts.isFunctionDeclaration(declaration) ||
        ts.isMethodDeclaration(declaration))
    ) {
      if (
        declaration.getSourceFile().fileName === node.getSourceFile().fileName
      ) {
        return false;
      }
    }
  }

  return true;
}
