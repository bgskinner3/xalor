import { RUNTIME_API_RULE_KEYS, XALOR_MATCH_DRIFT_RULE_KEYS } from './configs';
import {
  TRuntimeApiErrorMapper,
  TXalorMatchDriftErrorMapper,
  TRuntimeSHapeValidatorErrorMapper,
  TRuntimeShapeValidationErrorKey,
  TRuntimeApiErrorRules,
} from '../types/error-types';

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
export const XALOR_MATCH_ERROR_MESSAGES = {
  MALFORMED_NON_RECORD_PAYLOAD:
    'Execution stream collapse: Malformed non-record payload fallback failed.',

  ANCESTRAL_KEY_MISSING_FROM_VAULT:
    'Execution stream collapse: Ancestral tracking key is missing or malformed inside the Blueprint Vault.',

  UNEXPECTED_STREAM_COLLAPSE:
    'Unexpected execution stream collapse inside matchXalorDrift boundary.',

  MIGRATION_MUTATION_VIOLATION:
    'Evolution upcast failed: Transformed payload layout violates modern type parameters.',

  MISSING_COMPILED_INFRASTRUCTURE:
    "Gateway block: 'matchXalorDrift' executed without compiled metadata properties. Ensure your build-time transformer plugin is active.",
} as const;

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
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.MISSING_KEY_PRESENCE,
    message: (ctx) =>
      `REQUIRED KEY NOT PROVIDED: Validation could not locate a registered schema for '${ctx.path}'.\n` +
      `Reason: The requested root key was never supplied to the runtime validation engine.\n` +
      `Action: Ensure the key is registered with Xalor before attempting validation.`,
  },

  MISSING_FROM_VAULT: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.MISSING_FROM_VAULT,
    message: (ctx) =>
      `SCHEMA LOOKUP FAILURE: No compiled schema exists for '${ctx.path}'.\n` +
      `Reason: The requested schema is absent from the internal vault or failed to register successfully.\n` +
      `Action: Verify that the registration completed successfully before performing runtime validation.`,
  },

  PRIMITIVE_MISMATCH: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.PRIMITIVE_MISMATCH,
    message: (ctx) =>
      `PRIMITIVE TYPE MISMATCH: Runtime value at '${ctx.path}' does not satisfy the expected primitive contract.\n` +
      `Expected: ${ctx.expected}\n` +
      `Received: ${ctx.received}\n` +
      `Action: Supply a value matching the declared primitive type.`,
  },

  LITERAL_MISMATCH: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.LITERAL_MISMATCH,
    message: (ctx) =>
      `LITERAL VALUE MISMATCH: Runtime value at '${ctx.path}' does not match the required literal.\n` +
      `Expected: ${ctx.expected}\n` +
      `Received: ${ctx.received}\n` +
      `Action: Provide the exact literal value defined by the schema.`,
  },

  INTERSECTION_BREACHED: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.INTERSECTION_BREACHED,
    message: (_ctx) =>
      `INTERSECTION CONSTRAINT VIOLATION: Runtime value failed one or more required intersection members.\n` +
      `Reason: Every constituent type within an intersection must be satisfied simultaneously.\n` +
      `Action: Ensure the supplied value fulfills all intersected type requirements.`,
  },

  DEPTH_OVERFLOW: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.DEPTH_OVERFLOW,
    message: (_ctx) =>
      `VALIDATION DEPTH LIMIT EXCEEDED: Traversal exceeded the maximum recursive inspection depth.\n` +
      `Reason: The object graph is excessively deep or contains recursive structures that exceeded safety limits.\n` +
      `Action: Simplify the data structure or increase the configured recursion depth if appropriate.`,
  },

  UNION_EXHAUSTED: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.UNION_EXHAUSTED,
    message: (ctx) =>
      `UNION MATCH FAILURE: Runtime value did not satisfy any candidate member of the declared union.\n` +
      `Expected: ${ctx.expected}\n` +
      `Received: ${ctx.received}\n` +
      `Action: Supply a value matching one of the supported union variants.`,
  },

  EXCESS_PROPERTY: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.EXCESS_PROPERTY,
    message: (ctx) =>
      `UNEXPECTED PROPERTY DETECTED: Runtime object contains properties that are not declared by the schema.\n` +
      `Location: ${ctx.path}\n` +
      `Action: Remove the unknown property or extend the schema to explicitly support it.`,
  },

  MISSING_PROPERTY: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.MISSING_PROPERTY,
    message: (ctx) =>
      `REQUIRED PROPERTY MISSING: Runtime object is missing a required property.\n` +
      `Location: ${ctx.path}\n` +
      `Expected: ${ctx.expected}\n` +
      `Action: Supply the missing property with a value that satisfies the declared schema.`,
  },
  INVALID_KEY_FORMAT: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.INVALID_KEY_FORMAT,
    message: (ctx) =>
      `INVALID OBJECT KEY STRUCTURE: Object key name at '${ctx.path}' violates expression or map constraints.\n` +
      `Received Key: ${ctx.received}\n` +
      `Action: Revise the key token to adhere strictly to your dynamic index pattern criteria.`,
  },
  FUNCTION_MISMATCH: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.FUNCTION_MISMATCH,
    message: (ctx) =>
      `FUNCTION BOUNDARY MISMATCH: Provided functional contract signature is malformed or insufficient.\n` +
      `Location: ${ctx.path}\n` +
      `Expected Signature: ${ctx.expected}\n` +
      `Action: Ensure your executable callback matches mandatory parameter footprint thresholds.`,
  },
  INSTANCE_MISMATCH: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.INSTANCE_MISMATCH,
    message: (ctx) =>
      `PLATFORM CLASS INSTANCE MISMATCH: Object is not a valid instance of the required platform class.\n` +
      `Location: ${ctx.path}\n` +
      `Expected Constructor: ${ctx.expected}\n` +
      `Received Prototype  : ${ctx.received}\n` +
      `Action: Instantiate the data object utilizing the correct platform constructor (e.g. new Date()).`,
  },
  BRAND_CONSTRAINT_VIOLATION: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.BRAND_CONSTRAINT_VIOLATION,
    message: (ctx) =>
      `NOMINAL BRAND REFINEMENT BREACH: Underlying base type passes, but fails structural brand validation.\n` +
      `Location: ${ctx.path}\n` +
      `Expected Nominal Brand: ${ctx.expected}\n` +
      `Action: Ensure the input payload fulfills all value assertions defined by the branded type metadata.`,
  },
  FUNCTION_RETURNS_VIOLATION: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.FUNCTION_RETURNS_VIOLATION,
    message: (ctx) =>
      `FUNCTION RETURN TYPE VIOLATION: Execution interceptor caught an invalid return structure layout.\n` +
      `Location: ${ctx.path}\n` +
      `Expected Output Shape: ${ctx.expected}\n` +
      `Received Output Value: ${ctx.received}\n` +
      `Action: Modify the functional logic block output to fulfill your declared return context contract.`,
  },
  COLLECTION_BOUNDS_EXCEEDED: {
    errorArea: 'runtime_api',
    rule: RUNTIME_API_RULE_KEYS.COLLECTION_BOUNDS_EXCEEDED,
    message: (ctx) =>
      `COLLECTION SIZE LIMIT EXCEEDED: Target string length or array item count broke boundary laws.\n` +
      `Location: ${ctx.path}\n` +
      `Max Limit Allowed : ${ctx.expected}\n` +
      `Received Payload  : ${ctx.received}\n` +
      `Action: Truncate string characters or array items to remain within strict size constraint limits.`,
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
    errorArea: 'runtime_match_drift',
    rule: XALOR_MATCH_DRIFT_RULE_KEYS.MALFORMED_NON_RECORD_PAYLOAD,
    message: () =>
      `MATCH DRIFT ENTRY FAILURE: The supplied payload is not a valid object record and cannot participate in structural lineage evaluation.\n` +
      `Reason: matchXalorDrift compares object blueprints against both the current and ancestral schemas. Primitive values, arrays, null, or malformed payloads cannot be traversed.\n` +
      `Action: Pass a plain object representing a serialized data contract before invoking the migration gateway.`,
  },

  ANCESTRAL_KEY_MISSING_FROM_VAULT: {
    errorArea: 'runtime_match_drift',
    rule: XALOR_MATCH_DRIFT_RULE_KEYS.ANCESTRAL_KEY_MISSING_FROM_VAULT,
    message: () =>
      `ANCESTRAL BLUEPRINT NOT FOUND: The requested historical blueprint could not be located within the compiled Blueprint Vault.\n` +
      `Reason: The configured ancestralKey was never registered, was removed during compilation, or the generated snapshot is stale.\n` +
      `Action: Verify the ancestor registration, rebuild the project, and ensure the generated vault snapshot is synchronized with the current source tree.`,
  },

  UNEXPECTED_STREAM_COLLAPSE: {
    errorArea: 'runtime_match_drift',
    rule: XALOR_MATCH_DRIFT_RULE_KEYS.UNEXPECTED_STREAM_COLLAPSE,
    message: () =>
      `MATCH DRIFT EXECUTION FAILURE: An unexpected internal failure interrupted the migration evaluation pipeline.\n` +
      `Reason: The runtime encountered an unrecoverable execution state while validating lineage or executing migration control flow.\n` +
      `Action: Inspect the originating exception, verify the generated metadata, and report the failure if it persists.`,
  },

  MIGRATION_MUTATION_VIOLATION: {
    errorArea: 'runtime_match_drift',
    rule: XALOR_MATCH_DRIFT_RULE_KEYS.MIGRATION_MUTATION_VIOLATION,
    message: () =>
      `MIGRATION CONTRACT VIOLATION: The migration callback produced a payload that does not satisfy the destination blueprint.\n` +
      `Reason: Every migration must upcast legacy data into a structure that completely conforms to the current registered schema.\n` +
      `Action: Review the migration logic and populate all required properties before returning the transformed object.`,
  },

  MISSING_COMPILED_INFRASTRUCTURE: {
    errorArea: 'runtime_match_drift',
    rule: XALOR_MATCH_DRIFT_RULE_KEYS.MISSING_COMPILED_INFRASTRUCTURE,
    message: () =>
      `COMPILED METADATA UNAVAILABLE: matchXalorDrift executed without the required build-time lineage metadata.\n` +
      `Reason: The Xalor compiler transformer did not emit the migration registry or the compiled snapshot could not be located at runtime.\n` +
      `Action: Enable the Xalor transformer plugin, perform a clean rebuild, and confirm the generated Blueprint Vault artifacts are available before execution.`,
  },
} satisfies TXalorMatchDriftErrorMapper;

