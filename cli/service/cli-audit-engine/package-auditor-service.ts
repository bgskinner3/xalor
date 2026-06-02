import type { TAuditSizeMetrics, IXalorAuditPayload } from '../../models';
import { createDefaultAuditTemplate } from '../../utils';
import {
  isIgnoreDirKey,
  isUndefined,
  isArray,
  isPackageManifest,
  isString,
  isNull,
} from '../../../shared/utils/guards';
import { fsContext, yieldItems, IS_SOLID_CONFIG_ITEMS } from '../../../shared';
import type { TTripleKV } from '../../../shared/types';
const mandatoryImplicitFiles = [
  'README.md',
  'README',
  'LICENSE',
  'LICENCE',
  'CHANGELOG.md',
  'package.json',
];
class PackageLifecycleAuditor {
  private searchFileNames = fsContext.searchFileNames;

  private computeTargetWeight(absoluteTargetRoute: string): number {
    const stats = fsContext.fileStats(absoluteTargetRoute);

    if (!stats || !stats.isDirectory()) return 0;
    if (stats.isFile()) return stats.size;

    let cumulativeBytes = 0;
    const directoryStack: string[] = [absoluteTargetRoute];

    // COMMANDMENT VIII ALIGNMENT: Strict Finite Operational Boundary.
    // Explicitly caps total file chunks processed per package tier to neutralize zombie loops.
    const MAXIMUM_SAFE_FILE_LIMIT = 50000;

    for (let iteration = 0; iteration < MAXIMUM_SAFE_FILE_LIMIT; iteration++) {
      if (directoryStack.length === 0) break;

      const currentPath = directoryStack.pop();
      if (isUndefined(currentPath)) continue;

      try {
        const currentDirName = fsContext.getFileName(currentPath);
        // High-performance exclusion bypass
        if (isIgnoreDirKey(currentDirName)) continue;

        const activeEntries = fsContext.readDir(currentPath);

        // Leverage your yieldItems generator to stream the entries lazily with zero overhead
        for (const entryEntity of yieldItems(activeEntries)) {
          /* prettier-ignore */
          const fullNestedPath = fsContext.resolvePath(currentPath, entryEntity.name);

          if (entryEntity.isDirectory()) {
            if (!isIgnoreDirKey(entryEntity.name)) {
              directoryStack.push(fullNestedPath); // Defer subfolder processing safely
            }
          } else if (entryEntity.isFile()) {
            cumulativeBytes += fsContext.fileStats(fullNestedPath).size;
          }
        }
      } catch {
        continue; // Safely absorb runtime OS file lockouts or temporary thread interruptions
      }
    }

    return cumulativeBytes;
  }

  private whitelistSetUp(
    filesWhitelistArray: readonly unknown[] | undefined,
    targetSearchPaths: Set<string>,
  ): void {
    const projectRoot = fsContext.getProjectRoot();

    if (isArray(filesWhitelistArray)) {
      for (const pathTokenName of yieldItems(filesWhitelistArray)) {
        if (isString(pathTokenName)) {
          const absolutePath = fsContext.resolvePath(
            projectRoot,
            pathTokenName,
          );
          targetSearchPaths.add(absolutePath);
        }
      }
    } else {
      const registryFallbacks =
        IS_SOLID_CONFIG_ITEMS.buildLayer.fallbackIncludePatterns;

      for (const fallbackPattern of yieldItems(registryFallbacks)) {
        const segmentWithoutDoubleGlob = fallbackPattern.split('**')[0];
        const cleanFolderSegment = segmentWithoutDoubleGlob.split('*')[0];

        const fullFallbackPath = fsContext.resolvePath(
          projectRoot,
          cleanFolderSegment,
        );

        if (fsContext.fileExists(fullFallbackPath)) {
          targetSearchPaths.add(fullFallbackPath);
        }
      }
    }

    const tsupOutputDir = IS_SOLID_CONFIG_ITEMS.buildLayer.defaultOutputTarget;
    const absoluteTsupPath = fsContext.resolvePath(projectRoot, tsupOutputDir);

    if (fsContext.fileExists(absoluteTsupPath)) {
      targetSearchPaths.add(absoluteTsupPath);
    }
  }
  // private npmPackageInclusions() {
  //   let verifiedBundleBytes: number = 0;
  //   for (const implicitName of yieldItems(mandatoryImplicitFiles)) {
  //     const implicitFilePath = fsContext.resolvePath(implicitName);
  //     const stats = fsContext.fileStats(implicitFilePath);
  //     if (stats.isFile()) {
  //       verifiedBundleBytes += stats.size;
  //     }
  //   }
  //   return verifiedBundleBytes;
  // }
  private npmPackageInclusions(): number {
    let verifiedBundleBytes = 0;
    const projectRoot = fsContext.getProjectRoot();

    for (const implicitName of yieldItems(mandatoryImplicitFiles)) {
      const implicitFilePath = fsContext.resolvePath(projectRoot, implicitName);

      if (fsContext.fileExists(implicitFilePath)) {
        const stats = fsContext.fileStats(implicitFilePath);

        if (stats && stats.isFile()) {
          verifiedBundleBytes += stats.size;
        }
      }
    }

    return verifiedBundleBytes;
  }
  private dirWeightAccumulation(targetSearchPaths: Set<string>): number {
    let verifiedBundleBytes = 0;
    const projectRoot = fsContext.getProjectRoot();

    for (const targetRoute of targetSearchPaths) {
      if (targetRoute === projectRoot) {
        const baseEntries = fsContext.readDir(projectRoot);

        for (const ent of yieldItems(baseEntries)) {
          // 🟢 FIX: Pin the relative item name back onto the project root directory boundary path
          const fullEntPath = fsContext.resolvePath(projectRoot, ent.name);

          if (
            mandatoryImplicitFiles.includes(ent.name) ||
            isIgnoreDirKey(ent.name)
          ) {
            continue;
          }

          verifiedBundleBytes += this.computeTargetWeight(fullEntPath);
        }
      } else {
        verifiedBundleBytes += this.computeTargetWeight(targetRoute);
      }
    }

    return verifiedBundleBytes;
  }

