// src/validation/validators.ts
import type {
  TSolidArrayShape,
  TValidationContext,
  TSolidObjectRawShape,
  TSolidShape,
  TSolidReferenceShape,
  TSolidLiteralShape,
  TSolidPrimitiveShape,
  TSolidIntersectionShape,
  TSolidInstanceOfShape,
  TSolidFunctionShape,
} from '../../shared';
import {
  isArray,
  isObject,
  isNull,
  isRecord,
  isUndefined,
  isString,
  isNumber,
  isBoolean,
  isBigInt,
  isFunction,
  isKeyInObject,
} from '../../shared';
import { yieldEntries, yieldFiltered } from '../../shared';
import { shapeKindUtilsService } from '../../shared/service';
import { XalethorService } from '../xalor-service';
import { PROTO_EXPLOIT_KEYS } from '../models/constants';
import { XalethorVaultCompliance } from '../xalor-service/vault-compliance';

// Reusable short alias for internal reporting calls
// const report = XalethorVaultCompliance.reportError;
// const validateShape = XalethorVaultCompliance.validateShape;
// 🪐 Contextual Debug Logger Wrapper
// const logDebug = (
//   action: string,
//   path: string,
//   message: string,
//   payload?: unknown,
// ) => {
//   if (process.env.XALOR_DEBUG === 'true') {
//     const visualPath = path === '$' ? 'ROOT' : path;
//     console.log(`[XALOR 🛰️  DEBUG] [${action}] (${visualPath}) ➔ ${message}`);
//     if (payload !== undefined) {
//       console.log(
//         `               ⤷ Value:`,
//         typeof payload === 'object' ? JSON.stringify(payload) : payload,
//       );
//     }
//   }
// };

export function validateArray(
  data: unknown,
  shape: TSolidArrayShape,
  ctx: TValidationContext,
): boolean {
  if (!isArray(data))
    return XalethorVaultCompliance.reportError(ctx, 'array', data);

  const originalPath = ctx.path;
  const len = data.length;

  if (shape.elementShapes) {
    if (len < (shape.minLength || 0)) {
      return XalethorVaultCompliance.reportError(
        ctx,
        `Tuple(minLength: ${shape.minLength})`,
        `length: ${len}`,
      );
    }
    const elementCount = shape.elementShapes.length;
    for (let i = 0; i < elementCount; i++) {
      ctx.path = `${originalPath}[${i}]`;
      if (
        !XalethorVaultCompliance.validateShape(
          data[i],
          shape.elementShapes[i],
          ctx,
        )
      ) {
        ctx.path = originalPath;
        return false;
      }
    }
    ctx.path = originalPath;
    return true;
  }

  for (let i = 0; i < len; i++) {
    ctx.path = `${originalPath}[${i}]`;
    if (!XalethorVaultCompliance.validateShape(data[i], shape.items, ctx)) {
      ctx.path = originalPath;
      return false;
    }
  }
  ctx.path = originalPath;
  return true;
}

export function validateObject(
  data: unknown,
  shape: { properties: Record<string, TSolidObjectRawShape>; strict?: boolean },
  ctx: TValidationContext,
): boolean {
  if (!isObject(data) || isNull(data) || !isRecord(data))
    return XalethorVaultCompliance.reportError(ctx, 'object', data);

  const originalPath = ctx.path;

  // 1. Optional Strict Mode: Validate against excess properties
  if (shape.strict) {
    const rawDataKeys = Object.keys(data);
    for (let i = 0; i < rawDataKeys.length; i++) {
      const key = rawDataKeys[i];
      if (
        key !== undefined &&
        !Object.prototype.hasOwnProperty.call(shape.properties, key)
      ) {
        ctx.path = originalPath === '$' ? key : `${originalPath}.${key}`;

        const result = XalethorVaultCompliance.reportError(
          ctx,
          'excess_property',
          'excess_property',
        );
        ctx.path = originalPath;
        return result;
      }
    }
  }

  // 2. Blueprint Mapping Loop with prototype injection safety filters
  const propertyEntries = yieldEntries(
    shape.properties,
    (_key, _value): _key is string => !PROTO_EXPLOIT_KEYS.has(_key),
  );

  for (const [key, metadata] of propertyEntries) {
    if (PROTO_EXPLOIT_KEYS.has(key)) continue;

    const hasProperty = Object.hasOwn(data, key);
    const value = data[key];
    ctx.path = originalPath === '$' ? key : `${originalPath}.${key}`;

    if (!hasProperty) {
      if (metadata.requiresKeyPresence) {
        const result = XalethorVaultCompliance.reportError(
          ctx,
          metadata.shape,
          'missing_key_presence',
        );
        ctx.path = originalPath;
        return result;
      }
      if (metadata.optional) {
        continue;
      }

      const result = XalethorVaultCompliance.reportError(
        ctx,
        metadata.shape,
        'missing',
      );
      ctx.path = originalPath;
      return result;
    }

    if (value === undefined && !metadata.optional) {
      const result = XalethorVaultCompliance.reportError(
        ctx,
        metadata.shape,
        'missing',
      );
      ctx.path = originalPath;
      return result;
    }

    if (metadata.shape) {
      if (!XalethorVaultCompliance.validateShape(value, metadata.shape, ctx)) {
        ctx.path = originalPath;
        return false;
      }
    }
  }

  ctx.path = originalPath;
  return true;
}

