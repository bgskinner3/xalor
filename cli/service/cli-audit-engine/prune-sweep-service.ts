import type { IXalorAuditPayload } from '../../models/types';
import type { TTripleKV, TSolidShape } from '../../../shared/types';
import { fsContext } from '../../../shared/service';
import { REFERENCE_COLLECTOR_MAPPER } from '../../models/constants';
import { ObjectUtils, isReferenceShape, yieldItems } from '../../../shared';

class PruneSweepService {
  private recursiveReferenceTracerPipeline(
    shape: TSolidShape,
    blueprints: TTripleKV['blueprints'],
    activeHashesInUse: Set<string>,
  ): void {
    if (!shape) return;

    if (isReferenceShape(shape)) {
      const targetHash = shape.name;
      if (!activeHashesInUse.has(targetHash)) {
        activeHashesInUse.add(targetHash);
        const referencedShape = blueprints[targetHash];
        if (referencedShape) {
          /* prettier-ignore */
          this.recursiveReferenceTracerPipeline(referencedShape, blueprints, activeHashesInUse);
        }
      }
      return;
    }

    const executeDistributedCollector = <K extends TSolidShape['kind']>(
      targetKind: K,
      targetShape: Extract<TSolidShape, { kind: K }>,
    ): void => {
      const handler = REFERENCE_COLLECTOR_MAPPER[targetKind];
      if (handler) {
        handler(targetShape, activeHashesInUse, (child: TSolidShape) =>
          this.recursiveReferenceTracerPipeline(
            child,
            blueprints,
            activeHashesInUse,
          ),
        );
      }
    };

    // Dispatch point-free with complete static safety, zero errors, and zero casting overrides
    executeDistributedCollector(shape.kind, shape);
  }

  private removeOrphanedReferences(
    vault: TTripleKV,
    orphanedKeys: readonly string[],
  ) {
    for (const key of yieldItems(orphanedKeys)) {
      delete vault.references[key];
      delete vault.manifest[key];
      delete vault.registry[key];
    }
  }

  private resolveActiveHashes(vault: TTripleKV): Set<string> {
    const activeHashes = new Set<string>();
    const remainingKeys = ObjectUtils.keys(vault.references);

    for (const key of yieldItems(remainingKeys)) {
      const hash = vault.references[key];
      if (hash) activeHashes.add(hash);
    }

    return activeHashes;
  }

  private traceBlueprintGraph(vault: TTripleKV, activeHashes: Set<string>) {
    const blueprintKeys = ObjectUtils.keys(vault.blueprints);

    for (const key of yieldItems(blueprintKeys)) {
      if (activeHashes.has(key)) {
        const shape = vault.blueprints[key];
        if (shape) {
          this.recursiveReferenceTracerPipeline(
            shape,
            vault.blueprints,
            activeHashes,
          );
        }
      }
    }
  }

  private purgeUnreferencedBlueprints(
    vault: TTripleKV,
    activeHashes: Set<string>,
  ): void {
    const blueprintKeys = ObjectUtils.keys(vault.blueprints);
    for (const key of yieldItems(blueprintKeys)) {
      if (!activeHashes.has(key)) {
        delete vault.blueprints[key];
      }
    }
  }

  /** @see {@link AuditServiceDocs.executeSelfHealingPruneSweep} */
  public async executeSelfHealingPruneSweep(
    vault: TTripleKV,
    telemetryData: IXalorAuditPayload['telemetry'],
  ): Promise<void> {
    // console.log(telemetryData);
    if (telemetryData.orphanedKeys.length === 0) return;

    // Pipeline Sub-Routines Step-by-Step execution pass
    this.removeOrphanedReferences(vault, telemetryData.orphanedKeys);

    const activeHashes = this.resolveActiveHashes(vault);
    this.traceBlueprintGraph(vault, activeHashes);

    // SECURE FIX: Safely evict the orphaned shapes from the blueprints map before writing to disk
    this.purgeUnreferencedBlueprints(vault, activeHashes);

    try {
      /* prettier-ignore */
      const optimizedJsonString = JSON.stringify(vault, null, 2);
      const vaultFile = fsContext.envPaths.vaultFile;
      /* prettier-ignore */
      await fsContext.asyncWrite(vaultFile, optimizedJsonString);

      // TODO: add our Error handler logger
      console.log(
        `\n🧼 [Xalor Self-Healing]: Successfully evicted ${telemetryData.orphanedKeys.length} orphaned keys.`,
      );
      console.log(`💾 Cache files synchronized and optimized cleanly.\n`);
    } catch (error) {
      // TODO: add our Error handler logger
      const details =
        error instanceof Error
          ? error.message
          : 'Filesystem write barrier violation.';
      console.error(
        `❌ [Xalor Self-Healing Error]: Failed to save optimized snapshot to disk: ${details}`,
      );
    }
  }
}

