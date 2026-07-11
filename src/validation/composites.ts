// src/validation/validators.ts
import type {
  TValidationContext,
  TSolidShape,
  TSolidReferenceShape,
  TSolidLiteralShape,
  TSolidIntersectionShape,
  TSolidFunctionShape,
} from '../../shared';
import {
  yieldFiltered,
  isFunction,
  isKeyInObject,
  isObject,
} from '../../shared';
import { XalethorService } from '../xalor-service';
import { XalethorVaultCompliance } from '../xalor-service/vault-compliance';
import { errorService } from '../error';

export function validateIntersection(
  data: unknown,
  shape: TSolidIntersectionShape,
  ctx: TValidationContext,
): boolean {
  const { INTERSECTION_VALIDATION_PART_FAILED } = errorService.shapeValErrs;
  const reportError = XalethorVaultCompliance.reportError;

  const parts = yieldFiltered(
    shape.values,
    (_part): _part is TSolidShape => true,
  );
  for (const part of parts) {
    if (!XalethorVaultCompliance.validateShape(data, part, ctx)) {
      /* prettier-ignore */
      return reportError(ctx, 'intersection', data, INTERSECTION_VALIDATION_PART_FAILED.message);
    }
  }
  return true;
}

export function validateLiteral(
  data: unknown,
  shape: TSolidLiteralShape,
  ctx: TValidationContext,
): boolean {
  const { LITERAL_VALIDATION_VALUE_MISMATCH } = errorService.shapeValErrs;
  const reportError = XalethorVaultCompliance.reportError;

  const isMatch = data === shape.value;
  if (isMatch) return true;
  /* prettier-ignore */
  return reportError(ctx, shape, data, LITERAL_VALIDATION_VALUE_MISMATCH.message);
}

export function validateUnion(
  data: unknown,
  shape: Extract<TSolidShape, { kind: 'union' }>,
  ctx: TValidationContext,
): boolean {
  const { UNION_VALIDATION_NO_MATCH } = errorService.shapeValErrs;
  const reportError = XalethorVaultCompliance.reportError;
  const snapshotCount = ctx.errors.length;
  for (let i = 0; i < shape.values.length; i++) {
    if (XalethorVaultCompliance.validateShape(data, shape.values[i], ctx)) {
      if (ctx.errors.length > snapshotCount) {
        ctx.errors.splice(snapshotCount);
      }
      return true;
    }
  }
  return reportError(ctx, 'union', data, UNION_VALIDATION_NO_MATCH.message);
}

export function validateReference(
  data: unknown,
  shape: TSolidReferenceShape,
  ctx: TValidationContext,
): boolean {
  const { REF_VALIDATION_MISSING_VAULT_ENTRY } = errorService.shapeValErrs;
  const reportError = XalethorVaultCompliance.reportError;

  const metadata = XalethorService.inspectMetaData(shape.name);
  if (!metadata) {
    /* prettier-ignore */
    return reportError( ctx, REF_VALIDATION_MISSING_VAULT_ENTRY.expected(shape.name), 'Missing from Vault', REF_VALIDATION_MISSING_VAULT_ENTRY.message);
  }
  return XalethorVaultCompliance.validateShape(data, metadata.shape, ctx);
}

export function validateFunction(
  data: unknown,
  shape: TSolidFunctionShape,
  ctx: TValidationContext,
): boolean {
  const {
    FUNCTION_VALIDATION_PARAMETER_MISMATCH,
    FUNCTION_VALIDATION_TYPE_MISMATCH,
  } = errorService.shapeValErrs;
  const reportError = XalethorVaultCompliance.reportError;
  /* prettier-ignore */
  if (!isFunction(data)) return reportError(ctx, shape, data, FUNCTION_VALIDATION_TYPE_MISMATCH.message);

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
    /* prettier-ignore */
    return reportError( ctx, 'function_signature_parameters_mismatch', `provided: ${data.length}`, FUNCTION_VALIDATION_PARAMETER_MISMATCH.message);
  }
  return true;
}
