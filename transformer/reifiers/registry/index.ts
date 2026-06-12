// transformer/reifiers/registry/index.ts

/**
 * 🧭 REIFIER REGISTRY BOOTSTRAP (ORDER-SENSITIVE EXECUTION LAYER)
 *
 * ROLE:
 * This file defines the deterministic evaluation order for all shape reifiers.
 * Reifiers are executed sequentially, and the FIRST matching reifier wins.
 *
 * Because of this behavior, IMPORT ORDER = DISPATCH PRIORITY.
 *
 * ---------------------------------------------------------------------------
 * 🚨 WHY ORDER MATTERS (CRITICAL ARCHITECTURAL CONSTRAINT)
 * ---------------------------------------------------------------------------
 *
 * The reifier system is a "first-match wins" pipeline.
 * This means every shape is evaluated in sequence until one reifier claims it.
 *
 * If a generic reifier runs before a more specific one, it will "consume"
 * the shape prematurely and prevent correct interpretation.
 *
 * Example failure case:
 * - Object reifier runs before Branded → loses brand metadata
 * - Array reifier runs before Tuple (future) → collapses structural meaning
 * - Union runs too late → misses distributive optimization opportunities
 *
 * ---------------------------------------------------------------------------
 * 🧠 ORDERING PRINCIPLE (MOST SPECIFIC → MOST GENERIC)
 * ---------------------------------------------------------------------------
 *
 * 1. Specific structural overrides (highest priority)
 *    - branded
 *
 * 2. Composite / combinatorial constructs
 *    - unions
 *    - intersection
 *
 * 3. Structured containers
 *    - array
 *    - function
 *    - instanceof (runtime identity classification layer)
 *
 * 4. General structural objects
 *    - objects
 *
 * 5. Terminal primitives (lowest priority)
 *    - primitives
 *
 * ---------------------------------------------------------------------------
 * ⚠️ HARD RULE
 * ---------------------------------------------------------------------------
 *
 * NEVER reorder these imports based on aesthetics or locality.
 * Reordering changes runtime behavior of the entire transformation pipeline.
 *
 * Any new reifier MUST be inserted according to specificity rules above,
 * not appended arbitrarily.
 *
 * ---------------------------------------------------------------------------
 * 🧱 DESIGN INTENT
 * ---------------------------------------------------------------------------
 *
 * This system behaves like a pattern-matching compiler dispatch table.
 * Correctness depends on deterministic ordering, not runtime inferenc
import './branded';        // Highest specificity: structural marker override layer
import './unions';         // Composite branching logic (distributive expansion)
import './intersection';   // Multi-constraint merging logic
import './array';          // Structural sequence types (including tuple future split)
import './function';       // Callable structural semantics
import './instanceof';     // Runtime identity classification (constructor-bound types)
import './objects';        // Generic structural object shapes (fallback container layer)
import './primitives';     // Terminal scalar values (lowest precedence)
 */
import './branded'; // Check for __brand first
import './unions'; // Check for |
import './intersection';
import './array'; // Check for []
import './function';
import './instanceof'; // ** instanceOf placement Matters
import './objects'; // Check for {} / interfaces
import './primitives'; // Check for string/number/boolean

export { REIFIERS } from './core';
