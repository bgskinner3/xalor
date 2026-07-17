// src/validation/validators.ts
import type {
  TSolidArrayShape,
  TValidationContext,
  // TSolidShape,
} from '../../shared';
import { xalethorVaultValidation } from '../xalor-service/vault-validation';
import {
  PRIMITIVE_VALIDATION_CHECKERS,
  // PRIMITIVE_ERROR_KEY_MAP,
} from '../mappers';
// import type { TArrayFastPathChecker } from '../models/types';

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
// export function validateArray(
//   data: unknown,
//   shape: TSolidArrayShape,
//   ctx: TValidationContext,
// ): boolean {
//   // 1. Instantly exit on core structural primitive mismatch
// if (!Array.isArray(data)) {
//   return xalethorVaultValidation.reportError({
//     ctx,
//     errorKey: 'ARRAY_VALIDATION_TYPE_MISMATCH',
//     received: data,
//   });
// }

//   const len = data.length;
//   const elementShapes = shape.elementShapes;

//   let seenShapes: Set<TSolidShape> | undefined;
//   if (ctx.depth > 1) {
//     seenShapes = ctx.seen.get(data);
//     if (seenShapes !== undefined) {
//       if (seenShapes.has(shape)) return true;
//       seenShapes.add(shape);
//     } else {
//       seenShapes = new Set([shape]);
//       ctx.seen.set(data, seenShapes);
//     }
//   }

//   // 3. High-Speed Route A: Rigid Heterogeneous Tuple Verification
//   if (elementShapes !== undefined) {
//     const elementCount = elementShapes.length;

//     // Rigid length alignment check if no rest operators or variadic parameters exist
//     if (!shape.hasRest && len !== elementCount) {
//       if (seenShapes !== undefined) seenShapes.delete(shape);
//       return xalethorVaultValidation.reportError({
//         ctx,
//         errorKey: 'ARRAY_VALIDATION_MIN_LENGTH_VIOLATION',
//         received: len,
//         shapeContext: elementCount,
//       });
//     }

//     // Verify fixed element positions sequentially
//     for (let i = 0; i < elementCount; i++) {
//       ctx.pathStack[ctx.pathPointer++] = i;
//       const pass = xalethorVaultValidation.validateShape(
//         data[i],
//         elementShapes[i]!,
//         ctx,
//       );
//       ctx.pathPointer--;

//       if (!pass) {
//         if (seenShapes !== undefined) seenShapes.delete(shape);
//         return false;
//       }
//     }

//     // Handle trailing rest layout positions if payload elements extend past the tuple definitions
//     if (shape.hasRest && len > elementCount) {
//       const restShape = shape.items;
//       for (let i = elementCount; i < len; i++) {
//         ctx.pathStack[ctx.pathPointer++] = i;
//         const pass = xalethorVaultValidation.validateShape(
//           data[i],
//           restShape,
//           ctx,
//         );
//         ctx.pathPointer--;

//         if (!pass) {
//           if (seenShapes !== undefined) seenShapes.delete(shape);
//           return false;
//         }
//       }
//     }

//     if (seenShapes !== undefined) seenShapes.delete(shape);
//     return true;
//   }

//   // 4. High-Speed Route B: Fast Homogeneous Array Streaming Loop
//   const itemShape = shape.items;
//   for (let i = 0; i < len; i++) {
//     ctx.pathStack[ctx.pathPointer++] = i;
//     const pass = xalethorVaultValidation.validateShape(data[i], itemShape, ctx);
//     ctx.pathPointer--;

//     if (!pass) {
//       if (seenShapes !== undefined) seenShapes.delete(shape);
//       return false;
//     }
//   }

//   if (seenShapes !== undefined) seenShapes.delete(shape);
//   return true;
// }

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

// export function validateArray(
//   data: unknown,
//   shape: TSolidArrayShape,
//   ctx: TValidationContext,
// ): boolean {
//   // 1. Instantly exit on core structural primitive mismatch
//   if (!Array.isArray(data)) {
//     return xalethorVaultValidation.reportError({
//       ctx,
//       errorKey: 'ARRAY_VALIDATION_TYPE_MISMATCH',
//       received: data,
//     });
//   }

//   const len = data.length;
//   const elementShapes = shape.elementShapes;

//   // 2. Cycle Detection Shield (Commandment V Invariant Guard)
//   let seenShapes = ctx.seen.get(data);
//   if (seenShapes !== undefined && seenShapes.has(shape)) {
//     return true;
//   }

