import type { TXalorParsedConfig, TTripleKV } from '../../types';
import { ModuleKind, ScriptTarget } from 'typescript';

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
  commented: /(\/\*[\s\S]*?\*\/)|(\/\/.*)/g,
  // vault regexes
  line: /line:\s*(\d+)/,
  column: /column:\s*(\d+)/,
  anchor: /:(\d+)/,
  // node regex patterns
  tsConfigFiles: /^tsconfig(?:\.[a-zA-Z0-9_-]+)?\.json$/,
  //removal
  removeQuotes: /["']/g,
} as const);

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
 * CONFIG_FALLBACK_DEFAULT
 * 🪐 THE GEOMETRY BASELINE ZERO-CONFIG CONTEXT FALLBACK
 *
 * ROLE:
 * Serves as an immutable, production-ready environment configuration baseline.
 * Safely handles application parameters if the target project workspace missing,
 * corrupts, or strips out an explicit project-level `tsconfig.json` layout file.
 *
 * DESIGN INVARIANT:
 * Enforces strict common common denominator specifications to keep the engine compilation
 * threads completely isolated, secure, and running with near-zero latency.
 *
 * @param compilerOptions Native engine directives configuring compilation targets and target formats
 * @param includePatterns Default directory traversal matching filters capturing active source paths
 * @param excludePatterns Rigid security pattern masks blocking generated output bundles or artifacts
 * @param isFallbackMode System state flag tracking whether the active run pass relies on default parameters
 */
export const CONFIG_FALLBACK_DEFAULT: TXalorParsedConfig = {
  compilerOptions: {
    target: ScriptTarget.Latest,
    module: ModuleKind.CommonJS,
  },
  includePatterns: ['src/**/*', 'app/**/*', 'test/**/*'],
  excludePatterns: [
    'dist',
    'build',
    'out',
    'lib',
    'node_modules',
    '.cache',
    '.next',
    '.xalor',
  ],
  isFallbackMode: true,
} satisfies TXalorParsedConfig;

export const DEFAULT_VAULT_SHAPE_FALLBACK: TTripleKV = {
  blueprints: {},
  references: {},
  manifest: {},
  registry: {},
  driftTracking: {},
  version: '1.0.0',
} satisfies TTripleKV;
