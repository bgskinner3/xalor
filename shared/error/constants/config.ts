import type { TModeRouter } from '../types/base';
import type { TRuntimeApiErrorRules } from '../types';
/**
 * COMPILER_DIAGNOSTIC_RULE_KEYS
 *
 * ROLE:
 * Central registry of compiler-level structural and transformation failure states.
 *
 * These rules represent failures that occur during:
 * - AST transformation
 * - build-time validation
 * - codegen execution
 * - vault snapshot compilation
 *
 * NOTE:
 * Some rules intentionally map multiple failure keys to the same underlying rule
 * (e.g. filesystem_lock, snapshot_corruption). This reflects shared root failure domains.
 */
export const COMPILER_DIAGNOSTIC_RULE_KEYS = Object.freeze({
  COMPILER_MECHANICAL_FAULT: 'mechanical_collapse',
  GENESIS_HYDRATION_FAULT: 'snapshot_corruption',
  VAULT_FLUSH_IO_FAULT: 'filesystem_lock',
  AST_GENERATION_ANOMALY: 'codegen_discrepancy',
  UNKNOWN_API_TRIGGER: 'invalid_trigger_signature',
  COLD_START_INFRASTRUCTURE_FAULT: 'filesystem_lock',
  TEMPLATE_SEED_FAULT: 'filesystem_lock',
  GENESIS_STREAM_FAULT: 'snapshot_corruption',
  REGISTRATION_REJECTED_BREACH: 'invalid_type_contract',
} as const);

/**
 * COLLISION_BORDER_RULE_KEYS
 *
 * ROLE:
 * Defines structural identity collision states detected during compilation or mapping.
 *
 * These errors occur when:
 * - duplicate keys exist within a single compilation scope
 * - multiple files claim the same logical identifier
 *
 * NOTE:
 * Both entries map to the same rule because the failure domain is identical
 * (terminal contradiction of identity uniqueness constraints).
 */
export const COLLISION_BORDER_RULE_KEYS = Object.freeze({
  SAME_FILE: 'terminal_contradiction',
  CROSS_FILE: 'terminal_contradiction',
} as const);

/**
 * 🔬 ARCHITECTURAL EXPLANATION OF THE RULES SUITE:
 *
 * 1. UNBOUND_GENERIC (TypeFlags.TypeParameter & TypeFlags.Conditional)
 *    - Abstract type parameters (`T`, `U`) and deferred, un-evaluated conditional type expressions
 *      do not represent concrete shapes—they are lazy type-level instructions. The compiler cannot
 *      calculate a permanent, content-addressed fingerprint hash or map concrete properties for a
 *      layout whose properties do not yet exist. This rule forces developers to bind variables
 *      to real definitions at the call-site so the system has static shapes to freeze.
 *
 * 2. CATASTROPHIC_COMPILER_ERROR (TypeFlags.Any with missing symbol metadata)
 *    - When the TypeScript compiler thread hits a catastrophic syntax error, an invalid cross-file
 *      reference, or a broken missing import preceding our call-site, it silently converts that
 *      broken token into an internal Intrinsic Error Type flagged as `Any`. If left unchecked, this
 *      phantom state slips through object loops and writes a hollow, completely corrupted type mask
 *      of "any" straight into the production database. This rule isolates and blocks compilation
 *      failures immediately.
 *
 * 3. COMPUTATIONAL_COLLAPSE (TypeFlags.Any with non-any symbol metadata)
 *    - Catches structural breakdowns where complex utility types or recursive conditional loops
 *      exceed TypeScript's maximum internal evaluation depth boundaries or trigger tail-call stack
 *      overflow traps. When this boundary is crossed, the compiler engine gives up processing and
 *      collapses the entire type down into a blank error state. This check traps the collapse to
 *      prevent empty or broken blueprints from infecting the application.
 *
 * 4. TERMINAL_CONTRADICTION (TypeFlags.Never)
 *    - Traps impossible type program expressions and primitive contradictions authored at the root
 *      registration level (such as intersected scalars like `string & number`). Because a value can
 *      never simultaneously satisfy conflicting primitive layout rules, this structure resolves
 *      directly to a root `never` state. If serialized, it creates an un-verifiable runtime schema
 *      that automatically rejects all incoming structural payloads.
 *
 * 5. UNSERIALIZABLE_EXECUTABLE (Call/Construct Signatures & TypeFlags.ESSymbol)
 *    - Enforces pure data serialization boundaries. Raw runtime execution methods, class constructors,
 *      and active JavaScript `symbol` properties contain fluid, live instructions and unique memory
 *      addresses that cannot be represented as static, hidden JSON literal metadata sheets. This check
 *      filters them out entirely to keep the registry clean, data-only, and completely tree-shakeable.
 *
 * 6. OPEN_INDEX_SIGNATURE (TypeFlags.Object with active Index Infos but zero static properties)
 *    - Detects completely open-ended dictionary signatures (such as `{ [key: string]: number }`) that
 *      completely lack explicit keys. Because there are no discrete, named property symbols for the
 *      reifier to unroll into structural keys, it represents an infinite map rather than a concrete data
 *      structure. This filter blocks open index sheets, ensuring the developer converts their layout
 *      to an explicit, bounded schema record before registration.
 * 7. INVALID_TYPE_CONTRACT (Structural Schema Contract Violation)
 * - Triggered when a type definition is structurally valid in isolation
 *   but violates the expected contract boundary enforced by the registry system.
 * - This includes:
 *   • mismatched DTO shape expectations
 *   • invalid registry registration payloads
 *   • schema drift between declared and inferred types
 *   • violation of required interface contracts at registration time
 *
 * - Unlike TERMINAL_CONTRADICTION (impossible type), this represents
 *   a *valid TypeScript type that is semantically illegal in Xalor's system design layer*.
 *
 * 8. MISSING_PROPERTY (Structural Under-Specification Failure)
 * - Occurs when a required property defined in the schema contract
 *   is absent from the evaluated object structure.
 * - Unlike runtime API validation, this represents a *schema-level expectation failure*
 *   where the declared blueprint cannot be satisfied by the input object.
 */
