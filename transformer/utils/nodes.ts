// models/guards/transformer/nodes.ts
import ts from 'typescript';
import { SENTRY_TRIGGER_NAMES, isKeyOfArray } from '../../shared';
import type { TSentryTriggerName } from '../../shared';
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

/**
 * GET API NAME (The Sentry Identifier)
 *
 * ROLE:
 * Scans a CallExpression node to identify and isolate the exact Xalor entry-point string token.
 *
 * STRATEGY:
 * - Structural Uniformity: Checks both direct identifiers (`registerXalor()`) and property access
 *   namespaces (`Xalor.registerXalor()`) to map out all permissible calling signatures.
 * - Flat Routing: Resolves names to variables immediately, avoiding switch statements or nested
 *   loops while validating strings directly against your shared configuration arrays.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation). It normalizes the identifier lookup down
 * to an explicit `TSentryTriggerName`, allowing downstream routers to sort functions polymorphically
 * without handling complex AST patterns multiple times.
 */
export function getAPIName(node: ts.CallExpression): TSentryTriggerName {
  const expression = node.expression;

  if (ts.isIdentifier(expression)) {
    const name = expression.text;
    if (isKeyOfArray(SENTRY_TRIGGER_NAMES)(name)) return name;
  }

  if (ts.isPropertyAccessExpression(expression)) {
    const propertyName = expression.name.text;
    if (isKeyOfArray(SENTRY_TRIGGER_NAMES)(propertyName)) return propertyName;
  }

  throw new Error(`[xalor] Unknown API trigger: ${name}`);
}
/**
 * getFormattedPosition
 * 🛰️ TOOLING GEAR: CODE POSITION FORMATTER
 *
 * ROLE:
 * Converts a raw TypeScript AST position index into a human-readable
 * file, line, and character coordinate string.
 *
 * HOW IT WORKS (EASY TO READ):
 * 1. It looks up the specific line and character indices for the raw position.
 * 2. It increments the zero-indexed line number by 1 for standard editor view.
 * 3. It increments the zero-indexed character number by 1 for standard editor view.
 * 4. It joins them with the file name to return a standard format: "path/file.ts:line:char".
 *
 * @example
 * ```ts
 *
 *  const nodeStartPosition = node.getStart(sourceFile);
 *. getFormattedPosition(sourceFile, nodeStartPosition)
 * ```
 *
 *
 */
export function getFormattedPosition(
  sourceFile: ts.SourceFile,
  position: number,
): string {
  const { line, character } =
    sourceFile.getLineAndCharacterOfPosition(position);
  return `line: ${line + 1}, column: ${character + 1}`;
}