export const pruneSweepService = new PruneSweepService();
// protected selfHealingPrune(): void {}
// private removeOrphanedReferences(
//   vault: TTripleKV,
//   orphanedKeys: readonly string[],
// ) {
//   for (const key of yieldItems(orphanedKeys)) {
//     delete vault.references[key];
//     delete vault.manifest[key];
//     delete vault.registry[key];
//   }
// }

// private resolveActiveHashes(vault: TTripleKV): Set<string> {
//   const activeHashes = new Set<string>();
//   const remainingKeys = ObjectUtils.keys(vault.references);

//   for (const key of yieldItems(remainingKeys)) {
//     const hash = vault.references[key];
//     if (hash) activeHashes.add(hash);
//   }

//   return activeHashes;
// }

// private traceBlueprintGraph(vault: TTripleKV, activeHashes: Set<string>) {
//   const blueprintKeys = ObjectUtils.keys(vault.blueprints);

//   for (const key of yieldItems(blueprintKeys)) {
//     if (activeHashes.has(key)) {
//       const shape = vault.blueprints[key];
//       if (shape) {
//         recursiveReferenceTracerPipeline(
//           shape,
//           vault.blueprints,
//           activeHashes,
//         );
//       }
//     }
//   }
// }

// private purgeUnreferencedBlueprints(
//   vault: TTripleKV,
//   activeHashes: Set<string>,
// ): void {
//   const blueprintKeys = ObjectUtils.keys(vault.blueprints);
//   for (const key of yieldItems(blueprintKeys)) {
//     if (!activeHashes.has(key)) {
//       delete vault.blueprints[key];
//     }
//   }
// }

// /** @see {@link AuditServiceDocs.executeSelfHealingPruneSweep} */
// private async executeSelfHealingPruneSweep(vault: TTripleKV): Promise<void> {
//   // const telemetryDataOriginal =
//   //   await this.profileRuntimeFootprintAndOrphans(vault);

//   const telemetryData =
//     await telemetryService.profileRuntimeFootprintAndOrphans(
//       vault,
//       this.projectRoot,
//     );
//   // console.log(telemetryData);
//   if (telemetryData.orphanedKeys.length === 0) return;

//   // Pipeline Sub-Routines Step-by-Step execution pass
//   this.removeOrphanedReferences(vault, telemetryData.orphanedKeys);

//   const activeHashes = this.resolveActiveHashes(vault);
//   this.traceBlueprintGraph(vault, activeHashes);

//   // SECURE FIX: Safely evict the orphaned shapes from the blueprints map before writing to disk
//   this.purgeUnreferencedBlueprints(vault, activeHashes);

//   try {
//     /* prettier-ignore */
//     const optimizedJsonString = JSON.stringify(vault, null, 2);
//     /* prettier-ignore */
//     await fs.promises.writeFile(this.paths.vaultFile, optimizedJsonString, 'utf-8');

//     // TODO: add our Error handler logger
//     console.log(
//       `\n🧼 [Xalor Self-Healing]: Successfully evicted ${telemetryData.orphanedKeys.length} orphaned keys.`,
//     );
//     console.log(`💾 Cache files synchronized and optimized cleanly.\n`);
//   } catch (error) {
//     // TODO: add our Error handler logger
//     const details =
//       error instanceof Error
//         ? error.message
//         : 'Filesystem write barrier violation.';
//     console.error(
//       `❌ [Xalor Self-Healing Error]: Failed to save optimized snapshot to disk: ${details}`,
//     );
//   }
// }
