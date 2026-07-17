// src/validation/validators.ts
import type {
  TValidationContext,
  TSolidPrimitiveShape,
  TSolidInstanceOfShape,
} from '../../shared';
// import { shapeKindUtilsService } from '../../shared/service';
import { INSTANCE_REGISTRY_MAPPER } from '../../shared';
import {
  PRIMITIVE_VALIDATION_CHECKERS,
  PRIMITIVE_ERROR_KEY_MAP,
} from '../mappers';
import { xalethorVaultValidation } from '../xalor-service/vault-validation';
// function getTrueCodePointLength(val: string): number {
//   const totalCodeUnits = val.length;
//   let visualCharacterCount = 0;

//   for (let i = 0; i < totalCodeUnits; i++) {
//     const codeUnit = val.charCodeAt(i);
//     visualCharacterCount++;
//     // If we encounter a high-surrogate code unit (0xD800 - 0xDBFF),
//     // skip the trailing low-surrogate unit since they form a single character!
//     if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
//       i++;
//     }
//   }

//   return visualCharacterCount;
// }
// /**
//  * Validates data primitives using fast lookups.
//  * COMPLIANCE: Leverages native mappers cleanly without hot-path string building.
//  * SYNCHRONIZED: Consumes the new object-based TReportErrorParams payload interface via the vault singleton.
//  */
// export function validatePrimitive(
//   data: unknown,
//   shape: TSolidPrimitiveShape,
//   ctx: TValidationContext,
// ): boolean {
//   const type = shape.type;

//   // 1. Initial Strict Type Checking Pass
//   if (!PRIMITIVE_VALIDATION_CHECKERS[type](data)) {
//     const errorKey =
//       PRIMITIVE_ERROR_KEY_MAP[type] ?? 'PRIMITIVE_VALIDATION_UNKNOWN_TYPE';
//     return xalethorVaultValidation.reportError({
//       ctx,
//       errorKey,
//       received: data,
//       shapeContext: shape,
//     });
//   }

//   // 2. ⚡ STRUCTURAL BOUNDARY SECURITY VERIFICATION
//   // If the payload matches a string primitive and declares a maxLength boundary limit,
//   // enforce precise multi-byte verification using your zero-allocation character counter.
//   if (type === 'string' && typeof data === 'string') {
//     if (typeof shape.maxLength === 'number') {
//       if (getTrueCodePointLength(data) > shape.maxLength) {
//         return xalethorVaultValidation.reportError({
//           ctx,
//           // ⚡ MATCHED SYSTEM CONSTANT: Re-routed to map directly to your single constraint token
//           errorKey: 'ARRAY_VALIDATION_MIN_LENGTH_VIOLATION',
//           received: data.length, // Report code unit length for telemetry tracing
//           shapeContext: shape,
//         });
//       }
//     }
//   }

//   return true;
// }
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

  // 🏎️ THE AOT RESOLUTION HIGHWAY:
  // Direct object literal offset lookup replaces the external service class method call.
  // This allows V8 to perform full function inlining without changing your underlying shape model!
  const registryEntry =
    INSTANCE_REGISTRY_MAPPER[
      shape.name as keyof typeof INSTANCE_REGISTRY_MAPPER
    ];
  // const ctor = shapeKindUtilsService.resolveInstanceCtor(shape.name);
  const ctor = registryEntry !== undefined ? registryEntry.ctor : undefined;

  if (ctor === undefined) {
    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'ENGINE_FATAL_UNSUPPORTED_SHAPE_KIND',
      received: shape.name,
      shapeContext: shape,
    });
  }

  // Direct prototype chain verification executing via flat CPU hardware instruction tracks
  if (!(data instanceof ctor)) {
    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'INSTANCEOF_VALIDATION_PROTOTYPE_MISMATCH',
      received: data,
      shapeContext: shape,
    });
  }

  return true;
}
// export function validateInstanceOf(
//   data: unknown,
//   shape: TSolidInstanceOfShape,
//   ctx: TValidationContext,
// ): boolean {
//   if (data == null) {
//     return xalethorVaultValidation.reportError({
//       ctx,
//       errorKey: 'INSTANCEOF_VALIDATION_NIL_VALUE',
//       received: data,
//       shapeContext: shape,
//     });
//   }

//   const ctor = shapeKindUtilsService.resolveInstanceCtor(shape.name);
//   const isMatch = data instanceof ctor;

//   if (!isMatch) {
//     return xalethorVaultValidation.reportError({
//       ctx,
//       errorKey: 'INSTANCEOF_VALIDATION_PROTOTYPE_MISMATCH',
//       received: data,
//       shapeContext: shape,
//     });
//   }

//   return true;
// }
