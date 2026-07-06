#!/usr/bin/env node
// src/cli/bin.ts
import {
  runCompileCommand,
  runStudioCommand,
  runClearCommand,
  runAuditCommand,
  // runVacuumCommand
} from './commands';
import { determineCLIConfig } from './utils';
import type { TCommandRouterMapper } from './models';
import { CLI_LOGGER_MAPPER } from './models';

const COMMAND_ROUTER: TCommandRouterMapper = {
  // watch: (_projectRoot) => {
  //   // runWatchCommand(projectRoot);
  //   console.warn(
  //     `\n\x1b[33m⚠️  [Xalor CLI Alert]: The 'xalor watch' daemon has been completely deprecated.\x1b[0m\n` +
  //       `👉 Upgrade Action: Remove 'xalor watch' from your package.json scripts.\n` +
  //       `                  Simply add 'xalorViteWatchPlugin()' or 'XalorWebpackWatchPlugin'\n` +
  //       `                  directly into your bundler config for native ambient syncing.\n`,
  //   );
  // },
  vacuum: (projectRoot) => {
    console.log(
      '/n/n/\n\n\n\n\n\n\n',
      '/n/n/\n\n\n\n\n\n\n',
      `🧹 [Xalor CLI] Stage 2 Vacuum running: Purging development telemetry metrics...`,
      '/n/n/\n\n\n\n\n\n\n',
      '/n/n/\n\n\n\n\n\n\n',
      '/n/n/\n\n\n\n\n\n\n',
    );
    console.log(`📂 Target Workspace Anchor: ${projectRoot}`);
  },
  compile: (projectRoot) => {
    runCompileCommand(projectRoot);
  },
  audit: async (projectRoot, flags) => {
    console.log(
      '🪐 [Xalor CLI] Auto-compiling workspace to synchronize telemetry registry maps...',
    );
    // Await your async audit data generation routines cleanly!
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
