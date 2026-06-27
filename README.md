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
  <p style="font-size:18px; max-width:700px;">
    <em>“An ahead-of-time (AOT) TypeScript compilation engine that transforms static type contracts into live runtime validation and pattern-matching systems—without duplicating schemas or inflating client bundle sizes.”</em>
  </p>
</div>

<br/>
<br/>

In modern high-scale TypeScript applications:

- **Type Erasure:** Types only exist at compile time; runtime verification requires completely detached schema definitions (Zod, Yup, ArkType).
- **Workspace Clutter:** Maintaining duplicated static types alongside manual validation schemas introduces immediate code drift.
- **Bundle Inflation:** Traditional validation libraries force the client browser to download heavy runtime parsing engines, inflating bundle sizes by up to 50KB.
- **Procedural Overkill:** Evaluating complex polymorphic network payloads results in massive, brittle `if/else` or `switch` type-guard matrices.

**Xalor removes this separation entirely.** Your TypeScript types become your live runtime metadata.

<br/>
<br/>

## 🧠 The Architecture

Unlike standard runtime parsing engines, Xalor utilizes a two-phase ahead-of-time (AOT) compilation strategy via a custom compiler plugin:

```text
TypeScript Source File (.ts)
│
▼ (Build Time / ts-patch sweep)
Xalor AST Transformer ──> Extracts structural metadata blueprints
│
▼ (Injects optimized code-gen lookups)
Production JavaScript Output (0 KB Client Parser Overhead)
```

1. **Build-Time Compilation:** The Xalor AST transformer scans your source code call-sites during the compilation phase, parses complex generic or recursive structures, and embeds lightweight static lookup blueprints into the production JavaScript artifact.
2. **Zero-Overhead Runtime:** The runtime library bypasses parsing or type reconstruction completely, evaluating incoming payloads directly against pre-compiled schema graphs.

<br/>
<br/>

## 📦 Installation

```bash
npm install @bgskinner2/xalor
```

_Note: To enable AOT type extraction, ensure your project compiler layer is configured with `ts-patch` or the corresponding Xalor plugin wrapper._

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
