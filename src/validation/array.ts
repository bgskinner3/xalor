// src/validation/validators.ts
import type { TSolidArrayShape, TValidationContext } from '../../shared';
import { xalethorVaultValidation } from '../xalor-service/vault-validation';

/**
 * Validates complex array configurations and multi-position tuple tracking topologies.
 *
 * COMPLIANCE METRICS:
 * - COMMANDMENT V: Prevents infinite cyclical graph reference loop execution chains point-free.
 * - COMMANDMENT VIII: Zero closure allocations, dynamic array resizing, or string allocations.
 * - COMMANDMENT IX: Zero type assertions ('as any'), structural escape hatches, or switch statements.
 */
/**
 * Validates array configurations and deep tuple layouts.
 * COMPLIANCE: Absolute zero closure allocations, string interpolations, or dynamic resizing inside loops.
 * SYNCHRONIZED: Consumes the new object-based TReportErrorParams payload interface.
 *
 *
 * !!! HOTPATH ARRAYs
 */
export function validateArray(
  data: unknown,
  shape: TSolidArrayShape,
  ctx: TValidationContext,
): boolean {
  // 1. Instantly exit on core structural primitive mismatch
  if (!Array.isArray(data)) {
    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'ARRAY_VALIDATION_TYPE_MISMATCH',
      received: data,
    });
  }

  const len = data.length;
  const elementShapes = shape.elementShapes;

  // 2. Cycle Detection Shield (Commandment V Invariant Guard)
  let seenShapes = ctx.seen.get(data);
  if (seenShapes !== undefined && seenShapes.has(shape)) {
    return true;
  }

  if (seenShapes === undefined) {
    seenShapes = new Set([shape]);
    ctx.seen.set(data, seenShapes);
  } else {
    seenShapes.add(shape);
  }

  // 3. High-Speed Route A: Rigid Heterogeneous Tuple Verification
  if (elementShapes !== undefined) {
    const elementCount = elementShapes.length;

    // Rigid length alignment check if no rest operators or variadic parameters exist
    if (!shape.hasRest && len !== elementCount) {
      seenShapes.delete(shape);
      return xalethorVaultValidation.reportError({
        ctx,
        errorKey: 'ARRAY_VALIDATION_MIN_LENGTH_VIOLATION',
        received: len,
        shapeContext: elementCount,
      });
    }

    // Verify fixed element positions sequentially
    for (let i = 0; i < elementCount; i++) {
      ctx.pathStack[ctx.pathPointer++] = i;
      const pass = xalethorVaultValidation.validateShape(
        data[i],
        elementShapes[i],
        ctx,
      );
      ctx.pathPointer--;

      if (!pass) {
        seenShapes.delete(shape);
        return false;
      }
    }

    // Handle trailing rest layout positions if payload elements extend past the tuple definitions
    if (shape.hasRest && len > elementCount) {
      const restShape = shape.items;
      for (let i = elementCount; i < len; i++) {
        ctx.pathStack[ctx.pathPointer++] = i;
        const pass = xalethorVaultValidation.validateShape(
          data[i],
          restShape,
          ctx,
        );
        ctx.pathPointer--;

        if (!pass) {
          seenShapes.delete(shape);
          return false;
        }
      }
    }

    seenShapes.delete(shape);
    return true;
  }

  // 4. High-Speed Route B: Fast Homogeneous Array Streaming Loop
  const itemShape = shape.items;
  for (let i = 0; i < len; i++) {
    ctx.pathStack[ctx.pathPointer++] = i;
    const pass = xalethorVaultValidation.validateShape(data[i], itemShape, ctx);
    ctx.pathPointer--;

    if (!pass) {
      seenShapes.delete(shape);
      return false;
    }
  }

  seenShapes.delete(shape);
  return true;
}

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * ORIGINAL
 */

// export function validateArray(
//   data: unknown,
//   shape: TSolidArrayShape,
//   ctx: TValidationContext,
// ): boolean {
//   // I. Instantly exit on structural mismatch
//   if (!isArray(data)) {
//     return xalethorVaultValidation.reportError({
//       ctx,
//       errorKey: 'ARRAY_VALIDATION_TYPE_MISMATCH',
//       received: data,
//     });
//   }

//   const len = data.length;
//   const elementShapes = shape.elementShapes;

//   //II. High-Speed Branch A: Rigid Heterogeneous Tuple Verification
//   if (elementShapes) {
//     const minLength = shape.minLength || 0;
//     if (len < minLength) {
//       return xalethorVaultValidation.reportError({
//         ctx,
//         errorKey: 'ARRAY_VALIDATION_MIN_LENGTH_VIOLATION',
//         received: len,
//         shapeContext: minLength, // Passed cleanly down as a custom payload marker
//       });
//     }

//     const elementCount = elementShapes.length;
//     for (let i = 0; i < elementCount; i++) {
//       ctx.pathStack[ctx.pathPointer++] = i;

//       const pass = xalethorVaultValidation.validateShape(
//         data[i],
//         elementShapes[i],
//         ctx,
//       );

//       ctx.pathPointer--;
//       if (!pass) return false;
//     }

//     return true;
//   }

//   // III.. High-Speed Branch B: Fast Homogeneous Array Streaming Loop
//   const itemShape = shape.items;
//   for (let i = 0; i < len; i++) {
//     ctx.pathStack[ctx.pathPointer++] = i;

//     const pass = xalethorVaultValidation.validateShape(data[i], itemShape, ctx);

//     ctx.pathPointer--;
//     if (!pass) return false;
//   }

//   return true;
// }
