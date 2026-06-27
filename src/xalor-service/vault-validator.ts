import { ensureGlobalVault } from '../utils';
import type { TSolidVaultMap } from '../../shared';
import { validateShape, createInitialContext } from '../validation';

/**
 * XALETHOR VAULT VALIDATOR
 *
 * ROLE:
 * The "Bouncer" and Execution Engine. It takes raw data and compares
 * it against the Blueprints stored in the Vault.
 *
 * WHAT GOES HERE:
 * - Entry points for 'guard', 'assert', and 'parse' logic.
 * - Coordination of the recursive 'solidifyShape' engine.
 * - Context creation and recursion protection (seen Map).
 *
 * WHAT DOES NOT GO HERE:
 * - NO Hard-coded error strings (Let the Auditor speak).
 * - NO Persistence logic.
 * - NO Blueprint modification (The Bouncer doesn't rewrite the rules).
 */
export class XalethorVaultValidator {
  private static get vault(): TSolidVaultMap {
    return ensureGlobalVault();
  }
  public static has(key: string): boolean {
    return (
      this.vault.blueprints.has(key) &&
      this.vault.manifest.has(key) &&
      this.vault.registry.has(key)
    );
  }
  public static validateShape(data: unknown, key: string): boolean {
    const shape = this.vault.blueprints.get(key);

    if (!shape) return false;

    this.vault.errors.delete(key);

    const ctx = createInitialContext(key);
    const isValid = validateShape(data, shape, ctx);

    if (!isValid) this.vault.errors.set(key, ctx.errors);

    return isValid;
  }
  public static validateKey(key: string): void {
    if (!this.has(key)) {
      throw new Error(
        `[xalor] 🚨 MISSING BLUEPRINT: The key "${key}" is not registered in the Vault. ` +
          `Ensure you have a build-time isXalor<'${key}', Type>() call.`,
      );
    }
  }
}
