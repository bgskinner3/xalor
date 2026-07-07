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
  <p style="font-size:16px; max-width:750px; color: #444; line-height: 1.6;">
    Xalor is an ahead-of-time (AOT) TypeScript compilation engine that transforms static type contracts into an active, system-wide <strong>Distributed Contract Governance Framework</strong>. It manages data lifecycles, functional pattern matching, and runtime schema upcasting natively—with hard-zero dynamic parser bloat.
  </p>
</div>

<br/>
<br/>

### 🚫 The Distributed Architecture Problem

Distributed ecosystems (microservices, databases, mobile apps, and webhooks) deploy asynchronously.

- The Reactive Dead-End: Traditional parsers (Zod, Valibot) blindly reject out-of-sync or legacy data payloads. This throws rigid exceptions that drop financial webhooks, break data lakes, and crash checkout flows for un-updated mobile users.

### 🪐 The Xalor Core Solution

Xalor stops treating types as passive compile-time notes. By extracting your project's type geometry out-of-band during your build, Xalor constructs a centralized relational schema matrix that unlocks active, runtime data evolution with zero parser overhead.

<br/>
<br/>

## 🧠 The Architecture Lifecycle

```text
  [DEVELOPMENT TIME]          [COMPILATION TIME]              [PRODUCTION RUNTIME]
Developer writes pure ──► AOT Scribe Appends Tokens ──► O(1) Memory Blueprint Match
 TypeScript Interfaces    & Purges Telemetry Ballast    & Resilient Contract Evolution
```

1. **Phase 1 (Ingest & Map):** The AST transformer scans your macro layout targets mid-build, flattening complex generic or recursive structures into unique content-addressed blueprints.

<br/>

2. **Phase 2 (Reify & Scribe):** The engine erases transient generic parameters (`<'TOKEN'>`) entirely from the compiler stream, rewriting call-sites to pass lean string reference constants.

<br/>

3. **Phase 3 (Vacuum & Absolute Shedding):** At the terminal gate, the CLI purges IDE ghost folders, amputates verbose tracking metadata , and flushes a minified snapshot payload down to production.

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

- **The Gatekeeper Advantage:** If a duplicate key registration or broken structural layout contract is detected during `prebuild`, the pipeline executes an immediate, unrecoverable hard crash (`process.exit(1)`), stopping your primary builder and insulating production systems from structural configuration corruption.

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
        isSystemEncrypted: false,
      },
    };
  },
});

```

<br/>

 ### 🏢 **Scenario A (The Slow User):** 

     I. **The Breakage:** : You refactor an API schema from user_phone to a nested profile.contactNumber object. Because 40% of your mobile users haven't installed the latest app update yet, they continue sending legacy payloads that crash traditional parsers.
     
     II. **The Rescue:** :  matchDrift intercepts the old requests, matches their structural signature against yesterday's ancestral blueprint hash, and maps the fields to the modern layout in-memory before it hits your controller.
     
  
<br/>
<br/>

### 2. Functional Pattern Matching

Execute declarative, branching structural pattern matching over unknown or polymorphic payloads. Xalor bypasses heavy procedural conditional statement matrices, executing the closure handler of the first matching registry contract.

```ts
import { xalor } from '@bgskinner2/xalor';

const eventPayload: unknown = fetchIncomingWebhookEvent();

const response = xalor.match(eventPayload, {
  USER_LOGOUT: (user) => handleUserLogout(user), // 'user' is fully typed & narrowed
  STORE_ORDER: (order) => processCheckout(order), // 'order' is fully typed & narrowed
  default: () => handleFallbackFailure(), // Safe fall-through catch-all gate
});
```

<br/>
<br/>

### 3. Structural Token Generation & Core Casting

Instantly orchestrate data contracts and mock templates straight from your static registry footprints for local runtime evaluation sweeps.

```ts
import { xalor } from '@bgskinner2/xalor';

interface UserProfile {
  id: string;
  name: string;
}

// Register your layout contract (Eagerly unrolled for rich local hover autocomplete DX)
xalor.register<'USER', UserProfile>();

// Coerce unverified incoming values cleanly with O(1) flat lookups
const user = xalor.parse<'USER'>(fetchData());

// Instantly instantiate a pristine, default template state for your local test suites
const blankForm = xalor.default<'USER'>();
```

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
