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
  // 1. Initialize the root with the new Triple-KV structure
  if (!globalThis.__SOLID_VAULT__) {
    globalThis.__SOLID_VAULT__ = {
      driftTracking: new Map(),
      blueprints: new Map(),
      references: new Map(),
      manifest: new Map(),
      registry: new Map(),
      errors: new Map(),
    };
  }

  const vault = globalThis.__SOLID_VAULT__;

  //  THE RESILIENCY FIX
  // We ensure every specific Map is healthy to prevent runtime crashes.
  if (!(vault.driftTracking instanceof Map)) vault.driftTracking = new Map();
  if (!(vault.blueprints instanceof Map)) vault.blueprints = new Map();
  if (!(vault.references instanceof Map)) vault.references = new Map();
  if (!(vault.manifest instanceof Map)) vault.manifest = new Map();
  if (!(vault.registry instanceof Map)) vault.registry = new Map();
  if (!(vault.errors instanceof Map)) vault.errors = new Map();

  return vault;
}