export const TYPE_COMPLIANCE_RULE_KEYS = Object.freeze({
  UNBOUND_GENERIC_PARAMETER: 'unbound_generic',
  UNBOUND_GENERIC_CONDITIONAL: 'unbound_generic',
  CATASTROPHIC_COMPILER_ERROR: 'catastrophic_compiler_error',
  COMPUTATIONAL_COLLAPSE_ANY_NODE: 'computational_collapse',
  COMPUTATIONAL_COLLAPSE_RECURSIVE_LOOP: 'computational_collapse',
  TERMINAL_CONTRADICTION: 'terminal_contradiction',
  UNSERIALIZABLE_EXECUTABLE: 'unserializable_executable',
  OPEN_INDEX_SIGNATURE: 'open_index_signature',
  INVALID_TYPE_CONTRACT: 'invalid_type_contract',
} as const);
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

export const CORE_CONFIG_RULE_KEYS = Object.freeze({
  COMPILER_DIAGNOSTIC: COMPILER_DIAGNOSTIC_RULE_KEYS,
  COLLISION_BORDER: COLLISION_BORDER_RULE_KEYS,
  TYPE_COMPLIANCE: TYPE_COMPLIANCE_RULE_KEYS,
  RUNTIME_API: RUNTIME_API_RULE_KEYS,
  XALOR_MATCH_DRIFT: XALOR_MATCH_DRIFT_RULE_KEYS,
} as const);

/**
 * 🧭 XALOR_ERROR_AREAS
 *
 * ROLE:
 * High-level classification system for grouping all Xalor errors into execution domains.
 *
 * These values are used for:
 * - logging segmentation
 * - telemetry grouping
 * - UI filtering
 * - diagnostics routing
 *
 * Each area represents a top-level subsystem boundary inside the Xalor architecture.
 */
