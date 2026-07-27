import { hasOwnProperty, isRecord } from '../../../shared';
import type { TMockOverrides } from '../../models/types';
import { XALOR_SIM_GENERATOR_UTIL_KEYS } from '../../models';
export function isTargetRegistryStructure<K extends TActiveRegistryKeys>(
  payload: unknown,
): payload is TResolveRegistryStructure<K> {
  return isRecord(payload);
}

export const isValidMockOverrideBlock = <K extends TActiveRegistryKeys>(
  overrides: unknown,
): overrides is TMockOverrides<K> => {
  // 1. Must be a concrete object-like structure (not null, not an array, not a primitive primitive)
  if (
    typeof overrides !== 'object' ||
    overrides === null ||
    Array.isArray(overrides)
  ) {
    return false;
  }

  // 2. Iterate safely across the provided properties
  for (const propertyKey in overrides) {
    if (!hasOwnProperty(overrides, propertyKey)) {
      continue;
    }

    const rule = (overrides as Record<string, unknown>)[propertyKey];

    // 3. Every individual property override MUST be either a function or an array tuple descriptor
    if (typeof rule !== 'function' && !Array.isArray(rule)) {
      return false;
    }

    // 4. If it is an array tuple descriptor, confirm its structural integrity
    if (Array.isArray(rule)) {
      // Must not be empty, and index 0 MUST be a valid registered simulation generator string key
      if (rule.length === 0 || !(rule[0] in XALOR_SIM_GENERATOR_UTIL_KEYS)) {
        return false;
      }
    }
  }

  // 5. An empty object '{}' is a completely valid configuration payload for fallback defaults
  return true;
};
