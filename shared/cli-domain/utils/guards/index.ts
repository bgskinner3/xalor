import type { TTypeGuard } from '../../../types';
import type { TXalorCLIModesMap, TCLIFlags } from '../../types';
import { ALL_CLI_FLAGS } from '../../constants';
import { isKeyOfArray } from '../../../utils/guards';

/**
 * @utilType Guard
 * @name isInitMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to init execution states.
 */
export const isCompileMode: TTypeGuard<TXalorCLIModesMap['compile']> = (
  value: unknown,
): value is TXalorCLIModesMap['compile'] => {
  return value === 'compile' || value === '--compile';
};
/**
 * @utilType Guard
 * @name isWatchMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to watch execution states.
 */
export const isWatchMode: TTypeGuard<TXalorCLIModesMap['watch']> = (
  value: unknown,
): value is TXalorCLIModesMap['watch'] => {
  return value === 'watch' || value === '--watch' || value === '-w';
};
/**
 * @utilType Guard
 * @name isWatchMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to watch execution states.
 */
export const isStudioMode: TTypeGuard<TXalorCLIModesMap['studio']> = (
  value: unknown,
): value is TXalorCLIModesMap['studio'] => {
  return value === 'studio' || value === '--studio';
};
/**
 * @utilType Guard
 * @name isVacuumMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to vacuum execution states.
 */
export const isVacuumMode: TTypeGuard<TXalorCLIModesMap['vacuum']> = (
  value: unknown,
): value is TXalorCLIModesMap['vacuum'] => {
  return value === 'vacuum' || value === '--vacuum' || value === 'build';
};

/**
 * @utilType Guard
 * @name isReportMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to report execution states.
 */
export const isAuditMode: TTypeGuard<TXalorCLIModesMap['audit']> = (
  value: unknown,
): value is TXalorCLIModesMap['audit'] => {
  return value === 'audit' || value === '--audit';
};
/**
 * @utilType Guard
 * @name isClearMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to report execution states.
 */
export const isClearMode: TTypeGuard<TXalorCLIModesMap['clear']> = (
  value: unknown,
): value is TXalorCLIModesMap['clear'] => {
  return value === 'clear' || value === '--clear';
};

/**
 * IS_VALID_CLI_FLAG_GUARD
 *
 * ROLE: High-velocity primitive type guard validating terminal switch string parameters on boot.
 * STRATEGY: Statically derived from your curry factory configuration matrix to enforce
 * 100% type-narrowing safety across your TCLIFlags union contract boundaries.
 */
export const isValidCLIFlagGuard: TTypeGuard<TCLIFlags> = (
  value: unknown,
): value is TCLIFlags => isKeyOfArray(ALL_CLI_FLAGS)(value);
