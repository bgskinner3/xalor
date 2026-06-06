// transformer/utils/ast-helpers.ts
import { SENTRY_TRIGGER_NAMES, isKeyOfArray } from '../../shared';
import type { TSentryTriggerNames } from '../../shared';
import {
  addSyntheticLeadingComment,
  SyntaxKind,
  isIdentifier,
  isPropertyAccessExpression,
} from 'typescript';
import type { Node, Type, CallExpression, SourceFile } from 'typescript';
import type { TSolidShape } from '../../shared';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import { TransformerReportService } from '../error';
import { XalorRoutesService } from '../service';
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
export function getAPIName(
  node: CallExpression,
): TSentryTriggerNames | undefined {
  const expression = node.expression;

  // Path A: Standalone legacy macro identifiers (e.g., registerXalor)
  if (isIdentifier(expression)) {
    const apiName = expression.text;
    if (isKeyOfArray(SENTRY_TRIGGER_NAMES)(apiName)) return apiName;
  }

  // Path B: Chained method structures (e.g., xalor.register or Xalor.register)
  if (
    isPropertyAccessExpression(expression) &&
    isIdentifier(expression.expression)
  ) {
    const baseNamespace = expression.expression.text.toLowerCase(); // Enforce lowercase ("xalor")

    if (baseNamespace === 'xalor' && isIdentifier(expression.name)) {
      const methodName = expression.name.text;

      // Construct the unified lowercase signature key string: "xalor.register"
      const compoundName = `${baseNamespace}.${methodName}`;

      // Verify the compound string token exists exactly in our permissible trigger list
      if (isKeyOfArray(SENTRY_TRIGGER_NAMES)(compoundName)) {
        return compoundName;
      }

      // If the namespace is 'xalor' but the method itself is completely unmapped, log it
      const executeMode = XalorRoutesService.xalorCLIMode();
      TransformerReportService.logAnomaly({
        keyName: 'UNKNOWN_API_TRIGGER',
        fileLocation: 'transformer/miner/mining-target.ts ↳ getAPIName',
        error: `${expression.expression.text}.${methodName}`,
        mode: executeMode,
      });
    }
  }

  return undefined;
}

/**
 * getFormattedPosition
 * TOOLING GEAR: CODE POSITION FORMATTER
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
 * getFormattedPosition(sourceFile, nodeStartPosition)
 *
 *
 * ```
 *
 *
 */
export function getFormattedPosition(
  sourceFile: SourceFile,
  position: number,
): string {
  const { line, character } =
    sourceFile.getLineAndCharacterOfPosition(position);
  return `line: ${line + 1}, column: ${character + 1}`;
}
/**
 * MARK AS PURE (Minification Shield)
 *
 * ROLE:
 * - The "Bundle Optimizer." It signals to downstream tools that this function
 *   call is side-effect free.
 *
 * STRATEGY:
 * - Synthetic Annotation: Injects a @__PURE__ multi-line comment directly
 *   onto the generated AST node.
 *
 * WHY:
 * - This satisfies Commandment III (Zero-Footprint Runtime).
 * - If a developer registers a type but never actually uses it in their code,
 *   the minifier will see this tag and safely strip the metadata, preventing
 *   "Dead Code" from bloating the production bundle.
 */
export function markAsPure<T extends Node>(node: T): T {
  return addSyntheticLeadingComment(
    node,
    SyntaxKind.MultiLineCommentTrivia,
    '* @__PURE__ ',
    true,
  );
}

/**
 * CREATE MINING CTX
 *
 * ROLE:
 * The "Notebook." Initializes the recursive state for the Reification engine.
 *
 * STRATEGY:
 * - Depth Sync: Seeds the limit from IS_SOLID_CONFIG_ITEMS to ensure
 *   Atomic Cutting happens at the correct level.
 * - Fragment Drawer: Provides an empty Map to collect shredded pieces
 *   encountered during the walk.
 */
export function createMiningCtx(
  key: string,
  fragments: Map<string, TSolidShape>,
) {
  return {
    depth: 0,
    maxDepth: IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth,
    fragments,
    parentKey: key,
    seen: new Set<Type>(),
  };
}
