import type { TTripleKV } from '../../types';
import { TDeepWriteable } from '../../types';

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

export const DEFAULT_VAULT_SHAPE_FALLBACK: TDeepWriteable<TTripleKV> = {
  blueprints: {},
  references: {},
  manifest: {},
  registry: {},
  driftTracking: {},
  version: '1.0.0',
} satisfies TDeepWriteable<TTripleKV>;
