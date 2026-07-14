// src/validation/validators.ts
import type {
  TValidationContext,
  TSolidShape,
  TSolidIntersectionShape,
  TSolidLiteralShape,
  TSolidReferenceShape,
  TSolidFunctionShape,
} from '../../shared';
import {
  isFunction,
  isObject,
  isKeyInObject,
  yieldFiltered,
} from '../../shared';
import { xalethorVaultValidation } from '../xalor-service/vault-validation';
import { XalethorService } from '../xalor-service';

/**
 * Validates Intersection types.
 * COMPLIANCE: Validates parts linearly with zero dynamic string generations.
 * SYNCHRONIZED: Consumes the new object-based TReportErrorParams payload interface.
 */
export function validateIntersection(
  data: unknown,
  shape: TSolidIntersectionShape,
  ctx: TValidationContext,
): boolean {
  const parts = yieldFiltered(
    shape.values,
    (_part): _part is TSolidShape => true,
  );

  for (const part of parts) {
    if (!xalethorVaultValidation.validateShape(data, part, ctx)) {
      return xalethorVaultValidation.reportError({
        ctx,
        errorKey: 'INTERSECTION_VALIDATION_PART_FAILED',
        received: data,
        shapeContext: shape,
      });
    }
  }
  return true;
}

/**
 * Validates Literal value equations.
 * COMPLIANCE: Ultra-fast strict equality evaluation with flat metadata handoff.
 * SYNCHRONIZED: Consumes the new object-based TReportErrorParams payload interface.
 */
export function validateLiteral(
  data: unknown,
  shape: TSolidLiteralShape,
  ctx: TValidationContext,
): boolean {
  if (data === shape.value) return true;

  return xalethorVaultValidation.reportError({
    ctx,
    errorKey: 'LITERAL_VALIDATION_VALUE_MISMATCH',
    received: data,
    shapeContext: shape,
  });
}

/**
 * Validates Union member branches.
 * COMPLIANCE: Zero allocations. Splices transient context errors point-free on branch failure.
 * SYNCHRONIZED: Consumes the new object-based TReportErrorParams payload interface.
 */
export function validateUnion(
  data: unknown,
  shape: Extract<TSolidShape, { kind: 'union' }>,
  ctx: TValidationContext,
): boolean {
  const snapshotCount = ctx.errors.length;
  const len = shape.values.length;

  for (let i = 0; i < len; i++) {
    if (xalethorVaultValidation.validateShape(data, shape.values[i], ctx)) {
      if (ctx.errors.length > snapshotCount) {
        ctx.errors.length = snapshotCount;
      }
      return true;
    }
  }

  return xalethorVaultValidation.reportError({
    ctx,
    errorKey: 'UNION_VALIDATION_NO_MATCH',
    received: data,
    shapeContext: shape,
  });
}

/**
 * Validates Virtual Schema Reference Pointers.
 * COMPLIANCE: Traverses pre-registered blueprints via pure side-effect-free loops.
 * SYNCHRONIZED: Consumes the new object-based TReportErrorParams payload interface.
 */
export function validateReference(
  data: unknown,
  shape: TSolidReferenceShape,
  ctx: TValidationContext,
): boolean {
  const metadata = XalethorService.inspectMetaData(shape.name);
  if (!metadata) {
    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'REF_VALIDATION_MISSING_VAULT_ENTRY',
      received: 'Missing from Vault',
      shapeContext: shape.name,
    });
  }
  return xalethorVaultValidation.validateShape(data, metadata.shape, ctx);
}

/**
 * Validates Executable Function footprints.
 * COMPLIANCE: Eliminates argument string variations on failure. Pass length as number token.
 * SYNCHRONIZED: Consumes the new object-based TReportErrorParams payload interface.
 */
export function validateFunction(
  data: unknown,
  shape: TSolidFunctionShape,
  ctx: TValidationContext,
): boolean {
  if (!isFunction(data)) {
    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'FUNCTION_VALIDATION_TYPE_MISMATCH',
      received: data,
      shapeContext: shape,
    });
  }

  let mandatoryParamsCount = 0;
  const totalBlueprintParams = shape.parameters.length;

  for (let i = 0; i < totalBlueprintParams; i++) {
    const paramNode = shape.parameters[i];
    if (
      paramNode &&
      isObject(paramNode) &&
      isKeyInObject('optional')(paramNode) &&
      !paramNode.optional
    ) {
      mandatoryParamsCount++;
    }
  }

  if (data.length < mandatoryParamsCount) {
    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'FUNCTION_VALIDATION_PARAMETER_MISMATCH',
      received: data.length,
      shapeContext: shape,
    });
  }

  return true;
}
