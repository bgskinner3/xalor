#!/usr/bin/env node
// src/cli/bin.ts
import {
  runWatchCommand,
  runCompileCommand,
  runStudioCommand,
  runClearCommand,
} from './commands';
import { determineCLIConfig } from './utils';
import type { TCommandRouterMapper } from './models';

const COMMAND_ROUTER: TCommandRouterMapper = {
  watch: (projectRoot) => {
    runWatchCommand(projectRoot);
  },
  vacuum: (projectRoot) => {
    console.log(
      `🧹 [Xalor CLI] Stage 2 Vacuum running: Purging development telemetry metrics...`,
    );
    console.log(`📂 Target Workspace Anchor: ${projectRoot}`);
  },
  compile: (projectRoot) => {
    runCompileCommand(projectRoot);
  },
  audit: (projectRoot) => {
    console.log(`📊 [Xalor CLI]  report Audit Ledger Map...`);
    console.log(`📂 Target Workspace Anchor: ${projectRoot}`);
  },
  studio: (projectRoot) => {
    console.log(`📊 [Xalor CLI]  STUDIO Audit Ledger Map...`);
    runStudioCommand(projectRoot);
    console.log(`📂 Target Workspace Anchor: ${projectRoot}`);
  },
  clear: (projectRoot) => {
    runClearCommand(projectRoot);
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
