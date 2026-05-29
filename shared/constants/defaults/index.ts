/**
 * ⚙️ SHAPE KIND CONFIGURATION
 *
 * Defines the definitive list of data "Kinds" recognized by the Xalor engine.
 * This object acts as the central source of truth for both the Miner and
 * the Validator, ensuring that kind-string comparisons remain consistent
 * and protected from accidental mutation at runtime.
 */
export const IS_SOLID_SHAPE_KINDS_CONFIG = Object.freeze({
  primitive: 'primitive',
  literal: 'literal',
  union: 'union',
  intersection: 'intersection',
  branded: 'branded',
  object: 'object',
  array: 'array',
  reference: 'reference',
} as const);
/**
 * 🎨 ANSI TERMINAL COLOR CODES
 *
 * ROLE:
 * Raw terminal styling escape sequences for layout rendering.
 *
 * STRATEGY:
 * Maps standard terminal escape keys to predictable names. It uses compile-time
 * 'as const' literal typing to ensure arbitrary invalid strings cannot be fed
 * into stream pipelines.
 */
export const ANSI_COLOR_CODES = {
  reset: '\x1b[0m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  underline: '\x1b[4m',
  gray: '\x1b[90m',
} as const;
/**
 * 🗺️ DEFAULT LOGGING COLOR ROUTER
 *
 * ROLE:
 * Maps discrete event severity logs to deterministic visual priorities.
 *
 * STRATEGY:
 * Leverages the TS 'satisfies' keyword to validate that every status variant
 * perfectly pairs with an active key in the ANSI map, completely ruling out
 * 'any' fallback traps while preserving tight literal types.
 */
export const DEFAULT_TYPE_COLORS: Record<
  string,
  keyof typeof ANSI_COLOR_CODES
> = {
  info: 'cyan',
  error: 'red',
  debug: 'magenta',
  warn: 'yellow',
  log: 'yellow',
} satisfies Record<string, keyof typeof ANSI_COLOR_CODES>;
/**
 * 🔑 MASTER AUDITOR KEYWORDS LEDGER
 *
 * ROLE:
 * The single source of truth defining the absolute array list of string tokens
 * scanned by the diagnostic translation engine.
 */
export const AUDITOR_KEYWORDS = Object.freeze([
  'missing',
  'required',
  'literal',
  'excess',
  'stray',
  'union',
  'overflow',
  'depth',
  'intersection',
  'primitive',
  'type',
] as const);
/**
 * 🔑 SOLID SHAPE PRIMITIVE KEYS (THE IMMUTABLE COMPACTION MATRIX)
 *
 * ROLE:
 * The absolute, single source of truth defining the compiled runtime string constants
 * scanned by the diagnostic engine, the Bouncer, and the build-time Miner.
 *
 * THE IMMUTABLE BOUNDARIES MAP:
 * 1. BASE SYSTEM SCALARS - Standard execution properties ('string', 'number', 'boolean', 'bigint').
 * 2. STRUCTURAL TOP/BOTTOMS - Core compiler evaluation limits ('any', 'unknown', 'null', 'undefined').
 * 3. COMPACTION ENTIITES - Complex platform constructors ('Date', 'RegExp', 'Map', 'Set', 'Promise', 'URL')
 *                         flattened into single scalar tokens to prevent deep interface property
 *                         crawling and cache bloat on disk.
 *
 * STRATEGY:
 * Sealed using Object.freeze() and 'as const' to guarantee full runtime immutability.
 * Provides an allocation-free validation radar used for high-speed value checks and user-defined
 * type guard narrowings across application request streams.
 */

export const SOLID_SHAPE_PRIMITIVE_KEYS = Object.freeze([
  'string',
  'number',
  'boolean',
  'bigint',
  'unknown',
  'any',
  'null',
  'undefined',
  'never',
  'void',
  'Date',
  'RegExp',
  'Map',
  'Set',
  'Promise',
  'URL',
] as const);

/**
 * CUD_EXECUTION_MODES
 *
 * ROLE:
 * The single source of truth for all permitted type mutation lifecycle states.
 *
 * STRATEGY:
 * Freezing this dictionary object provides an immutable lookup vocabulary
 * across the codebase (NO switch statements), while preserving tight compile-time
 * type inference across your logging and mutation engines.
 *
 * @key create State token indicating a pristine type registration creation pass
 * @key State token indicating a structural layout mutation or property update pass
 * @key State token indicating a semantic file-removal deletion sweep pass
 *
 */
export const CUD_EXECUTION_MODES = Object.freeze({
  create: 'create',
  update: 'update',
  delete: 'delete',
  noop: 'noop',
} as const);
/**
 * REGEX_PATTERNS
 *
 * ROLE:
 * Master Immutable Global Regular Expression Registry.
 *
 * STRATEGY:
 * Provides a deeply frozen, centralized warehouse of pre-compiled structural regular
 * expression pattern metrics. Consolidating patterns here ensures maximum engine reuse
 * and prevents the runtime memory allocation thrashing caused by repeatedly recreating
 * regex literals inside heavy compiler visitor loops or token scanning passes.
 *
 * DESIGN SPECIFICATIONS:
 * Enforced via `Object.freeze` and the `as const` type modifier block to guarantee
 * complete multi-thread immutability. This protects your parsing gates against accidental
 * runtime overrides, property additions, or configuration drift across separate modules.
 *
 * @param coordinates: /:(\d+):(\d+)$/ (e.g., extracts line/col suffixes like ":14:1")
 * @param extensions: /\.(ts|tsx|js|jsx)$/ (Matches standard TypeScript/JavaScript module extension footprints for path cleaning)
 * @param backslashes: /\\/g (Strips backslashes natively to guarantee cross-OS platform path normalization harmony)
 * @param fragments: /\$/ (Isolates internal sub-fragment delimiters to shield public autocomplete directories)
 *
 *
 */
export const REGEX_PATTERNS = Object.freeze({
  coordinates: /:(\d+):(\d+)$/,
  extensions: /\.(ts|tsx|js|jsx)$/,
  backslashes: /\\/g,
  fragments: /\$/,
} as const);
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
