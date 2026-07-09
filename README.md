<p align="center">
  <img
    src="./assets/read-me-container.png"
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
  <a href="https://github.com">
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
    <em>“What else can you do with your types?”</em>
  </p>
  <p style="font-size: 16px; color: #555; margin-top: 0; max-width: 700px;">
    Turn TypeScript "ghost types" into live runtime execution networks—with zero duplicate code and near-zero bundle cost.
  </p>
</div>

<br/>
<br/>

## ⚡ What is Xalor?

Xalor is an **ahead-of-time (AOT) type reification engine** for JavaScript and TypeScript. It acts as a hybrid bridge between your build pipeline and your live production environment by treating native TypeScript interfaces as the single source of truth. 

A background compiler watcher silently parses your code during compilation, stripping out developer telemetry and baking your types into compressed, hidden runtime blueprints. Instead of just checking strings like a basic validation library, Xalor uses these live blueprints to handle advanced architectural patterns—like runtime data validation, data sanitization, functional pattern matching, and multi-version schema upcasting.

<br/>
<br/>

## What We Are Solving 

### 1. The Death of "Ghost Types" (Type Erasure) 

In the JavaScript world, TypeScript types are "ghosts." They exist only while you are writing code in your editor. The exact millisecond your project builds, **every single interface and type is completely erased.** Because of this type erasure, your production JavaScript has absolutely no native awareness of what your data contracts look like, leaving your application boundaries exposed to messy or malicious API payloads. 


### 2. The Flaws of Current Solutions (Zod vs. Typia) 
To fix type erasure, the community relies on two workarounds, but both force engineers to pay a heavy architectural tax: 

- **Schema-First (Zod, Valibot):** You must write a clunky runtime schema object first, then infer the TypeScript type from it. **The Tax:** This ships thousands of lines of heavy validation parsing logic straight to the client browser. It inflates bundle sizes, degrades performance scores, and forces the user's CPU to parse deep validation graphs on application boot. 

- **Type-First Macros (Typia):** They read your native TypeScript interfaces and use a compiler macro to output raw JavaScript validation code. **The Tax:** They spit out massive, messy auto-generated validation files straight into your local source code paths. This clutters your Git history, pollutes your folders with machine-generated noise, and severely chokes code editors during active saving passes. 



### 3. The Dual-Source Synchronization Risk 
If a developer updates a native TypeScript interface but forgets to update a separate validation schema file, your application compiles perfectly but crashes silently in production the second a mismatched API payload hits your endpoints. 


<br/>
<br/>

## 📦 Installation

```bash
npm install @bgskinner2/xalor
```

View the [Full Installation and configuration Reference](http://masterofsum.dev/xalor/docs)


<br/>
<br/>

## 📦 Quick Start

### 1. Register Your Type
Before you can evaluate data at runtime, you need to declare your native TypeScript contract and register it with the compiler.

```ts
import { xalor } from '@bgskinner2/xalor';

export type TUser = {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  active: boolean;
  role: 'user' | 'moderator' | 'admin';
  createdAt: Date; // Native class constructors are supported out-of-the-box
  lastLoginAt: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
};

// Map this interface to a global key token for active compilation tracking
xalor.register<"USER_PROFILE", TUser>()

```

<br/>
<br/>

### 2. Parsing Data
Pass any unverified runtime payload into the engine to verify structure, assert safety limits, and return a strongly-typed asset.



```typescript
import { xalor } from '@bgskinner2/xalor';

const exampleUser: unknown = {
  id: 1,
  username: "brennan_dev",
  email: "brennan@example.com",
  displayName: "Brennan Dev",
  avatarUrl: "https://example.com/avatar.jpg",
  active: true,
  role: "admin",
  createdAt: new Date("2025-01-10T12:00:00Z"),
  lastLoginAt: "2026-06-30T09:15:00Z",
  stats: {
    posts: 142,
    followers: 520,
    following: 180,
  }
};

// Parse untrusted payloads instantly. 
// The engine verifies shape compliance and yields a fully strongly-typed 'TUser' asset!
const parsedUser = xalor.parse<'USER_ACCOUNT'>(exampleUser);

console.log(`Successfully parsed user: ${parsedUser.displayName}`);
```
<br/>
<br/>

### 3. Advanced Core Capabilities
Xalor is far more than a basic validation utility. Because your type blueprints remain alive inside the execution space, you can unlock unique structural methods like **`xalor.drift`** (Upstream version upcasting and schema migration paths).

```ts
import { xalor } from '@bgskinner2/xalor';

// Process an incoming network packet or historical log stream contextually
const currentPayload = xalor.drift<'INVOICE_STREAM'>(incomingEvent, {
  currentKey: 'V2_EXPANDED_INVOICE',
  ancestralKey: 'V1_FLAT_INVOICE_RECORD',

  // UPCAST LANE: Executes contextually ONLY if data matches yesterday's shape.
  // Closures are 100% type-safe with full editor autocomplete reflecting yesterday's exact fields.
  v1_ancestor: (legacyData) => {
    return {
      invoiceId: legacyData.invoiceId,
      meta: {
        createdContext: 'UPCAST_MIGRATION_LANE',
        securityChecksum: 0,
        isSystemEncrypted: false,
      },
    };
  },
});
```


### 🏢 **Scenarios:**

     I. **The Breakage:** : You refactor an API schema from user_phone to a nested profile.contactNumber object. Because 40% of your mobile users haven't installed the latest app update yet, they continue sending legacy payloads that crash traditional parsers.

     II. **The Rescue:** :  matchDrift intercepts the old requests, matches their structural signature against yesterday's ancestral blueprint hash, and maps the fields to the modern layout in-memory before it hits your controller.


📖 Ready for an in-depth view? View our [Full matchDrift Documentation & Design Guide](http://masterofsum.dev/xalor/docs).

<br/>
<br/>

## 🛠️ CLI Developer Tooling

```bash
# Force an out-of-band workspace AST metadata compilation sweep and type audit
npx xalor compile

# Execute the final production telemetry vacuum, ballast amputation, and asset delivery
npx xalor vacuum

# Profile type graph compaction ratios, cache sizes, and search for dead code orphans
npx xalor audit
```

View the [Full CLI Reference & Studio Guide](http://masterofsum.dev/xalor/docs) to learn about `build`, `clear`, and our local interactive orchestration dashboard.

<br/>
<br/>

## 📊 Ecosystem Comparison

| Operational Feature                                             | Zod / Valibot | Typia | **Xalor** |
| :-------------------------------------------------------------- | :-----------: | :---: | :-------: |
| **Single Source of Truth** (Types are schemas)                  |      ❌       |  ✔️   |  **✔️**   |
| **Zero Client Bundle Inflation** (0 KB runtime parser)          |      ❌       |  ✔️   |  **✔️**   |
| **Ambient Project Integration** (Zero complex setup clutter)    |      ✔️       |  ❌   |  **✔️**   |
| **GPS Diagnostic Tracing** (Traceability tracking rules)        |      ❌       |  ❌   |  **✔️**   |
| **Distributed Contract Governance** (`matchDrift` Upcast Lanes) |      ❌       |  ❌   |  **✔️**   |

<br/>
<br/>

## 📄 License

This project is licensed under the MIT License.  
© 2026 Brennan Skinner
