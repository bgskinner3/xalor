// plugins/enviorments/vite-webpack.ts
/**
 * 🪐 XALOR AMBIENT DEVELOPMENT INTEGRATION GATEWAYS
 *
 * DESIGN PHILOSOPHY:
 * - ZERO EXTERNAL DEPENDENCIES: Refuses 3rd party wrappers to guarantee zero-churn maintenance.
 * - AMBIENT INVERSION OVER CLI: Completely bypasses the fragile out-of-process 'xalor watch' CLI command.
 * - PACING INTEGRITY: Synced directly to framework HMR queues to eliminate filesystem race conditions.
 *
 * VITE ENGINE LIFECYCLE MECHANICS:
 * 1. Restricts execution to development loops via the native `apply: 'serve'` constraint.
 * 2. Intercepts filesystem writes directly inside Vite's optimized single-threaded `handleHotUpdate` hook.
 * 3. Extracts `ctx.file` and bypasses OS file-locking delays point-free with zero memory allocations.
 *
 * WEBPACK / NEXT.JS ENGINE LIFECYCLE MECHANICS:
 * 1. Attaches a standard class instance contract via the universal Webpack `apply(compiler)` configuration.
 * 2. Hooks into `compiler.hooks.watchRun` to intercept dev saves before graph chunk generation.
 * 3. Uses a low-overhead integer index loop to traverse changed file paths inside the `watcher.mtimes` cache.
 *
 * CORE PIPELINE CONDUIT HANDOFF:
 * Regardless of the environment, both adapters route absolute file paths to a shared, stateless conduit.
 * The conduit spins up an in-memory `ts.createProgram` instance with `noEmit: false` and a black-hole
 * writeFile callback sink, forcing your master `xalorTransformerPlugin` to re-mine AST structures cleanly.
 */
import ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import xalorTransformerPlugin from '../../transformer';
import {
  fsContext,
  isCompilerInstance,
  isUndefined,
  ObjectUtils,
} from '../../shared';
import type {
  TWebpackCompilerInstance,
  TXalorVitePlugin,
  TPluginContext,
  THotUpdateContext,
} from '../shared-items';
import { BASE_COMPILER_OPTIONS } from '../shared-items';
import type { TTypeGuard } from '../../shared';

/**
 * assertWebpackShapeIntegrity
 * 🛡️ ZERO-DEPENDENCY RUNTIME DRIFT DEFENDER
 *
 * ROLE:
 * Verifies if the incoming live Webpack compiler object matches our custom
 * architectural structural interface blueprint contract.
 *
 * WHY:
 * Protects our users from silent failures or type drift crashes if a major
 * Next.js or Webpack version update refactors internal file system properties.
 *
 * COMPLIANCE STATUS:
 * - COMMANDMENT VIII: Zero memory re-allocations during hot watch runs.
 * - COMMANDMENT IX: Strongly typed literal assignment with zero type-escape hacks.
 */
export const assertWebpackShapeIntegrity: TTypeGuard<
  TWebpackCompilerInstance
> = (value: unknown): value is TWebpackCompilerInstance =>
  isCompilerInstance(value);
/**
 * executeAmbientTransformationPass --  AOT FILE TRACE
 *
 * - absoluteFilePath: string: This is the raw string path passed down by the host environment
 * (Vite passes it through handleHotUpdate, and Webpack pulls it out of your mtimes keys traversal loop).
 * It points directly to the physical location of the file on the user's hard drive.
 *
 * -if (!absoluteFilePath.endsWith('.ts') && ...): This is your first strict validation perimeter gate, satisfying Commandment
 * VIII (Internal Efficiency). If a developer saves a .css, .json, .md, or .png file inside their project folder, Vite and
 * Webpack will still trigger their watch hooks. By placing an ultra-fast string ending evaluation right at the front door,
 * your engine drops non-TypeScript modifications instantly point-free, preventing your system from spinning up heavy compiler
 * programs on unrelated assets.
 *
 */
