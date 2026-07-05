import type {
  TTypeResolverRuleMapper,
  TCompilerDiagnosticMapper,
  TRuntimeApiErrorMapper,
  TXalorMatchDriftErrorMapper,
  TCollisionBorderFailureMapper,
  TCoreMapperType,
} from '../types';
import {
  XALOR_ERROR_AREAS,
  COMPILER_DIAGNOSTIC_RULE_KEYS,
  COLLISION_BORDER_RULE_KEYS,
  TYPE_COMPLIANCE_RULE_KEYS,
  RUNTIME_API_RULE_KEYS,
  XALOR_MATCH_DRIFT_RULE_KEYS,
} from './config';

/**
 * COMPILER_DIAGNOSTIC_FALLBACKS
 * THE CANONICAL FALLBACK TEMPLATE REGISTRY
 *
 * ROLE:
 * A pre-allocated, immutable dictionary dictionary map storing default rule tokens
 * and structural layout text schemas to protect the report generation engine.
 *
 * WHY:
 * Satisfies Commandment I (Single Source of Truth) and Commandment VIII (Internal Efficiency).
 * It strips raw multi-line strings completely out of your execution loops, allowing the
 * scribe to fetch message templates switchlessly via O(1) direct hash key reads.
 */
export const COMPILER_DIAGNOSTIC_FALLBACKS: TCompilerDiagnosticMapper = {
  COMPILER_MECHANICAL_FAULT: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_DIAGNOSTIC_COMPILER,
    rule: COMPILER_DIAGNOSTIC_RULE_KEYS.COMPILER_MECHANICAL_FAULT,
    message: (msg) =>
      `An uncaught mechanical panic collapsed the transformation thread: ${msg ?? 'Unknown AST anomaly.'}\n` +
      `Action: Safeguarding process pipeline variables. Background loop remains active.`,
  },
  GENESIS_HYDRATION_FAULT: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_DIAGNOSTIC_COMPILER,
    rule: COMPILER_DIAGNOSTIC_RULE_KEYS.GENESIS_HYDRATION_FAULT,
    message: (msg) =>
      `Genesis Hydration structural parsing failed: ${msg ?? 'JSON serialization corruption.'}\n` +
      `Action: Resetting local cache parameters. A clean snapshot block will be rewritten on next save.`,
  },
  VAULT_FLUSH_IO_FAULT: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_DIAGNOSTIC_COMPILER,
    rule: COMPILER_DIAGNOSTIC_RULE_KEYS.TEMPLATE_SEED_FAULT,
    message: (msg) =>
      `Cache Shield deployment failure: ${msg ?? 'Access restriction occurred.'}\n` +
      `Check write permissions or process locks on target directories.`,
  },
  AST_GENERATION_ANOMALY: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_DIAGNOSTIC_COMPILER,
    rule: COMPILER_DIAGNOSTIC_RULE_KEYS.AST_GENERATION_ANOMALY,
    message: (kind) =>
      `Code-generation loop intercepted a structural shape kind discrepancy.\n` +
      `Encountered Unknown Kind: "${kind ?? 'undefined'}"\n` +
      `Action: Substituting with a baseline safe 'unknown' primitive fallback schema.`,
  },
  UNKNOWN_API_TRIGGER: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_DIAGNOSTIC_COMPILER,
    rule: COMPILER_DIAGNOSTIC_RULE_KEYS.UNKNOWN_API_TRIGGER,
    message: (method) =>
      `AST Sentry encountered an un-permitted property invocation under the Xalor namespace.\n` +
      `Encountered Invalid Method: "Xalor.${method ?? 'unknown'}"\n` +
      `Action: Aborting metadata extraction for this node. Ensure the target method matches permissible triggers.`,
  },
  COLD_START_INFRASTRUCTURE_FAULT: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_DIAGNOSTIC_COMPILER,
    rule: COMPILER_DIAGNOSTIC_RULE_KEYS.TEMPLATE_SEED_FAULT,
    message: (msg) =>
      `Cold-Start Shield deployment exception: Failed to allocate cache directories.\n🚨 Message: ${msg ?? 'Permission block.'}`,
  },
  TEMPLATE_SEED_FAULT: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_DIAGNOSTIC_COMPILER,
    rule: COMPILER_DIAGNOSTIC_RULE_KEYS.TEMPLATE_SEED_FAULT,
    message: (msg) =>
      `Baseline templates initialization deferred: Failed to copy static snapshot seeds.\n🚨 Message: ${msg ?? 'Access block.'}`,
  },
  GENESIS_STREAM_FAULT: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_DIAGNOSTIC_COMPILER,
    rule: COMPILER_DIAGNOSTIC_RULE_KEYS.GENESIS_STREAM_FAULT,
    message: (msg) =>
      `Safe evacuation triggered on broken snapshot data string stream loop.\n🚨 Message: ${msg ?? 'Stream read interruption.'}`,
  },
  REGISTRATION_REJECTED_BREACH: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_DIAGNOSTIC_COMPILER,
    rule: COMPILER_DIAGNOSTIC_RULE_KEYS.REGISTRATION_REJECTED_BREACH,
    message: (details) =>
      `Xalor Ingestion Filter Gateway explicitly rejected this type registration assignment!\n` +
      `Reason: ${details ?? 'Encountered an un-resolvable, volatile, or non-serializable type contract.'}\n` +
      `Action: Dismissed registration. Convert your data model into a clean, explicit primitive DTO.`,
  },
} satisfies TCompilerDiagnosticMapper;

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * COLLISION_BORDER_FAILURE_MAPPER
 * 🪐 THE COLLISION RADAR TEXT TEMPLATE BLUEPRINTS
 *
 * ROLE:
 * A pre-allocated, immutable dictionary map storing rule identifiers and dynamic
 * message factory closure functions for all validation boundary key collision exceptions.
 */
