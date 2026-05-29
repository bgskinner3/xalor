import type { TModeRouter } from '../types';

/**
 * 🔬 ARCHITECTURAL EXPLANATION OF THE RULES SUITE:
 *
 * 1. UNBOUND_GENERIC (TypeFlags.TypeParameter & TypeFlags.Conditional)
 *    - Abstract type parameters (`T`, `U`) and deferred, un-evaluated conditional type expressions
 *      do not represent concrete shapes—they are lazy type-level instructions. The compiler cannot
 *      calculate a permanent, content-addressed fingerprint hash or map concrete properties for a
 *      layout whose properties do not yet exist. This rule forces developers to bind variables
 *      to real definitions at the call-site so the system has static shapes to freeze.
 *
 * 2. CATASTROPHIC_COMPILER_ERROR (TypeFlags.Any with missing symbol metadata)
 *    - When the TypeScript compiler thread hits a catastrophic syntax error, an invalid cross-file
 *      reference, or a broken missing import preceding our call-site, it silently converts that
 *      broken token into an internal Intrinsic Error Type flagged as `Any`. If left unchecked, this
 *      phantom state slips through object loops and writes a hollow, completely corrupted type mask
 *      of "any" straight into the production database. This rule isolates and blocks compilation
 *      failures immediately.
 *
 * 3. COMPUTATIONAL_COLLAPSE (TypeFlags.Any with non-any symbol metadata)
 *    - Catches structural breakdowns where complex utility types or recursive conditional loops
 *      exceed TypeScript's maximum internal evaluation depth boundaries or trigger tail-call stack
 *      overflow traps. When this boundary is crossed, the compiler engine gives up processing and
 *      collapses the entire type down into a blank error state. This check traps the collapse to
 *      prevent empty or broken blueprints from infecting the application.
 *
 * 4. TERMINAL_CONTRADICTION (TypeFlags.Never)
 *    - Traps impossible type program expressions and primitive contradictions authored at the root
 *      registration level (such as intersected scalars like `string & number`). Because a value can
 *      never simultaneously satisfy conflicting primitive layout rules, this structure resolves
 *      directly to a root `never` state. If serialized, it creates an un-verifiable runtime schema
 *      that automatically rejects all incoming structural payloads.
 *
 * 5. UNSERIALIZABLE_EXECUTABLE (Call/Construct Signatures & TypeFlags.ESSymbol)
 *    - Enforces pure data serialization boundaries. Raw runtime execution methods, class constructors,
 *      and active JavaScript `symbol` properties contain fluid, live instructions and unique memory
 *      addresses that cannot be represented as static, hidden JSON literal metadata sheets. This check
 *      filters them out entirely to keep the registry clean, data-only, and completely tree-shakeable.
 *
 * 6. OPEN_INDEX_SIGNATURE (TypeFlags.Object with active Index Infos but zero static properties)
 *    - Detects completely open-ended dictionary signatures (such as `{ [key: string]: number }`) that
 *      completely lack explicit keys. Because there are no discrete, named property symbols for the
 *      reifier to unroll into structural keys, it represents an infinite map rather than a concrete data
 *      structure. This filter blocks open index sheets, ensuring the developer converts their layout
 *      to an explicit, bounded schema record before registration.
 */
export const XALOR_COMPLIANCE_RULE_KEYS = Object.freeze([
  'unbound_generic',
  'computational_collapse',
  'open_index_signature',
  'unserializable_executable',
  'catastrophic_compiler_error',
  'terminal_contradiction',
] as const);
/**
 * 🪐 TRANSFORMER EXECUTION MODE ROUTER (The Visual Lane Allocator)
 *
 * ROLE:
 * A high-speed, compile-time switchless mapping registry that translates active
 * transformer toolchain execution vectors into deterministic visualization layout modes.
 *
 * STRATEGY:
 * Bypasses sequential procedural if/else branching and switch metrics entirely.
 * By anchoring input environments directly to target layout keys ('hard' vs 'watch')
 * via a frozen object literal dictionary record, it guarantees an instantaneous,
 * constant-time O(1) hash table lookup on the execution stack frame.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation Rule) and Commandment VIII (Internal Efficiency).
 * It isolates environmental state evaluation mechanics away from the printing pipelines,
 * executing with absolute zero heap memory allocations or runtime closure overheads
 * during rapid development hot-module-replacement (HMR) save sweeps.
 */
export const REPORT_SERVICE_MODE_ROUTER: TModeRouter = {
  vacuum: 'hard',
  compile: 'hard',
  watch: 'watch',
  studio: 'watch',
} satisfies TModeRouter;
