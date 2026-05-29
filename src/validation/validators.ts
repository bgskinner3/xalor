// src/validation/validators.ts
import { validateShape } from './validate-shape';
import type {
  TSolidArrayShape,
  TValidationContext,
  TSolidObjectRawShape,
  TSolidShape,
  TSolidReferenceShape,
  TSolidLiteralShape,
  TSolidPrimitiveShape,
} from '../../shared';
import { reportError } from './errors';
import {
  isArray,
  isObject,
  isNull,
  isRecord,
  isInstanceOf,
  isUndefined,
  isString,
  isNumber,
  isBoolean,
  isBigInt,
} from '../../shared';
import { yieldEntries } from '../../shared';
import { XalethorService } from '../xalor-service';
import { PROTO_EXPLOIT_KEYS } from '../models/constants';

/**
 * 💎 Collection Validators
 * Optimized for O(1) memory and fast-bailout.
 */
export function validateArray(
  data: unknown,
  shape: TSolidArrayShape,
  ctx: TValidationContext,
): boolean {
  if (!isArray(data)) return reportError(ctx, 'array', data);

  const originalPath = ctx.path;
  const len = data.length;

  if (shape.elementShapes) {
    if (len < (shape.minLength || 0)) {
      /* prettier-ignore */ return reportError(ctx,`Tuple(minLength: ${shape.minLength})`,`length: ${len}` );
    }

    const elementCount = shape.elementShapes.length;
    for (let i = 0; i < elementCount; i++) {
      ctx.path = `${originalPath}[${i}]`;
      if (!validateShape(data[i], shape.elementShapes[i], ctx)) {
        ctx.path = originalPath;
        return false;
      }
    }

    ctx.path = originalPath;
    return true;
  }

  for (let i = 0; i < len; i++) {
    ctx.path = `${originalPath}[${i}]`;
    if (!validateShape(data[i], shape.items, ctx)) {
      ctx.path = originalPath;
      return false;
    }
  }

  ctx.path = originalPath;
  return true;
}

/**
 *
 * @param data
 * @param shape
 * @param ctx
 * @returns
 */
export function validateObject(
  data: unknown,
  shape: { properties: Record<string, TSolidObjectRawShape> },
  ctx: TValidationContext,
): boolean {
  if (!isObject(data) || isNull(data) || !isRecord(data))
    return reportError(ctx, 'object', data);

  const originalPath = ctx.path;
  const payloadKeys = Object.getOwnPropertyNames(data);
  const keyCount = payloadKeys.length;

  for (let i = 0; i < keyCount; i++) {
    if (PROTO_EXPLOIT_KEYS.has(payloadKeys[i])) {
      return false;
    }
  }

  const propertyEntries = yieldEntries(
    shape.properties,
    (_key, _value): _key is string => true,
  );

  for (const [key, metadata] of propertyEntries) {
    const hasProperty = Object.hasOwn(data, key);
    const value = data[key];

    ctx.path = originalPath === '$' ? key : `${originalPath}.${key}`;

    // Force a key presence check if the TypeScript source interface demands existence
    if (metadata.requiresKeyPresence && !hasProperty) {
      const result = reportError(ctx, metadata.shape, 'missing_key_presence');
      ctx.path = originalPath;
      return result;
    }

    if (!hasProperty || value === undefined) {
      // Bypasses the omission gate safely if key presence was verified or marked optional
      if (metadata.optional || metadata.requiresKeyPresence) continue;
      const result = reportError(ctx, metadata.shape, 'missing');
      ctx.path = originalPath;
      return result;
    }

    if (metadata.shape) {
      if (!validateShape(value, metadata.shape, ctx)) {
        ctx.path = originalPath;
        return false;
      }
    }
  }

  ctx.path = originalPath;
  return true;
}

/**
 * 💎 Graph Validators
 * Handles branch logic and type-graph fragments.
 */
export function validateUnion(
  data: unknown,
  shape: Extract<TSolidShape, { kind: 'union' }>,
  ctx: TValidationContext,
): boolean {
  const snapshotCount = ctx.errors.length;
  for (const subShape of shape.values) {
    if (validateShape(data, subShape, ctx)) {
      if (ctx.errors.length > snapshotCount) {
        ctx.errors.splice(snapshotCount);
      }
      return true;
    }
  }
  return reportError(ctx, shape, data);
}

/**
 * 💎 Ambient Database Bridge
 * Handles "Solid" type resolution via the Global Vault.
 */
export function validateReference(
  data: unknown,
  shape: TSolidReferenceShape,
  ctx: TValidationContext,
): boolean {
  const metadata = XalethorService.inspectMetaData(shape.name);
  if (!metadata) {
    return reportError(
      ctx,
      `Registered Shape: ${shape.name}`,
      'Missing from Vault',
    );
  }
  return validateShape(data, metadata.shape, ctx);
}

/**
 * 💎 Internal Utility
 * Validates a primitive value against a specific type string.
 */
export function validatePrimitive(
  data: unknown,
  shape: TSolidPrimitiveShape,
  ctx: TValidationContext,
): boolean {
  const { type } = shape;

  if (type === 'any' || type === 'unknown') return true;

  if (type === 'Date') {
    return isInstanceOf(data, Date) && !isNaN(data.getTime())
      ? true
      : reportError(ctx, 'Date', data);
  }
  if (type === 'RegExp') {
    return isInstanceOf(data, RegExp) ? true : reportError(ctx, 'RegExp', data);
  }
  if (type === 'Map') {
    return isInstanceOf(data, Map) ? true : reportError(ctx, 'Map', data);
  }
  if (type === 'Set') {
    return isInstanceOf(data, Set) ? true : reportError(ctx, 'Set', data);
  }
  if (type === 'URL') {
    return isInstanceOf(data, URL) ? true : reportError(ctx, 'URL', data);
  }

  // 🛡️ 3. EXPLICIT NULL / UNDEFINED LEAF VALIDATORS
  if (type === 'null')
    return isNull(data) ? true : reportError(ctx, 'null', data);
  if (type === 'undefined')
    return isUndefined(data) ? true : reportError(ctx, 'undefined', data);

  // 📊 4. STANDARD TYPE PRIMITIVE CONTRACT CHECKS
  // Combines your strict dictionary checking constraints without using a switch block
  if (type === 'string')
    return isString(data) ? true : reportError(ctx, 'string', data);
  if (type === 'number')
    return isNumber(data) ? true : reportError(ctx, 'number', data);
  if (type === 'boolean')
    return isBoolean(data) ? true : reportError(ctx, 'boolean', data);
  if (type === 'bigint')
    return isBigInt(data) ? true : reportError(ctx, 'bigint', data);

  return reportError(ctx, type, data);
}

/**
 * 💎 Internal Utility
 * Validates a value against a literal constant.
 */
export function validateLiteral(
  data: unknown,
  shape: TSolidLiteralShape,
  ctx: TValidationContext,
): boolean {
  return data === shape.value ? true : reportError(ctx, shape, data);
}