export const COLLISION_BORDER_FAILURE_MAPPER: TCollisionBorderFailureMapper = {
  SAME_FILE: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_COLLISION_SAME_FILE,
    rule: COLLISION_BORDER_RULE_KEYS.SAME_FILE,
    message: (ctx) =>
      `SAME-FILE DUPLICATION: Key "${ctx.keyName}" is duplicated inside the same file boundary context!\n` +
      `First Declared: [${ctx.historicalArea} ↳ ${ctx.historicalAnchor}]\n` +
      `Duplicated At:  [${ctx.activeArea} ↳ ${ctx.activeAnchor}]\n` +
      `Action: Unique tracking boundaries require distinct string identifiers to avoid cache drifting.`,
  },
  CROSS_FILE: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_COLLISION_CROSS_FILE,
    rule: COLLISION_BORDER_RULE_KEYS.CROSS_FILE,
    message: (ctx) =>
      `CROSS-FILE COLLISION: Unique identifier key "${ctx.keyName}" has been claimed by multiple files!\n` +
      `First Claimed By: [${ctx.initialFilePath} ↳ ${ctx.initialArea}]\n` +
      `Attempted Hijack:  [${ctx.hijackFilePath} ↳ ${ctx.hijackArea}]\n` +
      `Action: Xalor requires unique global keys. Change the target literal string key name.`,
  },
} satisfies TCollisionBorderFailureMapper;

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * TYPE_RESOLVER_RULE_MAPPER
 * 🪐 THE TYPE RESOLVER BOUNDARY EXCEPTION BLUEPRINTS
 *
 * ROLE:
 * A pre-allocated, immutable dictionary map storing structural rule identifiers
 * and context-aware string template factories used to format terminal compiler errors.
 * This structure decouples diagnostic text generation from complex loop traversal.
 */
