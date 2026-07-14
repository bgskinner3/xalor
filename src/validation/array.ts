// src/validation/validators.ts
import type { TSolidArrayShape, TValidationContext } from '../../shared';
import { isArray } from '../../shared';
import { xalethorVaultValidation } from '../xalor-service/vault-validation';
/**
 * Validates array configurations and deep tuple layouts.
 * COMPLIANCE: Absolute zero closure allocations, string interpolations, or dynamic resizing inside loops.
 * SYNCHRONIZED: Consumes the new object-based TReportErrorParams payload interface.
 */
export function validateArray(
  data: unknown,
  shape: TSolidArrayShape,
  ctx: TValidationContext,
): boolean {
  // 1. Instantly exit on structural mismatch
  if (!isArray(data)) {
    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'ARRAY_VALIDATION_TYPE_MISMATCH',
      received: data,
    });
  }

  const len = data.length;
  const elementShapes = shape.elementShapes;

  // 2. High-Speed Branch A: Rigid Heterogeneous Tuple Verification
  if (elementShapes) {
    const minLength = shape.minLength || 0;
    if (len < minLength) {
      return xalethorVaultValidation.reportError({
        ctx,
        errorKey: 'ARRAY_VALIDATION_MIN_LENGTH_VIOLATION',
        received: len,
        shapeContext: minLength, // Passed cleanly down as a custom payload marker
      });
    }

    const elementCount = elementShapes.length;
    for (let i = 0; i < elementCount; i++) {
      // ✨ Pass the raw number index instantly. Absolute zero string creations!
      ctx.pathStack[ctx.pathPointer++] = i;

      const pass = xalethorVaultValidation.validateShape(
        data[i],
        elementShapes[i],
        ctx,
      );

      // ✨ Instant integer decrement reset
      ctx.pathPointer--;
      if (!pass) return false;
    }

    return true;
  }

  // 3. High-Speed Branch B: Fast Homogeneous Array Streaming Loop
  const itemShape = shape.items;
  for (let i = 0; i < len; i++) {
    // ✨ Direct primitive numeric assignment to the pre-allocated memory slot
    ctx.pathStack[ctx.pathPointer++] = i;

    const pass = xalethorVaultValidation.validateShape(data[i], itemShape, ctx);

    // ✨ Instant integer decrement reset
    ctx.pathPointer--;
    if (!pass) return false;
  }

  return true;
}
