<p align="center">
  <img
    src="./assets/XALOR_README.png"
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
  <a href="https://bundlephobia.com/package/@bgskinner2/xalor">
    <img src="https://img.shields.io/bundlephobia/minzip/@bgskinner2/xalor" alt="Minizip Size" />
  </a>
</div>

&nbsp;

<p align="center">
  📦 <a href="https://github.com/bgskinner3/axiom-kit/blob/main/packages/xalor/docs/Installation.md">Installation</a> • 
  📖 <a href="https://github.com/bgskinner3/axiom-kit/blob/main/packages/xalor/docs/api.md">Documentation</a> • 
  ⚙️ <a href="https://github.com/bgskinner3/axiom-kit/blob/main/packages/xalor/docs/api.md">API Reference</a>
</p>

<br/>
<br/>

<div align="center">
  <p style="font-size:20px; max-width:700px;">
    <em>“A build-time TypeScript engine that turns your native types into a live runtime validation and generation system — without duplicating schemas or shipping heavy validation libraries.”</em>
  </p>
</div>

<br/>
<br/>

## 🧩 What is Xalor?

Xalor is a build-time type compiler and runtime orchestration framework. Write native TypeScript types once, and your app handles runtime validation, mocking, and data operations with zero schema duplication.

### 🗂️ The 50/50 Split Architecture

Xalor permanently divides the workload into two equal, highly optimized operational phases:

```text
       [ COMPILER ENGINE (50% Build-Time) ]         │       [ STRATEGY MATRIX (50% Runtime) ]
  • Background compiler memory scanning             │   • O(1) Memory Pointer Hydration on Boot
  • Deep Graph Interning (CAS Compaction)           │   • Multi-Strategy Payload Validation (guard, assert)
  • Ingestion Purity Gatehouse Filtering            │   • Reverse-Blueprint Synthesis (default, mock)
  • Depth-Bomb Cyclic Loop Protection               │   • Linear Object Shape-Shifting (pick, omit, merge)
```

### 🛰️ The Code Lifecycle Blueprint

You change zero coding habits. You write pure, native TypeScript types, and Xalor handles the compilation, indexing, and runtime mapping under the hood.

#### 1. The Build-Time Extraction Pass (Your IDE)

The background compiler watcher silently parses your types, sweeps them through purity filters, and bakes them into ultra-compact, content-addressed data layout maps on disk—keeping your source folders 100% clean.

```ts
// src/contracts.ts
import { registerXalor } from '@xalor/core';

export type TTransaction = {
  id: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
};

// Register your native contract exactly once
registerXalor<'TX_INDEX', TTransaction>();
```

#### 2. The Runtime Orchestration Pass (Your Live Application)

Because 100% of the property parsing layout math was pre-compiled at build-time, your production application bundle inherits a clean, pre-hydrated snapshot ledger. It runs flat, linear memory lookups using direct property matches at hardware-level speed:

```ts
// src/api/gateway.ts
import { validateXalor, generateXalor } from '@xalor/core';

export async function handleIncomingPayment(payload: unknown) {
  // ⚡ Strategy A: Execute an airtight runtime assertion throw instantly
  validateXalor<'TX_INDEX', 'assert'>(payload);

  // ⚡ Strategy B: Manufacture a typed zero-state default skeleton object
  const cleanTemplate = generateXalor<'TX_INDEX', 'default'>();

  console.log(payload.id); // Payload is fully narrowed and type-safe!
}
```

<br/>

## ✨ Features

- **Zero-Schema Type Bridge** — Native TypeScript types become your single source of truth.
- **Ghost Bridge IntelliSense** — Automatic IDE autocomplete with zero manual wiring.
- **Zero-Footprint Runtime** — Heavy type processing stays at build-time, not runtime.
- **Interactive Local Playground** — Explore types and APIs instantly through a live local daemon.
- **Multi-Utility Strategy API** — Validate, generate, and transform data from a unified API.
- **Boot-Time Parsing Elimination** — Microsecond-fast startup for serverless and edge workloads.
- **Deep Graph Interning (CAS)** — Deduplicates shared structures to minimize memory and storage usage.

### 📚 Dive deeper [All Features →](https://github.com/bgskinner3/xalor/tree/main)

<br/>

## 📦 Install

```bash

npm install @bgskinner2/xalor

```

