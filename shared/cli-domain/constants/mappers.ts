import {
  isWatchMode,
  isVacuumMode,
  isAuditMode,
  isCompileMode,
  isStudioMode,
  isClearMode,
} from '../utils/guards';

/**
 * CORE MODE SYSTEM EVALUATORS
 * ROLE: Point-free aggregation array holding authoritative mode type guard predicates.
 */
export const MODE_SYSTEM_EVALUATORS = [
  isCompileMode,
  isWatchMode,
  isVacuumMode,
  isAuditMode,
  isStudioMode,
  isClearMode,
] as const;
