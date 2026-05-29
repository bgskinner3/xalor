import { IS_SOLID_CONFIG_ITEMS } from '../../shared/constants';
import type { TReifyCTX } from '../types';

/**
 * INITIALIZATION CONTEXT SEED (The Genesis Compilation Context)
 *
 * ROLE:
 * Generates the clean baseline tracking memory layout configuration frame utilized
 * as the absolute root entry point for a brand-new type reification traversal sequence.
 *
 * STRATEGY:
 * Pre-allocates isolated long-lived state managers on the heap before the Abstract
 * Syntax Tree (AST) crawl begins. It seeds a pristine `fragments` Map buffer to hold
 * content-addressable storage components, provisions an empty `seen` Set to act as the
 * long-lived circular reference ledger, and safely extracts deep structural limits
 * switchlessly out of your centralized global configuration constants dictionary.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation Rule) and Commandment VIII (Internal Efficiency).
 * By anchoring all recursion depths, tracking paths, and buffer registries point-free right
 * at the initialization boundary, it ensures the entire down-tree execution track runs
 * with absolute structural safety, total thread isolation, and zero mid-flight allocation churn.
 */
export const DEFAULT_REIFY_CTX: TReifyCTX = {
  depth: 0,
  maxDepth: IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth,
  fragments: new Map(),
  parentKey: 'root',
  seen: new Set(),
} satisfies TReifyCTX;
