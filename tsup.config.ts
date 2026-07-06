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
  external: ['typescript', 'fs', 'path'],
  tsconfig: 'tsconfig.build.json',
  // 🐛 READABLE ENTIRE DIAGNOSTICS DEEP LOGS:
  // Preserves your readable, un-minified variable names during your alpha cycles!
  minify: false,
  sourcemap: true, // Generates map nodes to wire stack traces to original code lines
  shims: true, // Injects necessary polyfills for __dirname safety in ESM mode
  // 🧠 THE SHARED VAULT MEMORY PROTECTION BOUNDARY:
  // Forces code-splitting to ensure your internal shared/ utilities compile into
  // a single, common chunk file, protecting your memory singletons from duplication!
  splitting: true,
  treeshake: true,

  // Deep structural typings declaration resolution
  dts: {
    resolve: true,
    compilerOptions: {
      composite: false,
      incremental: false,
    },
  },

  /**
   * 🛰️ POST-BUILD INTEGRITY LIFECYCLE HANDSHAKE
   *
   * Executes automatically the exact millisecond compilation terminates.
   * Enforces monorepo relative path safety, establishes a legacy CJS environment
   * override drawer for ts-patch, and clones cold-start baseline templates.
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
    // This injects the master relative triple-slash instruction string
    // right onto the absolute top line of your production dist/index.d.ts file!
    // It bypasses local dev build crashes entirely because it happens POST-BUILD!
    const builtDtsFile = path.join(distDir, 'index.d.ts');
    if (fs.existsSync(builtDtsFile)) {
      const originalContent = fs.readFileSync(builtDtsFile, 'utf8');

      // 🟢 The Directive string: Walks back exactly 4 folders from dist/ to hit the user's project root!
      const tripleSlashDirective =
        '/// <reference path="../../../../.xalor/solid-env.ts" />\n';

      // Prepends the instruction to the top of the file seamlessly
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
