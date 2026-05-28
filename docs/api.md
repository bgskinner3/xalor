# Xalor Runtime API

- A unified interface for validating, generating, transforming, and building Xalor schemas at runtime.

## Table of Contents

1. [registerXalor](#register-xalor)

2. [validateXalor](#validate-xalor)
   - [Type Guard Strategy (`guard`)](#i-type-guard-strategy-guard)
   - [Assertion Strategy (`assert`)](#ii-assertion-strategy-assert)
   - [Synchronous Parser (`parse`)](#iii-synchronous-parser-parse)
   - [Async Parser (`parseasync`)](#iv-async-parser-parseasync)
   - [Diagnostic Audit Strategy (`audit`)](#v-diagnostic-audit-strategy-audit)

3. [generateXalor](#generate-xalor)
   - [Default Skeleton Strategy (`default`)](#i-default-skeleton-strategy-default)
   - [Mock Generation Strategy (`mock`)](#ii-mock-generation-strategy-mock)
   - [Structural Clone Strategy (`clone`)](#iii-structural-clone-strategy-clone)
   - [Runtime Cast Strategy (`cast`)](#iv-runtime-cast-strategy-cast)

4. [transformXalor](#transform-xalor)
   - [Selective Retention (`pick`)](#i-selective-retention-pick)
   - [Structural Exclusion (`omit`)](#ii-structural-exclusion-omit)
   - [Nominal Alignment (`rename`)](#iii-nominal-alignment-rename)
   - [Matrix Decompression (`flatten`)](#iv-matrix-decompression-flatten)
   - [Entity Aggregation (`merge`)](#v-entity-aggregation-merge)

5. [matchXalor](#match-xalor)

---

&nbsp;

# Register Xalor

### 🟢 Active

#### `registerXalor` is the schema registration engine of the Xalor system.

It is responsible for defining, storing, and initializing runtime schema blueprints used across validation, generation, and transformation layers.

This method is responsible for:

- linking runtime validators
- attaching generation strategies
- enabling transformation pipelines
- exposing registered schema metadata

## Core Responsibility

`registerXalor` establishes a canonical schema definition in the global runtime registry, enabling type-safe operations across the Xalor system.

It supports both compile-time inferred registration and runtime schema capture.

## Overload Strategies

### I. Declarative Type Registration

#### Registers a schema using a compile-time type definition only.

#### Behavior

- Extracts structure from generic type parameter
- Compiles schema metadata at build time
- Produces a fully inferred runtime schema definition
- No runtime object required

#### Example

```ts
interface IUser {
  id: number;
  username: string;
}

registerXalor<'USER_PROFILE', IUser>();
```

---

### II. Runtime Schema Inference Registration

#### Registers a schema by inferring structure from an existing runtime object.

#### Behavior

- Extracts object shape at runtime
- Converts structure into schema metadata
- Stores inferred schema in registry
- Supports dynamic schema creation

#### Example

```ts
const devConfig = {
  environment: 'production',
  clusterNodes: [1, 2, 3],
};

registerXalor<'APP_CONFIG'>(devConfig);
```

---

## Description

`registerXalor` is used when a schema must be introduced into the system before it can participate in validation, generation, or transformation workflows.

It acts as the foundation layer of the Xalor runtime architecture.

---

&nbsp;

# Validate Xalor

### 🟢 Active

#### `validateXalor` supports multiple runtime validation strategies depending on the desired execution model and error-handling behavior.

---

&nbsp;

# I. Type Guard Strategy (`'guard'`)

### Creates a reusable runtime type guard function.

### Behavior

- Returns a `TTypeGuard<T>`
- Performs runtime structural validation
- Returns a boolean result
- Narrows types safely within conditional branches

## Usage

```ts
const isUser = validateXalor<'USER_TEST', 'guard'>();

if (isUser(payload)) {
  console.log(payload.username);
}
```

---

## II. Assertion Strategy (`'assert'`)

### Performs runtime validation and throws immediately on failure.

### Behavior

- Returns `void`
- Throws a validation error if validation fails
- Narrows the validated value downstream after execution

## Usage

```ts
const payload: unknown = getIncomingRequest();

validateXalor<'USER_TEST', 'assert'>(payload);

console.log(payload.id);
```

---

## III. Synchronous Parser (`'parse'`)

### Validates and returns the typed runtime value synchronously.

### Behavior

- Returns validated typed data
- Throws on validation failure
- Supports runtime branding and schema hydration

## Usage

```ts
const user = validateXalor<'USER_TEST', 'parse'>(rawData);
```

---

## IV. Async Parser (`'parseAsync'`)

### Asynchronously validates and resolves typed runtime data.

### Behavior

- Returns `Promise<T>`
- Rejects on validation failure
- Supports async validation pipelines and external resolvers

## Usage

```ts
const user = await validateXalor<'USER_TEST', 'parseAsync'>(networkData);
```

---

## V. Diagnostic Audit Strategy (`'audit'`)

### Produces a structured validation report without throwing.

### Behavior

- Returns a diagnostic result object
- Collects validation issues
- Does not throw
- Useful for tooling, debugging, and reporting pipelines

## Usage

```ts
const report = validateXalor<'USER_TEST', 'audit'>(corruptedData);

if (!report.valid) {
  report.issues.forEach((issue) => {
    console.log(`${issue.path}: ${issue.rule}`);
  });
}
// LOGS:
// {
//   valid: false,
//   issues: [
//     {
//       path: 'username',
//       expected: '{\n  kind: primitive,\n  type: string\n}',
//       received: '"missing"',
//       rule: 'missing_property'
//     }
//   ]
// }
```

&nbsp;

&nbsp;

# Generate XALOR

### 🟢 Active

### `generateXalor` supports multiple runtime generation strategies for creating, cloning, coercing, and simulating typed runtime data structures.

This method supports:

- runtime type validation
- safe parsing
- structured validation errors
- strict or permissive validation modes

---

&nbsp;

## I. Default Skeleton Strategy (`'default'`)

### Creates a clean zero-state object from the registered schema blueprint.

### Behavior

- Generates structurally valid default objects
- Applies primitive fallback values
- Initializes arrays and nested objects
- Returns fully typed runtime-safe structures

## Default Primitive Mapping

| Type      | Default Value |
| --------- | ------------- |
| `string`  | `""`          |
| `number`  | `0`           |
| `boolean` | `false`       |
| `array`   | `[]`          |
| `object`  | `{}`          |

## Usage

```ts
const freshUser = generateXalor<'USER_TEST', 'default'>();
```

---

## II. Mock Generation Strategy (`'mock'`)

### Generates randomized mock data from the registered schema.

### Behavior

- Produces structurally valid randomized objects
- Generates realistic primitive placeholder values
- Randomizes optional field inclusion
- Generates variable collection sizes
- Useful for testing, prototyping, and fixtures

## Usage

```ts
const mockUser = generateXalor<'USER_TEST', 'mock'>();
```

---

## III. Structural Clone Strategy (`'clone'`)

### Creates a deep schema-aligned clone from existing runtime input.

### Behavior

- Removes undeclared properties
- Preserves only schema-defined fields
- Produces clean runtime-safe objects
- Supports circular-safe cloning pipelines

## Usage

```ts
const dirtyInput = {
  id: 1,
  username: 'skinner',
  strayGarbage: 'DROP TABLE Users;',
};

const cleanUser = generateXalor<'USER_TEST', 'clone'>(dirtyInput);
```

---

## IV. Runtime Cast Strategy (`'cast'`)

### Coerces loose runtime values into schema-compatible types.

### Behavior

- Converts compatible primitive values
- Coerces strings into numbers and booleans
- Supports case-insensitive literal alignment
- Wraps compatible singleton values into arrays
- Produces structurally aligned runtime output

## Usage

```ts
const looseInput = {
  id: '5562',
  username: 991,
  active: 'TRUE',
};

const strictUser = generateXalor<'USER_TEST', 'cast'>(looseInput);
```

&nbsp;

&nbsp;

# 🔄 transformXalor

### 🟢 Active

### `transformXalor` is the runtime data transformation engine of the Xalor system.

It is responsible for safely converting validated data structures between schema contracts using explicit transformation strategies.

## Core Responsibility

`transformXalor` takes a verified source object and transforms it into a target schema shape using deterministic, strategy-driven operations.

## Supported Capabilities

- Schema-to-schema data transformation
- Safe property selection and exclusion
- Key renaming and structural remapping
- Nested structure flattening
- Type-safe runtime data morphing
- Controlled schema boundary transitions

&nbsp;

## I. Selective Retention (`pick`)

### Description

Creates a new object containing only the selected properties from the source schema.

### Behavior

- Filters object by allowed key list
- Removes all non-selected properties
- Produces DTO-safe output structures
- Schema-aware field validation applied

### Use Cases

- API DTO construction
- UI view models
- Public-safe data exposure

### Example

```ts
const rawUser = {
  id: 101,
  email: 'brennan@xalor.io',
  phone: '555-0192',
  role: 'admin',
  token: 'jwt_991',
};

const publicContact = transformXalor<'USER_PROFILE', 'pick'>(rawUser, [
  'email',
  'phone',
]);

console.log(publicContact);
// {
//   email: 'brennan@xalor.io',
//   phone: '555-0192'
// }
```

---

## II. Structural Exclusion (`omit`)

### Description

Creates a full schema object while removing explicitly excluded properties.

### Behavior

- Preserves schema shape
- Removes sensitive or restricted fields
- Prevents sensitive data leakage
- Enforces schema compliance after exclusion

### Use Cases

- Security filtering
- Backend → frontend sanitization
- Sensitive field removal

### Example

```ts
const rawUser = {
  id: 101,
  email: 'brennan@xalor.io',
  phone: '555-0192',
  role: 'admin',
  token: 'jwt_991',
};

const safeUser = transformXalor<'USER_PROFILE', 'omit'>(rawUser, [
  'token',
  'role',
]);

console.log(safeUser);
// {
//   id: 101,
//   email: 'brennan@xalor.io',
//   phone: '555-0192'
// }
```

---

## III. Nominal Alignment (`rename`)

### Description

Transforms object keys from one schema naming convention to another.

### Behavior

- Maps keys via dictionary configuration
- Coerces values into destination schema types
- Supports cross-system integration mapping
- Preserves structural integrity during rename

### Use Cases

- API integration mapping
- snake_case → camelCase conversion
- third-party payload normalization

### Example

```ts
const networkInput = {
  external_id: '8842',
  user_name: 'neon_rider',
  is_verified: 'TRUE',
};

const formattedData = transformXalor<'EXTERNAL_PAYLOAD', 'rename'>(
  networkInput,
  {
    external_id: 'id',
    user_name: 'username',
    is_verified: 'active',
  },
);

console.log(formattedData);
// {
//   id: 8842,
//   username: 'neon_rider',
//   active: true
// }
```

---

## IV. Matrix Decompression (`flatten`)

### Description

Flattens nested object structures into dot-notation key-value maps.

### Behavior

- Recursively traverses nested objects
- Converts hierarchy into flat key paths
- Preserves arrays using index notation
- Produces analytics-friendly output

### Use Cases

- Logging pipelines
- CSV export preparation
- analytics indexing
- relational DB mapping

### Example

```ts
const nestedOrder = {
  orderId: 'ORD-991',
  meta: { timestamp: 1715974000 },
  items: [{ SKU: 'XAL-CORE' }],
};

const flatRecord = transformXalor<'STORE_ORDER', 'flatten'>(
  nestedOrder,
  'flatten',
);

console.log(flatRecord);
// {
//   orderId: "ORD-991",
//   meta.timestamp: 1715974000,
//   items[0].SKU: "XAL-CORE"
// }
```

---

## V. Entity Aggregation (`merge`)

### Description

Deeply combines a baseline data object (`dataOne`) with an incoming delta patch or extension data layer (`dataTwo`) while ensuring the resulting graph structure remains completely compliant with the target schema blueprint.

### Behavior

- **Patch Prioritization:** Overwrites baseline database keys with matching non-undefined patch properties.
- **Baseline Fallbacks:** Retains original properties natively when they are missing or uninstantiated inside the patch structure.
- **Undeclared Pruning:** Prevents custom or malicious input fields from polluting internal models by dropping keys missing from the schema blueprint.
- **Symmetrical Array Merging:** Evaluates list indexes synchronously to combine collection records smoothly without truncating trailing baseline entries.
- **Prototype Link Maintenance:** Automatically discovers and preserves rich class instances and underlying methods hierarchies across plain object overrides.
- **Dual-Graph Cyclic Safety:** Symmetrically caches overlapping reference loops to intercept infinite recursion memory heap allocation blowouts ($Depth \le 25$).

### Use Cases

- Multi-step wizard form state aggregation and consolidation tracking.
- Asymmetrical partial database or memory-cache updates.
- Dynamic user system settings overriding and preference configuration patching.
- Microservice response mapping and decentralized entity aggregation.

### Example

```ts
import { transformXalor } from 'xalor';

// 1. Establish the authoritative baseline database state model instance
const baseOrder = {
  orderId: 'ORD-707',
  items: [
    { SKU: 'PROD-A', quantity: 1 },
    { SKU: 'PROD-B', quantity: 5 },
  ],
};

// 2. Manufacture an unstructured, partial incoming modification delta patch
const patchOrder = {
  items: [
    { quantity: 3 }, // Modifies index 0 quantity, keeps baseline SKU intact
    { SKU: 'PROD-B-UPDATED' }, // Modifies index 1 SKU, keeps baseline quantity intact
    { SKU: 'PROD-C-NEW', quantity: 9 }, // Symmetrically appends index 2 into the collection array
  ],
};

// 3. Execute the deep dual-graph merge process pipeline
const result = transformXalor<'STORE_ORDER', 'merge'>(
  {
    mode: 'merge',
    dataOne: baseOrder,
    dataTwo: patchOrder,
  },
  'STORE_ORDER',
  'merge',
);

console.log(JSON.stringify(result, null, 2));
/*
{
  "orderId": "ORD-707",
  "items": [
    { "SKU": "PROD-A", "quantity": 3 },
    { "SKU": "PROD-B-UPDATED", "quantity": 5 },
    { "SKU": "PROD-C-NEW", "quantity": 9 }
  ]
}
*/
```

---

&nbsp;

# Match Xalor

### 🟡 In Progress

### `matchXalor` is the runtime pattern dispatch engine of the Xalor system.

It routes unknown or polymorphic input data to the first matching schema handler based on structural validation.

## Supported Capabilities

- Structural pattern matching over runtime data
- Schema-driven handler dispatch
- Automatic type narrowing per matched branch
- Safe fallback execution path
- Ordered evaluation of registered handlers