export const TYPE_RESOLVER_RULE_MAPPER: TTypeResolverRuleMapper = {
  UNBOUND_GENERIC_PARAMETER: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_TYPE_RESOLVER,
    rule: TYPE_COMPLIANCE_RULE_KEYS.UNBOUND_GENERIC_PARAMETER,
    message: (keyName: string) =>
      `Target key '${keyName}' is bound to an abstract uninstantiated generic variable.\n` +
      `Action: You must explicitly pass concrete parameters into your utility type definitions at the registration call-site.`,
  },
  UNBOUND_GENERIC_CONDITIONAL: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_TYPE_RESOLVER,
    rule: TYPE_COMPLIANCE_RULE_KEYS.UNBOUND_GENERIC_CONDITIONAL,
    message: (keyName: string) =>
      `Target key '${keyName}' contains an unresolved conditional type equation branch.\n` +
      `Action: The generic formula must be fully evaluated with concrete types at the registration call-site.`,
  },
  CATASTROPHIC_COMPILER_ERROR: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_TYPE_RESOLVER,
    rule: TYPE_COMPLIANCE_RULE_KEYS.CATASTROPHIC_COMPILER_ERROR,
    message: (keyName: string) =>
      `Target type for key '${keyName}' points to a broken reference that cannot be located by the compiler.\n` +
      `Action: Check for missing file imports, syntax errors, or broken type definitions preceding this call site.`,
  },
  COMPUTATIONAL_COLLAPSE_ANY_NODE: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_TYPE_RESOLVER,
    rule: TYPE_COMPLIANCE_RULE_KEYS.COMPUTATIONAL_COLLAPSE_ANY_NODE,
    message: (keyName: string) =>
      `Target type equation for key '${keyName}' failed to resolve and collapsed into a blank 'any' node.\n` +
      `Reason: This indicates infinite recursion traps or breaching TypeScript's structural compilation depth limits.`,
  },
  COMPUTATIONAL_COLLAPSE_RECURSIVE_LOOP: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_TYPE_RESOLVER,
    rule: TYPE_COMPLIANCE_RULE_KEYS.COMPUTATIONAL_COLLAPSE_RECURSIVE_LOOP,
    message: (keyName: string, aliasName?: string) =>
      `Target type alias '${aliasName}' for key '${keyName}' contains an un-terminated recursive loop calculation.\n` +
      `Action: Aborted compilation tracking pass to safeguard call stack integrity frameworks.`,
  },
  TERMINAL_CONTRADICTION: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_TYPE_RESOLVER,
    rule: TYPE_COMPLIANCE_RULE_KEYS.TERMINAL_CONTRADICTION,
    message: (keyName: string) =>
      `Target key '${keyName}' resolved directly to a terminal 'never' state.\n` +
      `Reason: This indicates a contradictory root-level intersection (e.g., string & number) which can never hold data.`,
  },

  // Unique Rule String: 'unserializable_executable'
  UNSERIALIZABLE_EXECUTABLE: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_TYPE_RESOLVER,
    rule: TYPE_COMPLIANCE_RULE_KEYS.UNSERIALIZABLE_EXECUTABLE,
    message: (keyName: string) =>
      `Target key '${keyName}' contains executable function parameters, class constructors, or unique runtime Symbols.\n` +
      `Action: Xalor enforces pure data schemas. Remove dynamic methods from your type definitions before registration.`,
  },

  // Unique Rule String: 'open_index_signature'
  OPEN_INDEX_SIGNATURE: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_TYPE_RESOLVER,
    rule: TYPE_COMPLIANCE_RULE_KEYS.OPEN_INDEX_SIGNATURE,
    message: (keyName: string) =>
      `Target structure for key '${keyName}' utilizes an open-ended index dictionary signature.\n` +
      `Action: Xalor requires explicit object property layouts. Convert your mapping to an explicit record schema layout.`,
  },
  INVALID_TYPE_CONTRACT: {
    errorArea: XALOR_ERROR_AREAS.TRANSFORMER_TYPE_RESOLVER,
    rule: TYPE_COMPLIANCE_RULE_KEYS.INVALID_TYPE_CONTRACT,
    message: (keyName: string) =>
      `TYPE CONTRACT VIOLATION: Registration for key '${keyName}' was rejected by the Xalor type resolver.\n` +
      `Reason: The provided type is structurally valid in TypeScript, but violates Xalor's enforced schema contract rules.\n` +
      `This indicates a mismatch between declared type shape and the expected registry-bound contract definition.\n` +
      `Action: Refactor the type into a strict DTO-compliant structure with explicit, serializable properties and re-register the schema.`,
  },
} satisfies TTypeResolverRuleMapper;

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * ⚙️ RUNTIME_API_RULE_MAPPER
 *
 * ROLE:
 * Central registry of runtime validation failure states produced by the Xalor
 * runtime schema enforcement engine.
 *
 * This mapper is responsible for translating low-level runtime validation
 * results into structured, human-readable diagnostic messages with:
 * - explicit execution context (path, expected, received)
 * - deterministic rule classification
 * - system-actionable remediation guidance
 *
 * ARCHITECTURAL POSITION:
 * This layer operates post-compilation and post-transformer execution.
 * It validates concrete runtime values against pre-compiled schema contracts
 * stored in the Xalor Vault.
 *
 * FAILURE DOMAIN:
 * Runtime API violations occur when incoming data violates structural or
 * contractual expectations defined by compiled schemas, including:
 * - missing or unregistered schema keys
 * - missing or corrupted vault entries
 * - primitive/type mismatches
 * - structural contract violations (union/intersection failures)
 * - schema boundary enforcement errors
 *
 */
