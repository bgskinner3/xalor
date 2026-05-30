// cli/commands/clear.ts
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import xalorTransformerPlugin from '../../transformer';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import { bootstrapEnvContext } from '../utils';
import { fileURLToPath } from 'url';

/**
 * runClearCommand
 * 🪐 THE COMPILER BOOTSTRAPPER & VAULT EVACUATION DISPATCHER
 *
 * ROLE:
 * Executes a unified, two-step atomic baseline system purge. Phase 1 boots a
 * lightweight virtual TypeScript program context to trigger in-memory store clearing
 * via the plugin, and Phase 2 handles physical file overwrites on disk immediately after.
 */
export function runClearCommand(projectRootPath: string): void {
  const { fileNames } = IS_SOLID_CONFIG_ITEMS;
  bootstrapEnvContext({ projectRootPath, cliMode: 'clear' });

  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.CommonJS,
    noEmit: false, // Must be false so the emit channel actively fires the transformer lifecycle
  };

  const compilerHost = ts.createCompilerHost(compilerOptions);

  const program = ts.createProgram({
    rootNames: [],
    options: compilerOptions,
    host: compilerHost,
  });

  // ========================================================================
  // TRIGGER THE EMIT PASS TO FIRE IN-MEMORY REGISTRY PURGING
  // The exact millisecond this executes, it passes control to xalorTransformerPlugin.
  // ========================================================================
  program.emit(
    undefined,
    () => {
      /* Black-hole swallow callback function to prevent physical compiled .js disk pollution */
    },
    undefined,
    false,
    {
      before: [xalorTransformerPlugin(program)],
    },
  );

  // ========================================================================
  // PHYSICAL VAULT & CACHE RE-SEED OVERWRITES (The Disk Clear Pass)
  // ========================================================================
  /* prettier-ignore */
  console.log('🛰️ [Xalor CLI] Initiating physical vault file system evacuations...');

  const currentModuleDir = path.dirname(fileURLToPath(import.meta.url));

  const FILE_PATHS_CONFIG = {
    target: {
      /* prettier-ignore */
      cacheDir: path.join(projectRootPath, 'node_modules', '.cache', fileNames.cacheFolderName),
      /* prettier-ignore */
      vaultFile: path.join(projectRootPath, 'node_modules', '.cache', fileNames.cacheFolderName, fileNames.vaultFileName),
      /* prettier-ignore */
      bridgeDir: path.join(projectRootPath, fileNames.intelFolderName),
      /* prettier-ignore */
      bridgeFile: path.join(projectRootPath, fileNames.intelFolderName, fileNames.bridgeFileName),
    },
    source: {
      /* prettier-ignore */
      vaultFile: path.resolve(currentModuleDir, '..', 'static-templates', fileNames.vaultFileName),
      /* prettier-ignore */
      dtsTemplate: path.resolve(currentModuleDir, '..', 'static-templates', fileNames.bridgeTemplate),
    },
  } as const;

  try {
    if (!fs.existsSync(FILE_PATHS_CONFIG.source.vaultFile)) {
      /* prettier-ignore */
      console.warn('⚠️ [xalor:clear] Clear aborted: Packaged distribution static templates missing.');
      process.env.XALOR_CLI_CLEAR = 'false';
      process.exit(1);
    }

    if (!fs.existsSync(FILE_PATHS_CONFIG.target.cacheDir)) {
      fs.mkdirSync(FILE_PATHS_CONFIG.target.cacheDir, { recursive: true });
    }
    fs.copyFileSync(
      FILE_PATHS_CONFIG.source.vaultFile,
      FILE_PATHS_CONFIG.target.vaultFile,
    );

    // B. OVERWRITE THE GHOST LAYER INTELLISENSE BRIDGE
    if (!fs.existsSync(FILE_PATHS_CONFIG.target.bridgeDir)) {
      fs.mkdirSync(FILE_PATHS_CONFIG.target.bridgeDir, { recursive: true });
    }
    fs.copyFileSync(
      FILE_PATHS_CONFIG.source.dtsTemplate,
      FILE_PATHS_CONFIG.target.bridgeFile,
    );
    /* prettier-ignore */
    console.log('✨ [Xalor CLI] Cache vaults and physical file systems successfully cleared.');
  } catch (error) {
    const errorDetails =
      error instanceof Error
        ? error.message
        : 'File system permission boundary lock occurred.';
    /* prettier-ignore */
    console.error(`❌ [Xalor CLI] Failed to evacuate local disk cache segments: ${errorDetails}`);

    // Ensure safety cleanup occurs on error paths before thread termination
    process.env.XALOR_CLI_CLEAR = 'false';
    process.exit(1);
  }

  // ========================================================================
  // REST FLAG SO WE CAN USE CLEAR AGAIN
  // ========================================================================
  process.env.XALOR_CLI_CLEAR = 'false';
  /* prettier-ignore */
  console.log( '🪐 [Xalor CLI] Environment variables synchronized point-free. Execution loop sealed.\n');
}