/**
 *
 *
 *
 */

export const RUNTIME_SHAPE_VALIDATION_ERRORS: TRuntimeSHapeValidatorErrorMapper =
  {
    ARRAY_VALIDATION_TYPE_MISMATCH: {
      message: 'Input data is not an array structure',
      expected: (_str) => 'array',
    },
    ARRAY_VALIDATION_MIN_LENGTH_VIOLATION: {
      message: 'Tuple length is shorter than minLength',
      expected: (str) => `Tuple(minLength: ${str})`,
    },
    OBJECT_VALIDATION_TYPE_MISMATCH: {
      message: 'Input data is not an object, is null, or is not a record',
      expected: (_str) => 'object',
    },
    OBJECT_VALIDATION_EXCESS_PROPERTY: {
      message: 'Strict mode: unexpected property key found',
      expected: (_str) => 'excess_property',
    },
    OBJECT_VALIDATION_MISSING_REQUIRED_KEY: {
      message: 'Property required by blueprint is missing from object',
      expected: (_str, shape) => `${shape}`,
    },
    OBJECT_VALIDATION_MISSING_PROPERTY: {
      message: 'Property is required but completely absent',
      expected: (_str, shape) => `${shape}`,
    },
    OBJECT_VALIDATION_UNDEFINED_PROPERTY: {
      message: 'Property is present but holds an explicit undefined',
      expected: (_str, shape) => `${shape}`,
    },
    UNION_VALIDATION_NO_MATCH: {
      message: 'Data failed to match every member of the union',
      expected: (_str) => 'union',
    },
    REF_VALIDATION_MISSING_VAULT_ENTRY: {
      message: 'Shape name lookup failed in the registry',
      expected: (_str) => `Registered Shape: ${_str}`,
    },
    PRIMITIVE_VALIDATION_NULL_EXPECTED: {
      message: 'Target type is `null` but data is not null',
      expected: (_str) => `null`,
    },
    PRIMITIVE_VALIDATION_UNDEFINED_EXPECTED: {
      message: 'Target type is `undefined` but data is defined',
      expected: (_str) => `undefined`,
    },
    PRIMITIVE_VALIDATION_STRING_EXPECTED: {
      message: 'Target type is `string` but data is not a string',
      expected: (_str) => `string`,
    },
    PRIMITIVE_VALIDATION_NUMBER_EXPECTED: {
      message: 'Target type is `number` but data is not a number',
      expected: (_str) => `number`,
    },
    PRIMITIVE_VALIDATION_BOOLEAN_EXPECTED: {
      message: 'Target type is `boolean` but data is not a boolean',
      expected: (_str) => `boolean`,
    },
    PRIMITIVE_VALIDATION_BIGINT_EXPECTED: {
      message: 'Target type is `bigint` but data is not a bigint',
      expected: (_str) => `bigint`,
    },
    PRIMITIVE_VALIDATION_UNKNOWN_TYPE: {
      message: 'Catch-all for other unsupported primitive types',
      expected: (_str, shape) => `${shape}`,
    },
    INTERSECTION_VALIDATION_PART_FAILED: {
      message: 'Data failed to satisfy one of the intersected shapes',
      expected: (_str) => `intersection`,
    },
    LITERAL_VALIDATION_VALUE_MISMATCH: {
      message: 'Data does not strictly equal (===) literal value',
      expected: (_str) => `shape (the literal shape object)`,
    },
    FUNCTION_VALIDATION_TYPE_MISMATCH: {
      message: 'Data is not a callable function',
      expected: (_str) => `shape (the function shape object)`,
    },
    FUNCTION_VALIDATION_PARAMETER_MISMATCH: {
      message: 'Function parameter count (data.length) < expected',
      expected: (_str) => `function_signature_parameters_mismatch`,
    },
    INSTANCEOF_VALIDATION_NIL_VALUE: {
      message: 'Data is null or undefined',
      expected: (_str) => `shape (the instance shape object)`,
    },
    INSTANCEOF_VALIDATION_PROTOTYPE_MISMATCH: {
      message: 'Data is not an instance of the resolved constructor',
      expected: (_str) => `instanceof_${_str}`,
    },
  } satisfies TRuntimeSHapeValidatorErrorMapper;

