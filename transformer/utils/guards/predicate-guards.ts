import type {
  TResolvedMiningRouterReturn,
  TRegisterRawPayload,
  TGenerateRawPayload,
  TValidateRawPayload,
  TTransformerRawPayload,
  TProgramContext,
} from '../../types';
import type {
  TMirrorBrand,
  TTupleGuard,
  TTypeGuard,
} from '../../../shared/types';
import {
  isKeyInObject,
  isFunction,
  isArrayOf,
  isString,
  isArray,
} from '../../../shared';
import type { TransformationContext } from 'typescript';
// ========================================================================
// TYPE PREDICATE GUARDS (Satisfies Main Miner Loop Safety)
// ========================================================================

/**
 * 🛡️ IS REGISTRATION TARGET TYPE GUARD
 * Verifies if an extracted target payload belongs to a type-producing registration node.
 */
export function isRegisterTarget(
  target: TResolvedMiningRouterReturn | null,
): target is TRegisterRawPayload {
  return target !== null && target.apiName === 'registerXalor';
}

/**
 * 🛡️ IS GENERATION TARGET TYPE GUARD
 * Verifies if an extracted target payload belongs to a type-consuming generation node.
 */
export function isGenerateTarget(
  target: TResolvedMiningRouterReturn | null,
): target is TGenerateRawPayload {
  return target !== null && target.apiName === 'generateXalor';
}

/** IS VALIDATION TARGET TYPE GUARD */
export function isValidateTarget(
  target: TResolvedMiningRouterReturn,
): target is TValidateRawPayload {
  return target !== null && target.apiName === 'validateXalor';
}

/** IS Transformer TARGET TYPE GUARD */
export function isTransformerTarget(
  target: TResolvedMiningRouterReturn,
): target is TTransformerRawPayload {
  return target !== null && target.apiName === 'transformXalor';
}
/**
 * isGetProgram
 *
 * ROLE:
 * High-Speed Structural Runtime Predicate Guard.
 *
 * STRATEGY:
 * Uses point-free structural checks to probe the active execution environment context object.
 * If the method is verified, it refines the signature to `TProgramContext` natively.
 * This enables the engine to dynamically pull the program compiler host slice switchlessly
 * without relying on dirty `as any` type assertions.
 */
export const isGetProgram: TTypeGuard<TProgramContext> = (
  context: unknown | TransformationContext,
): context is TProgramContext =>
  isKeyInObject('factory')(context) &&
  isKeyInObject('getCompilerOptions')(context) &&
  isFunction(context.getCompilerOptions) &&
  isKeyInObject('getProgram')(context) &&
  isFunction(context.getProgram);

// /**
//  *  TUPLE PREDICATE GUARD: VALIDATE SHAPE PAIRS
//  *
//  * Narrows a pair of unknown inputs into a type-safe tuple of two validated
//  * `TSolidShape` objects.
//  *
//  * @see {@link TransformerDocs.areTShapeEquivalents}
//  */
// export const isShapeTSolidShape: TNarrowingPairGuard<
//   TSolidShape,
//   TSolidShape,
//   TSolidShape
// > = (vals: [TSolidShape, TSolidShape]): vals is [TSolidShape, TSolidShape] =>
//   isBlueprintShapeString(vals[0]) && isBlueprintShapeString(vals[1]);

/**
 *  areShapesIdenticalStrings
 *
 * Compares two values inside a fixed tuple. It leverages V8 engine string interning
 * for sub-nanosecond pointer comparison before falling back to character matching.
 *
 * @see {@link TransformerDocs.areIdenticalStrings}
 */
export const isStringMirrored: TTupleGuard<TMirrorBrand, TMirrorBrand> = (
  vals: [unknown, unknown],
): vals is [TMirrorBrand, TMirrorBrand] =>
  isArray(vals) &&
  vals.length === 2 &&
  isArrayOf(isString, vals) &&
  isArrayOf((item): item is string => item === vals[0], vals);
