// transformer/utils/vault-serializer.ts

import * as fs from 'fs';
import * as path from 'path';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared/constants';
import {
  extractAndNormalizeShape,
  isReferenceShape,
  logDev,
} from '../../shared';
import type { TVaultSyncPayload, TTripleKV } from '../../shared/types';
import { XalorRoutesService } from '../service';

function buildSnapshotFromRegistry(
  rootDir: string,
  registry: Map<string, TVaultSyncPayload>,
): TTripleKV {
  const snapshot: TTripleKV = {
    blueprints: {},
    references: {},
    manifest: {},
    registry: {},
    version: IS_SOLID_CONFIG_ITEMS.solidVersion,
  } satisfies TTripleKV;

  registry.forEach((meta, key) => {
    /* prettier-ignore */ const { shape, area, anchor,  symbolName, typeName } = meta;
    /* prettier-ignore */ const filePath = path.relative(rootDir, meta.filePath).split(path.sep).join('/')

    /* prettier-ignore */ const pointerReference = extractAndNormalizeShape(shape, snapshot.blueprints);
    /* prettier-ignore */ const reference = isReferenceShape(pointerReference) ? pointerReference.name  : key;

    snapshot.references[key] = reference;

    snapshot.manifest[key] = { area, filePath, anchor };

    snapshot.registry[key] = { symbolName, typeName };
  });

  return snapshot;
}
/**
 * THE ATOMIC CHANGE SHIELD
 * Compares incoming bytes against current disk storage to intercept redundant mutations.
 * TODO: MOVE TO UTILS SMALL
 */
function shouldWritePayload(
  targetVaultFile: string,
  newJsonString: string,
): boolean {
  if (!fs.existsSync(targetVaultFile)) {
    return true; // File does not exist, mutation is mandatory
  }

  const existingDiskBytes = fs.readFileSync(targetVaultFile, 'utf8');
  return existingDiskBytes !== newJsonString;
}

/**
 * 📦 PURE VAULT SNAPSHOT SERIALIZER
 *
 * ROLE:
 * Master orchestration block coordinating the final memory-to-disk cache serialization.
 */
export function serializeAndFlushVault(
  rootDir: string,
  registry: Map<string, TVaultSyncPayload>,
): void {
  const paths = XalorRoutesService.resolveXalorPaths(rootDir);
  const snapshot = buildSnapshotFromRegistry(rootDir, registry);
  const newJsonPayload = JSON.stringify(snapshot, null, 2);

  try {
    if (!fs.existsSync(paths.cacheDir))
      fs.mkdirSync(paths.cacheDir, { recursive: true });

    // Shield the filesystem from unnecessary background write operations
    if (!shouldWritePayload(paths.vaultFile, newJsonPayload)) return;

    // Single Authoritative Write Pass
    fs.writeFileSync(paths.vaultFile, newJsonPayload, 'utf-8');

    /* prettier-ignore */ logDev(`[xalor:stage-4] 🏁 Persistence Complete. Bunker sealed at: ${paths.cacheDir}`,{ service: 'vault-archive.ts-persist' });
    /* prettier-ignore */ logDev(`[xalor:stage-4] 🧬 Shredded & Saved: [${Array.from(registry.keys()).join(', ')}]`,{ service: 'vault-archive.ts-persist' });
  } catch (error) {
    const structuralErrorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected underlying filesystem lock or restriction occurred.';

    logDev(
      `[xalor-persist] Failed to solidify cache: ${structuralErrorMessage}`,
      {
        type: 'error',
        service: 'vault-archive.ts-persist',
        override: true,
      },
    );
  }
}