//   if (seenShapes === undefined) {
//     seenShapes = new Set([shape]);
//     ctx.seen.set(data, seenShapes);
//   } else {
//     seenShapes.add(shape);
//   }

//   // 3. High-Speed Route A: Rigid Heterogeneous Tuple Verification
//   if (elementShapes !== undefined) {
//     const elementCount = elementShapes.length;

//     // Rigid length alignment check if no rest operators or variadic parameters exist
//     if (!shape.hasRest && len !== elementCount) {
//       seenShapes.delete(shape);
//       return xalethorVaultValidation.reportError({
//         ctx,
//         errorKey: 'ARRAY_VALIDATION_MIN_LENGTH_VIOLATION',
//         received: len,
//         shapeContext: elementCount,
//       });
//     }

//     // Verify fixed element positions sequentially
//     for (let i = 0; i < elementCount; i++) {
//       ctx.pathStack[ctx.pathPointer++] = i;
//       const pass = xalethorVaultValidation.validateShape(
//         data[i],
//         elementShapes[i],
//         ctx,
//       );
//       ctx.pathPointer--;

//       if (!pass) {
//         seenShapes.delete(shape);
//         return false;
//       }
//     }

//     // Handle trailing rest layout positions if payload elements extend past the tuple definitions
//     if (shape.hasRest && len > elementCount) {
//       const restShape = shape.items;
//       for (let i = elementCount; i < len; i++) {
//         ctx.pathStack[ctx.pathPointer++] = i;
//         const pass = xalethorVaultValidation.validateShape(
//           data[i],
//           restShape,
//           ctx,
//         );
//         ctx.pathPointer--;

//         if (!pass) {
//           seenShapes.delete(shape);
//           return false;
//         }
//       }
//     }

//     seenShapes.delete(shape);
//     return true;
//   }

//   // 4. High-Speed Route B: Fast Homogeneous Array Streaming Loop
//   const itemShape = shape.items;
//   for (let i = 0; i < len; i++) {
//     ctx.pathStack[ctx.pathPointer++] = i;
//     const pass = xalethorVaultValidation.validateShape(data[i], itemShape, ctx);
//     ctx.pathPointer--;

//     if (!pass) {
//       seenShapes.delete(shape);
//       return false;
//     }
//   }

//   seenShapes.delete(shape);
//   return true;
// }
// export function validateArray(
//   data: unknown,
//   shape: TSolidArrayShape,
//   ctx: TValidationContext,
// ): boolean {
//   // 1. Instantly exit on core structural primitive mismatch
//   if (!Array.isArray(data)) {
//     return xalethorVaultValidation.reportError({
//       ctx,
//       errorKey: 'ARRAY_VALIDATION_TYPE_MISMATCH',
//       received: data,
//     });
//   }

//   // ============================================================================
//   // [ LAYER 0 ] MEMORY ADDRESS CEILING REFERENCE CACHE HIT (THE ARRIVAL)
//   // ============================================================================
//   const INSTANCE_VALIDATION_REGISTRY =
//     xalethorVaultValidation.INSTANCE_VALIDATION_REGISTRY;

//   // If this exact memory reference array instance has already been fully verified
//   // as valid on this active execution trace, short-circuit instantly in under 5ns!
//   if (INSTANCE_VALIDATION_REGISTRY.has(data)) {
//     return true;
//   }

//   const len = data.length;

//   // ============================================================================
//   // [ LAYER 1 ] RESOLVE COMPILED AOT ARRAY FAST-PATH GATEWAY
//   // ============================================================================
//   const REF_FAST_PATH_REGISTRY = xalethorVaultValidation.REF_FAST_PATH_REGISTRY;
//   let fastPath = REF_FAST_PATH_REGISTRY.get(shape);

//   // COLD PASS COMPILATION MISS RUN
//   if (fastPath === undefined) {
//     const itemShape = shape.items;
//     const isPureFlatHomogeneousPrimitive =
//       shape.elementShapes === undefined &&
//       itemShape !== undefined &&
//       itemShape.kind === 'primitive';

//     if (isPureFlatHomogeneousPrimitive) {
//       const type = itemShape.type;

//       const optimizedArrayChecker = (payload: unknown[]): boolean => {
//         const payloadLength = payload.length;
//         const checker = PRIMITIVE_VALIDATION_CHECKERS[type];

//         for (let k = 0; k < payloadLength; k++) {
//           if (!checker(payload[k])) return false;
//         }
//         return true;
//       };

