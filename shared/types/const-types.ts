import { XALOR_MESSAGE_HANDLER } from '../error/messages';
import {
  IS_SOLID_SHAPE_KINDS_CONFIG,
  AUDITOR_KEYWORDS,
  SOLID_SHAPE_PRIMITIVE_KEYS,
  SENTRY_TRIGGER_NAMES,
  GENERATOR_MODE_TRIGGERS,
  VALIDATION_MODE_TRIGGERS,
  TRANSFORM_MODE_TRIGGERS,
  CLI_COMMAND_MODES,
  CUD_EXECUTION_MODES,
  TRANSFORMER_EXECUTE_MODES,
} from '../constants';

/**
 * TSolidShapeKinds
 *  The exhaustive list of supported type categories in the Solid system.
 * @see {@link FoundationalTypesDocs.TSolidShapeKinds}
 */
export type TSolidShapeKinds = keyof typeof IS_SOLID_SHAPE_KINDS_CONFIG;

/**
 * TAuditorKeywords
 * List of All Auditing key words in order to build Error messages
 * @see {@link FoundationalTypesDocs.TAuditorKeywords}
 */
export type TAuditorKeywords = (typeof AUDITOR_KEYWORDS)[number];

/**
 * TSolidShapePrimitiveKeys
 * List of All primitive key types in our Transformer
 * @see {@link FoundationalTypesDocs.TSolidShapePrimitiveKeys}
 */
export type TSolidShapePrimitiveKeys =
  (typeof SOLID_SHAPE_PRIMITIVE_KEYS)[number];

/**
 * ============================================================================
 *  🔒 RUNTIME API TYPES
 * ============================================================================
 */
/**
 * TSentryTriggerName
 *
 * Core list of ALL API Names
 *
 * @see {@link FoundationalTypesDocs.TSentryTriggerName}
 */
export type TSentryTriggerName = (typeof SENTRY_TRIGGER_NAMES)[number];
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

// ====================================================================================================
// ====================================================================================================
/**
 * GLOBAL ERROR HANDLER MAPPER KEYS
 */
export type TXalorErrorKey = keyof typeof XALOR_MESSAGE_HANDLER.ERROR;
export type TXalorWarningKey = keyof typeof XALOR_MESSAGE_HANDLER.WARNING;
// ====================================================================================================
// ====================================================================================================

/**
 * TXalorCLIModes
 *
 * Transformer List Modes
 *
 * @see {@link FoundationalTypesDocs.TXalorCLIModes}
 */
export type TXalorCLIModes = keyof typeof CLI_COMMAND_MODES;
/**
 * TXalorCLIModesMap
 *
 * PURPOSE:
 * A strongly-typed mapped utility structure.
 *
 * ROLE:
 * Enables referencing explicit single compiler keys using lookup notation.
 */
export type TXalorCLIModesMap = {
  readonly [K in TXalorCLIModes]: K;
};
/**
 * TCudExecutionMode
 *
 * ROLE:
 * Strict string union type derived from the frozen CUD_EXECUTION_MODES keys.
 */
export type TCudExecutionMode = keyof typeof CUD_EXECUTION_MODES;
/**
 * TTransformerExecuteMode
 *
 * Strict union type matching only: 'watch' | 'compile' | 'vacuum' | 'sudto | 'clear
 */
export type TTransformerExecuteMode = keyof typeof TRANSFORMER_EXECUTE_MODES;
