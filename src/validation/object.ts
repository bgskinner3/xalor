// src/validation/validators.ts
import type { TValidationContext, TSolidObjectRawShape } from '../../shared';
import { isObject, isNull, isRecord } from '../../shared';
import { yieldEntries } from '../../shared';
import { PROTO_EXPLOIT_KEYS } from '../models/constants';
import { XalethorVaultCompliance } from '../xalor-service/vault-compliance';
import { errorService } from '../error';
import { withPathRestore } from '../utils';

export function validateObject(
  data: unknown,
  shape: { properties: Record<string, TSolidObjectRawShape>; strict?: boolean },
  ctx: TValidationContext,
): boolean {
  const {
    OBJECT_VALIDATION_MISSING_PROPERTY,
    OBJECT_VALIDATION_EXCESS_PROPERTY,
    OBJECT_VALIDATION_MISSING_REQUIRED_KEY,
    OBJECT_VALIDATION_TYPE_MISMATCH,
    OBJECT_VALIDATION_UNDEFINED_PROPERTY,
  } = errorService.shapeValErrs;
  const reportError = XalethorVaultCompliance.reportError;
  if (!isObject(data) || isNull(data) || !isRecord(data)) {
    /* prettier-ignore */
    return reportError( ctx, OBJECT_VALIDATION_TYPE_MISMATCH.expected(), data, OBJECT_VALIDATION_TYPE_MISMATCH.message);
  }

  const originalPath = ctx.path;

  if (shape.strict) {
    const rawDataKeys = Object.keys(data);
    for (let i = 0; i < rawDataKeys.length; i++) {
      const key = rawDataKeys[i];
      if (
        key !== undefined &&
        !Object.prototype.hasOwnProperty.call(shape.properties, key)
      ) {
        ctx.path = originalPath === '$' ? key : `${originalPath}.${key}`;
        /* prettier-ignore */
        const result = reportError( ctx, 'excess_property', 'excess_property', OBJECT_VALIDATION_EXCESS_PROPERTY.message );
        ctx.path = originalPath;
        return result;
      }
    }
  }

  const propertyEntries = yieldEntries(
    shape.properties,
    (_key, _value): _key is string => !PROTO_EXPLOIT_KEYS.has(_key),
  );

  for (const [key, metadata] of propertyEntries) {
    if (PROTO_EXPLOIT_KEYS.has(key)) continue;

    const hasProperty = Object.hasOwn(data, key);
    const value = data[key];
    const targetPath = originalPath === '$' ? key : `${originalPath}.${key}`;

    if (!hasProperty) {
      if (metadata.requiresKeyPresence) {
        return withPathRestore(ctx, targetPath, () =>
          /* prettier-ignore */
          reportError(ctx, OBJECT_VALIDATION_MISSING_REQUIRED_KEY.expected('',metadata.shape), 'missing_key_presence', OBJECT_VALIDATION_MISSING_REQUIRED_KEY.message),
        );
      }
      if (metadata.optional) continue;
      return withPathRestore(ctx, targetPath, () =>
        /* prettier-ignore */
        reportError(ctx, OBJECT_VALIDATION_MISSING_PROPERTY.expected('',metadata.shape), 'missing', OBJECT_VALIDATION_MISSING_PROPERTY.message),
      );
    }

    if (value === undefined && !metadata.optional) {
      return withPathRestore(ctx, targetPath, () =>
        /* prettier-ignore */
        reportError(ctx, OBJECT_VALIDATION_UNDEFINED_PROPERTY.expected('',metadata.shape), 'missing', OBJECT_VALIDATION_UNDEFINED_PROPERTY.message),
      );
    }

    if (metadata.shape) {
      const pass = withPathRestore(ctx, targetPath, () =>
        XalethorVaultCompliance.validateShape(value, metadata.shape, ctx),
      );
      if (!pass) return false;
    }
  }

  return true;
}
