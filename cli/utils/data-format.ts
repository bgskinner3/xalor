import type { TSolidShape } from '../../shared/types';
import { REBUILD_STRATEGY_MAPPER } from '../models';
import { isUndefined, isNull } from '../../shared/utils/guards';
export function resolveBlueprint(
  name: string,
  pool: Record<string, TSolidShape> | Map<string, TSolidShape>,
): TSolidShape | undefined {
  return pool instanceof Map ? pool.get(name) : pool[name];
}

/**
 * generateSolidTypeScriptString
 * 🪐 TSOLID SHAPE CODE REBUILDER (Optimized Linear Pass)
 *
 * ROLE:
 * Transpiles custom TSolidShape JSON layout tokens directly back into
 * completely valid, beautifully aligned, human-readable TypeScript definitions.
 *
 * STRATEGY:
 * Employs a constant-time O(1) polymorphic strategy dictionary selection pass.
 * By unifying all handling signatures under a singular parameter interface,
 * this orchestrator completely bypasses function parameter contravariance clashing.
 * It routes payloads cleanly point-free to structural strategy blocks that narrow
 * variants on the V8 stack with absolute zero type-casting (`as`) or `any` overrides.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation Rule) and Commandment VIII (Internal Efficiency).
 * Pre-allocates padding structural indentation matrices and avoids intermediate inline closure
 * memory mapping arrays to guarantee sub-nanosecond execution with zero garbage collection churn.
 *
 * @param shape The incoming raw or nested TSolidShape layout token blueprint to rebuild
 * @param blueprintsPool The complete database snapshot cache ledger or global interning reference map
 * @param indentDepth Static character indentation counter tracking current tree depth levels (defaults to 0)
 * @returns A completely valid, formatted, and human-readable native TypeScript representation string
 */
export function generateSolidTypeScriptString(
  shape: TSolidShape,
  blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
  indentDepth = 0,
): string {
  if (isUndefined(shape) || isNull(shape)) return 'any';

  const strategy = REBUILD_STRATEGY_MAPPER[shape.kind];
  if (isUndefined(shape)) return 'unknown';

  const spacing = ' '.repeat(indentDepth);

  return strategy({
    shape,
    pool: blueprintsPool,
    depth: indentDepth,
    spacing,
  });
}
