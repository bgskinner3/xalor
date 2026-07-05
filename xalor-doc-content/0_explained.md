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

≈
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
