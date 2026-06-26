import type {
  TXalorParsedConfig,
  TTripleKV,
  TTextColorToken,
  TThemeBlocks,
} from '../../types';
import { ModuleKind, ScriptTarget } from 'typescript';
// import { IS_SOLID_CONFIG_ITEMS } from '../configs';
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
/* prettier-ignore */
export const DEFAULT_TYPE_COLORS: Record<string,keyof typeof ANSI_COLOR_CODES> = {
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

export const LOGGER_DESIGN_SPECTRUM = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  underline: '\x1b[4m',

  bgCanvasBlock: '\x1b[48;5;250m', // Premium Light Gray backdrop matrix
  textCanvasBlock: '\x1b[38;5;234m', // Deep charcoal black text for standard rows

  bgErrorBlock: '\x1b[48;5;88m', // Premium Dark Crimson Red backdrop
  textErrorBlock: '\x1b[38;5;255m', // Crisp Pure White text for raw error text rows
  bgFooterContrastBlock: '\x1b[48;5;235m', // Dark Slate Backdrop (ANSI 235)
  textFooterContrastBlock: '\x1b[38;5;255m', // Crisp White Text for high-contrast visibility

  textLightRed: '\x1b[38;5;196m\x1b[1m',
  textLightGreen: '\x1b[38;5;82m\x1b[1m',
  textLightYellow: '\x1b[38;5;226m\x1b[1m',
  textLightCyan: '\x1b[38;5;51m\x1b[1m',

  gray: '\x1b[90m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
} as const;

export const LOGGER_LAYOUT_CONFIG = {
  canvasWidth: 76,
  maxSafeFileLimit: 50000,
} as const;

export const LOGGER_SIGNAL_EMOJIS = {
  fault: '✖',
  warn: '⚠️',
  info: 'ℹ️',
  success: '✅',
  anchor: '🪐',
  package: '📦',
  link: '➔',
  bullet: '•',
  lightning: '⚡',
  diamond: '💎',
  fire: '💥',
  stop: '🛑',
  lock: '🔐',
} as const;

export const LOGGER_TOKEN_COLORS: Record<TTextColorToken, string> = {
  default: LOGGER_DESIGN_SPECTRUM.reset,
  error: LOGGER_DESIGN_SPECTRUM.textLightRed,
  success: LOGGER_DESIGN_SPECTRUM.textLightGreen,
  warning: LOGGER_DESIGN_SPECTRUM.textLightYellow,
  info: LOGGER_DESIGN_SPECTRUM.textLightCyan,
} satisfies Record<TTextColorToken, string>;
//* prettier-ignore */

export const LOGGER_THEME_BLOCKS: TThemeBlocks = {
  standard: {
    bg: LOGGER_DESIGN_SPECTRUM.bgCanvasBlock,
    fg: LOGGER_DESIGN_SPECTRUM.textCanvasBlock,
  },
  crimson: {
    bg: LOGGER_DESIGN_SPECTRUM.bgErrorBlock,
    fg: LOGGER_DESIGN_SPECTRUM.textErrorBlock,
  },
  contrast: {
    bg: LOGGER_DESIGN_SPECTRUM.bgFooterContrastBlock,
    fg: LOGGER_DESIGN_SPECTRUM.textFooterContrastBlock,
  },
} satisfies TThemeBlocks;
