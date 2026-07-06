import { ObjectUtils } from '../../utils';

/**
 * 🔑 CORE GLOBAL KEYS
 *
 * Defines the fundamental identifiers used to anchor the Xalor engine.
 * This includes the singleton key for the Global Vault and the
 * current versioning used to prevent schema mismatches across
 * different build environments.
 *
 * @key brandDomainNames Defines the controlled set of allowed semantic domains for all branded types
 * within the system architecture.
 */
const SOLID_GLOBAL_KEYS = {
  solidVaultKey: '__SOLID_VAULT__',
  solidVersion: '1.0.0',
  // branding keys
  solidBrandKey: '__xalorBrand',
  validBrandKey: '__valid',
  rootDirBrandKey: 'rootDir',

  //
  brandDomainNames: ['Shape', 'Solid', 'Path', 'Mirror'],
} as const;

/**
 * 🛰️ AMBIENT EMITTER CONFIGURATION
 *
 * Orchestrates the generation of the "Ghost Layer" (.d.ts) database.
 * These settings control where the IntelliSense Bridge is built,
 * how it identifies the parent module, and which linting rules
 * are suppressed to ensure a seamless developer experience.
 */
const SOLID_EMITTER_KEYS = {
  moduleName: '@bgskinner2/xalor',
  moduleType: 'global',
  banner: `/** 💎 SOLIDIFIED TYPE DATABASE (AUTO-GENERATED) */`,
  eslintDisabled: [
    '@typescript-eslint/no-unused-vars',
    '@typescript-eslint/no-explicit-any',
  ],
  imports: [
    // "import type { ISolidRegistry, ISolidIdentity } from '@bgskinner2/xalor';",
  ],
} as const;
// =============================================================================
// =============================================================================
// =============================================================================

/**
 * PACKAGE_FILE_PATHS
 * 🪐 THE VIRTUAL FILESYSTEM PERSISTENCE LEDGER
 *
 * PURPOSE:
 * Establishes the definitive, immutable target file names and structural folder
 * coordinates managing the physical generation, caching, and distribution layers
 * of the Xalor compiler plugin platform.
 *
 * DESIGN INVARIANT:
 * Satisfies Commandment I (Single Source of Truth) by grouping all active
 * build-time output assets under a unified structural dictionary, preventing
 * path layout desynchronization across the core transformation engines.
 *
 * @key intelFolderName - IDE FILE NAME OUTSIDE NODE_MODULES
 * @key bakedFileName - FINAILIZED PRODUCTION BUILDTIME BLUEPRINT FILENAME
 * @key vaultFileName - LIVING DEV VAULT STORAGE
 * @key productionBaseline - FILE NAME FOR AUDIT DUMP
 * @key vaultTemplate - vault file template name
 * @key bridgeTemplate - IDE template name
 * @key bridgeFileName - ide file name
 * @key cacheFolderName - FOLE NAME FOR NODE_MODULES/.cache
 */
export const PACKAGE_FILE_PATHS = Object.freeze({
  bridgeFileName: 'solid-env.ts',
  bridgeTemplate: 'solid-env.ts.template',
  vaultTemplate: 'vault-snapshot.json',

  // 🟢 The Core Serialized Vault Persistence Layers
  productionBaseline: 'production-baseline.json',
  vaultFileName: 'vault-snapshot.json',
  bakedFileName: 'baked-vault.js',
  intelFolderName: '.xalor',
  cacheFolderName: 'xalor',
  // generated final build
  generatedFinalBuild: 'xalor-vault.generated.json',
} as const);
/**
 * TYPED KEY LIST
 */
export const PACKAGE_FILE_KEY_NAMES = ObjectUtils.keys(PACKAGE_FILE_PATHS);

// =============================================================================
// =============================================================================
// =============================================================================

