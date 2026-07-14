import type {
  TInvertedRuleKeyMap,
  TRuntimeApiErrorRules,
  TRuntimeApiErrorKeys,
} from '../../models/types';
import { ObjectUtils } from '../../../shared';
import { RUNTIME_API_RULE_KEYS } from './configs';

/**
 * RECEIVED_TOKEN_FALLBACK_MAP
 *
 *
 * ROLE: Static monomorphic map translating internal validator tracking tokens down to
 * consumer-facing human-readable string descriptions (e.g., mapping rejection tags to 'undefined').
 *
 *
 * Governed by Commandment VIII (Zero-Allocation on Success Paths). This dictionary resides
 * permanently in the module scope and resolves lookups using constant-time O(1) property pointer
 * offsets. It completely purges sequential string equality loops (`if/else` ladders) and prevents
 * V8 runtime type thrashing outside the critical path lanes.
 */
export const RECEIVED_TOKEN_FALLBACK_MAP: Record<string, string> = {
  missing: 'undefined',
  missing_key_presence: 'undefined',
  excess_property: 'undefined',
} satisfies Record<string, string>;

/**
 * INVERTED_RULE_KEYS_MAP
 *
 *
 *
 * ROLE: Pre-computed reverse dictionary lookup table mapping lowercase API rule values strictly
 * back to their corresponding uppercase configuration registry object keys.
 *
 * @performance
 * Allocates exactly once at module hydration time (boot) via a single-pass `Object.entries().reduce`
 * accumulator sweep. This removes expensive runtime `Object.keys()` arrays and linear `O(N)` loop
 * scans from the failure paths. Resolves structural matches via sub-nanosecond point-free memory jumps,
 * keeping your serverless cold starts incredibly lean and your error reporting footprint highly optimized.
 */
export const INVERTED_RULE_KEYS_MAP: TInvertedRuleKeyMap = ObjectUtils.entries(
  RUNTIME_API_RULE_KEYS,
).reduce((accumulator, [uppercaseKey, ruleValue]) => {
  // Safely assign properties point-free using the strictly typed key indices
  accumulator[ruleValue as TRuntimeApiErrorRules] =
    uppercaseKey as TRuntimeApiErrorKeys;
  return accumulator;
}, {} as TInvertedRuleKeyMap) satisfies TInvertedRuleKeyMap;
