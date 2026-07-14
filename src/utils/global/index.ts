import { IS_SOLID_CONFIG_ITEMS } from '../../../shared';
import type {
  TSolidVaultMap,
  TSolidShape,
  TVaultDriftEntry,
} from '../../../shared';
import { executeVaultSelfHealingSeeding } from './helpers';

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

  if (existingVault && existingVault.blueprints.size > 0) {
    return existingVault;
  }

  const rawMapVault: TSolidVaultMap = {
    driftTracking: new Map<string, TVaultDriftEntry>(),
    blueprints: new Map<string, TSolidShape>(),
    references: new Map<string, string>(),
    manifest: new Map(),
    registry: new Map(),
    errors: new Map(),
  };

  globalThis.__SOLID_VAULT__ = rawMapVault;

  // 🪐 Dispatch the file lookups to our isolated self-healing method function
  executeVaultSelfHealingSeeding(rawMapVault);

  const isCompilePhaseActive = globalThis.__XALOR_COMPILE_LOCK__ === true;

  if (!isCompilePhaseActive) {
    // Dispatch the file lookups to your isolated self-healing method function
    executeVaultSelfHealingSeeding(rawMapVault);
  }
  const finalVault = globalThis.__SOLID_VAULT__;
  if (finalVault.blueprints instanceof Map) {
    /* prettier-ignore */ if (!(finalVault.driftTracking instanceof Map)) finalVault.driftTracking = new Map();
    /* prettier-ignore */ if (!(finalVault.references instanceof Map)) finalVault.references = new Map();
    /* prettier-ignore */ if (!(finalVault.manifest instanceof Map)) finalVault.manifest = new Map();
    /* prettier-ignore */ if (!(finalVault.registry instanceof Map)) finalVault.registry = new Map();
    /* prettier-ignore */ if (!(finalVault.errors instanceof Map)) finalVault.errors = new Map();
    return finalVault;
  }

  return finalVault;
}
