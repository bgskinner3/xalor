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
  <p style="font-size:20px; max-width:700px;">
    <em>“A build-time TypeScript engine that turns your native types into a live runtime validation and generation system — without duplicating schemas or shipping heavy validation libraries.”</em>
  </p>
</div>

<br/>
<br/>

## ✨ Why Xalor exists

In most TypeScript apps today:

- Types exist only at compile time
- Runtime validation requires separate schemas (Zod, Yup, etc.)
- Mocking and transformation logic is duplicated across the stack
- Types and runtime behavior slowly drift apart

Xalor removes that separation entirely.

<br/>

## 🧠 Core Idea

- **The Rule:** Write TypeScript types once.
- **The Result:** Use them natively at runtime.

<br/>

## 📦 Installation

```bash
npm install @bgskinner2/xalor
```

### ⚙️ Explore Configuration Options [Configure →](https://github.com/bgskinner3/xalor/tree/main)

<br/>

## ⚡ What Xalor gives you

From a single TypeScript type, you can:

- ✅ Validate runtime data
- 🧪 Generate mock objects
- 🔄 Transform object shapes
- 🧭 Perform structural matching

All powered by build-time compilation — not runtime schema parsing.

<br/>

## 🧩 Quick Example

```ts
// 1. Define a type
type Transaction = {
  id: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
};

// 2. Register it
xalor.register<'TX', Transaction>();

// 3. Validate data
xalor.parse<'TX'>(payload);

// 4. Generate mock data
const mock = xalor.mock<'TX'>();

// 5. Transform data
const slim = xalor.pick<'TX'>({
  data: payload,
  keys: ['id', 'currency'],
});
```

## From one type, Xalor can:

- Validate runtime data.
- Generate realistic mock objects.
- Transform object structures.
- Maintain compile-time and runtime alignment.

<br/>

## ⚙️ How it works (simplified)

**Xalor has two phases:**

### 🏗 Build time

- TypeScript types are analyzed
- Runtime blueprints are generated
- Optimized lookup structures are created

### ⚡ Runtime

- No schema parsing
- No type reconstruction
- Direct execution from precompiled blueprints

This keeps runtime operations fast and lightweight.

<br/>

## 🧠 API design

Xalor exposes a single instance:

```typescript
import { xalor } from '@bgskinner2/xalor';
```

### Core methods

```typescript
import { xalor } from '@bgskinner2/xalor';

xalor.register();

xalor.parse<'USER'>();
xalor.mock<'USER'>();
xalor.default<'USER'>();
xalor.cast<'USER'>();
xalor.clone<'USER'>();
xalor.pick<'USER'>();
```

\*\* Additional validation, generation, and transformation APIs are available in the documentation.
👉 [View All](#)

<br/>

## 🛠 CLI (Development Tooling)

`Xalor` includes a build-time development CLI:

```bash
npx xalor watch
npx xalor compile
```

## Additional development tooling is documented separately.

👉 [Full CLI documentation (coming soon)](#)

<br/>

## 🚀 Getting Started

```bash
npx xalor init
```

👉 [Installation & setup guide](#)

<br/>

## 📚 Documentation

- [Getting Started](#)
- [API Reference](#)
- [CLI Reference](#)
- [Guides](#)
- [How It Works](#)

<br/>

## 🧭 Mental Model

```text
TypeScript Types
       ↓
Build-Time Compilation
       ↓
Runtime System (validation / generation / transformation)
```

<br/>

## 💡 Why This Is Different

Unlike schema-based libraries:

- ❌ No duplicated validation schemas
- ❌ No runtime schema parsing
- ❌ No drift between types and runtime logic
- ❌ No separate validation system to maintain

**Instead:** Your TypeScript types are the system.

<br/>

## 📄 License

This project is licensed under the MIT License.

© 2024 Brennan Skinner
