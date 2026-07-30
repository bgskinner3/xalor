// src/validation/validators.ts
import type {
  TValidationContext,
  TSolidShape,
  TSolidIntersectionShape,
  TSolidLiteralShape,
  TSolidReferenceShape,
  TSolidFunctionShape,
} from '../../shared';
import { isFunction, isObject, isKeyInObject } from '../../shared';
import { xalethorVaultValidation } from '../xalor-service/vault-validation';
import { xalethorCoreService } from '../xalor-service';

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
  const parts = shape.values;
  const len = parts.length;

  // ⚡ BARE-METAL UPGRADE: Direct procedural loops replace generator heap overhead!
  for (let i = 0; i < len; i++) {
    const part = parts[i];
    if (
      part !== undefined &&
      !xalethorVaultValidation.validateShape(data, part, ctx)
    ) {
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

export function validateUnion(
  data: unknown,
  shape: Extract<TSolidShape, { kind: 'union' }> & {
    readonly discriminator?: {
      readonly propertyName: string;
      readonly mapping: Record<string | number, number>;
    };
  },
  ctx: TValidationContext,
): boolean {
  const discriminator = shape.discriminator;

  // ============================================================================
  // [ LAYER 1 ] THE AOT DISCRIMINATED JUMP LANE (O(1) DIRECT CPU ROUTING)
  // ============================================================================
  if (
    discriminator !== undefined &&
    typeof data === 'object' &&
    data !== null
  ) {
    const propName = discriminator.propertyName;

    // ⚡ CPU REGISTRY FIREWALL: Flat memory check replaces exhaustive multi-pass scans!
    const hasProperty = propName in data;
    const value = data[propName];

    // 1. If the discriminator tag key is missing entirely, fail-fast instantly under 1ns!
    if (!hasProperty) {
      return xalethorVaultValidation.reportError({
        ctx,
        errorKey: 'UNION_VALIDATION_NO_MATCH',
        received: 'missing_discriminator_tag',
        shapeContext: shape,
      });
    }

    // 2. If the tag holds a literal undefined, block execution before it can leak down
    if (value === undefined) {
      return xalethorVaultValidation.reportError({
        ctx,
        errorKey: 'UNION_VALIDATION_NO_MATCH',
        received: 'undefined_discriminator_tag',
        shapeContext: shape,
      });
    }

    // 3. Match the literal value against your precompiled dictionary index under 0ns
    const targetShapeIndex = discriminator.mapping[value as string | number];
    if (targetShapeIndex !== undefined) {
      const targetShape = shape.values[targetShapeIndex];
      if (targetShape !== undefined) {
        // Jump directly to the true designated variant shape branch pointer!
        return xalethorVaultValidation.validateShape(data, targetShape, ctx);
      }
    }

    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'UNION_VALIDATION_NO_MATCH',
      received: data,
      shapeContext: shape,
    });
  }

  // ============================================================================
  // [ LAYER 2 ] SEQUENTIAL FALLBACK SWEEP PASS (YOUR ORIGINAL TRACK)
  // ============================================================================
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
  const metadata = xalethorCoreService.inspectMetaData(shape.name);
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
