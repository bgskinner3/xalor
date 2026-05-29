// /transformer/miner/mining-target.ts
import ts from 'typescript';
import { XALOR_MINING_ROUTER_MAPPER } from '../mappers';
import { getAPIName } from '../utils';
import type { TResolvedMiningRouterReturn } from '../types';

/**
 * @see {@link TransformerDocs.resolveMiningTarget}
 */
export function resolveMiningTarget(
  node: ts.Node,
  checker: ts.TypeChecker,
): TResolvedMiningRouterReturn {
  if (!ts.isCallExpression(node)) return null;

  const apiName = getAPIName(node);

  if (apiName === 'registerXalor')
    return XALOR_MINING_ROUTER_MAPPER.registerXalor(node, checker);
  if (apiName === 'generateXalor')
    return XALOR_MINING_ROUTER_MAPPER.generateXalor(node, checker);
  if (apiName === 'validateXalor')
    return XALOR_MINING_ROUTER_MAPPER.validateXalor(node, checker);
  if (apiName === 'transformXalor')
    return XALOR_MINING_ROUTER_MAPPER.transformXalor(node, checker);

  return null;
}
