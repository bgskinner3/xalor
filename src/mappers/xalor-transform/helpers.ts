import { shapeKindUtilsService } from '../../../shared';
import { INSTANCE_CLONE_STRATEGIES } from './clone-instance-coercer';
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
/**
 * Maps live constructor function references directly back to their AOT registry keys
 * (e.g. Date constructor -> "Date"). Pre-allocated once at system initialization [INDEX].
 */
const CONSTRUCTOR_KEY_MAP: ReadonlyMap<unknown, string> = (() => {
  const cacheMap = new Map<unknown, string>();

  // Safe cast-free mapping registry descriptor boundary
  const mapperRef: Record<string, { readonly ctor: unknown }> =
    shapeKindUtilsService.instanceRegistryMapper;

  for (const key in mapperRef) {
    if (Reflect.has(mapperRef, key)) {
      const descriptor = mapperRef[key];
      if (descriptor && descriptor.ctor) {
        cacheMap.set(descriptor.ctor, key);
      }
    }
  }

  return cacheMap;
})();

/**
 * UNIVERSAL IN-FLIGHT REFERENCE ISOLATOR
 *
 * UNIVERSAL RUNTIME API: Natively intercepts platform objects and clones them using
 * your existing INSTANCE_CLONE_STRATEGIES with zero duplicated boilerplate structures [INDEX].
 *
 * CRITICAL: 100% free of type escape hatches ('as') or 'any' assignments [INDEX].
 */
export function clonePlatformInstance(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value; // Instantly bypass primitives
  }

  // 1. Convert the runtime constructor address back to its text key string
  const registryKey = CONSTRUCTOR_KEY_MAP.get(value.constructor);
  if (!registryKey) {
    return value; // Not a registered platform instance; pass through custom object safely
  }

  // 2. Safely read from strategies using a typesafe dictionary reference gate
  const strategiesRef: Record<string, (d: unknown) => unknown> =
    INSTANCE_CLONE_STRATEGIES;

  if (Reflect.has(strategiesRef, registryKey)) {
    const cloneFn = strategiesRef[registryKey];

    if (typeof cloneFn === 'function') {
      const clonedResult = cloneFn(value);
      // Fallback safeguard: if a strategy execution returns null due to type checks,
      // return the pristine original pointer to prevent layout corruption
      return clonedResult !== null ? clonedResult : value;
    }
  }

  return value;
}
