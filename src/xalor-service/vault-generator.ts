import { XalethorVaultKeeper } from './vault-keeper';
import { XalethorVaultAuditor } from './vault-auditor';
import {
  produceDefault,
  markAsSolid,
  produceMock,
  produceClone,
  produceCast,
} from '../utils';
import type { TSolidBranded } from '../../shared';
/**
 * XALETHOR VAULT GENERATOR
 *
 * ROLE:
 * The "Factory." It uses Blueprints to materialize brand-new
 * JavaScript objects from thin air.
 *
 * WHAT GOES HERE:
 * - 'getDefault' materialization.
 * - Mocking, Templating, and Data Casting.
 * - Sanitization logic (cloning objects to strip extra keys).
 *
 * WHAT DOES NOT GO HERE:
 * - NO Validation (Factories don't inspect; they build).
 * - NO GPS or Traceability logic.
 * - NO Disk persistence.
 */
export class XalethorVaultGenerator {
  private static requireShape<K extends keyof ISolidRegistry>(
    key: K,
    msg: string,
  ) {
    const shape = XalethorVaultKeeper.peek('blueprint', key);

    if (!shape) {
      XalethorVaultAuditor.panic(key, msg);
    }
    return shape;
  }
  public static getDefault<K extends keyof ISolidRegistry>(
    key: K,
  ): TSolidBranded<K, ISolidRegistry[K]> {
    /* prettier-ignore */ const shape = 
    this.requireShape( key, 'Generation failed: Blueprint missing from Vault.');

    const data = produceDefault(shape);

    if (markAsSolid<K, ISolidRegistry[K]>(data)) return data;

    throw new Error(`[xalor] Failed to brand default object for ${key}`);
  }

  /**
   * GET MOCK
   *
   * ROLE: The "Simulacrum."
   * Generates realistic, randomized data structures including optional
   * fields and variable array lengths for testing and prototyping.
   *
   * @param key - The unique identifier of the type in the Registry.
   * @returns {ISolidRegistry[K]} - A randomized, branded instance of the type.
   */
  public static getMock<K extends keyof ISolidRegistry>(
    key: K,
  ): TSolidBranded<K, ISolidRegistry[K]> {
    /* prettier-ignore */ const shape = 
    this.requireShape( key, 'Mocking failed: Blueprint missing from Vault.');

    const data = produceMock(shape);

    if (markAsSolid<K, ISolidRegistry[K]>(data)) return data;

    throw new Error(`[xalor] Failed to brand mock object for ${key}`);
  }
  /**
   * GET CLONE (The Sanitizer)
   *
   * ROLE: The "Clean Room."
   * Takes raw, untrusted data and returns a deep-copy that is physically
   * guaranteed to only contain properties defined in the TypeScript interface.
   *
   * STRATEGY:
   * - Graph Integrity: Uses internal Map tracking to handle circular references.
   * - Prototype Preservation: Maintains class instances where possible.
   * - Key Scrubbing: Iterates the Blueprint, not the Data, to ensure purity.
   *
   * @param data - The raw input object to be purified.
   * @param key - The unique identifier of the target blueprint.
   */
  public static getClone<K extends keyof ISolidRegistry>(
    data: unknown,
    key: K,
  ): TSolidBranded<K, ISolidRegistry[K]> {
    /* prettier-ignore */ const shape = 
    this.requireShape( key, 'Cloning failed: Blueprint missing from Vault.');

    const cleanData = produceClone(data, shape, new Map());

    if (markAsSolid<K, ISolidRegistry[K]>(cleanData)) return cleanData;

    throw new Error(`[xalor] Failed to brand purified clone for ${key}`);
  }
  /**
   * GET_CAST
   *
   * ROLE:
   * Coerces loose runtime input payloads into the exact structural and
   * primitive types demanded by your type blueprint contracts.
   * (e.g., safely turning the string "123" into the primitive number 123).
   *
   * STRATEGY:
   * Resolves the target configuration blueprint, pipes execution into the
   * exhaustive O(1) casting dictionary, and applies a protective nominal brand tag.
   */
  public static getCast<K extends keyof ISolidRegistry>(
    data: unknown,
    key: K,
  ): TSolidBranded<K, ISolidRegistry[K]> {
    /* prettier-ignore */
    const shape = this.requireShape(key, 'Coercion failed: Blueprint missing from Vault.');

    const castedData = produceCast(shape, data);

    if (markAsSolid<K, ISolidRegistry[K]>(castedData)) {
      return castedData;
    }

    throw new Error(
      `[xalor] Failed to brand coerced data layout container for key: ${key}`,
    );
  }
}
