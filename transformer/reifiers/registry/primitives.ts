// transformer/reifiers/registry/primitives.ts
import { TypeFlags } from 'typescript';
import { isStringLiteralType, isNumberLiteralType } from '../../utils';
import { registerReifier, maxStringLength } from './core';
import { isKeyOfArray } from '../../../shared';

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
  if (isStringLiteralType(type)) return { kind: 'literal', value: type.value };
  if (isNumberLiteralType(type)) return { kind: 'literal', value: type.value };

  const flags = type.getFlags();

  if (flags & TypeFlags.BooleanLiteral) {
    const intrinsicName = Reflect.get(type, 'intrinsicName');
    if (typeof intrinsicName === 'string') {
      return { kind: 'literal', value: intrinsicName === 'true' };
    }
  }

  if (flags & TypeFlags.Any) {
    return { kind: 'primitive', type: 'any' };
  }

  if (flags & TypeFlags.Unknown) {
    return { kind: 'primitive', type: 'unknown' };
  }

  if (flags & TypeFlags.String) {
    return { kind: 'primitive', type: 'string', maxLength: maxStringLength };
  }

  if (flags & TypeFlags.Number) return { kind: 'primitive', type: 'number' };
  if (flags & TypeFlags.Boolean) return { kind: 'primitive', type: 'boolean' };
  if (flags & TypeFlags.BigInt) return { kind: 'primitive', type: 'bigint' };

  if (flags & TypeFlags.Null) return { kind: 'primitive', type: 'null' };
  if (flags & TypeFlags.Undefined)
    return { kind: 'primitive', type: 'undefined' };

  const symbol = type.getSymbol() || type.aliasSymbol;
  if (symbol) {
    const symbolName = symbol.getName();
    /* prettier-ignore */ const platformScalars = ['Date', 'RegExp', 'Map', 'Set', 'Promise', 'URL'] as const;

    // Create an array slice to feed the type guard
    const scalarList = Array.from(platformScalars);

    if (isKeyOfArray(scalarList)(symbolName)) {
      return { kind: 'primitive', type: symbolName };
    }
  }

  return undefined;
});
