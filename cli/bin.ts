#!/usr/bin/env node
// src/cli/bin.ts
import {
  runCompileCommand,
  runStudioCommand,
  runClearCommand,
  runAuditCommand,
  runVacuumCommand,
} from './commands';
import { determineCLIConfig } from './utils';
import type { TCommandRouterMapper } from './models';
import { CLI_LOGGER_MAPPER } from './models';

const COMMAND_ROUTER: TCommandRouterMapper = {
  vacuum: (projectRoot) => {
    console.log(
      `\n\x1b[36m📊 [Xalor CLI] Launching Studio Telemetry Server Core...\x1b[0m\n` +
        ` ↳ Status: Active Thread Locked 🟢`,
    );

    runVacuumCommand(projectRoot);
    console.log(
      `\x1b[34m📂 Target Workspace Anchor:\x1b[0m \x1b[2m${projectRoot}\x1b[0m\n`,
    );
  },
  compile: (projectRoot) => {
    runCompileCommand(projectRoot);
  },
  audit: async (projectRoot, flags) => {
    console.log(
      '🪐 [Xalor CLI] Auto-compiling workspace to synchronize telemetry registry maps...',
    );

    await runAuditCommand(projectRoot, flags);
  },
  studio: (projectRoot) => {
    console.log(`📊 [Xalor CLI] Launching Studio Telemetry Server Core...`);
    runStudioCommand(projectRoot);
    console.log(`📂 Target Workspace Anchor: ${projectRoot}`);
  },
  clear: (projectRoot) => {
    runClearCommand(projectRoot);
  },
  help: () => {
    const helpLog = CLI_LOGGER_MAPPER.help('');
    console.log(helpLog.trim());
    process.exit(0);
  },
} satisfies TCommandRouterMapper;

/**
 * Master framework execution entry point
 */
function main(): void {
  // Strip Node runtime variables out of execution array head
  const config = determineCLIConfig(process.argv.slice(2));

  const executeAction = COMMAND_ROUTER[config.mode];
  executeAction(config.projectRoot);
}

main();
