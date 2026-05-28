import type {
  TGenerateXalorModes,
  TValidateXalorModes,
  TTransformXalorModes,
} from '../../shared';
import ts from 'typescript';
// ========================================================================
// ========================================================================
// BASE TYPES
// ========================================================================
// ========================================================================
/**
 * Defines the independent functional contract for sniffing out loose, raw properties from the AST.
 */
type TExtractRawRegistry<TPayload> = (
  node: ts.CallExpression,
  checker: ts.TypeChecker,
) => TPayload | null;
// ========================================================================
// ========================================================================
// API TYPES
// ========================================================================
// ========================================================================
/**
 *  RAW REGISTRATION PAYLOAD
 *
 * ROLE:
 * Governs the data emitted when parsing manual registration hooks.
 *
 * PATTERN TARGETED:
 * `registerXalor<'KEY', Type>()` or `registerXalor<'KEY'>(data)`
 *
 *  @see registerXalor api
 */
export type TRegisterRawPayload = {
  /** The unique lookup identification string extracted from generic slot 0 */
  readonly keyName: string;

  readonly keyType: ts.Type;
  /** The actual structural TS Type extracted to be turned into a JSON blueprint */
  readonly shapeType: ts.Type;

  readonly apiName: 'registerXalor';
} | null;

/**
 *  RAW GENERATION PAYLOAD
 *
 * ROLE:
 * Governs the data emitted when parsing operational invocation hooks.
 *
 * PATTERN TARGETED:
 * `generateXalor<'KEY', 'mode'>(optionalData)`
 *
 * @see generateXalor
 */
export type TGenerateRawPayload = {
  /** The target type graph identity key extracted from generic slot 0 */
  readonly keyName: string | undefined;
  /** The operational behavior directive extracted from generic slot 1 */
  readonly mode: TGenerateXalorModes | undefined;

  readonly apiName: 'generateXalor';
};
/**
 * RAW VALIDATION PAYLOAD
 *
 * ROLE:
 * Governs the lightweight metadata strings extracted from a validateXalor call.
 * Contains no heavy type graphs because validateXalor only consumes schemas.
 */
export type TValidateRawPayload = {
  readonly keyName: string | undefined;
  readonly mode: TValidateXalorModes | undefined;
  readonly apiName: 'validateXalor';
};
/**
 * RAW VALIDATION PAYLOAD
 *
 * ROLE:
 * Governs the lightweight metadata strings extracted from a validateXalor call.
 * Contains no heavy type graphs because validateXalor only consumes schemas.
 */
export type TTransformerRawPayload = {
  readonly keyName: string | undefined;
  readonly mode: TTransformXalorModes | undefined;
  readonly apiName: 'transformXalor';
};
// ========================================================================
// ========================================================================
// MAPPER TYPES
// ========================================================================
// ========================================================================
/**
 *  MAPPING REGISTRY
 *
 * ROLE:
 * Defines the rigid structural lookup shape for your polymorphic router map.
 *
 * WHY:
 * Satisfies Commandment I and V. It explicitly pairs each active API name with
 * its exact function payload contract, eliminating 'any' entirely from the loop.
 */
export type TXalorMinerRouterMap = {
  readonly registerXalor: TExtractRawRegistry<TRegisterRawPayload>;
  readonly generateXalor: TExtractRawRegistry<TGenerateRawPayload>;
  readonly validateXalor: TExtractRawRegistry<TValidateRawPayload>;
  readonly transformXalor: TExtractRawRegistry<TTransformerRawPayload>;
};

export type TResolvedMiningRouterReturn =
  | TRegisterRawPayload
  | TGenerateRawPayload
  | TValidateRawPayload
  | TTransformerRawPayload;
