import { ensureGlobalVault } from '../utils';
import type {
  TSolidMetadata,
  TSolidVaultMap,
  TSolidShape,
  TStrictSolidMetaData,
  TVaultRegistryEntry,
  TVaultManifestEntry,
  TVaultDriftEntry,
  TTripleKV,
} from '../../shared';
import { preRegisterMetadata } from '../utils';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';

/**
 * XALETHOR VAULT KEEPER
 *
 * ROLE:
 * The central "Librarian" of the Triple-KV system. It owns the raw Map
 * operations in RAM and manages the reification of shredded metadata.
 *
 * WHAT GOES HERE:
 * - Direct interaction with 'globalThis.__SOLID_VAULT__'.
 * - Metadata reconstruction (Stitching blueprints, manifest, and registry).
 * - High-performance 'peek' and 'resolve' methods.
 *
 * WHAT DOES NOT GO HERE:
 * - NO Validation logic (Bouncers don't live in the library).
 * - NO Disk I/O (Librarians don't build the building).
 * - NO Error formatting or panic logic.
 */
class XalethorVaultKeeper {
  private solidVersion = IS_SOLID_CONFIG_ITEMS.solidVersion;
  public get vault(): TSolidVaultMap {
    return ensureGlobalVault();
  }
  public get globalBlueprintList() {
    return this.vault.blueprints;
  }
  /**
   * Replaces 'Registry.registerShape'. ****
   */
  public solidify(rawMetadata: TSolidMetadata): void {
    const metadata = preRegisterMetadata(rawMetadata);

    /* prettier-ignore */
    const { key, reference, shape, area, filePath, symbolName, typeName, anchor } =
      metadata;

    if (this.vault.blueprints.has(key)) {
      /* prettier-ignore */ console.log( `[xalor] 🔄 Updating logic for: ${key}`, { service: 'vault-keeper.ts/Updating', override: true, type: 'warn' });
    }
    this.vault.blueprints.set(reference, shape);
    this.vault.references.set(key, reference);
    this.vault.manifest?.set(key, { area, filePath, anchor });
    this.vault.registry?.set(key, { symbolName, typeName });
  }
  public solidifyDrifts(driftTracking: TTripleKV['driftTracking']) {
    if (!driftTracking) return;

    for (const [evolutionTokenKey, driftEntry] of Object.entries(
      driftTracking,
    )) {
      if (!driftEntry) continue;

      // Hydrate the in-memory Storage Map node instance directly with the compiled descriptor records
      this.vault.driftTracking.set(evolutionTokenKey, {
        currentKey: driftEntry.currentKey,
        ancestorKey: driftEntry.ancestorKey,
      });
    }
  }
  /**
   * RETRIEVAL: Reconstructs the ghost-identity for the public API
   */
  public resolve(key: string): TStrictSolidMetaData | undefined {
    const shape = this.vault.blueprints.get(key);
    if (!shape) return undefined; // No shape means the type doesn't exist at all
    const manifest = this.vault.manifest?.get(key);
    const registry = this.vault.registry?.get(key);

    return {
      key,
      reference: key,
      shape,
      area: manifest?.area ?? 'unknown:0:0',
      anchor: manifest?.anchor ?? '',
      filePath: manifest?.filePath ?? 'unknown_file.ts',
      symbolName:
        registry?.symbolName ??
        `T${key.charAt(0) + key.slice(1).toLowerCase()}`,
      typeName: registry?.typeName ?? '{ ... }',
      version: this.solidVersion,
    };
  }

  /**
   * 🔍 vaultArchive
   *
   * A polymorphic gateway to the Triple-KV Vault.
   * It maps the variant request to the specific internal Map.
   */

  /* prettier-ignore */ public  peek( variant: 'driftTracking', key: string): TVaultDriftEntry | undefined;
  /* prettier-ignore */ public  peek( variant: 'registry', key: string,): TVaultRegistryEntry | undefined;
  /* prettier-ignore */ public  peek( variant: 'manifest', key: string,): TVaultManifestEntry | undefined;
  /* prettier-ignore */ public  peek( variant: 'blueprint', key: string): TSolidShape | undefined;
  /* prettier-ignore */ public  peek( variant: 'referenceKey', key: string): string | undefined;
  /* prettier-ignore */
  public peek(
    variant: 'blueprint' | 'manifest' | 'registry' | 'driftTracking' | 'referenceKey',
    key: string,
  ): TSolidShape | TVaultManifestEntry | TVaultRegistryEntry | TVaultDriftEntry | string | undefined {
    const injectedKey = this.vault.references.get(key);
    if (variant === 'referenceKey') return injectedKey
    if ( variant === 'blueprint') {
    if (!injectedKey) return undefined;
    if (variant === 'blueprint') return this.vault.blueprints.get(injectedKey);
    }

    if (variant === 'driftTracking') return this.vault.driftTracking.get(key);
    if (variant === 'manifest') return this.vault.manifest?.get(key);
    if (variant === 'registry') return this.vault.registry?.get(key);

    return undefined;
  }
}

export const xalethorVaultKeeper = new XalethorVaultKeeper();
