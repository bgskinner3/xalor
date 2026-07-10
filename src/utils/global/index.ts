// models/utils/global/index.ts
import { IS_SOLID_CONFIG_ITEMS } from '../../../shared';
import type { TSolidVaultMap } from '../../../shared';

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
 * Guarantees the existence of the Vault singleton.
 * If the Vault doesn't exist, it initializes the 'items' and 'errors' maps
 * and attaches them to the global scope. This is the primary "Bootloader"
 * for Pillar 2 (The Vault).
 */
export function ensureGlobalVault(): TSolidVaultMap {
  // 1. Core Cold-Start Initialization Gate
  if (!globalThis.__SOLID_VAULT__) {
    const rawMapVault: TSolidVaultMap = {
      driftTracking: new Map(),
      blueprints: new Map(),
      references: new Map(),
      manifest: new Map(),
      registry: new Map(),
      errors: new Map(),
    };
    globalThis.__SOLID_VAULT__ = rawMapVault;
  }

  // 2. THE RESILIENCY HEALING & TYPE REFINEMENT GATES:
  const vault = globalThis.__SOLID_VAULT__;

  // 🚀 THE WIN: We execute an 'instanceof Map' check on a known distinguishing property.
  // This triggers standard TypeScript Control Flow Analysis, which instantly refines
  // 'vault' from a loose union down to strictly 'TSolidVaultMap' with zero 'as' overrides!
  if (vault.blueprints instanceof Map) {
    if (!(vault.driftTracking instanceof Map)) vault.driftTracking = new Map();
    if (!(vault.references instanceof Map)) vault.references = new Map();
    if (!(vault.manifest instanceof Map)) vault.manifest = new Map();
    if (!(vault.registry instanceof Map)) vault.registry = new Map();
    if (!(vault.errors instanceof Map)) vault.errors = new Map();

    return vault; // Statically verified as a healthy TSolidVaultMap
  }

  // 3. PRODUCTION FALLBACK GATES:
  // If the guard fails, it means we loaded a pre-compiled 'IProductionVault' record array.
  // We return it exactly as it sits since production files should not carry mutable Map layers.
  return vault;
}
