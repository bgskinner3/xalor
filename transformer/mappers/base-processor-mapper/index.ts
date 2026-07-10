// /transformer/mappers/processor-mapper.ts
import type { TProcessorRewriteMap } from '../../types';
import { formatRegistration, formatGenerationArgs } from './base-formatters';
import { formatGuardArgs, formatParseArgs } from './validation-formatters';
import { formatTransformationArgs } from './transformation-formatters';
import { formatMatchArgs } from './match-formatters';

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
  /* prettier-ignore */
  'xalor.register': (raw, node, factory, areaString, shape) => formatRegistration(raw, node, factory, areaString, shape),

  // ========================================================================
  // GENERATION METHODS
  // ========================================================================
  /* prettier-ignore */
  'xalor.default':    (raw, node, factory) => formatGenerationArgs('default', raw, node, factory),

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================
  /* prettier-ignore */
  'xalor.guard':      (raw, node, factory) => formatGuardArgs(raw, node, factory),
  /* prettier-ignore */
  'xalor.parse':      (raw, node, factory) => formatParseArgs(raw, node, factory),

  // ========================================================================
  // TRANSFORMATION METHODS
  // ========================================================================
  /* prettier-ignore */
  'xalor.merge':      (raw, node, factory) => formatTransformationArgs('merge', raw, node, factory),
  /* prettier-ignore */
  'xalor.clone':      (raw, node, factory) => formatTransformationArgs('clone', raw, node, factory),
  // ========================================================================
  // MATCH METHODS
  // ========================================================================
  /* prettier-ignore */
  'xalor.drift':       (raw, node, factory) => formatMatchArgs('drift', raw, node, factory),
} satisfies TProcessorRewriteMap;

/**
 *
 *
 *
 *
 *
 *
 *
 *
 * TODO: REMOVE
 */
// /transformer/mappers/processor-mapper.ts
// import { generateShapeAST } from '../reifiers';
// import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
// import type { TProcessorRewriteMap } from '../types';
// import {
//   formatTransformationArgs,
//   formatGenerationArgs,
//   formatValidationArgs,
//   formatMatchArgs,
// } from '../utils/mapper-helpers';

// /**
//  * PARAMETER REWRITE ROUTER
//  *
//  * ROLE:
//  * Isolated routines formatting exact argument slots per function contract.
//  * Replaces conditional switch/if loops with functional object lookups.
//  */
// export const PROCESSOR_REWRITE_MAPPER: TProcessorRewriteMap = {
//   // ========================================================================
//   // REGISTRATION
//   // ========================================================================
//   'xalor.register': (raw, node, factory, areaString, shape) => {
//     if (!raw || !shape) return [...node.arguments];

//     const metadataExpression = factory.createObjectLiteralExpression([
//       /* prettier-ignore */ factory.createPropertyAssignment('key', factory.createStringLiteral(raw.keyName)),
//       /* prettier-ignore */ factory.createPropertyAssignment('area',factory.createStringLiteral(areaString ?? '')),
//       /* prettier-ignore */ factory.createPropertyAssignment('version', factory.createStringLiteral(IS_SOLID_CONFIG_ITEMS.solidVersion)),
//       /* prettier-ignore */ factory.createPropertyAssignment('shape', generateShapeAST(factory, shape)),
//     ]);
//     return node.arguments.length === 0
//       ? [metadataExpression]
//       : [node.arguments[0], metadataExpression];
//   },
//   // ========================================================================
//   // GENERATION METHODS
//   // ========================================================================
//   /* prettier-ignore */
//   'xalor.default':    (raw, node, factory) => formatGenerationArgs('default', raw, node, factory),

//   // ========================================================================
//   // VALIDATION METHODS
//   // ========================================================================
//   /* prettier-ignore */
//   'xalor.guard':      (raw, node, factory) => formatValidationArgs('guard', raw, node, factory),
//   /* prettier-ignore */
//   'xalor.parse':      (raw, node, factory) => formatValidationArgs('parse', raw, node, factory),

//   // ========================================================================
//   // TRANSFORMATION METHODS
//   // ========================================================================
//   /* prettier-ignore */
//   'xalor.merge':      (raw, node, factory) => formatTransformationArgs('merge', raw, node, factory),
//   /* prettier-ignore */
//   'xalor.clone':      (raw, node, factory) => formatTransformationArgs('clone', raw, node, factory),
//   // ========================================================================
//   // MATCH METHODS
//   // ========================================================================
//   /* prettier-ignore */
//   'xalor.drift':       (raw, node, factory) => formatMatchArgs('drift', raw, node, factory),
// } satisfies TProcessorRewriteMap;
