import type {
  TSolidError,
  TSolidBranded,
  TExpandUnionStructure,
} from '../../../../shared';

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
/**
 * 🟢 THE VALIDATED SUCCESS ENTRY bluePRINT
 * Unrolls the concrete, branded payload structure explicitly inside the editor.
 */
export type TSolidSafeParseSuccess<K extends TActiveRegistryKeys> =
  TExpandUnionStructure<{
    readonly success: true;
    readonly data: TSolidBranded<K, TResolveRegistryStructure<K>>;
    readonly errors: null;
  }>;

/**
 * 🔴 THE DIAGNOSTIC FAILURE RECORD
 * Unrolls the strict tracking list error footprint explicitly inside the editor.
 */
export type TSolidSafeParseFailure = TExpandUnionStructure<{
  readonly success: false;
  readonly data: null;
  readonly errors: readonly TSolidError[];
}>;