/**
 * SEARCH_FILE_NAMES
 * 🪐 THE SYSTEM EXPLORATION & DISCOVERY DIRECTORY
 *
 * PURPOSE:
 * An authoritative, frozen lookup dictionary tracking structural configuration
 * manifests, monorepo boundaries, dependency lists, and environment parameters
 * scanned by the engine to verify project layout boundaries.
 *
 * DESIGN INVARIANT:
 * Satisfies Commandment VIII (Internal Efficiency) by maintaining flat, primitive
 * string literal definitions natively, enabling lightning-fast O(1) constant-time
 * lookups across background filesystem watchers and AST mining processes.
 */
const SEARCH_FILE_NAMES = {
  /* prettier-ignore */ tsconfig: 'tsconfig.json',
  /* prettier-ignore */ tsconfigBuild: 'tsconfig.build.json',
  /* prettier-ignore */ tsconfigBase: 'tsconfig.base.json',
  /* prettier-ignore */ packageJson: 'package.json',
  /* prettier-ignore */ nodeModules: 'node_modules',
  /* prettier-ignore */ envFile: '.env',
  /* prettier-ignore */ envDevelopment: '.env.development',
  /* prettier-ignore */ gitIgnore: '.gitignore',
  tsupConfig: 'tsup.config.ts',
} as const;

/**
 * REIFY_DEPTH_LENGTH_SIZE_LIMITS
 * 🪐 THE LAWS OF FINITE GEOMETRY (Multi-Tiered Security Edition)
 *
 * PURPOSE:
 * Implements a strict, multi-tiered structural protection framework to prevent
 * deep tree-traversal heap corruption and infinite recursion stack overflows.
 * These metrics establish the immutable data constraints for the Build-Time Miner.
 *
 * ROLE:
 * 1. PERSISTENCE: Guarantees that content-addressed database snapshots remain compact
 *    enough to enable sub-millisecond, zero-allocation synchronous disk I/O operations.
 * 2. HYGIENE VISIBILITY: Establishes a distinct warning buffer zone where the compiler
 *    flags deep architectural anti-patterns before executing hard-chop layout cuts.
 * 3. SECURITY: Eliminates algorithmic memory-exhaustion vectors (e.g., recursive expansion
 *    traps) to maintain absolute stability across parallel compilation threads.
 *
 * @law depthAlarmThreshold - The precise layer depth where the audit engine triggers critical warnings.
 * @law maxDepth - The definitive structural limit forcing a 'reference' split to isolate type graphs.
 * @law maxStringLength - Enforces strict character allocation caps on primitive token identifiers.
 * @law maxObjectProperties - Clips overly dense data shapes to guarantee fast lookup matrix parsing.
 * @law maxUnionVariants - Clamps structural branching layers to shield the type loop from exploding.
 */
const REIFY_DEPTH_LENGTH_SIZE_LIMITS = {
  depthAlarmThreshold: 10,
  maxDepth: 25,
  maxStringLength: 4096,
  maxObjectProperties: 200,
  maxUnionVariants: 50,
  autoChop: true,
} as const;

/**
 * COMPILED_DISTRIBUTION_MANIFEST
 * ROLE: Authoritative compilation directory registries tracking output build targets workspace-wide.
 *
 * SPECIFICATIONS:
 * @property allowedOutputDirectories Standard collection paths searched by the telemetry scanner to detect production artifacts.
 * @property defaultOutputTarget Fallback compilation anchor destination used when executing baseline builds.
 */
/* prettier-ignore */
export const COMPILED_DISTRIBUTION_MANIFEST = Object.freeze({
  fallbackIncludePatterns: ['src/**/*', 'app/**/*', 'test/**/*'] as const,
  
  mandatoryExcludePatterns: ['dist', 'build', 'out', 'lib', 'node_modules', '.cache', '.next', '.xalor'] as const,
   
  defaultOutputTarget: 'dist',
} as const);

// ================================================================================
// ================================================================================
// FILE SYSTEM INDICATORS
// ================================================================================
// ================================================================================
/**
 * “workspace root markers” — they tell your system where the monorepo or repo boundary
 * lives so all path resolution can anchor consistently.
 */