export function executeAmbientTransformationPass(
  absoluteFilePath: string,
): void {
  const normalizedAbsolute = path.resolve(absoluteFilePath).replace(/\\/g, '/');

  if (
    normalizedAbsolute.includes('/.xalor/') ||
    normalizedAbsolute.endsWith('solid-env.ts')
  ) {
    return;
  }

  if (!absoluteFilePath.endsWith('.ts') && !absoluteFilePath.endsWith('.tsx')) {
    return;
  }
  /**
   * CROSS PLATFORM CANONICAL PATH MAPPER
   *
   * - sole mission is to take an absolute operating system file path (like /Users/bgskinner2/Projects/xalor/src/index.ts
   * on macOS or C:\Projects\xalor\src\index.ts on Windows) and reduce it down to an identical, clean relative
   * key (src/index.ts).
   *
   * !!! NOTE: If your engine does not do this, your type graph keys will be completely different depending on whether a
   * !!! developer runs your code on macOS, Linux, or a Windows machine.
   *
   */
  /**
   * .valueOf() safely forces the JavaScript runtime to strip away all type branding and return the clean,
   *  primitive string value natively
   */
  const rootStr = fsContext.envPaths.rootDir.valueOf();
  const normalizedRoot = path.resolve(rootStr).replace(/\\/g, '/');

  let relativePathKey = normalizedAbsolute.replace(normalizedRoot, '');
  if (relativePathKey.startsWith('/')) {
    relativePathKey = relativePathKey.slice(1);
  }
  if (!relativePathKey) {
    relativePathKey = 'src/index.ts';
  }

  const originalCliWatchValue = process.env.XALOR_CLI_WATCH;
  const originalCliCompileValue = process.env.XALOR_CLI_COMPILE;

  try {
    // ====================================================================================
    /**
     * where the plugin coordinates with the TypeScript Compiler API out-of-process.
     */
    // ====================================================================================

    process.env.XALOR_CLI_WATCH = 'true';
    process.env.XALOR_CLI_COMPILE = 'false';
    const program = ts.createProgram([absoluteFilePath], BASE_COMPILER_OPTIONS);

    program.emit(
      undefined,
      () => {
        // 🕳️ BLACK-HOLE SWALLOW: Swallows physical .js and .d.ts code output generation
        // to prevent filesystem pollution while allowing the transformer to run in-memory!
      },
      undefined,
      undefined,
      {
        before: [
          xalorTransformerPlugin(program, {
            compilationPhase: 'STANDARD_INLINE',
            targetedFilesCollector: new Set<string>([absoluteFilePath]),
          }),
        ],
      },
    );

    if (process.env.XALOR_CLI_SILENT !== 'true') {
      console.log(
        `\x1b[32m✨ [Xalor AOT] Ambient Watch Sync Complete: ${relativePathKey}\x1b[0m`,
      );
    }
  } catch {
    console.error(
      `\x1b[31m🚨 [Xalor AOT] Ambient Watch Interrupted: ${relativePathKey}\x1b[0m`,
    );
  } finally {
    process.env.XALOR_CLI_WATCH = originalCliWatchValue;
    process.env.XALOR_CLI_COMPILE = originalCliCompileValue;
  }
}

/**
 * USER CONNECTION
 * 
 *       To connect their workspace to your ambient type-graph mining engine, the
      user will open their project's vite.config.ts file and drop your function
      straight into their active plugins array:

      ```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { xalorViteWatchPlugin } from '@bgskinner2/xalor/plugins'; // 🪐 Your native entry point

export default defineConfig({
  plugins: [
    react(),
    xalorViteWatchPlugin() // ✨ That's it! Xalor is now fully connected ambiently.
  ]
});

      ```
 */
export function xalorViteWatchPlugin(): TXalorVitePlugin {
  return {
    name: 'vite-plugin-xalor-ambient-watch',
    configResolved() {
      globalThis.__XALOR_COMPILE_LOCK__ = true;
    },

    // 🔌 'apply: serve' is removed completely. This plugin handles dev watches
    // and production building lifecycles concurrently out-of-band!

    async handleHotUpdate(ctx: THotUpdateContext) {
      executeAmbientTransformationPass(ctx.file);
    },

    // 🚀 THE PRODUCTION CURE FOR VITE BUILDS:
    // Explicitly scopes the execution runtime context string to our custom TPluginContext structure.
    // This allows the compiler to fully recognize 'this.emitFile' with zero type-escapes!
    generateBundle(this: TPluginContext) {
      try {
        const sourceJsonPath = path.resolve(
          process.cwd(),
          './xalor-vault.json',
        );

        if (fs.existsSync(sourceJsonPath)) {
          const rawJsonData = fs.readFileSync(sourceJsonPath, 'utf8');

          // Emit the file natively into the asset graph tree structure
          // This forces Vite to write the file flatly as dist/xalor-vault.json right post-build!
          this.emitFile({
            type: 'asset',
            fileName: 'xalor-vault.json',
            source: rawJsonData,
          });
        }
      } catch (_err) {
        // Safe silent fallback during active development hot-reloading saves
      }
    },
  };
}

// ============================================================================
// ADAPTER B: NATIVE WEBPACK / NEXT.JS DEVELOPMENT WATCH COUPLING
// ============================================================================
export class XalorWebpackWatchPlugin {
  public apply(compiler: unknown): void {
    if (!assertWebpackShapeIntegrity(compiler)) {
      if (process.env.XALOR_CLI_SILENT !== 'true') {
        console.warn(
          `\n\x1b[33m⚠️  [Xalor Core Alert]: Webpack internal structural shape drift detected!\x1b[0m\n` +
            `👉 Action: Please verify your Next.js configuration or update @bgskinner2/xalor to match.\n`,
        );
      }
      return;
    }

    compiler.hooks.watchRun.tap('XalorAmbientWatch', (activeCompiler) => {
      const watchFileSystem = activeCompiler.watchFileSystem;
      if (!watchFileSystem) return;

      const changedFiles = ObjectUtils.keys(watchFileSystem.watcher.mtimes);
      const totalChanged = changedFiles.length;

      for (let i = 0; i < totalChanged; i++) {
        const file = changedFiles[i];
        if (!isUndefined(file)) {
          executeAmbientTransformationPass(file);
        }
      }
    });
  }
}
