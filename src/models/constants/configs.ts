/**
 * ⚙️ RUNTIME_API_RULE_KEYS
 *
 * ROLE:
 * Defines runtime validation failure states encountered during schema enforcement.
 *
 * These rules occur when:
 * - runtime data violates structural contracts
 * - expected schema fields are missing or mismatched
 * - union/intersection constraints fail evaluation
 * - depth or traversal limits are exceeded
 *
 * NOTE:
 * These are execution-time errors (post-compilation validation layer).
 */
export const RUNTIME_API_RULE_KEYS = Object.freeze({
  MISSING_KEY_PRESENCE: 'missing_key_presence',
  MISSING_FROM_VAULT: 'missing_from_vault',
  PRIMITIVE_MISMATCH: 'primitive_mismatch',
  LITERAL_MISMATCH: 'literal_mismatch',
  INTERSECTION_BREACHED: 'intersection_breached',
  DEPTH_OVERFLOW: 'depth_overflow',
  UNION_EXHAUSTED: 'union_exhausted',
  EXCESS_PROPERTY: 'excess_property',
  MISSING_PROPERTY: 'missing_property',

  INVALID_KEY_FORMAT: 'invalid_key_format',
  FUNCTION_MISMATCH: 'function_mismatch',
  INSTANCE_MISMATCH: 'instance_mismatch',

  // Advanced Constraint Keys
  BRAND_CONSTRAINT_VIOLATION: 'brand_constraint_violation',
  FUNCTION_RETURNS_VIOLATION: 'function_returns_violation',
  COLLECTION_BOUNDS_EXCEEDED: 'collection_bounds_exceeded',
} as const);

/**
 * 🌊 XALOR_MATCH_DRIFT_RULE_KEYS
 *
 * ROLE:
 * Defines structural versioning and schema migration failure states.
 *
 * These rules occur in the matchXalorDrift system when:
 * - legacy payloads cannot be mapped to current schemas
 * - ancestral blueprint metadata is missing or invalid
 * - migration transformations violate target schema constraints
 * - compiled transformation infrastructure is unavailable
 *
 * NOTE:
 * This layer is responsible for backward-compatible schema evolution across system versions.
 */
export const XALOR_MATCH_DRIFT_RULE_KEYS = Object.freeze({
  MALFORMED_NON_RECORD_PAYLOAD: 'malformed_non_record_payload',
  ANCESTRAL_KEY_MISSING_FROM_VAULT: 'ancestral_key_missing_from_vault',
  UNEXPECTED_STREAM_COLLAPSE: 'unexpected_stream_collapse',
  MIGRATION_MUTATION_VIOLATION: 'migration_mutation_violation',
  MISSING_COMPILED_INFRASTRUCTURE: 'missing_compiled_infrastructure',
} as const);
