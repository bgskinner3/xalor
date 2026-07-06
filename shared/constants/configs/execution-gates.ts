/**
 * ============================================================================
 * INTERNAL EXECUTION GATES
 * ============================================================================
 *
 * Master control matrix holding granular boolean toggles that dictate internal
 * function execution pathways, compiler routing blocks, and subsystem behaviors.
 *
 * @key - intellisenseInNodeModules: control for file position for intellisense file
 * @key - applyWatchLogs: enables all watch logs completely
 *
 *
 */

export const INTERNAL_EXECUTION_GATES = Object.freeze({
  externalCache: true,
  applyWatchLogs: true,
} as const);