  private extractExpectedPackageWeights(): TAuditSizeMetrics {
    const auditSizeMetrics = createDefaultAuditTemplate('packageMetrics');

    /* prettier-ignore */
    const packageJsonPath = fsContext.resolvePath(this.searchFileNames.packageJson);

    if (!fsContext.fileExists(packageJsonPath)) {
      return auditSizeMetrics;
    }

    let verifiedBundleBytes: number = 0;
    let prodDepCount: number = 0;

    try {
      const rawManifestContent = fsContext.readText(packageJsonPath);

      const parsedManifestObj = JSON.parse(rawManifestContent);
      if (!isPackageManifest(parsedManifestObj)) {
        return auditSizeMetrics;
      }

      const filesWhitelistArray = parsedManifestObj.files;
      const targetSearchPaths = new Set<string>();

      // A. REGISTRY-DRIVEN WHITELIST DISTRIBUTION CAPTURE
      this.whitelistSetUp(filesWhitelistArray, targetSearchPaths);

      // B: MANDATORY IMPLICIT NPM INCLUSIONS
      const implicitBytes = this.npmPackageInclusions(); // Fixed method typo name resolution
      verifiedBundleBytes += implicitBytes;

      // C: BOUNDED DIRECTORY WEIGHT ACCUMULATION LOOP
      const dynamicDirBytes = this.dirWeightAccumulation(targetSearchPaths);
      verifiedBundleBytes += dynamicDirBytes;

      const dependenciesBlock = parsedManifestObj.dependencies;
      if (dependenciesBlock !== undefined) {
        prodDepCount = Object.keys(dependenciesBlock).length;
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Unknown evaluation token crash';
      console.log(
        `\x1b[31m[xalor:debug] 🔥 Execution Thread Exploded! Catch blocker triggered: ${errorMsg}\x1b[0m`,
      );
      if (error instanceof Error && error.stack) {
        console.log(`\x1b[31m${error.stack}\x1b[0m`);
      }
      return auditSizeMetrics;
    }

    const projectedDependencyOverheadBytes = prodDepCount * 460800;

    // Fixed assignments mapping allocation parameters properly
    auditSizeMetrics.bundleSizeBytes = verifiedBundleBytes;
    auditSizeMetrics.estimatedInstallFootprintBytes =
      verifiedBundleBytes + projectedDependencyOverheadBytes;
    auditSizeMetrics.productionDependenciesCount = prodDepCount;
    auditSizeMetrics.isMissingManifest = false;

    return auditSizeMetrics;
  }
  public computeLifecycleFootprintDeltas(
    vault: TTripleKV,
  ): IXalorAuditPayload['lifecycleFootprint'] {
    const vaultFile = fsContext.envPaths.vaultFile;
    const { blueprints, references, version } = vault;

    let developmentCacheBytes: number | null = null;

    if (fsContext.fileExists(vaultFile)) {
      const stats = fsContext.fileStats(vaultFile);
      if (stats) {
        developmentCacheBytes = stats.size;
      }
    }
    if (isNull(developmentCacheBytes)) {
      developmentCacheBytes = Buffer.byteLength(JSON.stringify(vault), 'utf-8');
    }
    const productionEstimatedBytes = Buffer.byteLength(
      JSON.stringify({ blueprints, references, version }),
      'utf-8',
    );
    /* prettier-ignore */
    const netBytesEvaporated = Math.max( 0, developmentCacheBytes - productionEstimatedBytes );
    /* prettier-ignore */
    const evaporationEfficiencyRatio = developmentCacheBytes > 0 ? netBytesEvaporated / developmentCacheBytes : 0;

    const livePackageMetrics = this.extractExpectedPackageWeights();

    return {
      developmentCacheBytes,
      productionEstimatedBytes,
      netBytesEvaporated,
      evaporationEfficiencyRatio,
      physicalPackageMetrics: livePackageMetrics,
    };
  }
}

export const packageAuditorService = new PackageLifecycleAuditor();
// import type { IXalorAuditPayload } from '../../models/types';
// import type { TTripleKV } from '../../../shared/types';
// import { AuditSizeMetricsService } from './AuditSizeMetricsService';
// import { AuditSummaryService } from './AuditSummaryService';

// export class XalorAuditTelemetryController {
//   private readonly summaryService = new AuditSummaryService();

//   /**
//    * COMMANDMENT IV & VII: Orchestration Controller.
//    * Pulls data from isolated semantic services with zero allocation bleeding.
//    */
//   public async executeCompleteEngineAudit(
//     vault: TTripleKV,
//   ): Promise<IXalorAuditPayload> {

//     // 1. Gather outward-facing physical package metrics from the disk
//     const packageMetrics = AuditSizeMetricsService.extractExpectedPackageWeights();

//     // 2. Gather inward-facing logical graph metrics from the memory database
//     const graphSummary = await this.summaryService.calculateCasStorageSavings(vault);

//     // 3. Combine them natively into the final contract shape with zero 'as' casting hacks
//     return {
//       summary: graphSummary,
//       package: packageMetrics,
//     };
//   }
// }
// private formatBytes(bytes: number): string {
//   if (bytes === 0) return '0.00 B';

//   const KILOBYTE_FACTOR = 1024;
//   const sizeSizes = ['B', 'KB', 'MB', 'GB'];

//   // Determine the base-1024 exponent layer natively
//   const exponentIndex = Math.floor(
//     Math.log(bytes) / Math.log(KILOBYTE_FACTOR),
//   );
//   const calculatedValue = bytes / Math.pow(KILOBYTE_FACTOR, exponentIndex);

//   return `${calculatedValue.toFixed(2)} ${sizeSizes[exponentIndex]}`;
// }
// // ================================================================================
// // ================================================================================
// // ================================================================================
// // COMPUTE LIFECYCLE FOOTPRINT DELTAS
// // ================================================================================
// // ================================================================================
// // ================================================================================
// protected memoryDetails(): void {}
// /** @see {@link AuditServiceDocs.computeLifecycleFootprintDeltas} */
// private computeLifecycleFootprintDeltas(
//   vault: TTripleKV,
// ): IXalorAuditPayload['lifecycleFootprint'] {
//   const auditSizeMetrics = createDefaultAuditTemplate('packageMetrics');
//   const { blueprints, references, version } = vault;

//   let developmentCacheBytes: number | null = null;

//   if (fs.existsSync(this.paths.vaultFile)) {
//     try {
//       developmentCacheBytes = fs.statSync(this.paths.vaultFile).size;
//     } catch {
//       // TODO: add our Error handler logger
//       developmentCacheBytes = null;
//     }
//   }
//   if (isNull(developmentCacheBytes)) {
//     developmentCacheBytes = Buffer.byteLength(JSON.stringify(vault), 'utf-8');
//   }
//   const productionEstimatedBytes = Buffer.byteLength(
//     JSON.stringify({ blueprints, references, version }),
//     'utf-8',
//   );
//   /* prettier-ignore */
//   const netBytesEvaporated = Math.max( 0, developmentCacheBytes - productionEstimatedBytes );
//   /* prettier-ignore */
//   const evaporationEfficiencyRatio = developmentCacheBytes > 0 ? netBytesEvaporated / developmentCacheBytes : 0;

//   return {
//     developmentCacheBytes,
//     productionEstimatedBytes,
//     netBytesEvaporated,
//     evaporationEfficiencyRatio,
//     physicalPackageMetrics: auditSizeMetrics,
//   };
// }
