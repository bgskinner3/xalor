/**
 * 🔷 PRIMITIVE TYPEOF VALIDATOR MAP
 *
 * ROLE:
 * A pre-allocated, flat lookup ledger that maps blueprint primitive keys
 * directly to native JavaScript 'typeof' verification parameters.
 *
 * DESIGN INVARIANTS:
 * - Enforces Commandment VIII: Absolute zero runtime allocation. Evaluates at O(1) memory speeds.
 * - Enforces Commandment IX: No casts, zero assertions, pure evaluation layers.
 */
const PRIMITIVE_TYPEOF_VALIDATOR_MAP: Readonly<
  Record<string, (val: unknown) => boolean>
> = Object.freeze({
  string: (val) => typeof val === 'string',
  number: (val) => typeof val === 'number',
  boolean: (val) => typeof val === 'boolean',
  bigint: (val) => typeof val === 'bigint',
  symbol: (val) => typeof val === 'symbol',
  null: (val) => val === null,
  undefined: (val) => val === undefined,
  void: (val) => val === undefined,
});

/**
 * VERIFY RUNTIME PRIMITIVE COMPLIANCE
 *
 * ROLE:
 * Executes a high-velocity single-pass check to determine if a data payload
 * matches its intended primitive type blueprint descriptor token.
 *
 * STRATEGY:
 * - Direct index extraction from a static function dictionary.
 * - Fallback wildcard evaluation handles loose entries point-free.
 * - Explicitly shields intersection loops from data leakage by rejecting mismatches.
 *
 * @param type - The target primitive type name extracted from the structural blueprint.
 * @param data - The raw incoming wire value to be cross-examined.
 * @returns {boolean} True if the payload fully satisfies the type constraint.
 */
export function verifyRuntimePrimitiveCompliance(
  type: string,
  data: unknown,
): boolean {
  const evaluateTypeOf = PRIMITIVE_TYPEOF_VALIDATOR_MAP[type];
  if (evaluateTypeOf) {
    return evaluateTypeOf(data);
  }

  if (type === 'unknown' || type === 'any') return true;

  return false;
}
