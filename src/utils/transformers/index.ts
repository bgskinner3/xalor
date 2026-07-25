import { RECTIFIER_REGISTRY_MAPPER } from '../../mappers';
import type {
  TSolidBranded,
  TSolidMetadata,
  TStrictSolidMetaData,
} from '../../../shared';
// import { BRAND_SYMBOL } from '../../../shared';

/**
 * 💎 MARK AS SOLID
 *
 * ROLE:
 * A "Ghost" Type Narrower for Nominal Branding.
 * This utility bridges the gap between raw data and validated data
 * without introducing runtime overhead or using 'as' casts.
 *
 * STRATEGY:
 * Leveraging User-Defined Type Guards to apply a unique symbol brand
 * to the data structure. This "tags" the object as safe for use in
 * strict functions that require TSolid-branded inputs.
 *
 * @returns {true} - Always returns true, as validation happened prior.
 */
export function markAsSolid<
  K extends TActiveRegistryKeys | TActiveDriftRegistryKeys,
  T,
>(_val: unknown): _val is TSolidBranded<K, T> {
  return true;
}

/**
 * 🧼 PRE-REGISTER METADATA (The Refiner)
 *
 * ROLE:
 * Upgrades loose build-time or dynamic metadata fragments into strict,
 * un-degraded 'TStrictSolidMetaData' envelopes using an O(1) dictionary lookup map.
 *
 * LAW: Zero 'any', Zero type assertions ('as'), and Zero 'switch' blocks.
 */
export function preRegisterMetadata(
  input: TSolidMetadata,
): TStrictSolidMetaData {
  if (!input) {
    throw new Error(
      `[xalor] 🚨 REFINER BREAK: Cannot pre-register null or unallocated metadata fragments.`,
    );
  }

  return {
    key: RECTIFIER_REGISTRY_MAPPER.key(input),
    reference: RECTIFIER_REGISTRY_MAPPER.reference(input),
    area: RECTIFIER_REGISTRY_MAPPER.area(input),
    version: RECTIFIER_REGISTRY_MAPPER.version(input),
    shape: RECTIFIER_REGISTRY_MAPPER.shape(input),
    filePath: RECTIFIER_REGISTRY_MAPPER.filePath(input),
    symbolName: RECTIFIER_REGISTRY_MAPPER.symbolName(input),
    typeName: RECTIFIER_REGISTRY_MAPPER.typeName(input),
    anchor: RECTIFIER_REGISTRY_MAPPER.anchor(input),
  };
}
/**
 * GENERATIVE UTILITY: STOCHASTIC STRING SIMULACRUM
 *
 * ROLE:
 * The "Entropy Engine." Generates realistic, randomized character streams
 * to back string primitive configurations during dynamic mock materialization.
 *
 */
const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const generateRandomString = (maxLength = 20): string => {
  const maxSafeLength = maxLength > 20 ? 20 : maxLength;
  const targetLength = Math.floor(Math.random() * (maxSafeLength - 5 + 1)) + 5;

  let result = '';
  const alphabetLength = ALPHABET.length;

  for (let i = 0; i < targetLength; i++) {
    const randomIndex = Math.floor(Math.random() * alphabetLength);
    result += ALPHABET.charAt(randomIndex);
  }

  return result;
};
