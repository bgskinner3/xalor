import ts from 'typescript';
import type {
  TGenerateRawPayload,
  TRegisterRawPayload,
  TValidateRawPayload,
  TTransformerRawPayload,
} from './miner-targets';
import type { TSolidShape } from '../../shared';

/**
 * 🎛️ REGISTRATION REWRITER SIGNATURE
 * Defines the structural formatting routine for type-producing registration blocks.
 */
export type TRegisterProcessor = (
  raw: TRegisterRawPayload,
  node: ts.CallExpression,
  factory: ts.NodeFactory,
  areaString: string,
  shape?: TSolidShape,
) => ts.Expression[];

/**
 * 🎛️ GENERATION REWRITER SIGNATURE
 * Defines the functional parameter injection routine for type-consuming execution blocks.
 */
export type TGenerateProcessor = (
  raw: TGenerateRawPayload,
  node: ts.CallExpression,
  factory: ts.NodeFactory,
) => ts.Expression[];
/**
 * 🎛️ VALIDATION REWRITER SIGNATURE (🚀 Newly Incorporated!)
 * Defines the functional parameter injection routine for type-consuming validation blocks.
 */
export type TValidateProcessor = (
  raw: TValidateRawPayload,
  node: ts.CallExpression,
  factory: ts.NodeFactory,
) => ts.Expression[];
/**
 * 🎛️ TRansformer REWRITER SIGNATURE (🚀 Newly Incorporated!)
 * Defines the functional parameter injection routine for type-consuming validation blocks.
 */
export type TTransformerProcessor = (
  raw: TTransformerRawPayload,
  node: ts.CallExpression,
  factory: ts.NodeFactory,
) => ts.Expression[];
/**
 * 🗺️ FIXED PROCESSOR REWRITE MAP SCHEMA
 *
 * ROLE:
 * Governs the rigid lookup contract for your AST parameter rewriter table.
 *
 * WHY:
 * Satisfies Commandment IV & V. Pairing each unique API block with an explicit
 * signature registry ensures that no untyped arguments arrays can bleed into the compilation stream.
 */
export type TProcessorRewriteMap = {
  readonly registerXalor: TRegisterProcessor;
  readonly generateXalor: TGenerateProcessor;
  readonly validateXalor: TValidateProcessor;
  readonly transformXalor: TTransformerProcessor;
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
  | TTransformerProcessorTarget;
