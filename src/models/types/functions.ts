import type { TTypeGuard, TAssert } from '../../../shared';

/**
 * T_RETURN_VALIDATION_TOOLS
 *
 * ROLE:
 * The public interface payload mapping signature for Category 2 (Validation API).
 * Packages narrowed boolean guards and terminal exception asserters together.
 */
export type TReturnValidationTools<K extends keyof ISolidRegistry> = {
  guard: TTypeGuard<ISolidRegistry[K]>;
  assert: TAssert<ISolidRegistry[K]>;
};
