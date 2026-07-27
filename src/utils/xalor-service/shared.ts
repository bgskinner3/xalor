import { hasOwnProperty, isRecord } from '../../../shared';
import type { TMockOverrides } from '../../models/types';

export function isTargetRegistryStructure<K extends TActiveRegistryKeys>(
  payload: unknown,
): payload is TResolveRegistryStructure<K> {
  return isRecord(payload);
}

export const isValidMockOverrideBlock = <K extends TActiveRegistryKeys>(
  overrides: unknown,
): overrides is TMockOverrides<K> => {
  // 1. Must be a concrete object structure (not null, not an array, not a primitive)
  if (
    typeof overrides !== 'object' ||
    overrides === null ||
    Array.isArray(overrides)
  ) {
    return false;
  }

  let hasAtLeastOneProperty = false;

  // 2. Iterate safely across the provided properties
  for (const propertyKey in overrides) {
    if (!hasOwnProperty(overrides, propertyKey)) {
      continue;
    }

    // Flag that the object contains data definitions (is not empty)
    hasAtLeastOneProperty = true;

    const rule = (overrides as Record<string, unknown>)[propertyKey];

    // 3. Every individual property override MUST be either a function or a structured descriptor object
    if (
      typeof rule !== 'function' &&
      (typeof rule !== 'object' || rule === null)
    ) {
      return false;
    }

    // 4. If it's a metadata descriptor object, confirm it carries your designated discriminator tag
    if (typeof rule === 'object' && !('_xalorGen' in rule)) {
      return false;
    }
  }

  // 5. Enforce your strict rule: returns false if the object is empty ({})
  return hasAtLeastOneProperty;
};
