import type {
  TCompilerDiagnosticMapper,
  TCollisionBorderFailureMapper,
} from '../types';
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
    rule: 'mechanical_collapse',
    messageTemplate: (msg) =>
      `An uncaught mechanical panic collapsed the transformation thread: ${msg ?? 'Unknown AST anomaly.'}\n` +
      `Action: Safeguarding process pipeline variables. Background loop remains active.`,
  },
  GENESIS_HYDRATION_FAULT: {
    rule: 'snapshot_corruption',
    messageTemplate: (msg) =>
      `Genesis Hydration structural parsing failed: ${msg ?? 'JSON serialization corruption.'}\n` +
      `Action: Resetting local cache parameters. A clean snapshot block will be rewritten on next save.`,
  },
  VAULT_FLUSH_IO_FAULT: {
    rule: 'filesystem_lock',
    messageTemplate: (msg) =>
      `Cache Shield deployment failure: ${msg ?? 'Access restriction occurred.'}\n` +
      `Check write permissions or process locks on target directories.`,
  },
  AST_GENERATION_ANOMALY: {
    rule: 'codegen_discrepancy',
    messageTemplate: (kind) =>
      `Code-generation loop intercepted a structural shape kind discrepancy.\n` +
      `Encountered Unknown Kind: "${kind ?? 'undefined'}"\n` +
      `Action: Substituting with a baseline safe 'unknown' primitive fallback schema.`,
  },
  UNKNOWN_API_TRIGGER: {
    rule: 'invalid_trigger_signature',
    messageTemplate: (method) =>
      `AST Sentry encountered an un-permitted property invocation under the Xalor namespace.\n` +
      `Encountered Invalid Method: "Xalor.${method ?? 'unknown'}"\n` +
      `Action: Aborting metadata extraction for this node. Ensure the target method matches permissible triggers.`,
  },
  COLD_START_INFRASTRUCTURE_FAULT: {
    rule: 'filesystem_lock',
    messageTemplate: (msg) =>
      `Cold-Start Shield deployment exception: Failed to allocate cache directories.\n🚨 Message: ${msg ?? 'Permission block.'}`,
  },
  TEMPLATE_SEED_FAULT: {
    rule: 'filesystem_lock',
    messageTemplate: (msg) =>
      `Baseline templates initialization deferred: Failed to copy static snapshot seeds.\n🚨 Message: ${msg ?? 'Access block.'}`,
  },
  GENESIS_STREAM_FAULT: {
    rule: 'snapshot_corruption',
    messageTemplate: (msg) =>
      `Safe evacuation triggered on broken snapshot data string stream loop.\n🚨 Message: ${msg ?? 'Stream read interruption.'}`,
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
    rule: 'terminal_contradiction',
    message: (ctx) =>
      `SAME-FILE DUPLICATION: Key "${ctx.keyName}" is duplicated inside the same file boundary context!\n` +
      `First Declared: [${ctx.historicalArea} ↳ ${ctx.historicalAnchor}]\n` +
      `Duplicated At:  [${ctx.activeArea} ↳ ${ctx.activeAnchor}]\n` +
      `Action: Unique tracking boundaries require distinct string identifiers to avoid cache drifting.`,
  },
  CROSS_FILE: {
    rule: 'terminal_contradiction',
    message: (ctx) =>
      `CROSS-FILE COLLISION: Unique identifier key "${ctx.keyName}" has been claimed by multiple files!\n` +
      `First Claimed By: [${ctx.initialFilePath} ↳ ${ctx.initialArea}]\n` +
      `Attempted Hijack:  [${ctx.hijackFilePath} ↳ ${ctx.hijackArea}]\n` +
      `Action: Xalor requires unique global keys. Change the target literal string key name.`,
  },
} satisfies TCollisionBorderFailureMapper;
