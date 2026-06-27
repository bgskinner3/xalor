import type { TCLIBootStrapModes, TEnvStateMatrix } from '../../types';

/**
 * ============================================================================
 * 🚦 CLI MODE INITIALIZATION AND MUTATION MAPPER COMPACT
 * ============================================================================
 *
 * ROLE:
 * Unified dictionary registers that decouple environmental state configuration
 * from visual telemetry delivery across the system lifecycle.
 *
 * MAPS INCLUDED:
 * 1. CLI_BOOTSTRAP_LOG_MAPPER     - Direct terminal stream telemetry blueprints.
 * 2. MODE_ENV_MUTATION_MAPPER     - Process-level environment flag toggle footprints.
 */
/* prettier-ignore */
export const CLI_LOGGER_MAPPER: Record<TCLIBootStrapModes | 'help', (projectRootPath: string) => string> = {
  clear: (projectRootPath) => `
====================================================
🪐 [Xalor CLI] INITIALIZING ABSOLUTE ZERO CACHE PURGE...
📂 Project Root Anchor: ${projectRootPath}
====================================================`,

  compile: (projectRootPath) => `
⚡ [Xalor CLI] STARTING SINGLE-PASS SYNC BUILDER...
📂 Project Root Anchor: ${projectRootPath}
====================================================`,

  watch: (projectRootPath) => `
🔭 [Xalor CLI] STARTING REAL-TIME REFLECTION RUNNER...
📂 Project Root Anchor: ${projectRootPath}
====================================================`,

  help: () => `
======================================================================
🪐 XALOR CLI ENVIRONMENT GATEWAY MANUAL
======================================================================

Usage: xalor <command>

Commands:
  watch    🔭 Start real-time reflection watcher daemon (HMR)
  compile  ⚡ Execute single-pass sync graph AST builder
  audit    📊 Profile macro operational health and validation density
  studio   🛰️ Launch secure Cross-Origin localhost workspace UI
  vacuum   🧹 Purge stale un-referenced CAS cache leaf pointers
  clear    🔥 Hard flash-purge node_modules cache back to zero

======================================================================
    `
} satisfies Record<TCLIBootStrapModes | 'help', (projectRootPath: string) => string>;

/* prettier-ignore */
export const MODE_ENV_MUTATION_MAPPER: Record<TCLIBootStrapModes, TEnvStateMatrix> = {
  clear: {
    XALOR_CLI_CLEAR: 'true',
    XALOR_CLI_WATCH: 'false',
    XALOR_CLI_COMPILE: 'false',
  },
  watch: {
    XALOR_CLI_CLEAR: 'false',
    XALOR_CLI_WATCH: 'true',
    XALOR_CLI_COMPILE: 'false',
  },
  compile: {
    XALOR_CLI_CLEAR: 'false',
    XALOR_CLI_WATCH: 'false',
    XALOR_CLI_COMPILE: 'true',
  },
} satisfies Record<TCLIBootStrapModes, TEnvStateMatrix>;
