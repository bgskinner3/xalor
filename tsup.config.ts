// packages/xalor/tsup.config.ts
import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'transformer/index': 'transformer/index.ts',
    'scripts/postinstall': 'scripts/postinstall.ts',
    'cli/bin': 'cli/bin.ts',
    'plugins/index': 'plugins/index.ts',
  },
  loader: {
    '.html': 'text',
  },
  format: ['cjs', 'esm'],
  platform: 'node',
  clean: true,
  bundle: true,
  external: [
    // 1. Core Internal Dependencies (Do NOT bundle the TypeScript Compiler)
    'typescript',

    // 2. Peer/Optional Third-Party Packages (Keep external to prevent duplicate instances)
    /^@bgskinner2\//, // Keeps any monorepo sister packages external

    // 3. Modern Node.js Prefixed Protocol Subpaths (The absolute most critical line)
    /^node:/, // Catches 'node:fs', 'node:path', 'node:crypto', 'node:child_process', etc.

    // 4. Legacy Node.js Standard Library Strings (For older import syntax compatibility)
    'fs',
    'path',
    'zlib',
    'perf_hooks',
    'crypto',
    'os',
    'child_process',
    'module',
    'url',
    'util',
    'stream',
    'events',
    'http',
    'https',
    'net',
    'dns',
    'readline',
    'process',
    'v8',
    // 'worker_threads',
    // 'diagnostics_channel',
  ],
  tsconfig: 'tsconfig.build.json',

  // 🪐 THE CURE: Turn on active minification for the unified build pass!
  // This squashes long variable names down to single letters just like Zod.
  minify: true,
  sourcemap: true,
  shims: true,
  splitting: false,
  treeshake: true,

  // 🪐 DEEP PROPERTY OPTIMIZATION MANGLE BLOCKS
  // Custom compiler properties instructing the underlying builder engine
  // to aggressively minify internal dictionary, class, and method names.
  esbuildOptions(options) {
    options.mangleProps =
      /_ROUTER|AreaError|ConfigRule|TerminalPanel|TransformerError|Anomaly/;
  },

  dts: {
    resolve: true,
    compilerOptions: {
      composite: false,
      incremental: false,
    },
  },

  /**
   * 🛰️ POST-BUILD INTEGRITY LIFECYCLE HANDSHAKE
   */
  onSuccess: async () => {
    const distDir = path.join(__dirname, 'dist');
    const transDir = path.join(distDir, 'transformer');
    const scriptsDir = path.join(distDir, 'scripts');

    // 1. Establish CJS environment safety inside the transformer subfolder
    if (!fs.existsSync(transDir)) {
      fs.mkdirSync(transDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(transDir, 'package.json'),
      JSON.stringify({ type: 'commonjs' }, null, 2),
    );

    // 2. Ensures the scripts subfolder physically exists in your build output
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // 3. 🧠 THE PRODUCTION TYPES OVERRIDE:
    const builtDtsFile = path.join(distDir, 'index.d.ts');
    if (fs.existsSync(builtDtsFile)) {
      const originalContent = fs.readFileSync(builtDtsFile, 'utf8');
      const tripleSlashDirective =
        '/// <reference path="../../../../.xalor/solid-env.ts" />\n';
      fs.writeFileSync(
        builtDtsFile,
        tripleSlashDirective + originalContent,
        'utf8',
      );
      console.log(
        '[xalor:build] 🔗 Ambient workspace triple-slash directive successfully injected into production types!',
      );
    }

    // 4. Embed Static Templates cleanly using explicit filesystem cloning paths
    const srcTemplatesDir = path.join(__dirname, 'static-templates');
    const destTemplatesDir = path.join(distDir, 'static-templates');
    if (fs.existsSync(srcTemplatesDir)) {
      if (!fs.existsSync(destTemplatesDir)) {
        fs.mkdirSync(destTemplatesDir, { recursive: true });
      }
      const files = fs.readdirSync(srcTemplatesDir);
      const len = files.length;
      for (let i = 0; i < len; i++) {
        const file = files[i];
        fs.copyFileSync(
          path.join(srcTemplatesDir, file),
          path.join(destTemplatesDir, file),
        );
      }
      console.log(
        '[xalor:build] 📦 Static baseline templates explicitly embedded into dist/static-templates/',
      );
    }

    console.log(
      '[xalor:build] 🚀 Post-build environment overrides applied successfully!',
    );
  },
});
