import ts from 'typescript';
import type { TVaultSyncPayload } from '../../shared';
import {
  REGISTER_MODE_TRIGGERS,
  GENERATOR_MODE_TRIGGERS,
  VALIDATION_MODE_TRIGGERS,
  TRANSFORM_MODE_TRIGGERS,
} from '../../shared/constants';
export type TRegisterTriggers = (typeof REGISTER_MODE_TRIGGERS)[number]; // 'xalor.register'
export type TGeneratorTriggers = (typeof GENERATOR_MODE_TRIGGERS)[number]; // 'xalor.default' | 'xalor.mock' | ...
export type TValidationTriggers = (typeof VALIDATION_MODE_TRIGGERS)[number]; // 'xalor.guard' | 'xalor.assert' | ...
export type TTransformTriggers = (typeof TRANSFORM_MODE_TRIGGERS)[number]; // 'xalor.pick' | 'xalor.omit' | ...

export type TManifestChecks = {
  readonly existingPayload: TVaultSyncPayload;
  readonly newFilePath: TVaultSyncPayload['filePath'];
  readonly newArea: TVaultSyncPayload['area'];
  readonly newAnchor: TVaultSyncPayload['anchor'];
};
// ========================================================================
// BASE AST EXTRACTOR CONTRACT
// ========================================================================

/**
 * Defines the independent functional contract for sniffing out loose, raw properties from the AST.
 */
type TExtractRawRegistry<TPayload> = (
  node: ts.CallExpression,
  checker: ts.TypeChecker,
) => TPayload | null;

// ========================================================================
// API PAYLOAD TYPES (Mode property removed completely)
// ========================================================================

/**
 * RAW REGISTRATION PAYLOAD
 * Tracks declarations entering types into the CAS layout.
 */
export type TRegisterRawPayload = {
  readonly keyName: string;
  readonly keyType: ts.Type;
  readonly shapeType: ts.Type;
  readonly apiName: TRegisterTriggers; // Exactly: 'xalor.register'
};

/**
 * RAW GENERATION PAYLOAD
 * Captured when encountering 'xalor.default', 'xalor.mock', 'xalor.clone', etc.
 */
export type TGenerateRawPayload = {
  readonly keyName: string | undefined;
  readonly apiName: TGeneratorTriggers; // The precise method token invoked
};

/**
 * RAW VALIDATION PAYLOAD
 * Captured when encountering 'xalor.guard', 'xalor.assert', 'xalor.parse', etc.
 */
export type TValidateRawPayload = {
  readonly keyName: string | undefined;
  readonly apiName: TValidationTriggers; // The precise method token invoked
};

/**
 * RAW TRANSFORMER PAYLOAD
 * Captured when encountering 'xalor.pick', 'xalor.omit', 'xalor.rename', etc.
 */
export type TTransformerRawPayload = {
  readonly keyName: string | undefined;
  readonly apiName: TTransformTriggers; // The precise method token invoked
};
// ========================================================================
// ========================================================================
// MAPPER TYPES
// ========================================================================
// ========================================================================
/**
 * MAPPING REGISTRY
 *
 * ROLE:
 * Defines the rigid structural lookup shape for your polymorphic router map.
 *
 * WHY:
 * Satisfies Commandment I and V. It explicitly pairs each active API sub-command
 * token with its exact function payload contract, eliminating 'any' entirely from the loop.
 */
export type TXalorMinerRouterMap = {
  // Registration triggers: 'xalor.register'
  readonly [K in TRegisterTriggers]: TExtractRawRegistry<TRegisterRawPayload>;
} & {
  // Generation triggers: 'xalor.default', 'xalor.mock', etc.
  readonly [K in TGeneratorTriggers]: TExtractRawRegistry<TGenerateRawPayload>;
} & {
  // Validation triggers: 'xalor.guard', 'xalor.assert', etc.
  readonly [K in TValidationTriggers]: TExtractRawRegistry<TValidateRawPayload>;
} & {
  // Transformation triggers: 'xalor.pick', 'xalor.omit', etc.
  readonly [K in TTransformTriggers]: TExtractRawRegistry<TTransformerRawPayload>;
};

/**
 * Complete consolidated return union type emitted from the router matrix layer.
 */
export type TResolvedMiningRouterReturn =
  | TRegisterRawPayload
  | TGenerateRawPayload
  | TValidateRawPayload
  | TTransformerRawPayload;
