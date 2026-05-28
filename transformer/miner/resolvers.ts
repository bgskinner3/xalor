// transformer/miner/resolvers.ts
import { addSyntheticLeadingComment, SyntaxKind } from 'typescript';
import type { Node, Type } from 'typescript';
import type { TSolidShape } from '../../shared';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';

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