export function validateUnion(
  data: unknown,
  shape: Extract<TSolidShape, { kind: 'union' }>,
  ctx: TValidationContext,
): boolean {
  const snapshotCount = ctx.errors.length;

  for (let i = 0; i < shape.values.length; i++) {
    if (XalethorVaultCompliance.validateShape(data, shape.values[i], ctx)) {
      if (ctx.errors.length > snapshotCount) {
        ctx.errors.splice(snapshotCount);
      }

      return true;
    }
  }

  return XalethorVaultCompliance.reportError(ctx, 'union', data);
}

export function validateReference(
  data: unknown,
  shape: TSolidReferenceShape,
  ctx: TValidationContext,
): boolean {
  const metadata = XalethorService.inspectMetaData(shape.name);
  if (!metadata) {
    return XalethorVaultCompliance.reportError(
      ctx,
      `Registered Shape: ${shape.name}`,
      'Missing from Vault',
    );
  }
  return XalethorVaultCompliance.validateShape(data, metadata.shape, ctx);
}

export function validatePrimitive(
  data: unknown,
  shape: TSolidPrimitiveShape,
  ctx: TValidationContext,
): boolean {
  const { type } = shape;

  if (type === 'any' || type === 'unknown') return true;
  if (type === 'null')
    return isNull(data)
      ? true
      : XalethorVaultCompliance.reportError(ctx, 'null', data);
  if (type === 'undefined')
    return isUndefined(data)
      ? true
      : XalethorVaultCompliance.reportError(ctx, 'undefined', data);
  if (type === 'string')
    return isString(data)
      ? true
      : XalethorVaultCompliance.reportError(ctx, 'string', data);
  if (type === 'number')
    return isNumber(data)
      ? true
      : XalethorVaultCompliance.reportError(ctx, 'number', data);
  if (type === 'boolean')
    return isBoolean(data)
      ? true
      : XalethorVaultCompliance.reportError(ctx, 'boolean', data);
  if (type === 'bigint')
    return isBigInt(data)
      ? true
      : XalethorVaultCompliance.reportError(ctx, 'bigint', data);

  return XalethorVaultCompliance.reportError(ctx, type, data);
}

export function validateIntersection(
  data: unknown,
  shape: TSolidIntersectionShape,
  ctx: TValidationContext,
): boolean {
  const parts = yieldFiltered(
    shape.values,
    (_part): _part is TSolidShape => true,
  );

  for (const part of parts) {
    if (!XalethorVaultCompliance.validateShape(data, part, ctx)) {
      return XalethorVaultCompliance.reportError(ctx, 'intersection', data);
    }
  }
  return true;
}

export function validateLiteral(
  data: unknown,
  shape: TSolidLiteralShape,
  ctx: TValidationContext,
): boolean {
  const isMatch = data === shape.value;

  return isMatch ? true : XalethorVaultCompliance.reportError(ctx, shape, data);
}

export function validateFunction(
  data: unknown,
  shape: TSolidFunctionShape,
  ctx: TValidationContext,
): boolean {
  if (!isFunction(data))
    return XalethorVaultCompliance.reportError(ctx, shape, data);

  let mandatoryParamsCount = 0;
  const totalBlueprintParams = shape.parameters.length;

  for (let i = 0; i < totalBlueprintParams; i++) {
    const paramNode = shape.parameters[i];
    if (
      paramNode &&
      isObject(paramNode) &&
      isKeyInObject('optional')(paramNode) &&
      !paramNode.optional
    ) {
      mandatoryParamsCount++;
    }
  }

  if (data.length < mandatoryParamsCount) {
    return XalethorVaultCompliance.reportError(
      ctx,
      'function_signature_parameters_mismatch',
      `provided: ${data.length}`,
    );
  }
  return true;
}

