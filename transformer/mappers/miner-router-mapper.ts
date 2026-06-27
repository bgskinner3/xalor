// /transformer/mappers/miner-router-mapper.ts
import type { TXalorMinerRouterMap, TRegisterRawPayload } from '../types';
import { extractSingleKeyPayload } from '../utils';

/**
 * MINING ROUTER MAPPER
 *
 * ROLE:
 * Explicit AST static extractors mapped precisely to each executable API signature.
 *
 * STRATEGY:
 * Extracts the primary database key out of the first generic type parameter slot [0],
 * eliminating old recursive sub-argument extraction routines.
 */
export const XALOR_MINING_ROUTER_MAPPER: TXalorMinerRouterMap = {
  // ========================================================================
  // REGISTRATION
  // ========================================================================
  'xalor.register': (node, checker): TRegisterRawPayload | null => {
    const typeArgs = node.typeArguments;
    const args = node.arguments;

    if (typeArgs && typeArgs.length >= 2) {
      const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
      const shapeType = checker.getTypeFromTypeNode(typeArgs[1]);
      if (!keyType.isStringLiteral()) return null;
      return {
        keyName: keyType.value,
        keyType,
        shapeType,
        apiName: 'xalor.register',
      };
    }

    if (typeArgs && typeArgs.length === 1 && args.length >= 1) {
      const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
      const shapeType = checker.getTypeAtLocation(args[0]);
      if (!keyType.isStringLiteral()) return null;
      return {
        keyName: keyType.value,
        keyType,
        shapeType,
        apiName: 'xalor.register',
      };
    }

    return null;
  },

  // ========================================================================
  // GENERATION METHODS
  // ========================================================================
  /* prettier-ignore */ 'xalor.default':    (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.default'),

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================
  /* prettier-ignore */ 'xalor.guard':      (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.guard'),
  /* prettier-ignore */ 'xalor.parse':      (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.parse'),

  // ========================================================================
  // TRANSFORMATION METHODS
  // ========================================================================
  /* prettier-ignore */ 'xalor.merge':      (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.merge'),
  /* prettier-ignore */ 'xalor.clone':      (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.clone'),
  // ========================================================================
  // MATCH METHODS
  // ========================================================================
  /* prettier-ignore */ 'xalor.drift':      (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.drift'),
} satisfies TXalorMinerRouterMap;
