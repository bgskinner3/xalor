// scripts/postinstall.ts
// import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* prettier-ignore */ const userProjectRootDir = path.resolve(__dirname, '..', '..', '..', '..', '..');

const FILE_PATHS_CONFIG = {
  // Target Destinations (Inside the user's workspace)
  target: {
    /* prettier-ignore */ cacheDir: path.join(userProjectRootDir, 'node_modules', '.cache', 'xalor'),
    /* prettier-ignore */ vaultFile: path.join(userProjectRootDir, 'node_modules', '.cache', 'xalor', 'vault-snapshot.json'),
    // /* prettier-ignore */ bridgeDir: path.join(userProjectRootDir, 'node_modules', '.cache', 'xalor'),
    // /* prettier-ignore */ bridgeFile: path.join(userProjectRootDir, 'node_modules', '.cache', 'xalor', 'solid-env.ts'),
    /* prettier-ignore */ bridgeDir: path.join(userProjectRootDir, '.xalor'),
    /* prettier-ignore */ bridgeFile: path.join(userProjectRootDir, '.xalor', 'solid-env.ts'),
  },
  // Source Assets (Inside our packaged distribution bundle)
  source: {
    /* prettier-ignore */ templatesDir: path.resolve(__dirname, '..', 'static-templates'),
    /* prettier-ignore */ vaultFile: path.resolve(__dirname, '..', 'static-templates', 'vault-snapshot.json'),
    /* prettier-ignore */ dtsTemplate: path.resolve(__dirname, '..', 'static-templates', 'solid-env.ts.template'),
    /* prettier-ignore */
    cliBinFile: path.resolve(__dirname, '..', 'cli', 'bin.js'), // ⚡ ADD THIS VALUE TO POINT TO YOUR BINARY FILE
  },
} as const;

try {
  // 🛡️ PERMISSIONS SECURITY BOUNDARY GUARD
  if (!fs.existsSync(FILE_PATHS_CONFIG.source.vaultFile)) {
    /* prettier-ignore */ console.warn('⚠️ [xalor:init] Postinstall aborted: Compiled static templates missing in dist/. Package requires full compilation pass first.');
    process.exit(0);
  }

  // 1. FLUSH THE COLD-START DEV CACHE BASELINE
  if (!fs.existsSync(FILE_PATHS_CONFIG.target.cacheDir)) {
    fs.mkdirSync(FILE_PATHS_CONFIG.target.cacheDir, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATHS_CONFIG.target.vaultFile)) {
    /* prettier-ignore */ fs.copyFileSync(FILE_PATHS_CONFIG.source.vaultFile, FILE_PATHS_CONFIG.target.vaultFile);
  }

  // 2. FLUSH THE GHOST LAYER INTELLISENSE BRIDGE
  if (!fs.existsSync(FILE_PATHS_CONFIG.target.bridgeDir)) {
    fs.mkdirSync(FILE_PATHS_CONFIG.target.bridgeDir, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATHS_CONFIG.target.bridgeFile)) {
    /* prettier-ignore */ fs.copyFileSync(FILE_PATHS_CONFIG.source.dtsTemplate, FILE_PATHS_CONFIG.target.bridgeFile);
  }
  // if (fs.existsSync(FILE_PATHS_CONFIG.source.cliBinFile)) {
  //   // Spawn your compiled binary command using pure, untethered orchestration
  //   const backgroundDaemon = spawn(
  //     'node',
  //     [FILE_PATHS_CONFIG.source.cliBinFile, 'watch'],
  //     {
  //       detached: true, // Tells the operating system to let this script run forever on its own
  //       stdio: 'ignore', // Completely severs standard output and error hooks from the install console
  //       windowsHide: true, // Suppresses annoying terminal flashing boxes on Windows environments
  //       cwd: userProjectRootDir, // Sets the execution context to their sandbox project workspace
  //     },
  //   );

  //   // Unref tells Node's main thread to drop tracking reference counters,
  //   // allowing the npm install terminal script to close and terminate immediately!
  //   backgroundDaemon.unref();
  // }
} catch (error) {
  const errMsg = error instanceof Error ? error.message : String(error);
  // Fail completely silently to prevent disrupting their primary package installation workflow
  console.warn(`⚠️ [xalor:init] Workspace seeding safely bypassed: ${errMsg}`);
}
