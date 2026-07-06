// plugins/index.ts
/**
 * 🪐 XALOR PUBLIC PLUGINS REGISTRY
 *
 * ROLE:
 * Master entry point for the public framework integration layer.
 * Exposes explicit, framework-standard drop-in modules for your users.
 *
 * DESIGN STATUS:
 * - Pure vanilla TypeScript with absolute zero 3rd party package dependencies.
 * - Ready to expand and append future build-tool adaptations point-free.
 */

// 1. Export the production-ready adapters we built for Vite and Webpack (Next.js)
/* prettier-ignore */
export { xalorViteWatchPlugin, XalorWebpackWatchPlugin } from './environments/vite-webpack';

/* prettier-ignore */
export { xalorNextTurboWatchPlugin } from './environments/next-turbo';

// 2. Export the structural interface definitions to keep external setups typed
/* prettier-ignore */
export type { TWebpackCompilerInstance } from './shared-items';

// ============================================================================
// 🔮 FUTURE EXTENSIBILITY MAP (PRE-ARCHITECTED SLOTS)
//
// Because we are not using a third-party framework, adding support for other
// systems down the line means writing thin, native wrappers right here.
// ============================================================================

/**
 * xalorRollupWatchPlugin
 * Rollup plugins are structurally identical to Vite plugins!
 * When you are ready to expand, this can route directly to your same core.
 */
/*
export function xalorRollupWatchPlugin() {
  return xalorViteWatchPlugin();
}
*/

/**
 * xalorEsbuildWatchPlugin
 * Esbuild uses an onEnd / onLoad setup callback ring.
 * When ready, your custom esbuild build hook will map right to your core conduit.
 */
/*
export function xalorEsbuildWatchPlugin() {
  return {
    name: 'esbuild-plugin-xalor-ambient-watch',
    setup(build: any) {
      build.onEnd((result: any) => {
        // Traverses changed files and fires executeAmbientTransformationPass point-free!
      });
    }
  };
}
*/
