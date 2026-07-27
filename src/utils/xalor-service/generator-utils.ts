import type {
  IArchetypeStrategy,
  TXalorSimGeneratorArchTypes,
  TXalorSimGeneratorKeys,
  TXalorTupleMapping,
} from '../../models/types';
import { XALOR_SIM_GENERATOR_UTIL_KEYS } from '../../models';
import { isKeyInObject, isString, isArray } from '../../../shared';

export function isUserMutationCallback<Structure, Key extends keyof Structure>(
  rule: unknown,
): rule is (baseValue: Structure[Key]) => Structure[Key] {
  return typeof rule === 'function';
}
/**
 * IS XALOR SIM GENERATOR KEY
 *
 * Statically and runtime verifies whether an incoming unknown string token
 * is an authoritative registered simulation utility key identifier.
 *
 * DESIGN INVARIANTS:
 * - Satisfies COMMANDMENT I: Derives bounds cleanly from your source map without duplicate arrays.
 * - Satisfies COMMANDMENT VIII: Executes via O(1) properties lookup with zero memory allocation.
 * - Satisfies COMMANDMENT IX: 100% explicit return type tracking with no 'as' casting overrides.
 *
 * @param {unknown} token - The raw, untrusted incoming string lookup key to validate.
 * @returns {token is TXalorSimGeneratorKeys} True if the token is an established simulation key.
 */
export function isXalorSimGeneratorKey(
  token: unknown,
): token is TXalorSimGeneratorKeys {
  return isString(token) && isKeyInObject(token)(XALOR_SIM_GENERATOR_UTIL_KEYS);
}

/**
 * IS VALID TUPLE RULE
 *
 * Verifies that an unknown property override rule is a structurally sound,
 * strictly bound simulation utility array-tuple configuration block.
 *
 * Satisfies COMMANDMENT IX: 100% assertion-free native type refinement predicate.
 */
export function isValidTupleRule<K extends TXalorSimGeneratorKeys>(
  rule: unknown,
  utilKey: K,
): rule is TXalorTupleMapping<K> {
  return isArray(rule) && rule[0] === utilKey;
}

// Strategy A: Unpacks known object wrapper properties to match positional parameters cleanly
const pureStrategy: IArchetypeStrategy = Object.freeze({
  execute: (generatorFn, _, __, config) => {
    // 🎯 FIX: Check if the config is an object wrapper container (like { length: 12 })
    if (config && typeof config === 'object' && 'length' in config) {
      const positionalLength = (config as Record<string, unknown>).length;
      return generatorFn(positionalLength);
    }

    // Default fallback for pure object config shapes (currency, percentage, etc.)
    const packedArgs =
      config !== undefined ? Object.freeze([config]) : Object.freeze([]);
    return generatorFn(...packedArgs);
  },
});

// Strategy B: Injects the dynamic field key context parameter natively
const contextualStrategy: IArchetypeStrategy = Object.freeze({
  execute: (generatorFn, propertyName) => {
    return generatorFn(propertyName);
  },
});

// Strategy C: Passes the baseline mock primitive first, followed by custom configurations
const transformerStrategy: IArchetypeStrategy = Object.freeze({
  execute: (generatorFn, _, baselineValue, config) => {
    const transformerArgs =
      config !== undefined
        ? Object.freeze([baselineValue, config])
        : Object.freeze([baselineValue]);

    return generatorFn(...transformerArgs);
  },
});

/* prettier-ignore */
export const ARCHETYPE_STRATEGY_ROUTER: Record<TXalorSimGeneratorArchTypes, IArchetypeStrategy> = Object.freeze({
  pure: pureStrategy,
  contextual: contextualStrategy,
  transformer: transformerStrategy,
}) satisfies  Record<TXalorSimGeneratorArchTypes, IArchetypeStrategy>