export const RUNTIME_API_RULE_MAPPER: TRuntimeApiErrorMapper = {
  MISSING_KEY_PRESENCE: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_API,
    rule: RUNTIME_API_RULE_KEYS.MISSING_KEY_PRESENCE,
    message: (ctx) =>
      `REQUIRED KEY NOT PROVIDED: Validation could not locate a registered schema for '${ctx.path}'.\n` +
      `Reason: The requested root key was never supplied to the runtime validation engine.\n` +
      `Action: Ensure the key is registered with Xalor before attempting validation.`,
  },

  MISSING_FROM_VAULT: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_API,
    rule: RUNTIME_API_RULE_KEYS.MISSING_FROM_VAULT,
    message: (ctx) =>
      `SCHEMA LOOKUP FAILURE: No compiled schema exists for '${ctx.path}'.\n` +
      `Reason: The requested schema is absent from the internal vault or failed to register successfully.\n` +
      `Action: Verify that the registration completed successfully before performing runtime validation.`,
  },

  PRIMITIVE_MISMATCH: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_API,
    rule: RUNTIME_API_RULE_KEYS.PRIMITIVE_MISMATCH,
    message: (ctx) =>
      `PRIMITIVE TYPE MISMATCH: Runtime value at '${ctx.path}' does not satisfy the expected primitive contract.\n` +
      `Expected: ${ctx.expected}\n` +
      `Received: ${ctx.received}\n` +
      `Action: Supply a value matching the declared primitive type.`,
  },

  LITERAL_MISMATCH: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_API,
    rule: RUNTIME_API_RULE_KEYS.LITERAL_MISMATCH,
    message: (ctx) =>
      `LITERAL VALUE MISMATCH: Runtime value at '${ctx.path}' does not match the required literal.\n` +
      `Expected: ${ctx.expected}\n` +
      `Received: ${ctx.received}\n` +
      `Action: Provide the exact literal value defined by the schema.`,
  },

  INTERSECTION_BREACHED: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_API,
    rule: RUNTIME_API_RULE_KEYS.INTERSECTION_BREACHED,
    message: (_ctx) =>
      `INTERSECTION CONSTRAINT VIOLATION: Runtime value failed one or more required intersection members.\n` +
      `Reason: Every constituent type within an intersection must be satisfied simultaneously.\n` +
      `Action: Ensure the supplied value fulfills all intersected type requirements.`,
  },

  DEPTH_OVERFLOW: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_API,
    rule: RUNTIME_API_RULE_KEYS.DEPTH_OVERFLOW,
    message: (_ctx) =>
      `VALIDATION DEPTH LIMIT EXCEEDED: Traversal exceeded the maximum recursive inspection depth.\n` +
      `Reason: The object graph is excessively deep or contains recursive structures that exceeded safety limits.\n` +
      `Action: Simplify the data structure or increase the configured recursion depth if appropriate.`,
  },

  UNION_EXHAUSTED: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_API,
    rule: RUNTIME_API_RULE_KEYS.UNION_EXHAUSTED,
    message: (ctx) =>
      `UNION MATCH FAILURE: Runtime value did not satisfy any candidate member of the declared union.\n` +
      `Expected: ${ctx.expected}\n` +
      `Received: ${ctx.received}\n` +
      `Action: Supply a value matching one of the supported union variants.`,
  },

  EXCESS_PROPERTY: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_API,
    rule: RUNTIME_API_RULE_KEYS.EXCESS_PROPERTY,
    message: (ctx) =>
      `UNEXPECTED PROPERTY DETECTED: Runtime object contains properties that are not declared by the schema.\n` +
      `Location: ${ctx.path}\n` +
      `Action: Remove the unknown property or extend the schema to explicitly support it.`,
  },

  MISSING_PROPERTY: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_API,
    rule: RUNTIME_API_RULE_KEYS.MISSING_PROPERTY,
    message: (ctx) =>
      `REQUIRED PROPERTY MISSING: Runtime object is missing a required property.\n` +
      `Location: ${ctx.path}\n` +
      `Expected: ${ctx.expected}\n` +
      `Action: Supply the missing property with a value that satisfies the declared schema.`,
  },
} satisfies TRuntimeApiErrorMapper;

