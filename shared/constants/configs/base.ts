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

const PACKAGE_FILE_PATHS = {
  bridgeFileName: 'solid-env.ts',

  bridgeTemplate: 'solid-env.ts.template',
  vaultTemplate: 'vault-snapshot.json',

  // 🟢 The Core Serialized Vault Persistence Layers
  vaultFileName: 'vault-snapshot.json',
  bakedFileName: 'baked-vault.js',
  intelFolderName: '.xalor',
  cacheFolderName: 'xalor',
} as const;

/**
 * ⚖️ REIFY DEPTH & SIZE LIMITS
 *
 * PURPOSE:
 * Implements the "Atomic Cut" strategy to prevent the "Pyramid of Doom."
 * These constants act as the physical laws for the Build-Time Miner.
 *
 * ROLE:
 * 1. PERSISTENCE: Ensures JSON blueprints remain small enough for rapid I/O.
 * 2. PERFORMANCE: Caps recursion depth to protect the Runtime Engine's stack.
 * 3. SECURITY: Mitigates "Billion Laughs" style memory exhaustion attacks.
 *
 * @law maxDepth - Forces a 'reference' chop once nesting exceeds this level.
 * @law maxStringLength - Guards against "URL Shutdown" scenarios.
 */
const REIFY_DEPTH_LENGTH_SIZE_LIMITS = {
  maxDepth: 10,
  maxStringLength: 4096,
  maxObjectProperties: 200,
  maxUnionVariants: 50,
  autoChop: true,
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
} as const;
