<p align="center">
  <img
    src="https://alcyhpembwnuztcsthtx.supabase.co/storage/v1/object/public/Page%20Images/xalor/read-me-container-bg-v2.png"
    alt="Xalor hero"
    width="100%"
  />
</p>

<div align="center">
<h1 style="color: #51FFFF; letter-spacing: 8px;">XALOR</h1>
</div>

<div align="center">
  <p style="font-size:24px; max-width:750px; font-weight: 600; margin-bottom: 5px;">
    <em>“Don't just erase your types. Run them.”</em>
  </p>
  <p style="font-size: 16px; color: #555; margin-top: 0; max-width: 700px;">
  Turn your TypeScript types into runtime intelligence—powering validation, generation, migration, and transformations without duplicate schemas or runtime type definitions.
  </p>
</div>

<div align="center">
  <a href="https://www.npmjs.com/package/@bgskinner2/xalor">
    <img src="https://img.shields.io/npm/v/@bgskinner2/xalor.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/@bgskinner2/xalor">
    <img src="https://img.shields.io/npm/types/@bgskinner2/xalor.svg" alt="TypeScript Support" />
  </a>
  <a href="https://github.com/bgskinner3/xalor/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@bgskinner2/xalor.svg" alt="License" />
  </a>
</div>

&nbsp;

<h3 align="center">
  📦 <a href="http://masterofsum.dev/xalor/docs/getting-started">Installation</a>
  • 📖 <a href="http://masterofsum.dev/xalor/docs">Documentation</a>
  • ⚙️ <a href="http://masterofsum.dev/xalor/docs/api">API Reference</a>
</h3>

<br/>
<br/>

# ⚡ What is Xalor?

Xalor is an **ahead-of-time (AOT) Type Metadata Engine** for TypeScript.

It captures TypeScript's erased type information during compilation and transforms it into an optimized runtime structural graph of reusable blueprints.

These blueprints become a runtime metadata layer that powers:

- Runtime validation
- Data normalization
- Structural matching
- Runtime generation
- Schema evolution
- Type-driven transformations

without maintaining duplicate schemas or shipping runtime schema interpreters.

Your TypeScript types become runtime-aware structural contracts.

<br/>
<br/>

## 🚀 Quick Start

### 1. Installation & Configuration

```bash
npm install @bgskinner2/xalor
```

💡 **Looking for Vite, Next.js, or custom build configurations?**

See the [Bundler Integration Guide](http://masterofsum.dev/xalor/docs/gettingStarted).

<br/>

### 2. Define Your Type

Write normal TypeScript.

No schemas.  
No DSLs.  
No duplicated validation objects.

```ts
import { xalor } from '@bgskinner2/xalor';

export type TUser = {
  id: number;
  username: string;
  role: 'user' | 'moderator' | 'admin';
};

// Register your type contract token for AOT extraction
xalor.register<'USER_PROFILE', TUser>();
```

During build:

```text
TypeScript
    ↓
Extraction
    ↓
Blueprint
    ↓
Runtime Metadata
```

<br/>

### 3. Validate Runtime Data

```ts
const result = xalor.safeParse<'USER_PROFILE'>(payload);

if (result.success) {
  // Fully typed: TypeScript automatically recognizes 'username'
  console.log(result.data.username);
}
```

The result is:

✅ Runtime validated
✅ Fully typed
✅ Backed by your original TypeScript definition

<br/>
<br/>

# 🧬 Runtime Type Intelligence

Validation is only the beginning.

Once Xalor understands your application's structural contracts, the same runtime intelligence can power an entire lifecycle of data operations.

<br/>

## 🛡 Runtime Validation

```ts
const result = xalor.safeParse<'USER_PROFILE'>(payload);
```

Validate external data while preserving full TypeScript inference.

<br/>

## 🏗 Runtime Generation

Generate safe structures directly from your types:

```ts
xalor.default<'USER_PROFILE'>();

xalor.mock<'USER_PROFILE'>();
```

Useful for:

- Testing
- Forms
- UI scaffolding
- Application state initialization

<br/>

## 🔄 Schema Evolution & Migration

Software changes. Data survives.

Mobile clients, databases, event streams, and external services often contain older versions of your structures.

Xalor can understand structural lineage and migrate historical payloads into current contracts.

```ts
xalor.drift<'USER_PROFILE'>(legacyPayload, context);
```

Instead of rejecting yesterday's data, Xalor can evolve it into today's structure.

<br/>

## 🧩 Structural Operations

Runtime intelligence enables higher-level operations:

```ts
xalor.guard<'USER_PROFILE'>(payload);

xalor.merge(context);

xalor.clone(payload);
```

Your type system becomes reusable runtime knowledge.

<br/>

# ⚙️ How Does Xalor Work?

Xalor does not recreate TypeScript as handwritten runtime schemas.

Instead, it converts structural type information into compact, deterministic runtime blueprints.

Example:

```ts
interface User {
  id: number;
  username: string;
  role: 'user' | 'moderator' | 'admin';
}
```

Becomes:

```json
{
  "registryKey": "USER_PROFILE",
  "blueprint": "sh_4vztgu",
  "shape": {
    "kind": "object",
    "properties": {
      "id": {
        "kind": "primitive",
        "type": "number"
      },
      "username": {
        "kind": "primitive",
        "type": "string"
      },
      "role": {
        "kind": "union",
        "values": ["user", "moderator", "admin"]
      }
    }
  }
}
```

The runtime receives optimized structural blueprints instead of duplicate schema definitions.

Benefits:

- Shared structures can be deduplicated.
- Large applications avoid repeated schema payloads.
- Runtime operations execute against precomputed type intelligence.

Learn more about Xalor's compiler pipeline, blueprint system, and runtime architecture:

👉 [Documentation Portal](http://masterofsum.dev/xalor/docs)

<br/>

# 📊 Performance Characteristics

Because Xalor operates against precompiled metadata instead of interpreting schemas dynamically:

- ⚡ Optimized validation paths
- 🛡 Fast malformed payload rejection
- 🧠 Low-allocation runtime behavior

Benchmark details:

[View Performance Benchmarks](http://masterofsum.dev/xalor/docs/benchmarks)

<br/>

## 📄 License

MIT License

© 2026 Brennan Skinner
