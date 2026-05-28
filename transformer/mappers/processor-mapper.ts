// /transformer/mappers/processor-mapper.ts
import { generateShapeAST } from '../reifiers';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import type { TProcessorRewriteMap } from '../types';
/**
 * 🗺️ PARAMETER REWRITE ROUTER
 *
 * ROLE:
 * Isolated routines formatting exact argument slots per function contract.
 * Replaces conditional switch/if loops with functional object lookups.
 */
export const PROCESSOR_REWRITE_MAPPER: TProcessorRewriteMap = {
  registerXalor: (raw, node, factory, areaString, shape) => {
    if (!raw || !shape) return [...node.arguments];

    const metadataExpression = factory.createObjectLiteralExpression([
      /* prettier-ignore */ factory.createPropertyAssignment('key', factory.createStringLiteral(raw.keyName)),
      /* prettier-ignore */ factory.createPropertyAssignment('area',factory.createStringLiteral(areaString)),
      /* prettier-ignore */ factory.createPropertyAssignment('version', factory.createStringLiteral(IS_SOLID_CONFIG_ITEMS.solidVersion)),
      /* prettier-ignore */ factory.createPropertyAssignment('shape', generateShapeAST(factory, shape)),
    ]);
    return node.arguments.length === 0
      ? [metadataExpression]
      : [node.arguments[0], metadataExpression];
  },

  generateXalor: (raw, node, factory) => {
    const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');
    const modeLiteral = factory.createStringLiteral(raw.mode ?? 'default');

    return node.arguments.length > 0
      ? [keyLiteral, modeLiteral, node.arguments[0]]
      : [keyLiteral, modeLiteral];
  },
  validateXalor: (raw, node, factory) => {
    const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');
    const modeLiteral = factory.createStringLiteral(raw.mode ?? 'default');

    return node.arguments.length > 0
      ? [keyLiteral, modeLiteral, node.arguments[0]]
      : [keyLiteral, modeLiteral];
  },
  transformXalor: (raw, node, factory) => {
    const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');
    const modeLiteral = factory.createStringLiteral(raw.mode ?? 'default');

    return node.arguments.length > 0
      ? [keyLiteral, modeLiteral, node.arguments[0]]
      : [keyLiteral, modeLiteral];
  },
} satisfies TProcessorRewriteMap;