/**
 * 🚨 XALOR DRIFT ECOSYSTEM ERROR LEDGER
 *
 * Centralized dictionary of authoritative structural exceptions.
 * Enforces Commandment VI by providing deterministic, highly traceable diagnostics.
 *
 * @key MALFORMED_NON_RECORD_PAYLOAD       - Triggered when the initial runtime ingress receives a non-object payload block.
 * @key ANCESTRAL_KEY_MISSING_FROM_VAULT   - Triggered when the assigned ancestralKey literal cannot be found within the Xalethor registry.
 * @key UNEXPECTED_STREAM_COLLAPSE         - Triggered when all upstream validation configurations and runtime pathways fail verification.
 * @key MIGRATION_MUTATION_VIOLATION       - Triggered when a developer's custom migration upcaster block produces a corrupted modern shape layout.
 * @key MISSING_COMPILED_INFRASTRUCTURE    - Triggered if the runtime ingress portal is invoked without necessary metadata context layers injected.
 */

export const XALOR_MATCH_DRIFT_ERROR_MAPPER: TXalorMatchDriftErrorMapper = {
  MALFORMED_NON_RECORD_PAYLOAD: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_MATCH_DRIFT,
    rule: XALOR_MATCH_DRIFT_RULE_KEYS.MALFORMED_NON_RECORD_PAYLOAD,
    message: () =>
      `MATCH DRIFT ENTRY FAILURE: The supplied payload is not a valid object record and cannot participate in structural lineage evaluation.\n` +
      `Reason: matchXalorDrift compares object blueprints against both the current and ancestral schemas. Primitive values, arrays, null, or malformed payloads cannot be traversed.\n` +
      `Action: Pass a plain object representing a serialized data contract before invoking the migration gateway.`,
  },

  ANCESTRAL_KEY_MISSING_FROM_VAULT: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_MATCH_DRIFT,
    rule: XALOR_MATCH_DRIFT_RULE_KEYS.ANCESTRAL_KEY_MISSING_FROM_VAULT,
    message: () =>
      `ANCESTRAL BLUEPRINT NOT FOUND: The requested historical blueprint could not be located within the compiled Blueprint Vault.\n` +
      `Reason: The configured ancestralKey was never registered, was removed during compilation, or the generated snapshot is stale.\n` +
      `Action: Verify the ancestor registration, rebuild the project, and ensure the generated vault snapshot is synchronized with the current source tree.`,
  },

  UNEXPECTED_STREAM_COLLAPSE: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_MATCH_DRIFT,
    rule: XALOR_MATCH_DRIFT_RULE_KEYS.UNEXPECTED_STREAM_COLLAPSE,
    message: () =>
      `MATCH DRIFT EXECUTION FAILURE: An unexpected internal failure interrupted the migration evaluation pipeline.\n` +
      `Reason: The runtime encountered an unrecoverable execution state while validating lineage or executing migration control flow.\n` +
      `Action: Inspect the originating exception, verify the generated metadata, and report the failure if it persists.`,
  },

  MIGRATION_MUTATION_VIOLATION: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_MATCH_DRIFT,
    rule: XALOR_MATCH_DRIFT_RULE_KEYS.MIGRATION_MUTATION_VIOLATION,
    message: () =>
      `MIGRATION CONTRACT VIOLATION: The migration callback produced a payload that does not satisfy the destination blueprint.\n` +
      `Reason: Every migration must upcast legacy data into a structure that completely conforms to the current registered schema.\n` +
      `Action: Review the migration logic and populate all required properties before returning the transformed object.`,
  },

  MISSING_COMPILED_INFRASTRUCTURE: {
    errorArea: XALOR_ERROR_AREAS.RUNTIME_MATCH_DRIFT,
    rule: XALOR_MATCH_DRIFT_RULE_KEYS.MISSING_COMPILED_INFRASTRUCTURE,
    message: () =>
      `COMPILED METADATA UNAVAILABLE: matchXalorDrift executed without the required build-time lineage metadata.\n` +
      `Reason: The Xalor compiler transformer did not emit the migration registry or the compiled snapshot could not be located at runtime.\n` +
      `Action: Enable the Xalor transformer plugin, perform a clean rebuild, and confirm the generated Blueprint Vault artifacts are available before execution.`,
  },
} satisfies TXalorMatchDriftErrorMapper;

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

