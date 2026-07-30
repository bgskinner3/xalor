// src/validation/validators.ts
import type { TSolidArrayShape, TValidationContext } from '../../shared';
import { xalethorVaultValidation } from '../xalor-service/vault-validation';
import { PRIMITIVE_VALIDATION_CHECKERS } from '../mappers';

/**
 * Validates complex array configurations and multi-position tuple tracking topologies.
 *
 * COMPLIANCE METRICS:
 * - COMMANDMENT V: Prevents infinite cyclical graph reference loop execution chains point-free.
 * - COMMANDMENT VIII: Zero closure allocations, dynamic array resizing, or string allocations.
 * - COMMANDMENT IX: Zero type assertions ('as any'), structural escape hatches, or switch statements.
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

  // ============================================================================
  // [ LAYER 0 ] MEMORY ADDRESS CEILING REFERENCE CACHE HIT
  // ============================================================================
  const INSTANCE_VALIDATION_REGISTRY =
    xalethorVaultValidation.INSTANCE_VALIDATION_REGISTRY;
  if (INSTANCE_VALIDATION_REGISTRY.has(data)) {
    return true;
  }

  const len = data.length;
  const itemShape = shape.items;

  // ============================================================================
  // ⚡ THE DIRECT INLINED PRIMITIVE STREAMING GATEWAY (MAX THROUGHPUT WIN)
  // ============================================================================
  // If the schema indicates a flat homogeneous primitive layer (e.g. string[], number[]),
  // stream the validation inline using raw CPU registers. This completely bypasses
  // cache registry maps, validateShape call frames, and mapper dictionary lookups!
  if (
    shape.elementShapes === undefined &&
    itemShape !== undefined &&
    itemShape.kind === 'primitive'
  ) {
    const type = itemShape.type;
    const primitiveChecker = PRIMITIVE_VALIDATION_CHECKERS[type];

    if (primitiveChecker !== undefined) {
      for (let i = 0; i < len; i++) {
        if (!primitiveChecker(data[i])) {
          ctx.pathStack[ctx.pathPointer++] = i;
          xalethorVaultValidation.reportError({
            ctx,
            errorKey: 'PRIMITIVE_VALIDATION_UNKNOWN_TYPE',
            received: data[i],
          });
          ctx.pathPointer--;
          return false;
        }
      }

      // Stamp the reference pointer right upon a clean, zero-allocation success pass
      INSTANCE_VALIDATION_REGISTRY.set(data, true);
      return true;
    }
  }

  // ============================================================================
  // PATH B: Complex Structural Elements / Rigid Heterogeneous Tuples (Cold Path)
  // ============================================================================
  const elementShapes = shape.elementShapes;

  // Cycle Detection Shield — Only paid when processing non-primitive complex arrays!
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
    if (!shape.hasRest && len !== elementCount) {
      seenShapes.delete(shape);
      return xalethorVaultValidation.reportError({
        ctx,
        errorKey: 'ARRAY_VALIDATION_MIN_LENGTH_VIOLATION',
        received: len,
      });
    }

    for (let i = 0; i < elementCount; i++) {
      ctx.pathStack[ctx.pathPointer++] = i;
      const targetElementShape = elementShapes[i];

      if (targetElementShape !== undefined) {
        const pass = xalethorVaultValidation.validateShape(
          data[i],
          targetElementShape,
          ctx,
        );
        ctx.pathPointer--;
        if (!pass) {
          seenShapes.delete(shape);
          return false;
        }
      } else {
        ctx.pathPointer--;
      }
    }

    if (shape.hasRest && len > elementCount) {
      const restShape = shape.items;
      if (restShape !== undefined) {
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
    }

    seenShapes.delete(shape);
    INSTANCE_VALIDATION_REGISTRY.set(data, true);
    return true;
  }

  // 4. High-Speed Route B: Fast Homogeneous Array Streaming Fallback Loop
  if (itemShape !== undefined) {
    for (let i = 0; i < len; i++) {
      ctx.pathStack[ctx.pathPointer++] = i;
      const pass = xalethorVaultValidation.validateShape(
        data[i],
        itemShape,
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
  INSTANCE_VALIDATION_REGISTRY.set(data, true);
  return true;
}
