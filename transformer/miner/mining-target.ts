// /transformer/miner/mining-target.ts
import ts from 'typescript';
import { XALOR_MINING_ROUTER_MAPPER } from '../mappers';
import { getAPIName } from '../utils';
import type { TResolvedMiningRouterReturn } from '../types';

export function resolveMiningTarget(
  node: ts.Node,
  checker: ts.TypeChecker,
): TResolvedMiningRouterReturn | null {
  if (!ts.isCallExpression(node)) return null;

  const apiName = getAPIName(node);
  if (!apiName) return null;

  // Check if the extracted API token exists directly in our optimized mapper
  if (
    Object.prototype.hasOwnProperty.call(XALOR_MINING_ROUTER_MAPPER, apiName)
  ) {
    const targetMiner =
      XALOR_MINING_ROUTER_MAPPER[
        apiName as keyof typeof XALOR_MINING_ROUTER_MAPPER
      ];
    return targetMiner(node, checker);
  }

  return null;
}
