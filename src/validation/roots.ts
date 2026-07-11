// src/validation/validators.ts
import type {
  TValidationContext,
  TSolidPrimitiveShape,
  TSolidInstanceOfShape,
} from '../../shared';
import {
  isObject,
  isNull,
  isUndefined,
  isString,
  isNumber,
  isBoolean,
  isBigInt,
} from '../../shared';
import { shapeKindUtilsService } from '../../shared/service';
import { XalethorVaultCompliance } from '../xalor-service/vault-compliance';
import { errorService } from '../error';

export function validatePrimitive(
  data: unknown,
  shape: TSolidPrimitiveShape,
  ctx: TValidationContext,
): boolean {
  const { type } = shape;
  const reportError = XalethorVaultCompliance.reportError;
  const {
    PRIMITIVE_VALIDATION_NULL_EXPECTED,
    PRIMITIVE_VALIDATION_UNDEFINED_EXPECTED,
    PRIMITIVE_VALIDATION_STRING_EXPECTED,
    PRIMITIVE_VALIDATION_NUMBER_EXPECTED,
    PRIMITIVE_VALIDATION_BOOLEAN_EXPECTED,
    PRIMITIVE_VALIDATION_BIGINT_EXPECTED,
    PRIMITIVE_VALIDATION_UNKNOWN_TYPE,
  } = errorService.shapeValErrs;

  // 1. Pass-through Core Types
  if (type === 'any' || type === 'unknown') {
    return true;
  }

  if (type === 'never') {
    /* prettier-ignore */
    return reportError(ctx, 'never', data, 'Type evaluated as unreachable never.');
  }

  if (type === 'null') {
    if (isNull(data)) return true;
    /* prettier-ignore */
    return reportError(ctx, 'null', data, PRIMITIVE_VALIDATION_NULL_EXPECTED.message);
  }

  if (type === 'undefined' || type === 'void') {
    if (isUndefined(data)) return true;
    /* prettier-ignore */
    return reportError(ctx, type, data, PRIMITIVE_VALIDATION_UNDEFINED_EXPECTED.message);
  }

  if (type === 'string') {
    if (isString(data)) return true;
    /* prettier-ignore */
    return reportError(ctx, 'string', data, PRIMITIVE_VALIDATION_STRING_EXPECTED.message);
  }

  if (type === 'number') {
    if (isNumber(data)) return true;
    /* prettier-ignore */
    return reportError(ctx, 'number', data, PRIMITIVE_VALIDATION_NUMBER_EXPECTED.message);
  }

  if (type === 'boolean') {
    if (isBoolean(data)) return true;
    /* prettier-ignore */
    return reportError(ctx, 'boolean', data, PRIMITIVE_VALIDATION_BOOLEAN_EXPECTED.message);
  }

  if (type === 'bigint') {
    if (isBigInt(data)) return true;
    /* prettier-ignore */
    return reportError(ctx, 'bigint', data, PRIMITIVE_VALIDATION_BIGINT_EXPECTED.message);
  }

  if (type === 'symbol') {
    if (typeof data === 'symbol') return true;
    /* prettier-ignore */
    return reportError(ctx, 'symbol', data, 'Target type is symbol but data is not a symbol.');
  }

  // 4. Catch-all fallback for unrecognized primitive schema tokens
  /* prettier-ignore */
  return reportError(ctx, type, data, PRIMITIVE_VALIDATION_UNKNOWN_TYPE.message);
}

export function validateInstanceOf(
  data: unknown,
  shape: TSolidInstanceOfShape,
  ctx: TValidationContext,
): boolean {
  const {
    INSTANCEOF_VALIDATION_NIL_VALUE,
    INSTANCEOF_VALIDATION_PROTOTYPE_MISMATCH,
  } = errorService.shapeValErrs;
  const reportError = XalethorVaultCompliance.reportError;
  /* prettier-ignore */
  if (data == null) return reportError(ctx, shape, data, INSTANCEOF_VALIDATION_NIL_VALUE.message);

  const ctor = shapeKindUtilsService.resolveInstanceCtor(shape.name);
  const isMatch = data instanceof ctor;

  if (!isMatch) {
    const receivedPrototype = isObject(data)
      ? data.constructor.name
      : typeof data;
    /* prettier-ignore */
    return reportError(ctx, `instanceof_${shape.name}`, receivedPrototype, INSTANCEOF_VALIDATION_PROTOTYPE_MISMATCH.message);
  }

  return true;
}
