import type { TValidationContext, TSolidObjectRawShape } from '../../../shared';
import { xalethorVaultValidation } from '../../xalor-service/vault-validation';

// TODO: MOVE TO VALDTION HELPER UTILS
/**
 * Validates native JavaScript Map objects via direct linear iteration.
 * COMPLIANCE: Absolute zero object key allocations or generic record hash lookups.
 * GOVERNED BY COMMANDMENT VIII: Zero memory allocations on successful paths.
 */
export function validateNativeMapCollection(
  data: Map<unknown, unknown>,
  shape: {
    readonly properties: Readonly<Record<string, TSolidObjectRawShape>>;
    readonly strict?: boolean;
  },
  ctx: TValidationContext,
): boolean {
  const valueMetadata = shape.properties;
  const fallbackTargetShape =
    valueMetadata['*']?.shape || valueMetadata['value']?.shape;

  // ⚡ BARE-METAL LINEAR TRACK: Avoids Map.prototype.forEach functional scoping overhead!
  // V8 compiles this destructuring iterator directly into flat, sequential register offsets.
  for (const [key, value] of data) {
    if (ctx.isInvalidCircular) {
      return false;
    }

    const stringKey = typeof key === 'string' ? key : String(key);
    const specificMetadata = valueMetadata[stringKey];
    const activeTargetShape = specificMetadata?.shape ?? fallbackTargetShape;

    if (activeTargetShape !== undefined) {
      ctx.pathStack[ctx.pathPointer++] = stringKey;

      const elementPass = xalethorVaultValidation.validateShape(
        value,
        activeTargetShape,
        ctx,
      );

      ctx.pathPointer--;

      // Early breakout — stops winding loop frames instantly if a sub-element fails
      if (!elementPass) {
        return false;
      }
    }
  }

  return true;
}
// export function validateNativeMapCollection(
//   data: Map<unknown, unknown>,
//   shape: {
//     readonly properties: Readonly<Record<string, TSolidObjectRawShape>>;
//     readonly strict?: boolean;
//   },
//   ctx: TValidationContext,
// ): boolean {
//   const valueMetadata = shape.properties;

//   // Extract a static target value validator shape node if explicitly mapped by your compiler
//   const fallbackTargetShape =
//     valueMetadata['*']?.shape || valueMetadata['value']?.shape;

//   let pass = true;

//   // V8 optimizes Map.prototype.forEach to run at near-native C++ loop speed
//   data.forEach((value, key) => {
//     if (!pass) return;

//     const stringKey = typeof key === 'string' ? key : String(key);
//     const specificMetadata = valueMetadata[stringKey];
//     const activeTargetShape = specificMetadata?.shape ?? fallbackTargetShape;

//     if (activeTargetShape) {
//       ctx.pathStack[ctx.pathPointer++] = stringKey;

//       const elementPass = XalethorService.validateShape(
//         value,
//         activeTargetShape,
//         ctx,
//       );

//       // ✨ Instant integer register decrement reset
//       ctx.pathPointer--;
//       if (!elementPass) {
//         pass = false;
//       }
//     }
//   });

//   if (!pass) {
//     return XalethorService.reportError({
//       ctx,
//       errorKey: 'OBJECT_VALIDATION_TYPE_MISMATCH',
//       received: data,
//     });
//   }

//   return true;
// }
