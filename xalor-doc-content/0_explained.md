# Xalor Documentation Content Database (`doc-content`)

This directory serves as the centralized, static data vault for all text copy, architectural schemata, code blocks, and feature sets across the Xalor ecosystem.

## 🏗️ Architecture Role

Instead of hardcoding text layouts directly into UI components, our frontend systems query this directory to programmatically render layout modules across two production environments:

1. **The Core Documentation Suite (`/xalor/docs`)** — Powers page routing trees, sidebar links, and detailed API execution files.
2. **The Sandbox Studio Preview (`/xalor/studio`)** — Feeds pre-seeded data, mockup files, execution logs, and simulated telemetry directly into interactive code editor tabs.

```text
               ┌───────────────────────────────┐
               │    Xalor Package Source AST   │
               └───────────────┬───────────────┘
                               │ (Sync Script)
                               ▼
               ┌───────────────────────────────┐
               │    doc-content Directory      │
               │   (vault-snapshots / JSON)    │
               └───────────────┬───────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
   ┌───────────────────────┐       ┌───────────────────────┐
   │ Core Docs Site Engine │       │ Sandbox Studio View   │
   │    (/xalor/docs)      │       │    (/xalor/studio)    │
   └───────────────────────┘       └───────────────────────┘
```

## 🔄 Automated Synchronization Framework

Much of the structural payload and content configurations housed within this file system are **auto-generated**.

To maintain strict data integrity and eliminate human configuration slip-ups, a background synchronization builder sweeps our core compiler packages. Any underlying changes made directly to the source codebase will automatically update and re-compile these JSON schemas on the very next development loop.

This automation locks in a 100% synchronized state for:

- **API Naming & Signatures:** Automated renaming reflection (e.g., swapping method names dynamically across docs text fields).
- **Connecting Endpoints & Routes:** Instant updates to sandbox targets and routing navigation properties.
- **Code Example Snippets:** Real-time extraction of live testing assets to keep code strings unpolluted and functional.

## 🛠️ Modifying Content

- **System Content & Schemas:** Do not edit automated data strings manually. If an API contract requires adjustments, update the target signature directly within the package source and rerun the toolchain build process.
- **Static Copy Text:** Pure marketing text attributes, tags, and paragraph copy blocks can be safely updated inside their respective static properties files without disrupting core compiler pipelines.

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

# Updating Docs Sheet

## I. Custom Text Formatting Cheat Sheet

When authoring or modifying raw content fields inside this repository, your text strings are passed natively to the browser via the frontend parser function `parseInlineFormat`.

To apply rich typographic styling inline without injecting heavy HTML or full markdown parsers, wrap your text in these explicit delimiter tokens:

| Formatting Rule       | Syntax Delimiter | JSON Copy Example                                     | Visual Browser Render                                                     |
| :-------------------- | :--------------- | :---------------------------------------------------- | :------------------------------------------------------------------------ |
| **Bold Text**         | `**content**`    | `"Ensure **strict type safety** at borders."`         | Emphasizes copy in bold matching the main text color.                     |
| **Highlighted Text**  | `_content_`      | `"Validation is executed via _validateXalor_."`       | Renders with a soft background tint and a distinct active accent color.   |
| **Inline Code Block** | \`content\`      | `"Updates propagate instantly to \`tsconfig.json\`."` | Monospace type representation for system config parameters and variables. |

<br/>
<br/>

## II. Routes

- TODO

<br/>
<br/>

## III. Roadmap

- TODO

<br/>
<br/>




```text

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                      THE HYBRID BUILD SPLIT                                                            │
│                              Visualizing Side-by-Side Type Eradication & CAS Compaction                                                │
├───────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┬────────────────────────┤
│ 1. COMPILE-TIME SOURCE CODE (Developer Input)         │ 2. REIFICATION GATE (The Production Split)            │ 3. DECOUPLED VAULT     │
│ Native TypeScript Files (.ts)                         │ Erased Client Bundles vs Server Blueprints           │ server/blueprints.json │
├───────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼────────────────────────┤
│                                                       │                                                       │                        │
│   // src/models/secure.ts                             │   // dist/client/bundle.js                            │ // Single-Instance CAS │
│   type TTransactionSafe = {                           │   xalor.parse('sh_16c0mbs', data);                    │                        │
│     id: string;                                       │                 │                                     │ type TSharedCurrency = {│
│     status: 'pending' | 'completed';                  │                 │ (O(1) Memory Hydration)             │   value: string;       │
│     amount: { value: string; exp: number }; ───┐      │                 ▼                                     │   exponent: number;    │
│   };                                           │      │                                                       │ };                     │
│                                                │      │   // dist/server/xalor.blueprints.json                │         ▲    ▲         │
│                                                │(CAS) │   "sh_16c0mbs": {                                     │         │    │         │
│   // src/models/base.ts                        ├──────┼──►  "id": "string",                                   │         │    │         │
│   type TBaseTransaction = {                    │      │     "status": "union",                                │         │    │         │
│     id: string;                                │      │     "amount": "sh_1cr65y8" ───────────────────────────┼─────────┘    │         │
│     currency: string;                          │      │   },                                                  │              │         │
│     amount: { value: string; exp: number }; ───┘      │                                                       │              │         │
│   };                                                  │   "sh_1nculbp": {                                     │              │         │
│                                                       │     "id": "string",                                   │              │         │
│                                                       │     "currency": "string",                             │              │         │
│                                                       │     "amount": "sh_1cr65y8" ───────────────────────────┼──────────────┘         │
│                                                       │   }                                                   │                        │
└───────────────────────────────────────────────────────┴───────────────────────────────────────────────────────┴────────────────────────┘
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                      THE PHANTOM BUILD HYBRID SPLIT                                                    │
├───────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┬────────────────────────┤
│ 1. COMPILE-TIME SOURCE CODE (Developer Input)         │ 2. REIFICATION GATE (The Production Split)            │ 3. DECOUPLED VAULT     │
│ Native TypeScript Interface Files (.ts)               │ Erased Client Bundles vs Server Blueprints           │ server/blueprints.json │
├───────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼────────────────────────┤
│                                                       │                                                       │                        │
│   // src/models/secure.ts                             │   // dist/client/bundle.js                            │ // Blueprint Cache Card│
│   type TTransactionSafe = {                           │   xalor.parse('sh_16c0mbs', data);                    │                        │
│     id: string;                                       │                 │                                     │  "sh_1cr65y8": {       │
│     status: 'pending' | 'completed';                  │                 │ (O(1) Memory Hydration Map)         │    "kind": "object",   │
│     amount: { value: string; exp: number }; ───┐      │                 ▼                                     │    "properties": {     │
│   };                                           │      │                                                       │  ┌───"value": {        │
│                                                │      │   // dist/server/xalor.blueprints.json                │  │     "type": "string",│
│   // src/models/base.ts                        │(CAS) │   "sh_16c0mbs": {                                     │  │     "maxLength": 4096│
│   type TBaseTransaction = {                    ├──────┼──►  "amount": { "name": "sh_1cr65y8" } ──────────────┼──┤   },               │
│     id: string;                                │      │   },                                                  │  └───"exponent": {     │
│     currency: string;                          │      │                                                       │        "type": "number"│
│     amount: { value: string; exp: number }; ───┘      │   "sh_1nculbp": {                                     │      }                 │
│   };                                                  │     "amount": { "name": "sh_1cr65y8" } ───────────────┘    }                   │
│                                                       │   }                                                   │  }                     │
└───────────────────────────────────────────────────────┴───────────────────────────────────────────────────────┴────────────────────────┘


```