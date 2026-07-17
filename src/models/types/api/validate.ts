import type { TSolidError, TSolidBranded } from '../../../../shared';

/**
 * TITLE: SAFE PARSE DATA FLOW DISCRIMINATOR
 *
 * DESCRIPTION:
 * Centrally isolates the complex generic type reification return calculation bounds.
 * Maps your current production schema tokens down to their mutable, partial, and
 * fully aligned instance graph footprints natively, satisfying Commandment IX.
 * Replaces engine-level runtime exception unwinding loops with a strict,
 * zero-allocation discriminated union payload boundary modeled after AOT designs.
 *
 * @template K - The authoritative evolution tracking namespace token literal key.
 */
export type TSolidSafeParseResult<K extends TActiveRegistryKeys> =
  | {
      readonly success: true;
      readonly data: TSolidBranded<K, TResolveRegistryStructure<K>>;
      readonly errors: null;
    }
  | {
      readonly success: false;
      readonly data: null;
      readonly errors: readonly TSolidError[];
    };
