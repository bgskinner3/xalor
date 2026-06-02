import type { IXalorAuditPayload, TXalorAuditNode } from '../../models/types';
import type { TTripleKV, TDeepWriteable } from '../../../shared/types';
import { fsContext } from '../../../shared/service';
import {
  ObjectUtils,
  isUndefined,
  isReferenceShape,
  isObjectShape,
  isKeyInObject,
  yieldItems,
} from '../../../shared';

/** @see {@link AuditServiceDocs.calculateCasStorageOptimizationLedger} */
class AuditSummaryService {
  private seedFreqMap(
    blueprintFreqMap: Record<string, number> = {},
    userVaultKeys: string[],
    vault: TTripleKV,
  ) {
    for (const keyToken of userVaultKeys) {
      if (isUndefined(keyToken)) continue;
      const rootHashPointer = vault.references[keyToken];
      if (isUndefined(rootHashPointer)) continue;

      blueprintFreqMap[rootHashPointer] =
        (blueprintFreqMap[rootHashPointer] ?? 0) + 1;
    }
  }
  private deepBluePrintCrawl(
    unqHashes: readonly string[],
    vault: TTripleKV,
    blueprintFreqMap: Record<string, number>,
  ): void {
    for (const hash of yieldItems(unqHashes)) {
      if (!isKeyInObject(hash)(vault.blueprints)) {
        continue;
      }

      const blueprintNode = vault.blueprints[hash];
      if (isObjectShape(blueprintNode)) {
        const propertyKeys = ObjectUtils.keys(blueprintNode.properties);

        // FIXED: Stream the actual property key string values instead of indices!
        for (const propKey of yieldItems(propertyKeys)) {
          const propertyContainer = blueprintNode.properties[propKey];
          const shapeNode = propertyContainer.shape;

          if (isReferenceShape(shapeNode)) {
            const innerReferenceHash = shapeNode.name;
            blueprintFreqMap[innerReferenceHash] =
              (blueprintFreqMap[innerReferenceHash] ?? 0) + 1;
          }
        }
      }
    }
  }

  private computeBlueprintPropVolume(
    blueprints: TTripleKV['blueprints'],
    blueprintFreqMap: Record<string, number>,
  ) {
    let unrolledPropVol = 0;
    let compactedPropVol = 0;

    for (const [hashKey, blueprintNode] of ObjectUtils.entries(blueprints)) {
      if (!isObjectShape(blueprintNode)) continue;

      const propertyCount = ObjectUtils.keys(blueprintNode.properties).length;

      compactedPropVol += propertyCount;
      unrolledPropVol += propertyCount * (blueprintFreqMap[hashKey] ?? 1);
    }

    return { unrolledPropVol, compactedPropVol };
  }
  private computeCompressionRatio(
    unrolledPropVol: number,
    compactedPropVol: number,
  ): number {
    if (unrolledPropVol === 0 || compactedPropVol >= unrolledPropVol) {
      return 0;
    }

    return 1 - compactedPropVol / unrolledPropVol;
  }
  private async getDatabaseDiskSize(): Promise<number> {
    try {
      const vaultPath = fsContext.envPaths.vaultFile;
      const stats = await fsContext.asyncFileStats(vaultPath);
      return stats.size;
    } catch (error) {
      // Check if the error is just a standard 'File Not Found' event
      const isMissing =
        error instanceof Error &&
        isKeyInObject('code')(error) &&
        error.code === 'ENOENT';

      if (!isMissing) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown disk exception';
        console.error(
          `❌ [Xalor Vault Error] Failed to retrieve database metrics: ${errorMsg}`,
        );
      }

      return 0; // High-resiliency safety fallback
    }
  }
  public async calculateCasStorageSavings(
    vault: TTripleKV,
    nodes: TXalorAuditNode[],
  ): Promise<TDeepWriteable<IXalorAuditPayload['summary']>> {
    const userVaultKeys = ObjectUtils.keys(vault.references);
    const unqHashes = ObjectUtils.keys(vault.blueprints);

    const blueprintFreqMap: Record<string, number> = {};

    //A. Seed the frequency tracker using top-level user registration keys
    this.seedFreqMap(blueprintFreqMap, userVaultKeys, vault);

    // B. DEEP GRAPH CRAWL: Sweep all blueprints
    // to uncover internal child references (like sh_1vwzxq9)!
    this.deepBluePrintCrawl(unqHashes, vault, blueprintFreqMap);

    // C.  MEASURE DE-COUPLED PROPERTY VOLUMES CHRONOLOGICALLY
    /* prettier-ignore */
    const { unrolledPropVol, compactedPropVol } = 
    this.computeBlueprintPropVolume(vault.blueprints, blueprintFreqMap)

    // D. CONVERT UNROLLED DELTAS  COMPACTION RATIO
    const casCompressionRatio = this.computeCompressionRatio(
      unrolledPropVol,
      compactedPropVol,
    );
    const totalDatabaseDiskBytes = await this.getDatabaseDiskSize();
    /* prettier-ignore */
    const highestGraphDepthRecorded= 
    nodes.reduce((max, node) => Math.max(max, node.metrics.depth), 0);

    return {
      totalRegisteredKeys: userVaultKeys.length,
      totalUniqueFingerprints: unqHashes.length,
      casCompressionRatio,
      totalDatabaseDiskBytes,
      highestGraphDepthRecorded,
      compileTimeOverheadMs: 0,
    };
  }
}