export function validateInstanceOf(
  data: unknown,
  shape: TSolidInstanceOfShape,
  ctx: TValidationContext,
): boolean {
  if (data == null)
    return XalethorVaultCompliance.reportError(ctx, shape, data);

  const ctor = shapeKindUtilsService.resolveInstanceCtor(shape.name);
  const isMatch = data instanceof ctor;

  if (!isMatch) {
    const receivedPrototype = isObject(data)
      ? data.constructor.name
      : typeof data;

    return XalethorVaultCompliance.reportError(
      ctx,
      `instanceof_${shape.name}`,
      receivedPrototype,
    );
  }

  return true;
}
// export function validateArray(
//   data: unknown,
//   shape: TSolidArrayShape,
//   ctx: TValidationContext,
// ): boolean {
//   if (!isArray(data)) return report(ctx, 'array', data);

//   const originalPath = ctx.path;
//   const len = data.length;

//   if (shape.elementShapes) {
//     if (len < (shape.minLength || 0)) {
//       /* prettier-ignore */ return report(ctx,`Tuple(minLength: ${shape.minLength})`,`length: ${len}` );
//     }

//     const elementCount = shape.elementShapes.length;
//     for (let i = 0; i < elementCount; i++) {
//       ctx.path = `${originalPath}[${i}]`;
//       if (!validateShape(data[i], shape.elementShapes[i], ctx)) {
//         ctx.path = originalPath;
//         return false;
//       }
//     }

//     ctx.path = originalPath;
//     return true;
//   }

//   for (let i = 0; i < len; i++) {
//     ctx.path = `${originalPath}[${i}]`;
//     if (!validateShape(data[i], shape.items, ctx)) {
//       ctx.path = originalPath;
//       return false;
//     }
//   }

//   ctx.path = originalPath;
//   return true;
// }

// /**
//  *
//  * @param data
//  * @param shape
//  * @param ctx
//  * @returns
//  */
// export function validateObject(
//   data: unknown,
//   shape: { properties: Record<string, TSolidObjectRawShape>; strict?: boolean },
//   ctx: TValidationContext,
// ): boolean {
//   if (!isObject(data) || isNull(data) || !isRecord(data))
//     return report(ctx, 'object', data);

//   const originalPath = ctx.path;

//   // 1. Optional Strict Mode: Validate against excess properties
//   if (shape.strict) {
//     const rawDataKeys = Object.keys(data);
//     for (let i = 0; i < rawDataKeys.length; i++) {
//       const key = rawDataKeys[i];
//       if (
//         key !== undefined &&
//         !Object.prototype.hasOwnProperty.call(shape.properties, key)
//       ) {
//         ctx.path = originalPath === '$' ? key : `${originalPath}.${key}`;
//         const result = report(ctx, 'excess_property', 'excess_property');
//         ctx.path = originalPath;
//         return result;
//       }
//     }
//   }

//   // 2. Blueprint Mapping Loop with prototype injection safety filters
//   const propertyEntries = yieldEntries(
//     shape.properties,
//     (_key, _value): _key is string => !PROTO_EXPLOIT_KEYS.has(_key),
//   );

//   for (const [key, metadata] of propertyEntries) {
//     if (PROTO_EXPLOIT_KEYS.has(key)) continue;

//     const hasProperty = Object.hasOwn(data, key);
//     const value = data[key];
//     ctx.path = originalPath === '$' ? key : `${originalPath}.${key}`;

//     // Fix: Explicitly decoupled property presence evaluation matrix
//     if (!hasProperty) {
//       if (metadata.requiresKeyPresence) {
//         const result = report(ctx, metadata.shape, 'missing_key_presence');
//         ctx.path = originalPath;
//         return result;
//       }
//       if (metadata.optional) {
//         continue;
//       }
//       const result = report(ctx, metadata.shape, 'missing');
//       ctx.path = originalPath;
//       return result;
//     }

//     if (value === undefined && !metadata.optional) {
//       const result = report(ctx, metadata.shape, 'missing');
//       ctx.path = originalPath;
//       return result;
//     }

//     if (metadata.shape) {
//       if (!validateShape(value, metadata.shape, ctx)) {
//         ctx.path = originalPath;
//         return false;
//       }
//     }
//   }

