import { registerReifier } from './core';
import { INSTANCE_REGISTRY_MAPPER } from '../../../shared';

export function isInstanceRegistryKey(
  name: string,
): name is keyof typeof INSTANCE_REGISTRY_MAPPER {
  return name in INSTANCE_REGISTRY_MAPPER;
}
/**
 * INSTANCEOF REIFIER
 *
 * Detects native/global constructors like Date, Map, URL, etc.
 */
registerReifier((type, _checker, _next, _ctx) => {
  const symbol = type.getSymbol() ?? type.aliasSymbol;
  if (!symbol) return undefined;

  const name = symbol.getName();

  if (!isInstanceRegistryKey(name)) return undefined;

  return {
    kind: 'instanceof',
    name,
  };
});
