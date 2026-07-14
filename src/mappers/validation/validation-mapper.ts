import {
  validateArray,
  validateReference,
  validateUnion,
  validateObject,
  validatePrimitive,
  validateLiteral,
  validateFunction,
  validateIntersection,
  validateInstanceOf,
} from '../../validation';
import type { TValidatorMapper } from '../../models/types';
import {
  isPrimitiveShape,
  isLiteralShape,
  isObjectShape,
  isArrayShape,
  isBrandedShape,
  isUnionShape,
  isReferenceShape,
  isFunctionShape,
  isIntersectionShape,
  isInstanceOfShape,
} from '../../../shared';
import { XalethorService } from '../../xalor-service';
import { validateNativeMapCollection } from './helpers';
/**
 * 💎 SHAPE_VALIDATION_MAPPER MAPPING TABLE
 *
 * A specialized lookup table that maps Shape Kinds to their execution logic.
 *
 * INVARIANTS:
 * - Governed by COMMANDMENT IV: Operation Isolation (Routes only, no logic).
 * - Governed by COMMANDMENT VIII: Internal Efficiency (Static lookup).
 * - ZERO 'as' casts. ZERO 'any' usage.
 */
export const SHAPE_VALIDATION_MAPPER: TValidatorMapper = {
  primitive: (data, shape, ctx, _blueprintId) => {
    if (!isPrimitiveShape(shape)) return false;
    return validatePrimitive(data, shape, ctx);
  },
  literal: (data, shape, ctx, _blueprintId) =>
    isLiteralShape(shape) && validateLiteral(data, shape, ctx),
  union: (data, shape, ctx, _blueprintId) => {
    if (!isUnionShape(shape)) return false;
    return validateUnion(data, shape, ctx);
  },

  object: (data, shape, ctx, blueprintId) => {
    if (!isObjectShape(shape)) return false;

    if (data instanceof Map) {
      return validateNativeMapCollection(data, shape, ctx);
    }
    return validateObject(data, shape, ctx, blueprintId);
  },
  branded: (data, shape, ctx, _blueprintId) => {
    if (!isBrandedShape(shape)) return false;

    return XalethorService.validateShape(data, shape.base, ctx);
  },
  array: (data, shape, ctx, _blueprintId) => {
    if (!isArrayShape(shape)) return false;
    return validateArray(data, shape, ctx);
  },
  reference: (data, shape, ctx, _blueprintId) => {
    if (!isReferenceShape(shape)) return false;
    return validateReference(data, shape, ctx);
  },
  function: (data, shape, ctx, _blueprintId) => {
    if (!isFunctionShape(shape)) return false;
    return validateFunction(data, shape, ctx);
  },
  intersection: (data, shape, ctx, _blueprintId) => {
    if (!isIntersectionShape(shape)) return false;
    return validateIntersection(data, shape, ctx);
  },
  instanceof: (data, shape, ctx, _blueprintId) => {
    if (!isInstanceOfShape(shape)) return false;
    return validateInstanceOf(data, shape, ctx);
  },
} satisfies TValidatorMapper;