export const XALOR_ERROR_AREAS = Object.freeze({
  TRANSFORMER_DIAGNOSTIC_COMPILER: 'transformer_diagnostic_compiler',
  RUNTIME_API: 'runtime_api',
  TRANSFORMER_COLLISION_SAME_FILE: 'transformer_collision_same_file',
  TRANSFORMER_COLLISION_CROSS_FILE: 'transformer_collision_cross_file',
  TRANSFORMER_TYPE_RESOLVER: 'transformer_type_resolver',
  RUNTIME_MATCH_DRIFT: 'runtime_match_drift',
} as const);
/**
 * 🪐 TRANSFORMER EXECUTION MODE ROUTER (The Visual Lane Allocator)
 *
 * ROLE:
 * A high-speed, compile-time switchless mapping registry that translates active
 * transformer toolchain execution vectors into deterministic visualization layout modes.
 *
 * STRATEGY:
 * Bypasses sequential procedural if/else branching and switch metrics entirely.
 * By anchoring input environments directly to target layout keys ('hard' vs 'watch')
 * via a frozen object literal dictionary record, it guarantees an instantaneous,
 * constant-time O(1) hash table lookup on the execution stack frame.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation Rule) and Commandment VIII (Internal Efficiency).
 * It isolates environmental state evaluation mechanics away from the printing pipelines,
 * executing with absolute zero heap memory allocations or runtime closure overheads
 * during rapid development hot-module-replacement (HMR) save sweeps.
 */
export const REPORT_SERVICE_MODE_ROUTER: TModeRouter = {
  vacuum: 'hard',
  compile: 'hard',
  watch: 'watch',
  studio: 'watch',
} satisfies TModeRouter;
/**
 * 🪐 RUNTIME_API_MESSAGE_KEYWORD_RULES
 *
 * ROLE:
 * A high-speed, compile-time switchless keyword mapping registry that translates
 * raw diagnostic validation strings into deterministic runtime rule categories.
 *
 * STRATEGY:
 * Bypasses sequential procedural if/else branching, heavy dynamic regex scanning,
 * and switch metrics entirely. By anchoring known error keyword signatures directly
 * to target rule tags (e.g., 'depth' ──► 'depth_overflow') via an immutable, flat
 * tuple array dictionary, it guarantees a predictable, constant-time scan layout
 * across the execution stack frame.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation Rule) and Commandment VIII (Internal Efficiency).
 * It isolates raw validation text scanning mechanics away from the formatting and reporting
 * pipelines. This enables the engine to process low-level text errors generated by all 10
 * core TSolidShape AST variants with absolute zero heap memory allocations or runtime string
 * duplication overheads during active ingestion sweeps.
 *
 * INVARIANT:
 * Zero allocations inside hot paths. Elements must be carefully sorted so that highly
 * specific structural key phrases take positional precedence over broad fallback tokens.
 */
/* prettier-ignore */
export const RUNTIME_API_MESSAGE_KEYWORD_RULES: readonly (readonly [string, TRuntimeApiErrorRules])[] = [
  /* prettier-ignore */ ['depth', 'depth_overflow'],
  /* prettier-ignore */ ['maxdepth', 'depth_overflow'],
  /* prettier-ignore */ ['missing from vault', 'missing_from_vault'],
  /* prettier-ignore */ ['registered shape', 'missing_from_vault'],
  /* prettier-ignore */ ['missing_key_presence', 'missing_key_presence'],
  /* prettier-ignore */ ['missing blueprint', 'missing_key_presence'],
  /* prettier-ignore */ ['missing', 'missing_property'],
  /* prettier-ignore */ ['excess_property', 'excess_property'],
  /* prettier-ignore */ ['excess', 'excess_property'],
  /* prettier-ignore */ ['union', 'union_exhausted'],
  /* prettier-ignore */ ['intersection', 'intersection_breached'],
  /* prettier-ignore */ ['literal', 'literal_mismatch'],
  /* prettier-ignore */ ['invalid_key_format', 'invalid_key_format'],
  /* prettier-ignore */ ['pattern', 'invalid_key_format'],
  /* prettier-ignore */ ['parameters', 'function_mismatch'],
  /* prettier-ignore */ ['signature', 'function_mismatch'],
  /* prettier-ignore */ ['instanceof', 'instance_mismatch'],
  /* prettier-ignore */ ['resolveinstancector', 'instance_mismatch'],
  /* prettier-ignore */ ['brand', 'brand_constraint_violation'],
  /* prettier-ignore */ ['refinement', 'brand_constraint_violation'],
  /* prettier-ignore */ ['returntype', 'function_returns_violation'],
  /* prettier-ignore */ ['return', 'function_returns_violation'],
  /* prettier-ignore */ ['maxlength', 'collection_bounds_exceeded'],
  /* prettier-ignore */ ['minlength', 'collection_bounds_exceeded'],
  /* prettier-ignore */ ['tuple', 'collection_bounds_exceeded'],
] satisfies readonly (readonly [string, TRuntimeApiErrorRules])[];
