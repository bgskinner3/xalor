import {
  GENERATOR_MODE_TRIGGERS,
  VALIDATION_MODE_TRIGGERS,
  TRANSFORM_MODE_TRIGGERS,
} from '../constants';
/**
 * TGenerateXalorModes
 *
 * Generator List Modes
 *
 * @see {@link FoundationalTypesDocs.TGenerateXalorModes}
 */
export type TGenerateXalorModes = (typeof GENERATOR_MODE_TRIGGERS)[number];
/**
 * TValidateXalorModes
 *
 * Validation List Modes
 *
 * @see {@link FoundationalTypesDocs.TValidateXalorModes}
 */
export type TValidateXalorModes = (typeof VALIDATION_MODE_TRIGGERS)[number];
/**
 * TTransformXalorModes
 *
 * Transformer List Modes
 *
 * @see {@link FoundationalTypesDocs.TTransformXalorModes}
 */
export type TTransformXalorModes = (typeof TRANSFORM_MODE_TRIGGERS)[number];
