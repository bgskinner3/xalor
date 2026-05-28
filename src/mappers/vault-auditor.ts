import type { TRuleAuditorMapper } from '../models/types';

/**
 * ============================================================================
 * DIAGNOSTIC ENGINE MAPPER: RULE MATCHERS MATRIX
 * ============================================================================
 *
 * ROLE:
 * The "Classifier." Converts unstructured runtime validation error text strings
 * into deterministic, strongly typed error category enums. It acts as the primary
 * translator layer for the Auditor Layer (Category 2 Validation API - Soft Fails).
 */
export const RULE_KEYWORDS_MAP: TRuleAuditorMapper = {
  missing: 'missing_property',
  required: 'missing_property',
  literal: 'literal_mismatch',
  excess: 'excess_property',
  stray: 'excess_property',
  union: 'union_exhausted',
  overflow: 'depth_overflow',
  depth: 'depth_overflow',
  intersection: 'intersection_breached',
  primitive: 'primitive_mismatch',
  type: 'primitive_mismatch',
} satisfies TRuleAuditorMapper;
