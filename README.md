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
  <a href="https://bundlephobia.com/package/@bgskinner2/xalor">
    <img src="https://img.shields.io/bundlephobia/minzip/@bgskinner2/xalor" alt="Minizip Size" />
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
  <p style="font-size:16px; max-width:750px; color: #444; line-height: 1.6;">
    Xalor is an ahead-of-time (AOT) TypeScript compilation engine that transforms static type contracts into an active, system-wide <strong>Distributed Contract Governance Framework</strong>. It manages data lifecycles, functional pattern matching, and runtime schema upcasting natively—with hard-zero dynamic parser bloat.
  </p>
</div>


<br/>
<br/>

### 🚫 The Distributed Architecture Problem
In distributed enterprise production ecosystems, applications suffer from **Version Deployment Desynchronization**. Microservices, asynchronous data lakes, mobile clients, databases, and external webhooks update asynchronously. 
* Traditional parsers (Zod, Valibot) are reactive dead-ends. They blindly reject out-of-sync or legacy data structures, throwing rigid validation exceptions that break core execution paths, drop financial webhooks, and crash checkouts for un-updated mobile application users.

### 🪐 The Xalor Core Solution
Xalor stops treating types as passive compile-time annotations. By extracting your project's type geometry out-of-band at build time, Xalor constructs a centralized, relational schema grid that unlocks advanced data evolution and upcasting mechanisms natively.


<br/>
<br/>

## 🧠 The Architecture Lifecycle

```text
  [DEVELOPMENT TIME]          [COMPILATION TIME]              [PRODUCTION RUNTIME]
Developer writes pure ──► AOT Scribe Appends Tokens ──► O(1) Memory Blueprint Match
 TypeScript Interfaces    & Purges Telemetry Ballast    & Resilient Contract Evolution
```

1. **Phase 1 (Ingest & Map):** The Xalor AST transformer scans your macro layout targets during the compilation window, unrolling complex generic or recursive trees into content-addressed blueprints.
2. **Phase 2 (Reify & Scribe):** The engine modifies the compiler stream mid-flight, wiping out transient generic arguments (`<'TOKEN'>`) and realigning parameters to pass lean string reference constants.
3. **Phase 3 (Vacuum & Absolute Shedding):** At the terminal gate, the CLI purges IDE ghost folders (`./xalor`), amputates verbose developer telemetry (`manifest`, `registry`), and flushes a minified Relational Core layout down to your project.

<br/>
<br/>

## 📦 Installation

```bash
npm install @bgskinner2/xalor
```

### 🛡️ Implicit Production Lifecycle Gates
Xalor integrates directly into your native package manager toolchain using standard implicit scripts. Update your project's **`package.json`** to automate the out-of-band compilation and vacuum routines before assets serialize to your distribution targets:

```json
"scripts": {
  "prebuild": "xalor vacuum",
  "build": "tsc",
  "reset": "rm -rf .xalor src/vault-snapshot.json dist node_modules/.cache/xalor"
}
```
* **The Gatekeeper Advantage:** If a duplicate key registration or broken structural layout contract is detected during `prebuild`, the pipeline executes an immediate, unrecoverable hard crash (`process.exit(1)`), stopping your primary builder and insulating production systems from structural configuration corruption.


<br/>
<br/>


## 🧩 The Contract Governance API & Capabilities

### 1. matchDrift: The Upstream Versioning Bridge & Migration Gate
`matchDrift` solves the single most painful flaw in asynchronous distributed networks: safely processing mismatched or legacy payloads by checking them against historical blueprint ancestors and upcasting them to current structural specifications on the fly.

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
        isSystemEncrypted: false
      }
    };
  }
});
```
* 🏢 **Scenario A (The Slow User):** You refactor a schema from `user_phone` to a nested object block. 40% of mobile store application users haven't updated their client yet. `matchDrift` catches the old requests, detects they satisfy the `v1_ancestor` layout signature, intercepts them, maps properties cleanly to the modern shape, and passes the updated entity downstream.
* 🪙 **Scenario B (Immutable Financial Streams):** A permanent Kafka/RabbitMQ ledger contains events written two years ago under a flat schema format. Modern system code expects an expanded multi-tier tracking layout. `matchDrift` parses the stream, instantly isolates legacy items, and triggers the migration closure block to dynamically normalize the historic financial ledgers for compliance tracking with zero runtime heap accumulation.

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

| Operational Feature | Zod / Valibot | Typia | **Xalor** |
| :--- | :---: | :---: | :---: |
| **Single Source of Truth** (Types are schemas) | ❌ | ✔️ | **✔️** |
| **Zero Client Bundle Inflation** (0 KB runtime parser) | ❌ | ✔️ | **✔️** |
| **Ambient Project Integration** (Zero complex setup clutter) | ✔️ | ❌ | **✔️** |
| **GPS Diagnostic Tracing** (Traceability tracking rules) | ❌ | ❌ | **✔️** |
| **Distributed Contract Governance** (`matchDrift` Upcast Lanes) | ❌ | ❌ | **✔️** |


<br/>
<br/>


## 📄 License

This project is licensed under the MIT License.  
© 2026 Brennan Skinner


{
  "include": ["src/**/*", "node_modules/.cache/xalor/solid-env.ts"]
}
```

