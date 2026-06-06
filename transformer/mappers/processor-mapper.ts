// /transformer/mappers/processor-mapper.ts
import { generateShapeAST } from '../reifiers';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import type { TProcessorRewriteMap } from '../types';
import {
  formatTransformationArgs,
  formatGenerationArgs,
  formatValidationArgs,
} from '../utils/mapper-helpers';

/**
 * PARAMETER REWRITE ROUTER
 *
 * ROLE:
 * Isolated routines formatting exact argument slots per function contract.
 * Replaces conditional switch/if loops with functional object lookups.
 */
export const PROCESSOR_REWRITE_MAPPER: TProcessorRewriteMap = {
  // ========================================================================
  // REGISTRATION
  // ========================================================================

  'xalor.register': (raw, node, factory, areaString, shape) => {
    if (!raw || !shape) return [...node.arguments];

    const metadataExpression = factory.createObjectLiteralExpression([
      /* prettier-ignore */ factory.createPropertyAssignment('key', factory.createStringLiteral(raw.keyName)),
      /* prettier-ignore */ factory.createPropertyAssignment('area',factory.createStringLiteral(areaString ?? '')),
      /* prettier-ignore */ factory.createPropertyAssignment('version', factory.createStringLiteral(IS_SOLID_CONFIG_ITEMS.solidVersion)),
      /* prettier-ignore */ factory.createPropertyAssignment('shape', generateShapeAST(factory, shape)),
    ]);
    return node.arguments.length === 0
      ? [metadataExpression]
      : [node.arguments[0], metadataExpression];
  },
  // ========================================================================
  // GENERATION METHODS
  // ========================================================================
  /* prettier-ignore */
  'xalor.default':    (raw, node, factory) => formatGenerationArgs('default', raw, node, factory),
  /* prettier-ignore */
  'xalor.mock':       (raw, node, factory) => formatGenerationArgs('mock', raw, node, factory),
  /* prettier-ignore */
  'xalor.clone':      (raw, node, factory) => formatGenerationArgs('clone', raw, node, factory),
  /* prettier-ignore */
  'xalor.cast':       (raw, node, factory) => formatGenerationArgs('cast', raw, node, factory),

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================
  /* prettier-ignore */
  'xalor.guard':      (raw, node, factory) => formatValidationArgs('guard', raw, node, factory),
  /* prettier-ignore */
  'xalor.assert':     (raw, node, factory) => formatValidationArgs('assert', raw, node, factory),
  /* prettier-ignore */
  'xalor.parse':      (raw, node, factory) => formatValidationArgs('parse', raw, node, factory),
  /* prettier-ignore */
  'xalor.parseAsync': (raw, node, factory) => formatValidationArgs('parseAsync', raw, node, factory),
  /* prettier-ignore */
  'xalor.audit':      (raw, node, factory) => formatValidationArgs('audit', raw, node, factory),

  // ========================================================================
  // TRANSFORMATION METHODS
  // ========================================================================
  /* prettier-ignore */
  'xalor.pick':       (raw, node, factory) => formatTransformationArgs('pick', raw, node, factory),
  /* prettier-ignore */
  'xalor.omit':       (raw, node, factory) => formatTransformationArgs('omit', raw, node, factory),
  /* prettier-ignore */
  'xalor.rename':     (raw, node, factory) => formatTransformationArgs('rename', raw, node, factory),
  /* prettier-ignore */
  'xalor.merge':      (raw, node, factory) => formatTransformationArgs('merge', raw, node, factory),
  /* prettier-ignore */
  'xalor.flatten':    (raw, node, factory) => formatTransformationArgs('flatten', raw, node, factory),
} satisfies TProcessorRewriteMap;