//   ctx.path = originalPath;
//   return true;
// }

// /**
//  * 💎 Graph Validators
//  * Handles branch logic and type-graph fragments.
//  */
// export function validateUnion(
//   data: unknown,
//   shape: Extract<TSolidShape, { kind: 'union' }>,
//   ctx: TValidationContext,
// ): boolean {
//   const snapshotCount = ctx.errors.length;
//   for (const subShape of shape.values) {
//     if (validateShape(data, subShape, ctx)) {
//       if (ctx.errors.length > snapshotCount) {
//         ctx.errors.splice(snapshotCount);
//       }
//       return true;
//     }
//   }
//   return report(ctx, 'union', data);
// }

// /**
//  * 💎 Ambient Database Bridge
//  * Handles "Solid" type resolution via the Global Vault.
//  */
// export function validateReference(
//   data: unknown,
//   shape: TSolidReferenceShape,
//   ctx: TValidationContext,
// ): boolean {
//   const metadata = XalethorService.inspectMetaData(shape.name);
//   if (!metadata) {
//     return report(ctx, `Registered Shape: ${shape.name}`, 'Missing from Vault');
//   }
//   return validateShape(data, metadata.shape, ctx);
// }

// /**
//  * 💎 Internal Utility
//  * Validates a primitive value against a specific type string.
//  */
// export function validatePrimitive(
//   data: unknown,
//   shape: TSolidPrimitiveShape,
//   ctx: TValidationContext,
// ): boolean {
//   const { type } = shape;

//   if (type === 'any' || type === 'unknown') return true;

//   if (type === 'null') return isNull(data) ? true : report(ctx, 'null', data);

//   if (type === 'undefined')
//     return isUndefined(data) ? true : report(ctx, 'undefined', data);

//   if (type === 'string')
//     return isString(data) ? true : report(ctx, 'string', data);

//   if (type === 'number')
//     return isNumber(data) ? true : report(ctx, 'number', data);

//   if (type === 'boolean')
//     return isBoolean(data) ? true : report(ctx, 'boolean', data);

//   if (type === 'bigint')
//     return isBigInt(data) ? true : report(ctx, 'bigint', data);

//   return report(ctx, type, data);
// }
// export function validateIntersection(
//   data: unknown,
//   shape: TSolidIntersectionShape,
//   ctx: TValidationContext,
// ): boolean {
//   const parts = yieldFiltered(
//     shape.values,
//     (_part): _part is TSolidShape => true,
//   );
//   for (const part of parts) {
//     if (!validateShape(data, part, ctx))
//       return report(ctx, 'intersection', data);
//   }
//   return true;
// }
// /**
//  * 💎 Internal Utility
//  * Validates a value against a literal constant.
//  */
// export function validateLiteral(
//   data: unknown,
//   shape: TSolidLiteralShape,
//   ctx: TValidationContext,
// ): boolean {
//   return data === shape.value ? true : report(ctx, shape, data);
// }

// export function validateFunction(
//   data: unknown,
//   shape: TSolidFunctionShape,
//   ctx: TValidationContext,
// ): boolean {
//   if (!isFunction(data)) {
//     return report(ctx, shape, data);
//   }
//   let mandatoryParamsCount = 0;
//   const totalBlueprintParams = shape.parameters.length;
//   for (let i = 0; i < totalBlueprintParams; i++) {
//     const paramNode = shape.parameters[i];
//     /* prettier-ignore */
//     if (paramNode && isObject(paramNode) && isKeyInObject('optional')(paramNode) && !paramNode.optional) {
//       mandatoryParamsCount++;
//     }
//   }
//   if (data.length < mandatoryParamsCount) {
//     /* prettier-ignore */
//     return report(ctx, 'function_signature_parameters_mismatch', `provided: ${data.length}`);
//   }
//   return true;
// }

// export function validateInstanceOf(
//   data: unknown,
//   shape: TSolidInstanceOfShape,
//   ctx: TValidationContext,
// ): boolean {
//   if (data == null) {
//     return report(ctx, shape, data);
//   }
//   const ctor = shapeKindUtilsService.resolveInstanceCtor(shape.name);
//   if (!(data instanceof ctor)) {
//     /* prettier-ignore */ const receivedPrototype = isObject(data) ? data.constructor.name : typeof data;
//     /* prettier-ignore */ return report(ctx, `instanceof_${shape.name}`, receivedPrototype);
//   }
//   return true;
// }