---

### ⚡ Route A: Vite-Based Toolchains

Supports raw Vite configurations, React-Vite sandboxes, Nuxt 3, SvelteKit, and Vitest.

- Open your project's **`vite.config.ts`** or `vite.config.js` profile.
- Import the **`xalorViteWatchPlugin`** method from the public plugins directory.
- Register the function call directly inside Vite's active **`plugins` array**.
- The hook activates _only_ during development (`apply: 'serve'`), adding zero overhead to builds.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { xalorViteWatchPlugin } from '@bgskinner2/xalor/plugins';

export default defineConfig({
  plugins: [
    react(),
    xalorViteWatchPlugin(), // 🪐 Runs fast out-of-process AOT mining loops natively on save
  ],
});
```

---

### 📦 Route B: Next.js & Webpack Toolchains

Supports Next.js (App & Pages Routers), NestJS servers, and standard Webpack projects.

- Open your project's **`next.config.js`** or `webpack.config.js` file.
- Pull the **`XalorWebpackWatchPlugin`** constructor class out of your plugins module.
- Push a fresh class instance straight into the internal **Webpack plugins array block**.
- Isolate the injection with a condition to ensure it executes **strictly inside local dev servers**.

```javascript
const { XalorWebpackWatchPlugin } = require('@bgskinner2/xalor/plugins');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    // 🛡️ Only couple the ambient type synchronization gateway during active hot-reloads
    if (dev) {
      config.plugins.push(new XalorWebpackWatchPlugin());
    }
    return config;
  },
};

module.exports = nextConfig;
```

<br/>
<br/>

## 🧩 Core Capabilities & API

### 1. Structural Validation & Data Generation

Xalor exposes a clean, centralized instance interface. Native type parameters direct the underlying pre-compiled blueprints.

```ts
import { xalor } from '@bgskinner2/xalor';

// 1. Define a native type (Supports complex generics and recursive trees)
type Transaction = {
  id: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
};

// 2. Register your layout contract
xalor.register<'TX', Transaction>();

// 3. Fast structural runtime validation
const data: unknown = fetchIncomingPayload();
const payload = xalor.parse<'TX'>(data); // Strongly-typed output!

// 4. Instant default data for test suites
const defaultData = xalor.default<'TX'>();
```

### 2. Functional Pattern Matching (`xalor`)

Execute pure, declarative structural pattern matching over unknown or polymorphic payloads. Xalor bypasses procedural condition loops, executing the closure handler of the first matching contract.

```ts
import { xalor } from '@bgskinner2/xalor';

// Process an un-typed or polymorphic network stream
const eventPayload: unknown = fetchIncomingWebhookEvent();

const response = xalor.match(eventPayload, {
  USER_LOGOUT: (user) => handleUserLogout(user), // 'user' is fully typed and narrowed via registry
  STORE_ORDER: (order) => processCheckout(order), // 'order' is fully typed and narrowed via registry
  default: () => handleFallbackFailure(), // Safe fall-through catch-all gate
});
```

<br/>
<br/>

## 🛠️ CLI Developer Tooling

Xalor includes an ahead-of-time (AOT) development toolset to manage compilation lifecycles, monitor schema optimization metrics, and prevent type drift:

```bash
# Actively watch your source files and hot-reload runtime blueprints
npx xalor watch

# Manually trigger an out-of-band workspace AST metadata compilation sweep
npx xalor compile

# Profile type graph optimization metrics and scan for dead code orphans
npx xalor audit
```

<br/>
<br/>

### 🛰️ Deep-Dive Intelligence

Running `npx xalor audit` triggers our operational compiler profiler, outputting real-time ledger diagnostics directly to your terminal:

- **Storage Compaction:** Visualizes Content-Addressable Storage (CAS) node deduplication ratios.
- **Metadata Evaporation:** Tracks the exact volume of development footprint stripped away for bare-metal production builds.
- **Dead-Code Shaking:** Statically scans call-sites to flag unused or orphaned contract keys instantly.

### 👉 **Ready to explore the full suite?** View the [Full CLI Reference & Studio Guide](http://masterofsum.dev/xalor/docs) to learn about `build`, `clear`, and our local interactive orchestration dashboard.

## 📊 Ecosystem Comparison

| Feature                             | Zod / Valibot | Typia | **Xalor** |
| :---------------------------------- | :-----------: | :---: | :-------: |
| **Single Source of Truth** 🧭       |      ❌       |  ✔️   |  **✔️**   |
| **Zero Client Bundle Inflation** 📦 |      ❌       |  ✔️   |  **✔️**   |
| **Zero Workspace Setup Clutter** ✨ |      ✔️       |  ❌   |  **✔️**   |
| **GPS Diagnostic Tracing** 📍       |      ❌       |  ❌   |  **✔️**   |
| **Self-Healing Types** 🧬           |      ❌       |  ✔️   |  **✔️**   |
| **Native Pattern Matching API** 🎛️  |      ❌       |  ❌   |  **✔️**   |

<br/>
<br/>

## 📄 License

This project is licensed under the MIT License.  
© 2026 Brennan Skinner