/* prettier-ignore */
const WORKSPACE_INDICATORS = Object.freeze([ 'pnpm-workspace.yaml', 'nx.json', 'turbo.json', 'lerna.json', 'package-lock.json', 'yarn.lock', '.git' ] as const);
/* prettier-ignore */
const PACKAGE_INDICATORS = Object.freeze([ 'package.json', 'tsconfig.json', 'tsconfig.base.json', 'tsconfig.build.json' ] as const);
/* prettier-ignore */
const BUILD_IGNORE_DIRECTORIES = Object.freeze([ 'node_modules', 'dist', 'build', '.next', '.cache', 'coverage',   '.git' ] as const);
/* prettier-ignore */
const ALLOWED_BASE_FILE_EXTENSIONS = Object.freeze(['.js', '.mjs', '.ts', '.tsx'] as const);
/* prettier-ignore */
export const ALLOWED_EXTS_SET = new Set<string>(ALLOWED_BASE_FILE_EXTENSIONS);

/**
 * FILE_SYSTEM_SIGNAL_MAP
 *
 * @key workspaceIndicators
 *  “workspace root markers” — they tell your system where the monorepo or repo boundary
 * lives so all path resolution can anchor consistently.
 *
 *  @key packageIndicators
 * Signals the local runtime or compilation domain boundaries.
 * Used to locate specific apps, services, or packages nested inside a monorepo structure.
 *
 * @key ignoreDirectories
 * Folders strictly bypassed by asset discovery, file system sweeps, or index trees.
 * Isolates runtime trash, test logs, and build artifacts from active workspace parsing.
 *
 */
export const FILE_SYSTEM_SIGNAL_MAP = {
  workspaceIndicators: WORKSPACE_INDICATORS,
  packageIndicators: PACKAGE_INDICATORS,
  ignoreDirectories: BUILD_IGNORE_DIRECTORIES,
  allowedExtensions: ALLOWED_BASE_FILE_EXTENSIONS,
} as const;
/**
 * 🪐 XALOR CLI ENVIRONMENT ENGINE CONFIGURATION MATRICES
 *
 * @description
 * Establishes absolute threshold parameters, telemetry memory caps, and recursive
 * abstract syntax tree (AST) constraint guardrails enforced across the engine lifecycle.
 *
 * I. STUDIO MONITORING ENGINE CONSTRAINTS
 * @property {number} studioMemRejectionMax
 *   Absolute memory size capacity ceiling in Megabytes (MB). Prevents standard
 *   JavaScript heap expansion anomalies on low-spec developer systems. If memory
 *   consumption spikes past this limit, the orchestrator triggers an instant shutdown.
 *
 * @property {number} studioMemNestingDepth
 *   Maximum recursion tree boundary limits allowed before aborting. Direct protection
 *   guardrail mitigating infinite cyclical loop references. Prevents the stack pointer
 *   from overflowing V8 memory parameters during execution loops.
 *
 * @property {number} studioMemMaxBlueprintCount
 *   Maximum scale volume footprint for localized schema pools. Caps the aggregate length
 *   of localized schema layouts evaluated in a single pass. Guarantees object lookup
 *   complexities (O(N)) do not stall the CPU thread.
 */

export const CLI_CONFIG_OPTIONS = {
  // STUDIO OPTIONS
  studioMemRejectionMax: 50.0,
  studioMemNestingDepth: 25,
  studioMemMaxBlueprintCount: 5000,
} as const;

/**
 * 🌍 MASTER GLOBAL CONFIGURATION
 *
 * The unified source of truth for the entire Xalor ecosystem.
 * This object flattens the individual key groups into a single,
 * immutable configuration object used by the Miner, the Emitter,
 * and the Runtime Engine.
 */
export const IS_SOLID_CONFIG_ITEMS = {
  ...SOLID_GLOBAL_KEYS,
  emitter: SOLID_EMITTER_KEYS,
  reifyLimit: REIFY_DEPTH_LENGTH_SIZE_LIMITS,
  fileNames: PACKAGE_FILE_PATHS,
  searchFileNames: SEARCH_FILE_NAMES,
  buildLayer: COMPILED_DISTRIBUTION_MANIFEST,
  fileSystemMap: FILE_SYSTEM_SIGNAL_MAP,
  cliConfig: CLI_CONFIG_OPTIONS,
} as const;
