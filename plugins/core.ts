// plugins/core.ts
import ts from 'typescript';
import * as path from 'path';
import xalorTransformerPlugin from '../transformer';
import { fsContext } from '../shared';

// ============================================================================
// 🪐 STRUCTURAL WEBPACK COMPILER INTERFACES (Commandment IX Compliant)
// ============================================================================
export interface TWebpackCompilerInstance {
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
}

/**
 * executeAmbientTransformationPass
 * 🪐 STATELESS AOT FILE TRACE CONDUIT
 */
function executeAmbientTransformationPass(absoluteFilePath: string): void {
  if (!absoluteFilePath.endsWith('.ts') && !absoluteFilePath.endsWith('.tsx')) {
    return;
  }

  const rootStr = fsContext.envPaths.rootDir.valueOf();

  const normalizedAbsolute = path.resolve(absoluteFilePath).replace(/\\/g, '/');
  const normalizedRoot = path.resolve(rootStr).replace(/\\/g, '/');

  let relativePathKey = normalizedAbsolute.replace(normalizedRoot, '');
  if (relativePathKey.startsWith('/')) {
    relativePathKey = relativePathKey.slice(1);
  }
  if (!relativePathKey) {
    relativePathKey = 'src/index.ts';
  }

  try {
    const program = ts.createProgram([absoluteFilePath], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      strict: true,
      noEmit: true,
    });

    program.emit(undefined, () => {}, undefined, undefined, {
      before: [xalorTransformerPlugin(program)],
    });

    if (process.env.XALOR_CLI_SILENT !== 'true') {
      console.log(
        `\x1b[32m✨ [Xalor AOT] Ambient Watch Sync Complete: ${relativePathKey}\x1b[0m`,
      );
    }
  } catch {
    console.error(
      `\x1b[31m🚨 [Xalor AOT] Ambient Watch Interrupted: ${relativePathKey}\x1b[0m`,
    );
  }
}

// ============================================================================
// ADAPTER A: NATIVE VITE DEVELOPMENT WATCH COUPLING
// ============================================================================
export function xalorViteWatchPlugin() {
  return {
    name: 'vite-plugin-xalor-ambient-watch',
    apply: 'serve' as const,

    async handleHotUpdate(ctx: { file: string }) {
      executeAmbientTransformationPass(ctx.file);
    },
  };
}

