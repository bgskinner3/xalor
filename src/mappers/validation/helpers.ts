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

      if (!elementPass) {
        return false;
      }
    }
  }

  return true;
}
