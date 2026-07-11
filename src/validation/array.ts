// src/validation/validators.ts
import type { TSolidArrayShape, TValidationContext } from '../../shared';
import { isArray } from '../../shared';
import { XalethorVaultCompliance } from '../xalor-service/vault-compliance';
import { errorService } from '../error';
import { withPathRestore } from '../utils';

export function validateArray(
  data: unknown,
  shape: TSolidArrayShape,
  ctx: TValidationContext,
): boolean {
  /* prettier-ignore */
  const { ARRAY_VALIDATION_TYPE_MISMATCH, ARRAY_VALIDATION_MIN_LENGTH_VIOLATION } = errorService.shapeValErrs;
  const reportError = XalethorVaultCompliance.reportError;

  if (!isArray(data))
    return reportError(
      ctx,
      ARRAY_VALIDATION_TYPE_MISMATCH.expected(),
      data,
      ARRAY_VALIDATION_TYPE_MISMATCH.message,
    );

  const len = data.length;
  if (shape.elementShapes) {
    if (len < (shape.minLength || 0)) {
      return reportError(
        ctx,
        ARRAY_VALIDATION_MIN_LENGTH_VIOLATION.expected(String(shape.minLength)),
        `length: ${len}`,
        ARRAY_VALIDATION_MIN_LENGTH_VIOLATION.message,
      );
    }

    const elementCount = shape.elementShapes.length;
    for (let i = 0; i < elementCount; i++) {
      const targetPath = ctx.path === '$' ? `[${i}]` : `${ctx.path}[${i}]`;
      /* prettier-ignore */
      const pass = withPathRestore(ctx, targetPath, () => 
        XalethorVaultCompliance.validateShape(data[i], shape.elementShapes![i], ctx)
      );
      if (!pass) return false;
    }
    return true;
  }

  for (let i = 0; i < len; i++) {
    const targetPath = ctx.path === '$' ? `[${i}]` : `${ctx.path}[${i}]`;
    const pass = withPathRestore(ctx, targetPath, () =>
      XalethorVaultCompliance.validateShape(data[i], shape.items, ctx),
    );
    if (!pass) return false;
  }
  return true;
}
