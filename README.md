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
  📦 <a href="https://github.com/bgskinner3/axiom-kit/blob/main/packages/xalor/docs/Installation.md">Installation</a> 
  • 📖 <a href="https://github.com/bgskinner3/axiom-kit/blob/main/packages/xalor/docs/api.md">Documentation</a> 
  • ⚙️ <a href="https://github.com/bgskinner3/axiom-kit/blob/main/packages/xalor/docs/api.md">API Reference</a>
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

## ⚡ What Xalor gives you

From a single TypeScript type, you can:

- ✅ Validate runtime data
- 🧪 Generate mock objects
- 🔄 Transform object shapes
- 🧭 Perform structural matching

All powered by build-time compilation — not runtime schema parsing.

<br/>

## 🧩 Quick Example

### 1. Define a type

```ts
type Transaction = {
  id: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
};
```

### 2. Register it

```ts
import { xalor } from '@bgskinner2/xalor';

xalor.register<'TX', Transaction>();
```

### 3. Validate data

```ts
const payload = {
  id: 'z2XIErEIP',
  amount: 1200,
  currency: 'USD',
};

xalor.parse<'TX'>(payload);

/**
 * Returns
 * - Use `parse()` as the primary synchronous validation gate.
 * - Verifies that the input conforms to the registered contract.
 * - Returns the validated value with full type inference.
 *
 */
```

### 4. Generate mock data

```ts
const mock = xalor.mock<'TX'>();

/**
 * Returns
 *  - `mock` Generates realistic, randomized data structures
 *
 * {
 *   id: 's2Z7XIErEIP',
 *   amount: 985,
 *   currency: 'EUR'
 * }
 *
 */
```

### 5. Transform data

```ts
const mockOrder = {
  id: 'z2XIErEIP',
  amount: 985,
  currency: 'EUR',
};

const slim = xalor.pick<'TX'>({
  data: mockOrder,
  keys: ['id', 'currency'],
});

/**
 * Returns
 * - Creates a new object containing only the requested properties.
 *  - Use `pick` to filter Set cache to retain explicit tracking keys.
 *
 * {
 *   id: 's2Z7XIErEIP',
 *   amount: 985,
 * }
 */
```

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

<br/>

## 🧪 Validation

```typescript
xalor.assert<'USER'>();
xalor.guard<'USER'>();
xalor.parse<'USER'>();
xalor.audit<'USER'>();
```

## 🏗️ Generation

```typescript
xalor.cast<'USER'>();
xalor.mock<'USER'>();
xalor.default<'USER'>();
xalor.clone<'USER'>();
```

## 🔄 Transformation

```typescript
xalor.pick<'USER'>();
xalor.omit<'USER'>();
xalor.flatten<'USER'>();
xalor.rename<'USER'>();
xalor.merge<'USER'>();
```

<br/>

## 🛠 CLI (Development Tooling)

`Xalor` includes a build-time development CLI:

```bash
npx xalor watch
npx xalor compile
npx xalor studio
npx xalor diff
npx xalor audit
```

👉 [Full CLI documentation (coming soon)](#)

<br/>

## 📦 Installation

```bash
npm install @bgskinner2/xalor
```

### ⚙️ Explore Configuration Options [Configure →](https://github.com/bgskinner3/xalor/tree/main)

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

<!-- <br/>
 TODO: ADD ROADMAP

## 🗺 Roadmap

* [ ] Advanced transformation pipelines
* [ ] Framework integrations (Next.js, NestJS, etc.)
* [ ] Performance benchmarking suite
* [ ] Visual debugging tools (studio expansion)
* [ ] Remote compilation mode -->

<br/>

## 📄 License

This project is licensed under the MIT License.

© 2024 Brennan Skinner
