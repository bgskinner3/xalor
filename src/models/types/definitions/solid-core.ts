// models/types/definitions/solid-blueprints.d.ts
import type { TSolidVaultMap } from '../../../../shared';
/**
 *  THE AMBIENT BLUEPRINTS
 * These are the serialized structures stored in the Vault.
 * They are global so they can be accessed by the Miner and the Engine.
 */
declare global {
  /** The Singleton on globalThis */
  /**
   * __SOLID_VAULT__
   * The single authoritative Registry store instance attached straight to globalThis memory paths.
   */
  var __SOLID_VAULT__: TSolidVaultMap | undefined;

  /**
   * __XALOR_COMPILE_LOCK__
   * An ambient boolean flag populated exclusively by your Vite / Webpack / CLI tools on initialization.
   * Tells sub-routines to block synchronous filesystem reads during active build passes.
   */
  var __XALOR_COMPILE_LOCK__: boolean | undefined;
}
export {};
