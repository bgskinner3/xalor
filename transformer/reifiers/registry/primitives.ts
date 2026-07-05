// transformer/reifiers/registry/primitives.ts
import { TypeFlags } from 'typescript';
import { isStringLiteralType, isNumberLiteralType } from '../../utils';
import { registerReifier, maxStringLength } from './core';
import { isString } from '../../../shared';

/**
 * LEAF NODE REIFIER
 *
 * This module handles the registration of all base TypeScript primitives:
 * - string, number, boolean, bigint
 *
 * NOTE: Literal types (e.g., "admin", 42, true) are also handled here.
 * In our architecture, Literals are treated as "Constant Primitives" and
 * are registered before base types to ensure specificity.
 */
registerReifier((type, _checker, _next, _ctx) => {
  const flags = type.getFlags();

  if (isStringLiteralType(type)) {
    return { kind: 'literal', type: 'string', value: type.value };
  }

  if (isNumberLiteralType(type)) {
    return { kind: 'literal', type: 'number', value: type.value };
  }

  if (flags & TypeFlags.BooleanLiteral) {
    const intrinsicName = Reflect.get(type, 'intrinsicName');
    if (isString(intrinsicName)) {
      return {
        kind: 'literal',
        type: 'boolean',
        value: intrinsicName === 'true',
      };
    }
  }
  /* prettier-ignore */
  if (flags & TypeFlags.String) return { kind: 'primitive', type: 'string', maxLength: maxStringLength };
  /* prettier-ignore */
  if (flags & TypeFlags.Number) return { kind: 'primitive', type: 'number' };
  /* prettier-ignore */
  if (flags & TypeFlags.Boolean) return { kind: 'primitive', type: 'boolean' };
  /* prettier-ignore */
  if (flags & TypeFlags.BigInt) return { kind: 'primitive', type: 'bigint' };
  /* prettier-ignore */
  if (flags & TypeFlags.Null) return { kind: 'primitive', type: 'null' };
  /* prettier-ignore */
  if (flags & TypeFlags.Undefined) return { kind: 'primitive', type: 'undefined' };
  /* prettier-ignore */
  if (flags & TypeFlags.Void) return { kind: 'primitive', type: 'void' };
  /* prettier-ignore */
  if (flags & TypeFlags.Any) return { kind: 'primitive', type: 'any' };
  /* prettier-ignore */
  if (flags & TypeFlags.Unknown) return { kind: 'primitive', type: 'unknown' };
  /* prettier-ignore */
  if (flags & TypeFlags.Never) return { kind: 'primitive', type: 'never' };

  return undefined;
});
