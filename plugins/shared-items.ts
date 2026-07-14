import ts from 'typescript';
/**
 * Shared baseline TypeScript compiler configuration.
 *
 * Configured for modern Node.js execution (ES2022 / NodeNext),
 * with strict type-checking enabled and library checks skipped for performance.
 * Intended as the default foundation for program/compiler instantiation.
 */
export const BASE_COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  strict: true,
  noEmit: false,
  skipLibCheck: true,
  esModuleInterop: true,
  // importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Preserve,
  // jsx: ts.JsxEmit.Preserve | ts.JsxEmit.ReactJSX
  // paths: { baseUrl ?? },
  // isolatedModules: true,
  // noTypesAndSymbols: true
  // types: []
  // typeRoots: []
} satisfies ts.CompilerOptions;

/**
 * TWebpackCompilerInstance
 *
 * - avoid official Webpack type packages in order to avoid making this too bloated with downstream deps.
 *
 * I. Hook Registration: hooks.watchRun.tap
 *   - Webpack uses a deeply optimized event-emitter framework called Tapable to orchestrate its build stages.
 *     @link https://github.com/webpack/tapable
 *   - watchRun: This specific property is an event hook that fires exactly once at the beginning of an incremental
 * compilation pass, right after a file change is captured on disk, but before Webpack builds its internal
 * compilation graph chunks.
 *   - tap(pluginName, callback): This is the registration method. It accepts your unique tracking string identifier
 * ('XalorAmbientWatch') and an execution callback closure.
 *  - callback: (compiler: TWebpackCompilerInstance) => void: Notice the recursion here. When Webpack fires the hook,
 * it passes the active executing compiler instance right back into our callback as an argument (activeCompiler).
 * This lets our loop safely read the real-time file system states.
 *
 * II. Debounce
 * - watchFileSystem?: The question mark is a defensive coding requirement. When Webpack boots up for a cold
 * production build (xalor compile), this file system watcher does not exist in memory. The optional chaining token
 * protects our runtime code from throwing unhandled TypeError exceptions.
 * - mtimes: This is a native JavaScript object dictionary record where the keys are absolute file paths and the values are their filesystem modified-time timestamps (number).
 *
 */
export type TWebpackCompilerInstance = {
  readonly hooks: {
    readonly watchRun: {
      tap(
        pluginName: string,
        callback: (compiler: TWebpackCompilerInstance) => void,
      ): void;
    };
  };
  readonly watchFileSystem?: {
    readonly watcher: {
      readonly mtimes: Record<string, number | { accuracy?: number } | unknown>;
    };
  };
};
// =================================================
// =================================================
// vite-webpack
// =================================================
// =================================================
export type THotUpdateContext = {
  readonly file: string;
};

export type TEmitFileOptions = {
  readonly type: 'asset';
  readonly fileName: string;
  readonly source: string;
};

export type TPluginContext = {
  /**
   * NATIVE COMPILATION ASSET INJECTOR
   * Registers a flat, un-wrapped file footprint straight into the bundler asset tree map.
   */
  emitFile(options: TEmitFileOptions): void;
};

export type TXalorVitePlugin = {
  readonly name: string;
  configResolved(): void;
  handleHotUpdate(ctx: THotUpdateContext): Promise<void> | void;
  generateBundle(this: TPluginContext): void;
};
