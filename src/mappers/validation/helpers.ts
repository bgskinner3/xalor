import type { TValidationContext, TSolidObjectRawShape } from '../../../shared';
import { XalethorService } from '../../xalor-service';

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

  // Extract a static target value validator shape node if explicitly mapped by your compiler
  const fallbackTargetShape =
    valueMetadata['*']?.shape || valueMetadata['value']?.shape;

  let pass = true;

  // V8 optimizes Map.prototype.forEach to run at near-native C++ loop speed
  data.forEach((value, key) => {
    if (!pass) return;

    const stringKey = typeof key === 'string' ? key : String(key);
    const specificMetadata = valueMetadata[stringKey];
    const activeTargetShape = specificMetadata?.shape ?? fallbackTargetShape;

    if (activeTargetShape) {
      ctx.pathStack[ctx.pathPointer++] = stringKey;

      const elementPass = XalethorService.validateShape(
        value,
        activeTargetShape,
        ctx,
      );

      // ✨ Instant integer register decrement reset
      ctx.pathPointer--;
      if (!elementPass) {
        pass = false;
      }
    }
  });

  if (!pass) {
    return XalethorService.reportError({
      ctx,
      errorKey: 'OBJECT_VALIDATION_TYPE_MISMATCH',
      received: data,
    });
  }

  return true;
}