### ⚙️ Explore Configuration Options [Configure →](https://github.com/bgskinner3/xalor/tree/main)

<br/>

## 🛠️ Quick Start

```typescript
import { xalor } from '@bgskinner2/xalor';
import type { UserProfile } from './types';

// 1. Validate incoming data payloads instantly
const isValid = xalor.check<UserProfile>(payload);

// 2. Generate compliant mock data structures out-of-the-box
const mockData = xalor.mock<UserProfile>();
```

<br/>

## ⚡ Runtime API Operations Suite

Xalor leverages your pre-compiled, content-addressed type blueprints (`sh_xxxxxx`) to drive a high-performance runtime application deck. Instead of executing heavy parsing strings on the heap, you call unified core methods configured with lightweight, point-free execution strategy tokens to validate, synthesize, or mutate data structures at hardware-level speeds.

| Core Runtime API       | Strategy Tokens (Sub-Commands)                                 | Core Operational Objective (Why use it)                                                           |
| :--------------------- | :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `registerXalor<K, T>`  | _N/A (Ingestion Macro)_                                        | Signals the background compiler watcher to mine, flatten, and index a type contract.              |
| `validateXalor<K, S>`  | `'guard'` \| `'assert'` \| `'parse'` \| `'audit'`              | Executes airtight data boundary verification, sanitization, or diagnostic flight audits.          |
| `generateXalor<K, S>`  | `'default'` \| `'mock'` \| `'clone'` \| `'cast'`               | Manufactures fresh zero-state skeletons, randomized testing data, or deep clones from blueprints. |
| `transformXalor<K, S>` | `'pick'` \| `'omit'` \| `'rename'` \| `'flatten'` \| `'merge'` | Handles in-memory payload shape-shifting, structural key remapping, and schema merging.           |
| `matchXalor<K, T>`     | _N/A (Routing Gate)_                                           | Implements structural pattern routing to stream business logic based on incoming data shapes.     |

### 🛰️ Quick-Start Syntax Blueprint

```ts
// 1. Register your native TypeScript contract once (Build-time)
registerXalor<'USER_PROFILE', TUserProfile>();

// 2. Execute any runtime API strategy dynamically across the stack (Runtime)
const isUserValid = validateXalor<'USER_PROFILE', 'guard'>(payload); // Returns boolean
const freshSkeleton = generateXalor<'USER_PROFILE', 'default'>(); // Returns typed empty object
const flatKeyMap = transformXalor<'USER_PROFILE', 'flatten'>(user); // Returns dot-notation map
```

👉 For full parameter specifications, custom error-handling models, and interactive code recipes for each execution strategy, see the [Full Runtime API Strategy Manual](https://xalor.dev).

<br/>

## 🛠️ CLI Layer & Workspace Commands

Xalor shifts the mathematical heavy lifting of your type structures entirely into your build phase via an optimized, low-overhead background compiler engine. The CLI layer acts as your local infrastructure control deck—governing workspace database persistence, incremental delta-pruning, CI/CD safety boundaries, and live telemetry streaming.

| Command         | Category     | Operational Blueprint (What it does)                                                       |
| :-------------- | :----------- | :----------------------------------------------------------------------------------------- |
| `xalor watch`   | Local DX     | Monitors active file-system saves, running real-time HMR state synchronization.            |
| `xalor compile` | CI/CD Gate   | Executes a single-pass full-graph AST sweep, freezing pipelines on rule breaches.          |
| `xalor studio`  | Simulation   | Launches a secure, cross-origin loopback server to power your web workspace UI.            |
| `xalor vacuum`  | Sanitation   | Cleans the ledger by evicting stale, un-referenced CAS cache pointer fragments.            |
| `xalor diff`    | Verification | Cross-examines local type changes against production logs to intercept breaking API drift. |
| `xalor audit`   | Profiling    | Generates deep codebase structural density profiles and local Markdown reports.            |
| `xalor clear`   | Recovery     | Hard flash-purges the local `node_modules` cache directory back to absolute zero.          |

👉 For the complete CLI technical specification manual, advanced flag parameters, and CI/CD integration recipes, read the [Full CLI Commands Documentation Manual](https://xalor.dev).

<br/>
<br/>

## 📄 License

This project is licensed under the MIT License.

© 2024 Brennan Skinner
