// models/types/definitions/solid-blueprints.d.ts
import type { TSolidVaultMap } from '../../../../shared';
/**
 *  THE AMBIENT BLUEPRINTS
 * These are the serialized structures stored in the Vault.
 * They are global so they can be accessed by the Miner and the Engine.
 */
declare global {
  /** The Singleton on globalThis */
  var __SOLID_VAULT__: TSolidVaultMap | undefined;
}
export {};
