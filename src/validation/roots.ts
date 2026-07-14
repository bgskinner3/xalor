// src/validation/validators.ts
import type {
  TValidationContext,
  TSolidPrimitiveShape,
  TSolidInstanceOfShape,
} from '../../shared';
import { shapeKindUtilsService } from '../../shared/service';
import {
  PRIMITIVE_VALIDATION_CHECKERS,
  PRIMITIVE_ERROR_KEY_MAP,
} from '../mappers';
import { xalethorVaultValidation } from '../xalor-service/vault-validation';

/**
 * Validates data primitives using fast lookups.
 * COMPLIANCE: Leverages native mappers cleanly without hot-path string building.
 * SYNCHRONIZED: Consumes the new object-based TReportErrorParams payload interface via the vault singleton.
 */
export function validatePrimitive(
  data: unknown,
  shape: TSolidPrimitiveShape,
  ctx: TValidationContext,
): boolean {
  const type = shape.type;

  if (PRIMITIVE_VALIDATION_CHECKERS[type](data)) return true;

  const errorKey =
    PRIMITIVE_ERROR_KEY_MAP[type] ?? 'PRIMITIVE_VALIDATION_UNKNOWN_TYPE';

  return xalethorVaultValidation.reportError({
    ctx,
    errorKey,
    received: data,
    shapeContext: shape,
  });
}

/**
 * Validates complex platform class instances (e.g., Date, RegExp, Custom Classes).
 * COMPLIANCE: Eliminates dynamic prototype string checks from hot loops.
 * SYNCHRONIZED: Consumes the new object-based TReportErrorParams payload interface via the vault singleton.
 */
export function validateInstanceOf(
  data: unknown,
  shape: TSolidInstanceOfShape,
  ctx: TValidationContext,
): boolean {
  if (data == null) {
    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'INSTANCEOF_VALIDATION_NIL_VALUE',
      received: data,
      shapeContext: shape,
    });
  }

  const ctor = shapeKindUtilsService.resolveInstanceCtor(shape.name);
  const isMatch = data instanceof ctor;

  if (!isMatch) {
    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'INSTANCEOF_VALIDATION_PROTOTYPE_MISMATCH',
      received: data,
      shapeContext: shape,
    });
  }

  return true;
}
