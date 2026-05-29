// transformer/utils/ast-helpers.ts
import { SENTRY_TRIGGER_NAMES, isKeyOfArray } from '../../shared';
import type { TSentryTriggerName } from '../../shared';
import {
  addSyntheticLeadingComment,
  SyntaxKind,
  isIdentifier,
  isPropertyAccessExpression,
} from 'typescript';
import type { Node, Type, CallExpression, SourceFile } from 'typescript';
import type { TSolidShape } from '../../shared';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
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
export function getAPIName(node: CallExpression): TSentryTriggerName {
  const expression = node.expression;

  if (isIdentifier(expression)) {
    const apiName = expression.text;
    if (isKeyOfArray(SENTRY_TRIGGER_NAMES)(apiName)) return apiName;
  }

  if (isPropertyAccessExpression(expression)) {
    const propertyName = expression.name.text;
    if (isKeyOfArray(SENTRY_TRIGGER_NAMES)(propertyName)) return propertyName;
  }
  // TODO: ERROR HANDLER
  // /**
  //  * 🪐 ENVIRONMENT-AWARE ANSI SENTRY BREACH PANEL
  //  *
  //  * ROLE:
  //  * Conceptually bundles, aggregates, and transforms an invalid library caller signature
  //  * (such as a misspelled or legacy API method invocation) into a highly descriptive,
  //  * color-mapped ANSI panel visualization report.
  //  *
  //  * WHY:
  //  * Satisfies Commandment I (Single Source of Truth) and Commandment VI (Traceability).
  //  * It logs the anomaly cleanly directly to the console stream using your universal
  //  * report service framework, preserving complete thread performance safety. This ensures
  //  * the user receives explicit, stylized guidance to fix the call site while guaranteeing
  //  * the background dev watch-mode compiler server remains 100% active, alive, and un-thrown.
  //  */
  // const invalidTriggerReport = TransformerReportService.generateTerminalPanel({
  //   keyName: 'UNKNOWN_API_TRIGGER',
  //   fileLocation: `transformer/miner/mining-target.ts ↳ getAPIName`,
  //   message: `AST Sentry encountered an un-permitted property invocation under the Xalor namespace.\n` +
  //            `Encountered Invalid Method: "Xalor.${propertyName}"\n` +
  //            `Action: Aborting metadata extraction for this node. Ensure the target method matches permissible triggers.`,
  //   rule: 'invalid_trigger_signature',
  //   mode: 'watch', // Defaults safely to watch warning layouts to keep the terminal process active
  // });

  // console.warn(invalidTriggerReport);
  throw new Error(`[xalor] Unknown API trigger: ${expression}`);
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
