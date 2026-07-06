// plugins/next-turbo.ts
import * as fs from 'fs';
import * as path from 'path';
import { executeAmbientTransformationPass } from './vite-webpack';
import { fsContext } from '../../shared'; // Universal shared workspace truth bearer
/**
 * xalorNextTurboWatchPlugin
 * 🪐 ZERO-DEPENDENCY TURBOPACK LIFE-CYCLE SHIM
 *
 * ROLE:
 * An ambient, non-blocking file-system background watch daemon tailored specifically
 * for Next.js Turbopack (`next dev --turbo`) execution lanes.
 *
 * STRATEGY:
 * Uses a lightweight, low-overhead native `fs.watch` recursive listener cell.
 * It bypasses Webpack completely, intercepting file mutations inside the active Node
 * thread and routing them point-free straight to your core AOT mining pass.
 *
 * COMPLIANCE STATUS:
 * - COMMANDMENT IV: Keeps Turbopack file-monitoring isolated away from Vite/Webpack code layers.
 * - COMMANDMENT VIII: Employs an internal, zero-allocation Map to debounce hardware-level OS events.
 */
export function xalorNextTurboWatchPlugin(
  options: { watchDir?: string } = {},
): void {
  // 1. Only initialize the background daemon inside local development modes
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const rootStr = fsContext.envPaths.rootDir.valueOf();
  const targetRelativeDir = options.watchDir ?? 'src';
  const absoluteWatchTarget = path.resolve(rootStr, targetRelativeDir);

  // Guard offensively against uninstantiated directories on the user's hard drive
  if (!fs.existsSync(absoluteWatchTarget)) {
    return;
  }

  // 🪐 VOLATILE HARDWARE DEBOUNCER: Single-allocation reference cache to suppress rapid OS event streams
  const activeDebounceCache = new Map<string, NodeJS.Timeout>();
  const HARDWARE_DEBOUNCE_COOLDOWN_MS = 100;

  console.log(
    `\x1b[35m🪐 [Xalor Turbo] Ambient Watch Daemon Booted. Target: ${targetRelativeDir}/\x1b[0m`,
  );

  // ⚡ Spin up the raw, recursive operating system filesystem watcher natively
  fs.watch(
    absoluteWatchTarget,
    { recursive: true },
    (_eventType: string, relativeFileName: string | null): void => {
      // Step A: Immediately drop execution point-free if the file token is null or empty
      if (!relativeFileName) return;

      const absoluteFilePath = path
        .join(absoluteWatchTarget, relativeFileName)
        .replace(/\\/g, '/');

      // Step B: Defensive perimeter filter. Ignore files that aren't TypeScript modules
      if (
        !absoluteFilePath.endsWith('.ts') &&
        !absoluteFilePath.endsWith('.tsx')
      ) {
        return;
      }

      // Step C: Clear trailing hardware execution timers to prevent multi-traversal double runs
      const existingTimeout = activeDebounceCache.get(absoluteFilePath);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Step D: Allocate the atomic cooldown window to shield your transformer core
      const newTimeout = setTimeout(() => {
        activeDebounceCache.delete(absoluteFilePath);

        // 🚀 FIRE TRANSMISSION HOOK
        // Routes straight into your verified core logic pass, updating RAM vaults seamlessly!
        executeAmbientTransformationPass(absoluteFilePath);
      }, HARDWARE_DEBOUNCE_COOLDOWN_MS);

      activeDebounceCache.set(absoluteFilePath, newTimeout);
    },
  );
}
