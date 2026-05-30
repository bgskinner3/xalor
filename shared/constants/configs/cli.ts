/**
 * CLI_COMMAND_MODES CONFIGURATION
 *
 * ROLE:
 * The single source of truth for all permitted execution types.
 *
 * STRATEGY:
 * Freezing this array allows your runtime engine to check strings
 * instantly using Set lookups (NO switch statements), while your type
 * engine uses it to lock down auto-complete in the IDE.
 */
export const CLI_COMMAND_MODES = Object.freeze({
  watch: 'watch',
  compile: 'compile',
  vacuum: 'vacuum',
  audit: 'audit',
  studio: 'studio',
  clear: 'clear',
} as const);
/**
 * XALOR_ENV_KEYS
 *
 * ROLE:
 * The single source of truth for internal cross-process environment flags.
 */
export const XALOR_ENV_KEYS = Object.freeze({
  /** Rolling local development watch loops thread (Stage 1B) */
  watch: 'XALOR_CLI_WATCH',
  /** One-shot local development compilation sync pass */
  compile: 'XALOR_CLI_COMPILE',
  /** Terminal production minification and flat JS baking (Stage 2) */
  vacuum: 'XALOR_CLI_VACUUM',

  studio: 'XALOR_CLI_STUDIO',

  clear: 'XALOR_CLI_CLEAR',
});

export const TRANSFORMER_EXECUTE_MODES = Object.freeze({
  watch: 'watch',
  compile: 'compile',
  vacuum: 'vacuum',
  studio: 'studio',
  clear: 'clear',
} as const);

/**
 * XALOR_CLI_STATUS_MESSAGES
 *
 * ROLE:
 * The single source of truth for all native Microsoft TypeScript watch status codes.
 *
 * STRATEGY:
 * Directly intercepting numeric diagnostic identifiers isolates terminal UI feedback away
 * from standard execution exceptions, ensuring absolute compliance with Commandment IV.
 *
 * @param 6031 - Triggered at initial launch when the compilation loop first spins up in memory.
 * @param 6032 - Triggered on a file-save event when a code modification delta is actively captured on disk.
 * @param 6042 - Triggered when rapid, consecutive saves occur, queuing up processing for the next compiler cycle.
 * @param 6193 - Triggered at compile loop termination when code issues remain, isolating registries from corruption.
 * @param 6194 - Triggered at compile loop termination when the workspace is completely clean and sync succeeds.
 */
export const XALOR_CLI_STATUS_MESSAGES: Readonly<Record<number, string>> =
  Object.freeze({
    // Initial Handshake States
    6031: '🛰️ [Xalor CLI] Booting in-memory background reflection radar...',

    // Incremental Delta Capture States
    6032: '🔄 [Xalor CLI] File change captured on disk. Processing AST increments...',
    6042: '⏳ [Xalor CLI] Consecutive save events caught. Queuing AST processing cycle...',

    // Compilation Finalization States
    6194: '✅ [Xalor CLI] Code synchronization complete. Memory registries locked.',
    6193: '⚠️ [Xalor CLI] Pass completed with compilation errors. Registries isolated.',
  });