export const CORE_MAPPER_TABLE: TCoreMapperType = {
  /* prettier-ignore */ 'RUNTIME_API': RUNTIME_API_RULE_MAPPER,
  /* prettier-ignore */ 'TRANSFORMER_DIAGNOSTIC_COMPILER': COMPILER_DIAGNOSTIC_FALLBACKS,
  /* prettier-ignore */ 'TRANSFORMER_COLLISION_SAME_FILE': COLLISION_BORDER_FAILURE_MAPPER.SAME_FILE,
  /* prettier-ignore */ 'TRANSFORMER_COLLISION_CROSS_FILE': COLLISION_BORDER_FAILURE_MAPPER.CROSS_FILE,
  /* prettier-ignore */ 'TRANSFORMER_TYPE_RESOLVER': TYPE_RESOLVER_RULE_MAPPER,
  /* prettier-ignore */ 'RUNTIME_MATCH_DRIFT': XALOR_MATCH_DRIFT_ERROR_MAPPER,
} satisfies TCoreMapperType;

export const ALL_MAPPER_RULES = {
  ...XALOR_MATCH_DRIFT_ERROR_MAPPER,
  ...RUNTIME_API_RULE_MAPPER,
  ...COMPILER_DIAGNOSTIC_FALLBACKS,
  ...COLLISION_BORDER_FAILURE_MAPPER,
  ...TYPE_RESOLVER_RULE_MAPPER,
};
