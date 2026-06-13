import { registerReifier } from './core';
import { isKeyOfInstanceKind } from '../../../shared';

/**
 * INSTANCEOF REIFIER
 *
 * Detects native/global constructors like Date, Map, URL, etc.
 */
registerReifier((type, _checker, _next, _ctx) => {
  const symbol = type.getSymbol() ?? type.aliasSymbol;
  if (!symbol) return undefined;

  const name = symbol.getName();

  if (!isKeyOfInstanceKind(name)) return undefined;

  return {
    kind: 'instanceof',
    name,
  };
});
