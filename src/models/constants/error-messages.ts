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
