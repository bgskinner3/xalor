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
    <em>“Don't just erase your types. Run them.”</em>
  </p>
  <p style="font-size: 16px; color: #555; margin-top: 0; max-width: 700px;">
   Turn pristine TypeScript interfaces into live runtime metadata networks—with zero local code pollution, zero third-party compiler dependencies, and 0 KB client schema inflation.
  </p>
</div>

<br/>
<br/>

## ⚡ What is Xalor?

Xalor is an **ahead-of-time (AOT) type reification engine** for JavaScript and TypeScript. It acts as a hybrid bridge between your build pipeline and your live production environment by treating native TypeScript interfaces as the single source of truth.

A background compiler watcher silently parses your code during compilation, stripping out developer telemetry and baking your types into compressed, hidden runtime blueprints. Instead of just checking strings like a basic validation library, Xalor uses these live blueprints to handle advanced architectural patterns:

- **Airtight Runtime Data Validation** with zero client-side engine overhead.
- **Automated Data Sanitization** at high-traffic boundary ingress points.
- **Functional Pattern Matching** executing at constant memory pointer speeds.
- **Multi-Version Schema Upcasting** via native ancestral blueprint matching.

<br/>
<br/>

## 📦 Installation

```bash
npm install @bgskinner2/xalor
```

💡 **Looking for Vite or Next.js configurations?**
View our [Bundler Integration & Getting Started Guide](http://masterofsum.dev/xalor/docs/gettingStarted).

<br/>
<br/>

## ⚡ The Happy Medium

- **TypeScript** is completely erased at runtime, leaving production JavaScript blind to corrupt payloads.
- **Zod** forces you to define schemas twice, leading to code duplication and larger client bundles.
- **Typia** relies on fragile monkey-patches such as `ts-patch`, which can pollute your local Git files.
- **Xalor** uses a custom build CLI pass to extract TypeScript interfaces into an immutable runtime validation vault.

### The Result

You get:

- ⚡ Macro-level performance
- ✨ Rich validation features
- 🚫 Zero code duplication

<br/>
<br/>

## 📊 Performance Benchmark Wins

Tested head-to-head against competing frameworks on an **Apple M2 Pro** running **Node.js 22**.

### Valid Payloads

- ⚡ **Sub-microsecond execution speeds** powered by monomorphic inline caches.

### Malformed & Malicious Payloads

- 🛡️ **Rejects malformed input in ~270 nanoseconds**, compared to **12+ microseconds** in many competing approaches.
- 🚀 Xalor bypasses deep recursive evaluation loops entirely when processing malicious payloads, maintaining consistently fast rejection times.

📈 **[View the Complete Raw Performance Metrics & Suite Benchmarks](http://masterofsum.dev/xalor/docs/benchmarks)**

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

## 🚀 Beyond Validation: What Else Can Your Types Do?

Because Xalor treats types as an active metadata layer, it unlocks capabilities that traditional validation libraries cannot provide.

- **Automated Safe Fallbacks (`xalor.generateXalorDefault`)** – Automatically pre-populates forms and UI structures with primitive defaults (`""`, `0`, `false`) to prevent unexpected `undefined` property crashes.
- **Multi-Version Schema Upcasting (`xalor.drift`)** – Detects legacy client payloads, matches historical schema signature hashes, and safely upcasts them in memory to support asynchronous microservice deployments.
- **GPS-Style Error Traceability** – Pinpoints validation failures directly to their TypeScript source, such as `src/models/user.ts:42`, making issues easier to identify and fix.

<br/>
<br/>

## 📦 Quick Start

### 1. Register Your Type

Write pure TypeScript. No custom schema DSLs, no duplicate configurations, and no local file noise.

```typescript
import { xalor } from '@bgskinner2/xalor';

export type TUser = {
  id: number;
  username: string;
  role: 'user' | 'moderator' | 'admin';
};

xalor.register<'USER_PROFILE', TUser>();
```

<br/>
<br/>

### 2. Parse Untrusted Data Instantly

```typescript
import { xalor } from '@bgskinner2/xalor';

const parsedUser = xalor.parse<'USER_PROFILE'>(incomingPayload);
console.log(`Verified data for: ${parsedUser.username}`);
```

---

### 📖 Ready for full architecture maps, framework configurations, and complete benchmarks?

👉 **[Explore the Official Xalor Documentation Portal](http://masterofsum.dev/xalor/docs)**

---

<br/>
<br/>

## 📄 License

This project is licensed under the MIT License.  
© 2026 Brennan Skinner
