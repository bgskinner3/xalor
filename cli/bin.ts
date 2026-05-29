#!/usr/bin/env node
// src/cli/bin.ts
// import * as path from 'path';
import {
  runWatchCommand,
  runCompileCommand,
  runStudioCommand,
} from './commands';
import { determineCLIConfig } from './utils';
import type { TCommandRouterMapper } from '../shared';

const COMMAND_ROUTER: TCommandRouterMapper = {
  init: (projectRoot) => {
    console.log(
      `🚀 [Xalor CLI] Bootstrapping pristine Stage 1A local workspace layout context...`,
    );
    console.log(`📂 Target Workspace Anchor: ${projectRoot}`);
  },
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
  report: (projectRoot) => {
    console.log(`📊 [Xalor CLI]  report Audit Ledger Map...`);
    console.log(`📂 Target Workspace Anchor: ${projectRoot}`);
  },
  studio: (projectRoot) => {
    console.log(`📊 [Xalor CLI]  STUDIO Audit Ledger Map...`);
    runStudioCommand(projectRoot);
    console.log(`📂 Target Workspace Anchor: ${projectRoot}`);
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
