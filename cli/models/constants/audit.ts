import { SENTRY_TRIGGER_MODES } from '../../../shared';
import { ObjectUtils } from '../../../shared';

/**
 * DRIFT_VARIANCE_CATEGORIES
 * ROLE: Evaluation taxonomy categorizing contract mutations over time.
 * SPECIFICATIONS:
 * - BREAKING_MUTATION: Destructive changes (e.g. primitive type swaps). Forces hard pipeline abort.
 * - COMPATIBLE_ADDITION: Safe extensions (e.g. optional fields). Logs note and passes build.
 * - COMPATIBLE_DELETION: Safe removals (e.g. removing optional fields). Logs note and passes build.
 * - STRICTNESS_STRETCH: Optional to required mutation. Threatens legacy data ingestion; forces pipeline abort.
 * - STRICTNESS_RELAXATION: Required to optional mutation. Safe, backward-compatible; passes build.
 */
export const DRIFT_VARIANCE_CATEGORIES = Object.freeze([
  'BREAKING_MUTATION',
  'COMPATIBLE_ADDITION',
  'COMPATIBLE_DELETION',
  'STRICTNESS_STRETCH',
  'STRICTNESS_RELAXATION',
] as const);

/**
 * COMPLEXITY_TAXONOMY_TOKEN_KEYS
 * ROLE: Non-enumerable engineering tokens mapping predictable runtime processing overheads.
 * SPECIFICATIONS:
 * - FLAT_O1: Primitives only. Fast constant-time microsecond-scale execution memory paths.
 * - LINEAR_ON: Simple arrays or records. Traversal cost scales linearly with arriving payload size.
 * - COMPLEX_ON2: Deeply nested layouts, generic tables, or intersections. High recursive CPU risk.
 */
export const COMPLEXITY_TAXONOMY_TOKEN_KEYS = Object.freeze({
  FLAT_O1: 'O(1) Flat',
  LINEAR_ON: 'O(N) Linear',
  COMPLEX_ON2: 'O(N²) High Risk',
} as const);
/**
 * TELEMETRY_API_TOKEN_NAMES
 *
 * ROLE:
 * A flat, immutable dictionary index containing all valid runtime strategy tokens.
 *
 * STRATEGY:
 * - Single Allocation Flattening: Unrolls grouped dictionary strategies point-free on
 *   boot to build a unified index, completely avoiding recurring lookup loops.
 * - High-Efficiency Crawling: Empowers the Static Distribution Crawler to cross-examine
 *   bundle strings using direct, single-pass matches instead of running multiple loops.
 */
export const TELEMETRY_API_TOKEN_NAMES = Object.freeze(
  ObjectUtils.keys(SENTRY_TRIGGER_MODES).flatMap(
    (key) => SENTRY_TRIGGER_MODES[key],
  ),
);
