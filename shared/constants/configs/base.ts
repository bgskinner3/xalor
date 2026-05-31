/**
 * 🔑 CORE GLOBAL KEYS
 *
 * Defines the fundamental identifiers used to anchor the Xalor engine.
 * This includes the singleton key for the Global Vault and the
 * current versioning used to prevent schema mismatches across
 * different build environments.
 */
const SOLID_GLOBAL_KEYS = {
  solidVaultKey: '__SOLID_VAULT__',
  solidVersion: '1.0.0',
  // branding keys
  solidBrandKey: '__xalorBrand',
  validBrandKey: '__valid',
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
 */
const PACKAGE_FILE_PATHS = {
  bridgeFileName: 'solid-env.ts',
  bridgeTemplate: 'solid-env.ts.template',
  vaultTemplate: 'vault-snapshot.json',

  // 🟢 The Core Serialized Vault Persistence Layers
  productionBaseline: 'production-baseline.json',
  vaultFileName: 'vault-snapshot.json',
  bakedFileName: 'baked-vault.js',
  intelFolderName: '.xalor',
  cacheFolderName: 'xalor',
} as const;
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
} as const;
