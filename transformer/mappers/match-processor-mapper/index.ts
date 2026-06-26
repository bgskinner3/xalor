import type { TMatchProcessorMapper } from '../../types';
import { xalorCentralContext } from '../../service';
import { extractLiteralStringFromProperty } from './helpers';
import ts from 'typescript';

/**
 * ============================================================================
 * PARAMETER REWRITE MATCH ROUTER (CATEGORY 5 MATCH HANDLERS)
 * ============================================================================
 *
 * ROLE:
 * The "Evolution Matrix Gateway." Intercepts, structures, and maps all variant
 * runtime matching methods (such as drift version bridges) during the AST sweep.
 * Completely replaces procedural conditional loops with functional object lookups.
 *
 * STRATEGY:
 * - Local AST Property Extraction: Sweeps through the local arguments context object
 *   literal expression sitting in memory without triggering intensive global type files
 *   or Symbol table lookups.
 * - In-Memory Linage Harvesting: Registers plaintext contemporary and optional ancestral
 *   registry identifiers straight into the volatile `driftRegistry` context store.
 * - Point-Free Bytecode Injection: Appends individual string literals directly onto the
 *   emitted target production JavaScript parameters layout array payload.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation Rule) and Commandment VIII (Internal Efficiency).
 * Delegates multi-generational lifecycle mapping processing out-of-band during the visitor
 * pass at hardware-level speeds. This prepares the system for a flat, high-velocity single-pass
 * linear verification routine at runtime with zero client-side engine parsing overhead.
 */
export const MATCH_PROCESSOR_MAPPER: TMatchProcessorMapper = {
  drift: (raw, node, factory) => {
    const evolutionToken = raw.keyName;
    const configObjectArg = node.arguments[1];

    if (configObjectArg && ts.isObjectLiteralExpression(configObjectArg)) {
      let currentKey = '';
      let ancestralKey = '';

      // Clean, zero-allocation pass over properties using our new compilation extraction utility
      for (const property of configObjectArg.properties) {
        currentKey ||=
          extractLiteralStringFromProperty(property, 'currentKey') ?? '';
        ancestralKey ||=
          extractLiteralStringFromProperty(property, 'ancestralKey') ?? '';
      }

      if (currentKey && evolutionToken) {
        xalorCentralContext.addDriftLineage(evolutionToken, {
          currentKey,
          ancestorKey: ancestralKey,
        });

        const liveKeyLiteral = factory.createStringLiteral(currentKey);
        const oldKeyLiteral = factory.createStringLiteral(ancestralKey);

        return [...node.arguments, liveKeyLiteral, oldKeyLiteral];
      }
    }
    return [...node.arguments];
  },
} satisfies TMatchProcessorMapper;