/* prettier-ignore */
export const RULE_KIND_MAPPER: Record<TRuntimeShapeValidationErrorKey, TRuntimeApiErrorRules> = {
  OBJECT_VALIDATION_EXCESS_PROPERTY: 'excess_property',
  OBJECT_VALIDATION_MISSING_PROPERTY: 'missing_property',
  
  // ✨ Synchronized: Exhaustive mapping slot added to satisfy compiler constraints
  OBJECT_VALIDATION_UNDEFINED_PROPERTY: 'missing_property',
  OBJECT_VALIDATION_MISSING_REQUIRED_KEY: 'missing_key_presence',
  
  UNION_VALIDATION_NO_MATCH: 'union_exhausted',
  INTERSECTION_VALIDATION_PART_FAILED: 'intersection_breached',
  LITERAL_VALIDATION_VALUE_MISMATCH: 'literal_mismatch',
  FUNCTION_VALIDATION_PARAMETER_MISMATCH: 'function_mismatch',
  INSTANCEOF_VALIDATION_PROTOTYPE_MISMATCH: 'instance_mismatch',
  ARRAY_VALIDATION_MIN_LENGTH_VIOLATION: 'collection_bounds_exceeded',
  REF_VALIDATION_MISSING_VAULT_ENTRY: 'missing_from_vault',
  
  // Explicit primitive fallback tokens mapped point-free
  PRIMITIVE_VALIDATION_STRING_EXPECTED: 'primitive_mismatch',
  PRIMITIVE_VALIDATION_NUMBER_EXPECTED: 'primitive_mismatch',
  PRIMITIVE_VALIDATION_BOOLEAN_EXPECTED: 'primitive_mismatch',
  PRIMITIVE_VALIDATION_BIGINT_EXPECTED: 'primitive_mismatch',
  PRIMITIVE_VALIDATION_NULL_EXPECTED: 'primitive_mismatch',
  PRIMITIVE_VALIDATION_UNDEFINED_EXPECTED: 'primitive_mismatch',
  PRIMITIVE_VALIDATION_UNKNOWN_TYPE: 'primitive_mismatch',
  OBJECT_VALIDATION_TYPE_MISMATCH: 'primitive_mismatch',
  ARRAY_VALIDATION_TYPE_MISMATCH: 'primitive_mismatch',
  FUNCTION_VALIDATION_TYPE_MISMATCH: 'primitive_mismatch',
  INSTANCEOF_VALIDATION_NIL_VALUE: 'primitive_mismatch'

} satisfies Record<TRuntimeShapeValidationErrorKey, TRuntimeApiErrorRules>;
