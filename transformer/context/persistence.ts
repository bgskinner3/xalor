// transformer/context/persistence.ts
import * as fs from 'fs';
import * as path from 'path';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared/constants';
import { isReferenceShape, logDev, computeStringHash } from '../../shared';
import type {
  TVaultSyncPayload,
  TTripleKV,
  TSolidShape,
} from '../../shared/types';
import { extractAndNormalizeShape } from '../utils';
import { XalorRoutesService, xalorCentralContext } from '../service';
import { TransformerReportService } from '../error';

/**
 * RECONSTRUCT ARCHIVE SNAPSHOT (The Snapshot Master Builder)
 *
 * ROLE:
 * Master orchestration block coordinating the final memory-to-disk cache serialization.
 * It translates long-lived volatile in-memory registry vectors into a rigid, portable,
 * normalized JSON data layout (`TTripleKV`) to write a canonical ledger file.
 *
 * STRATEGY:
 * Sweeps through your live process state ledger maps and converts raw layout schemas
 * into content-addressed references. For simple interfaces, it extracts nested parts natively.
 * For unrolled complex generic models or distributive unions, it passes shapes to an isolated
 * interning engine to build deterministic `sh_` hash pointers. It standardizes multi-OS file
 * markers to forward slashes and formats clean, coordinate metadata mappings point-free,
 * switchlessly neutralizing loop churn and data leakages.
 *
 * WHY:
 * Satisfies Commandment III (Runtime Consumption Rule) and Commandment V (Graph Integrity).
 * It strips all complex compiler abstractions away, exporting your type graph down to a dead-flat
 * dictionary layout. This allows the lightweight runtime validation engine to execute ultra-fast
 * single-pass linear verification routines with absolute zero computational overhead.
 */
export function buildSnapshotFromRegistry(
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
    const { shape, area, anchor, symbolName, typeName } = meta;
    const filePath = path
      .relative(rootDir, meta.filePath)
      .split(path.sep)
      .join('/');

    const pointerReference = extractAndNormalizeShape(
      shape,
      snapshot.blueprints,
    );

    const targetReferenceString = isReferenceShape(pointerReference)
      ? pointerReference.name
      : internAndRegisterShape(shape, snapshot.blueprints);

    snapshot.references[key] = targetReferenceString;
    snapshot.manifest[key] = { area, filePath, anchor };
    snapshot.registry[key] = { symbolName, typeName };
  });

  return snapshot;
}
/**
 * internAndRegisterShape
 * THE BLUCPRINT INTERNING MACHINE
 *
 * ROLE:
 * Generates a deterministic content-addressed identifier token for a raw
 * structural shape layout and caches it securely in the blueprints collection vault.
 *
 * WHY:
 * Satisfies Commandment VIII (Internal Efficiency). By operating as a pure,
 * stateless function, it eliminates the heap closure allocation costs of inline
 * IIFEs during intensive development watch-mode compilation passes.
 */
export function internAndRegisterShape(
  shape: TSolidShape,
  blueprints: Record<string, TSolidShape>,
): string {
  const serializedString = JSON.stringify(shape);

  const uniqueStructuralHash = computeStringHash(serializedString);

  blueprints[uniqueStructuralHash] = shape;

  return uniqueStructuralHash;
}

/**
 * THE ATOMIC CHANGE SHIELD
 * Compares incoming bytes against current disk storage to intercept redundant mutations.
 */
function shouldWritePayload(
  targetVaultFile: string,
  newJsonString: string,
): boolean {
  if (!fs.existsSync(targetVaultFile)) {
    return true; // File does not exist, mutation is mandatory
  }

  const existingDiskBytes = fs.readFileSync(targetVaultFile, 'utf8');
  return existingDiskBytes !== newJsonString; // Only authorize write if strings differ
}
/**
 * PURE VAULT SNAPSHOT SERIALIZER
 *
 * ROLE:
 * Master orchestration block coordinating the final memory-to-disk cache serialization.
 */
export async function serializeAndFlushVault(rootDir: string): Promise<void> {
  const { globalKeyRegistry } = xalorCentralContext.context;
  const paths = XalorRoutesService.resolveXalorPaths(rootDir);

  const snapshot = buildSnapshotFromRegistry(rootDir, globalKeyRegistry);
  const newJsonPayload = JSON.stringify(snapshot, null, 2);

  try {
    if (!fs.existsSync(paths.cacheDir)) {
      fs.mkdirSync(paths.cacheDir, { recursive: true });
    }

    if (!shouldWritePayload(paths.vaultFile, newJsonPayload)) return;

    await fs.promises.writeFile(paths.vaultFile, newJsonPayload, 'utf-8');

    logDev(
      `[xalor:cache-shield] 🏁 Storage sealed asynchronously at: ${paths.cacheDir}`,
      {
        service: 'vault-archive.ts-persist',
      },
    );
  } catch (error: unknown) {
    const mode = XalorRoutesService.xalorCLIMode();
    TransformerReportService.logAnomaly({
      keyName: 'VAULT_FLUSH_IO_FAULT',
      fileLocation: paths.vaultFile,
      error,
      mode: mode,
    });
  }
}
