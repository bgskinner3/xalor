import { IS_SOLID_CONFIG_ITEMS } from '../../../shared';
import type {
  TSolidVaultMap,
  TSolidShape,
  TVaultDriftEntry,
  TSolidError,
} from '../../../shared';
import { executeVaultSelfHealingSeeding } from './self-healing-seeding';
let isVaultFullySeeded = false;
// ====================================================================
/**
 * GLOBAL VAULT ACCESSORS
 *
 * These utilities manage the library's "Live Memory." By attaching the Vault
 * to 'globalThis', we ensure that metadata and error states persist across
 * different modules, bundles, and execution contexts (like HMR or Jest).
 */

// ====================================================================
/**
 * GET GLOBAL VAULT
 * Safely attempts to retrieve the existing Vault singleton.
 * Returns 'undefined' if no types have been solidified yet, preventing
 * unnecessary memory allocation during passive lookups.
 */
export function getGlobalVault(): TSolidVaultMap | undefined {
  return globalThis[IS_SOLID_CONFIG_ITEMS.solidVaultKey];
}

/**
 * ENSURE GLOBAL VAULT
 * This is your primary production runtime bootloader.
 * It executes entirely inside the compiled /dist environment on server start.
 */
export function ensureGlobalVault(): TSolidVaultMap {
  const existingVault = globalThis.__SOLID_VAULT__;

  if (isVaultFullySeeded && existingVault !== undefined) {
    return existingVault;
  }

  const rawMapVault: TSolidVaultMap = {
    driftTracking: new Map<string, TVaultDriftEntry>(),
    blueprints: new Map<string, TSolidShape>(),
    references: new Map<string, string>(),
    manifest: new Map(),
    registry: new Map(),
    errors: new Map<string, TSolidError[]>(),
  };

  globalThis.__SOLID_VAULT__ = rawMapVault;

  const isCompilePhaseActive = globalThis.__XALOR_COMPILE_LOCK__ === true;

  if (!isCompilePhaseActive) {
    executeVaultSelfHealingSeeding(rawMapVault);
  }
  isVaultFullySeeded = true;

  // Enforce rigid graph safety by locking structural metadata shapes
  Object.freeze(rawMapVault.blueprints);
  Object.freeze(rawMapVault.references);
  Object.freeze(rawMapVault.manifest);
  Object.freeze(rawMapVault.registry);
  Object.freeze(rawMapVault.driftTracking);
  Object.freeze(rawMapVault);

  isVaultFullySeeded = true;

  return rawMapVault;
}