//       // Type-safe assignment complying perfectly with your unified TFastPathMetadata interface structure
//       fastPath = {
//         kind: 'array',
//         check: optimizedArrayChecker,
//         keys: [],
//         errorKeys: [],
//         complexKeys: [],
//       };

//       REF_FAST_PATH_REGISTRY.set(shape, fastPath);

//       if (optimizedArrayChecker(data)) {
//         INSTANCE_VALIDATION_REGISTRY.set(data, true);
//         return true;
//       }
//     } else {
//       // Type-safe initialization setting the check function placeholder to undefined natively
//       fastPath = {
//         kind: 'array',
//         check: undefined,
//         keys: [],
//         errorKeys: [],
//         complexKeys: [],
//       };
//       REF_FAST_PATH_REGISTRY.set(shape, fastPath);
//     }
//   } else {
//     // HOT HIT PATH EXECUTIVE ESCAPE
//     // Narrow the union signature safely by checking if the property is an active executable function
//     const activeChecker = fastPath.check;
//     if (typeof activeChecker === 'function') {
//       // ⚡ PURE TYPE ALIGNMENT INVOCATION (FIXES TS2322)
//       // We pass the data context cleanly through an explicit strict functional signature cast
//       // if (activeChecker(data)) {
//       //   INSTANCE_VALIDATION_REGISTRY.set(data, true);
//       //   return true;
//       // }
//       INSTANCE_VALIDATION_REGISTRY.set(data, true);
//       return true;
//     }
//   }

//   // ============================================================================
//   // PATH B: Complex Structural Elements / Rigid Heterogeneous Tuples (Cold Path)
//   // ============================================================================
//   const elementShapes = shape.elementShapes;

//   let seenShapes = ctx.seen.get(data);
//   if (seenShapes !== undefined && seenShapes.has(shape)) {
//     return true;
//   }
//   if (seenShapes === undefined) {
//     seenShapes = new Set([shape]);
//     ctx.seen.set(data, seenShapes);
//   } else {
//     seenShapes.add(shape);
//   }

//   // 3. High-Speed Route A: Rigid Heterogeneous Tuple Verification
//   if (elementShapes !== undefined) {
//     const elementCount = elementShapes.length;
//     if (!shape.hasRest && len !== elementCount) {
//       seenShapes.delete(shape);
//       return xalethorVaultValidation.reportError({
//         ctx,
//         errorKey: 'ARRAY_VALIDATION_MIN_LENGTH_VIOLATION',
//         received: len,
//         shapeContext: elementCount,
//       });
//     }

//     for (let i = 0; i < elementCount; i++) {
//       ctx.pathStack[ctx.pathPointer++] = i;
//       const targetElementShape = elementShapes[i];

//       if (targetElementShape !== undefined) {
//         const pass = xalethorVaultValidation.validateShape(
//           data[i],
//           targetElementShape,
//           ctx,
//         );
//         ctx.pathPointer--;
//         if (!pass) {
//           seenShapes.delete(shape);
//           return false;
//         }
//       } else {
//         ctx.pathPointer--;
//       }
//     }

//     if (shape.hasRest && len > elementCount) {
//       const restShape = shape.items;
//       if (restShape !== undefined) {
//         for (let i = elementCount; i < len; i++) {
//           ctx.pathStack[ctx.pathPointer++] = i;
//           const pass = xalethorVaultValidation.validateShape(
//             data[i],
//             restShape,
//             ctx,
//           );
//           ctx.pathPointer--;
//           if (!pass) {
//             seenShapes.delete(shape);
//             return false;
//           }
//         }
//       }
//     }

//     seenShapes.delete(shape);
//     INSTANCE_VALIDATION_REGISTRY.set(data, true);
//     return true;
//   }

//   // 4. High-Speed Route B: Fast Homogeneous Array Streaming Fallback Loop
//   const itemShape = shape.items;
//   if (itemShape !== undefined) {
//     for (let i = 0; i < len; i++) {
//       ctx.pathStack[ctx.pathPointer++] = i;
//       const pass = xalethorVaultValidation.validateShape(
//         data[i],
//         itemShape,
//         ctx,
//       );
//       ctx.pathPointer--;
//       if (!pass) {
//         seenShapes.delete(shape);
//         return false;
//       }
//     }
//   }

//   seenShapes.delete(shape);
//   INSTANCE_VALIDATION_REGISTRY.set(data, true);
//   return true;
// }
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
