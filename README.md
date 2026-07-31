<p align="center">
  <img
    src="https://alcyhpembwnuztcsthtx.supabase.co/storage/v1/object/public/Page%20Images/xalor/read-me-container.png"
    alt="Xalor hero"
    width="100%"
  />
</p>

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

<h2 align="center">
  📦 <a href="http://masterofsum.dev/xalor/docs/getting-started">Installation</a>
  • 📖 <a href="http://masterofsum.dev/xalor/docs">Documentation</a>
  • ⚙️ <a href="http://masterofsum.dev/xalor/docs/api">API Reference</a>
</h2>

<br/>
<br/>

<div align="center">
  <p style="font-size:24px; max-width:750px; font-weight: 600; margin-bottom: 5px;">
    <em>“Don't just erase your types. Run them.”</em>
  </p>
  <p style="font-size: 16px; color: #555; margin-top: 0; max-width: 700px;">
   Turn pristine TypeScript interfaces into live runtime metadata networks—with zero local code pollution, zero third-party compiler dependencies, and 0 KB client schema inflation.
  </p>
</div>

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

### The Problem

TypeScript provides exceptional developer safety, but its type system disappears during compilation.

```text
Developer Types

interface User {
  id: number;
  name: string;
}

        ↓

TypeScript Compilation

        ↓

Production JavaScript

(no knowledge of User)
```

After compilation, production systems lose access to the structural knowledge that existed during development.

Applications must either:

- Maintain duplicate runtime schemas.
- Generate validation code.
- Ship runtime systems that reconstruct type information dynamically.

Xalor takes a different approach.

<br/>
<br/>

### The Xalor Approach

Xalor captures type information **before compilation erasure** and converts it into compact runtime blueprints.

```text
TypeScript Source
        ↓
Compiler Extraction
        ↓
Structural Reification
        ↓
Canonical Fingerprinting
        ↓
CAS Blueprint Registry
        ↓
Runtime Metadata Vault
        ↓
Type Intelligence Operations
```

Your types remain the single source of truth.

<br/>

The resulting metadata powers:

- ⚡ **Runtime Validation** — `safeParse`, `parse`, and `guard`
- 🧹 **Data Sanitization** — Normalize and clean incoming payloads
- 🧬 **Structural Matching** — Execute logic against known type layouts
- 🔄 **Schema Evolution** — Upgrade historical payloads through `drift`
- 🏗️ **Runtime Generation** — Create defaults, mocks, and transformations

<br/>
<br/>

---

## 📦 Installation

```bash
npm install @bgskinner2/xalor
```

💡 **Looking for Vite, Next.js, or custom build configurations?**

See the [Bundler Integration Guide](http://masterofsum.dev/xalor/docs/gettingStarted).

---

# 🚀 Quick Start

## 1. Define Your Type

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

---

## 2. Validate Runtime Data

```ts
const result = xalor.safeParse<'USER_PROFILE'>(payload);

if (result.success) {
  // Fully typed: TypeScript automatically recognizes 'username'
  console.log(result.data.username);
}
```

Your returned data is fully typed.

<br/>
<br/>

---

# ⚖️ Why Xalor Exists

Modern TypeScript applications usually choose between three approaches:

| Approach                   | Tradeoff                                  |
| -------------------------- | ----------------------------------------- |
| Handwritten schemas        | Your source of truth exists twice         |
| Runtime validation engines | Production ships additional parsing logic |
| Code generation            | Adds generated files and build complexity |

Xalor takes a different path:

> Capture the type system once during compilation, then reuse that intelligence everywhere.

<br/>
<br/>

### Traditional Flow

```text
TypeScript Type

        +

Runtime Schema

        ↓

Two Sources Of Truth
```

<br/>

### Xalor Flow

```text
TypeScript Type

        ↓

Build-Time Extraction

        ↓

Runtime Blueprint

        ↓

Every Runtime Capability
```

<br/>
<br/>

---

# 🧬 The Xalor Metadata Layer

Xalor does not recreate TypeScript as handwritten runtime schemas.

Instead, it converts structural type information into compact, deterministic metadata blueprints.

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
        "values": ["admin", "user", "moderator"]
      }
    }
  }
}
```

The runtime receives the optimized blueprint reference instead of shipping duplicate schema logic.

<br/>

Benefits:

- Shared structures are automatically deduplicated.
- Large projects avoid repeated schema payloads.
- Runtime operations execute against compact metadata.

<br/>
<br/>

---

# 🚀 Beyond Validation

Validation is simply the first consumer of Xalor's metadata layer.

## 🛡 Runtime Validation

```ts
const result = xalor.safeParse<'USER_PROFILE'>(payload);

if (result.success) {
  console.log(result.data.username);
}
```

---

## 🏗 Runtime Generation

Generate safe structures directly from your types:

```ts
xalor.default<'USER_PROFILE'>();

xalor.mock<'USER_PROFILE'>();
```

Useful for:

- Form initialization
- Testing
- UI scaffolding
- Empty application states

---

## 🔄 Schema Evolution

Distributed systems rarely deploy everything at once.

Old clients, databases, and services continue sending historical structures.

```ts
xalor.drift<'USER_PROFILE'>(legacyPayload, context);
```

Xalor can identify previous structural versions and migrate payloads into the current contract.

---

## 🧩 Structural Operations

Runtime metadata enables higher-level operations:

```ts
xalor.guard<'USER_PROFILE'>(payload);

xalor.merge(context);

xalor.clone(payload);
```

Your type system becomes a reusable runtime intelligence layer.

<br/>
<br/>

---

# 📊 Performance Characteristics

Benchmarked on:

- Apple M2 Pro
- Node.js 22

Because Xalor operates against precompiled metadata instead of interpreting schemas dynamically:

- ⚡ Sub-microsecond validation paths
- 🛡 Extremely fast malformed payload rejection
- 🧠 Low allocation runtime behavior

Full benchmark suite:

[View Performance Benchmarks](http://masterofsum.dev/xalor/docs/benchmarks)

<br/>
<br/>

---

## 📖 Explore The Architecture

Learn how Xalor's compiler pipeline, CAS storage, and runtime vault work:

👉 [Documentation Portal](http://masterofsum.dev/xalor/docs)

<br/>
<br/>

---

## 📄 License

MIT License

© 2026 Brennan Skinner