export const auditSummaryService = new AuditSummaryService();

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * TODO: DELETE WHEN FINISHED
 */

// private calculateCasStorageOptimizationLedger(
//   vault: TTripleKV,
// ): TDeepWriteable<IXalorAuditPayload['summary']> {
//   const userKeysArray = Object.keys(vault.references);
//   const uniqueHashesArray = Object.keys(vault.blueprints);

//   const totalRegisteredKeys = userKeysArray.length;
//   const totalUniqueFingerprints = uniqueHashesArray.length;

//   // ========================================================================
//   // 🪐 STEP 1: INITIALIZE FULL-GRAPH REUSE FREQUENCY MATRIX
//   // Counts how many times EVERY blueprint hash (parent or child) is used across the codebase.
//   // ========================================================================
//   const blueprintUsageFrequencyMap: Record<string, number> = {};

//   // A. Seed the frequency tracker using top-level user registration keys
//   for (let i = 0; i < totalRegisteredKeys; i++) {
//     const keyToken = userKeysArray[i];
//     if (keyToken === undefined) continue;

//     const rootHashPointer = vault.references[keyToken];
//     if (rootHashPointer === undefined) continue;

//     blueprintUsageFrequencyMap[rootHashPointer] =
//       (blueprintUsageFrequencyMap[rootHashPointer] ?? 0) + 1;
//   }

//   // B. 🟢 DEEP GRAPH CRAWL: Sweep all blueprints to uncover internal child references (like sh_1vwzxq9)!
//   for (let i = 0; i < totalUniqueFingerprints; i++) {
//     const hashKey = uniqueHashesArray[i];
//     if (hashKey === undefined) continue;

//     const blueprintNode = vault.blueprints[hashKey];
//     if (
//       blueprintNode !== undefined &&
//       blueprintNode.kind === 'object' &&
//       blueprintNode.properties
//     ) {
//       const propertyKeys = Object.keys(blueprintNode.properties);
//       const propLen = propertyKeys.length;

//       for (let j = 0; j < propLen; j++) {
//         const propKey = propertyKeys[j];
//         if (propKey === undefined) continue;

//         const propertyContainer = blueprintNode.properties[propKey];
//         if (propertyContainer === undefined) continue;

//         // Extract the underlying structural configuration node path
//         const shapeNode = propertyContainer.shape;

//         // 🪐 THE CRAWLER DISCOVERY GATEWAY: Catch deep content-addressed reference links!
//         if (
//           shapeNode !== undefined &&
//           shapeNode.kind === 'reference' &&
//           shapeNode.name
//         ) {
//           const innerReferenceHash = shapeNode.name;

//           // Increment the reuse counter for the nested child blueprint node
//           blueprintUsageFrequencyMap[innerReferenceHash] =
//             (blueprintUsageFrequencyMap[innerReferenceHash] ?? 0) + 1;
//         }
//       }
//     }
//   }

//   let totalUnrolledPropertiesVolume = 0;
//   let totalCompactedPropertiesVolume = 0;

//   // ========================================================================
//   // 🪐 STEP 2: MEASURE DE-COUPLED PROPERTY VOLUMES CHRONOLOGICALLY
//   // ========================================================================
//   for (let i = 0; i < totalUniqueFingerprints; i++) {
//     const hashKey = uniqueHashesArray[i];
//     if (hashKey === undefined) continue;

//     const blueprintNode = vault.blueprints[hashKey];
//     if (
//       blueprintNode !== undefined &&
//       blueprintNode.kind === 'object' &&
//       blueprintNode.properties
//     ) {
//       const basePropertyCount = Object.keys(blueprintNode.properties).length;

//       // Look up how many times this specific fingerprint node was shared across the full graph tree
//       const activeReferenceMultiplier =
//         blueprintUsageFrequencyMap[hashKey] ?? 1;

//       // 🟢 HYGIENE FIX: Unrolled volume scales the properties count by its deep graph reuse factor!
//       totalUnrolledPropertiesVolume +=
//         basePropertyCount * activeReferenceMultiplier;

//       // Compacted size remains lean—stored exactly once on disk
//       totalCompactedPropertiesVolume += basePropertyCount;
//     }
//   }

//   // ========================================================================
//   // 🪐 STEP 3: CONVERT UNROLLED DELTAS TO CONST COMPACTION RATIO
//   // ========================================================================
//   const casCompressionRatio =
//     totalUnrolledPropertiesVolume > totalCompactedPropertiesVolume &&
//     totalUnrolledPropertiesVolume > 0
//       ? Math.max(
//           0,
//           Math.min(
//             1,
//             1 -
//               totalCompactedPropertiesVolume / totalUnrolledPropertiesVolume,
//           ),
//         )
//       : 0;

//   let totalDatabaseDiskBytes = 0;
//   try {
//     if (fs.existsSync(this.paths.vaultFile)) {
//       totalDatabaseDiskBytes = fs.statSync(this.paths.vaultFile).size;
//     }
//   } catch {
//     // Suppress disk faults safely
//   }

//   const highestGraphDepthRecorded = 0;

//   return {
//     totalRegisteredKeys,
//     totalUniqueFingerprints,
//     casCompressionRatio,
//     totalDatabaseDiskBytes,
//     highestGraphDepthRecorded,
//     compileTimeOverheadMs: 0,
//   };
// }
