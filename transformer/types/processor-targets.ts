import ts from 'typescript';
import type {
  TRegisterRawPayload,
  TGenerateRawPayload,
  TValidateRawPayload,
  TTransformerRawPayload,
  TMatchRawPayload,
} from './guards';
import type { TSolidShape } from '../../shared';
import type {
  TRegisterTriggers,
  TGeneratorTriggers,
  TValidationTriggers,
  TTransformTriggers,
  TMatchTriggers,
  TMatchXalorModes,
} from '../../shared/auto';
export type TRewriterFunction<TPayload, TShape = TSolidShape> = (
  raw: TPayload,
  node: ts.CallExpression,
  factory: ts.NodeFactory,
  areaString?: string,
  shape?: TShape,
) => ts.Expression[];

export type TProcessorRewriteMap = {
  readonly [K in TRegisterTriggers]: TRewriterFunction<TRegisterRawPayload>;
} & {
  readonly [K in TGeneratorTriggers]: TRewriterFunction<TGenerateRawPayload>;
} & {
  readonly [K in TValidationTriggers]: TRewriterFunction<TValidateRawPayload>;
} & {
  readonly [K in TTransformTriggers]: TRewriterFunction<TTransformerRawPayload>;
} & {
  readonly [K in TMatchTriggers]: TRewriterFunction<TMatchRawPayload>;
};

// ========================================================================
// DISCRIMINATED REWRITER CONTEXTS
// ========================================================================

/** 🎛️ SHARED BASE PARAMETERS HOOK */
type TBaseProcessorTargetParams = {
  readonly node: ts.CallExpression;
  readonly sourceFile: ts.SourceFile;
  readonly factory: ts.NodeFactory;
};

/** 📥 REGISTER PASS CONFIGURATION (The Producer Lane) */
type TRegisterProcessorTarget = TBaseProcessorTargetParams & {
  readonly target: NonNullable<TRegisterRawPayload>;
  /** 🎯 INDUSTRIAL CONTROLLERS REQ LOGIC: shape is explicitly required */
  readonly shape: TSolidShape;
};

/** 🚀 GENERATE PASS CONFIGURATION (The Consumer Lane) */
type TGenerateProcessorTarget = TBaseProcessorTargetParams & {
  readonly target: TGenerateRawPayload;
  /** 🎯 INDUSTRIAL CONTROLLERS REQ LOGIC: shape is strictly prohibited here */
  readonly shape?: undefined;
};
/** 🛡️ VALIDATE PASS CONFIGURATION (The Consumer Validation Lane - 🚀 Newly Incorporated!) */
type TValidateProcessorTarget = TBaseProcessorTargetParams & {
  readonly target: TValidateRawPayload;
  /** 🎯 INDUSTRIAL CONTROLLERS REQ LOGIC: shape is strictly prohibited here */
  readonly shape?: undefined;
};
/** 🛡️ VALIDATE PASS CONFIGURATION (The Consumer Validation Lane - 🚀 Newly Incorporated!) */
type TTransformerProcessorTarget = TBaseProcessorTargetParams & {
  readonly target: TTransformerRawPayload;
  /** 🎯 INDUSTRIAL CONTROLLERS REQ LOGIC: shape is strictly prohibited here */
  readonly shape?: undefined;
};

/** 🛡️ VALIDATE PASS CONFIGURATION (The Consumer Validation Lane - 🚀 Newly Incorporated!) */
type TMatchProcessorTarget = TBaseProcessorTargetParams & {
  readonly target: TMatchRawPayload;
  /** 🎯 INDUSTRIAL CONTROLLERS REQ LOGIC: shape is strictly prohibited here */
  readonly shape?: undefined;
};

/**
 * 🎛️ AUTHORITATIVE DISCRIMINATED PROCESSOR PARAMETERS UNION
 *
 * ROLE:
 * The single source of truth defining parameter configurations for solidVisitorProcessor.
 *
 * WHY:
 * Satisfies Commandment V (Graph Integrity). It locks properties securely across
 * compiling branches with absolute zero un-typed any-bypasses or manual assertions.
 */
export type TProcessorTarget =
  | TRegisterProcessorTarget
  | TGenerateProcessorTarget
  | TValidateProcessorTarget
  | TTransformerProcessorTarget
  | TMatchProcessorTarget;

// ====================================================================================
// ====================================================================================
// DRIFT PROCESSOR MAPPER TYPES
// ====================================================================================
// ====================================================================================
export type TMatchProcessorHandler = (
  raw: { readonly keyName: string },
  node: ts.CallExpression,
  factory: ts.NodeFactory,
) => ts.Expression[];

export type TMatchProcessorMapper = Record<
  TMatchXalorModes,
  TMatchProcessorHandler
>;