// ============================================================================
// ADAPTER B: NATIVE WEBPACK / NEXT.JS DEVELOPMENT WATCH COUPLING
// ============================================================================
export class XalorWebpackWatchPlugin {
  public apply(compiler: TWebpackCompilerInstance): void {
    compiler.hooks.watchRun.tap('XalorAmbientWatch', (activeCompiler) => {
      const watchFileSystem = activeCompiler.watchFileSystem;
      if (!watchFileSystem) return;

      const changedFiles = Object.keys(watchFileSystem.watcher.mtimes);
      const totalChanged = changedFiles.length;

      for (let i = 0; i < totalChanged; i++) {
        const file = changedFiles[i];
        if (file !== undefined) {
          executeAmbientTransformationPass(file);
        }
      }
    });
  }
}
/**
 # Ambient Transformation Pipeline

This document describes the end-to-end execution flow of the ambient transformation system, from framework file watching through transformer execution and cache generation.

---

# Step 1: Framework Interception Gate

The transformation pipeline begins when a source file is modified.

## Vite

When running under **Vite** in local development (`apply: 'serve'`):

1. Vite's file watcher detects the filesystem change.
2. The plugin's `handleHotUpdate(ctx)` hook is invoked.
3. Vite provides the absolute path of the modified file via `ctx.file`.
4. That absolute path is forwarded directly into the transformation conduit.

Flow:

```text
File Save
    ↓
Vite File Watcher
    ↓
handleHotUpdate(ctx)
    ↓
ctx.file
    ↓
executeAmbientTransformationPass(...)
```

---

## Next.js / Webpack

When running under **Next.js (Webpack)**:

1. Webpack's incremental watcher detects the file modification.
2. Before compilation begins, the native `watchRun` hook executes.
3. The plugin intercepts this lifecycle stage.
4. It inspects:

```ts
watchFileSystem.watcher.mtimes
```

This internal timestamp map contains every file currently marked as modified.

The plugin performs a lightweight iteration over the changed entries and forwards each altered file path into the transformation handler.

Flow:

```text
File Save
    ↓
Webpack Watcher
    ↓
watchRun
    ↓
watchFileSystem.watcher.mtimes
    ↓
Changed Files
    ↓
executeAmbientTransformationPass(...)
```

---

# Step 2: Path Canonicalization and Standardization

Execution enters:

```ts
executeAmbientTransformationPass(absoluteFilePath)
```

The transformer first computes a stable project-relative identifier.

## Root Directory Resolution

The project root is obtained from the shared filesystem context:

```ts
fsContext.envPaths.rootDir.valueOf()
```

---

## Path Normalization

Both paths are normalized using:

```ts
path.resolve(...)
```

Windows separators are converted into POSIX form:

```ts
.replace(/\\/g, "/")
```

This guarantees identical path behavior across:

- Windows
- Linux
- macOS

---

## Canonical Relative Key

The normalized project root is removed from the normalized absolute file path, producing a canonical relative identifier.

Example:

```text
Absolute:
C:/Projects/App/src/index.ts

Root:
C:/Projects/App

Relative Key:
src/index.ts
```

This relative key becomes the transformer's canonical file identifier.

---

# Step 3: Spinning Up the In-Memory Compilation Frame

To preserve strict architectural boundaries, the plugin never interacts directly with the transformer's internal state.

Instead, it invokes the transformer exactly as any external TypeScript consumer would.

## Program Creation

A temporary in-memory compilation is created:

```ts
ts.createProgram(...)
```

Only the modified file is included in the compilation.

---

## No Physical Output

Compilation is configured with:

```ts
noEmit: true
```

The write hooks are also overridden, ensuring that no JavaScript files are written to disk.

The compilation exists solely to execute the transformer.

This guarantees:

- zero filesystem pollution
- zero generated JavaScript
- zero emitted declaration files

Only the transformer itself executes.

---

# Step 4: Transformer Activation

The plugin invokes:

```ts
program.emit(...)
```

During emit, the transformer is registered in the `before` transformation stage:

```ts
before: [
    xalorTransformerPlugin(program)
]
```

At this point, execution transfers entirely into the transformer's internal pipeline.

---

## Internal Initialization

Upon visiting the `SourceFile`, the transformer immediately performs its internal cleanup operations.

Examples include:

```ts
xalorCentralContext.resetActivePassKeys()

xalorCentralContext.resetBlacklist()
```

These routines prepare a clean transformation context for the current compilation pass.

---

## Graph Processing

The transformer then proceeds to:

- parse the source file
- analyze type syntax graphs
- update volatile in-memory registries
- rebuild internal metadata
- refresh transformation state

All of these operations remain encapsulated within the transformer's private execution domain.

---

## Cache Generation

Once analysis completes, the transformer persists its derived metadata into its internal cache snapshots.

These cache artifacts are generated entirely from within the transformer itself, without exposing any internal context APIs to the hosting plugin.

---

# Architectural Summary

```text
File Save
    │
    ▼
Framework Watcher
(Vite / Webpack)
    │
    ▼
Plugin Hook
(handleHotUpdate / watchRun)
    │
    ▼
executeAmbientTransformationPass(...)
    │
    ▼
Canonical Path Resolution
    │
    ▼
ts.createProgram(...)
    │
    ▼
program.emit(...)
    │
    ▼
xalorTransformerPlugin(program)
    │
    ▼
Internal Reset
    │
    ▼
Type Graph Analysis
    │
    ▼
Registry Updates
    │
    ▼
Cache Snapshot Generation
```

---

# Design Principles

The pipeline is built around several architectural guarantees:

- Framework integrations remain thin entry points responsible only for detecting file changes.
- The plugin communicates with the transformer exclusively through the standard TypeScript compiler API.
- The transformer maintains complete ownership of its internal state and lifecycle.
- No internal context methods or registries are exposed outside the transformer.
- All analysis executes entirely in memory.
- No JavaScript output is produced during ambient transformation passes.
- Cache generation and registry updates remain fully encapsulated within the transformer's private domain.
 */
