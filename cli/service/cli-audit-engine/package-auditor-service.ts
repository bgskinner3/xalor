import type { TAuditSizeMetrics } from '../../models';
import { createDefaultAuditTemplate } from '../../utils';
import {
  isIgnoreDirKey,
  isUndefined,
  isArray,
  isPackageManifest,
  isString,
} from '../../../shared/utils/guards';
import { fsContext, yieldItems, IS_SOLID_CONFIG_ITEMS } from '../../../shared';

const mandatoryImplicitFiles = [
  'README.md',
  'README',
  'LICENSE',
  'LICENCE',
  'CHANGELOG.md',
  'package.json',
];
class PackageAuditorService {
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
  // private dirWeightAccumulation(targetSearchPaths: Set<string>): number {
  //   let verifiedBundleBytes: number = 0;
  //   const projectRoot = fsContext.projectRoot;
  //   for (const targetRoute of targetSearchPaths) {
  //     if (targetRoute === projectRoot) {
  //       const baseEntries = fsContext.readDir(projectRoot);

  //       for (const ent of yieldItems(baseEntries)) {
  //         const fullEntPath = fsContext.resolvePath(ent.name);

  //         if (
  //           mandatoryImplicitFiles.includes(ent.name) ||
  //           isIgnoreDirKey(ent.name)
  //         ) {
  //           continue;
  //         }

  //         verifiedBundleBytes += this.computeTargetWeight(fullEntPath);
  //       }
  //     } else {
  //       verifiedBundleBytes += this.computeTargetWeight(targetRoute);
  //     }
  //   }

  //   return verifiedBundleBytes;
  // }
  // public verifyBuildSync(): boolean {
  //   const projectRoot = fsContext.getProjectRoot();
  //   const tsupOutputDir = IS_SOLID_CONFIG_ITEMS.buildLayer.defaultOutputTarget;
  //   const absoluteTsupPath = fsContext.resolvePath(projectRoot, tsupOutputDir);

  //   return fsContext.fileExists(absoluteTsupPath);
  // }
  // public extractExpectedPackageWeights(): TAuditSizeMetrics {
  //   // const rootDir = fsContext.projectRoot;
  //   const auditSizeMetrics = createDefaultAuditTemplate('packageMetrics');
  //   /* prettier-ignore */
  //   const packageJsonPath = fsContext.resolvePath(this.searchFileNames.packageJson)

  //   if (!fsContext.fileExists(packageJsonPath)) return auditSizeMetrics;

  //   let verifiedBundleBytes: number = 0;
  //   let prodDepCount: number = 0;

  //   try {
  //     const rawManifestContent = fsContext.readText(packageJsonPath);
  //     const parsedManifestObj = JSON.parse(rawManifestContent);
  //     if (!isPackageManifest(parsedManifestObj)) return auditSizeMetrics;
  //     const filesWhitelistArray = parsedManifestObj.files;
  //     const targetSearchPaths = new Set<string>();
  //     if (isUndefined(filesWhitelistArray)) return auditSizeMetrics;
  //     // A. REGISTRY-DRIVEN WHITELIST DISTRIBUTION CAPTURE
  //     this.whitelistSetUp(filesWhitelistArray, targetSearchPaths);

  //     // B: MANDATORY IMPLICIT NPM INCLUSIONS
  //     verifiedBundleBytes += this.npmPackageINclusions();

  //     // C: BOUNDED DIRECTORY WEIGHT ACCUMULATION LOOP

  //     verifiedBundleBytes += this.dirWeightAccumulation(targetSearchPaths);

  //     const dependenciesBlock = parsedManifestObj.dependencies;

  //     if (dependenciesBlock !== undefined) {
  //       prodDepCount = Object.keys(dependenciesBlock).length;
  //     }
  //   } catch {
  //     console.log(auditSizeMetrics);
  //     return auditSizeMetrics;
  //   }
  //   const projectedDependencyOverheadBytes = prodDepCount * 460800;
  //   auditSizeMetrics.bundleSizeBytes = verifiedBundleBytes;
  //   auditSizeMetrics.estimatedInstallFootprintBytes =
  //     verifiedBundleBytes + projectedDependencyOverheadBytes;
  //   auditSizeMetrics.productionDependenciesCount =
  //     projectedDependencyOverheadBytes;
  //   auditSizeMetrics.isMissingManifest = false;

  //   return auditSizeMetrics;
  // }
  public extractExpectedPackageWeights(): TAuditSizeMetrics {
    const auditSizeMetrics = createDefaultAuditTemplate('packageMetrics');
    const projectRoot = fsContext.getProjectRoot();

    console.log(
      `\x1b[33m[xalor:debug] 🔍 Initiating package sizing audit at root: ${projectRoot}\x1b[0m`,
    );

    /* prettier-ignore */
    const packageJsonPath = fsContext.resolvePath(this.searchFileNames.packageJson);
    console.log(
      `\x1b[33m[xalor:debug] 📑 Looking for manifest file at resolved path: ${packageJsonPath}\x1b[0m`,
    );

    if (!fsContext.fileExists(packageJsonPath)) {
      console.log(
        `\x1b[31m[xalor:debug] ❌ Physical check failed: package.json does not exist at target path!\x1b[0m`,
      );
      return auditSizeMetrics;
    }

    console.log(
      `\x1b[32m[xalor:debug] ✅ Manifest file successfully detected on disk.\x1b[0m`,
    );

    let verifiedBundleBytes: number = 0;
    let prodDepCount: number = 0;

    try {
      const rawManifestContent = fsContext.readText(packageJsonPath);
      console.log(
        `\x1b[33m[xalor:debug] 💾 Manifest stream buffer read successfully (${rawManifestContent.length} characters).\x1b[0m`,
      );

      const parsedManifestObj = JSON.parse(rawManifestContent);
      console.log(
        `\x1b[33m[xalor:debug] 🧠 JSON string parsed successfully into memory record structures.\x1b[0m`,
      );

      if (!isPackageManifest(parsedManifestObj)) {
        console.log(
          `\x1b[31m[xalor:debug] ❌ Structure Validation Failed: Data shape rejected by isPackageManifest type guard!\x1b[0m`,
        );
        return auditSizeMetrics;
      }
      console.log(
        `\x1b[32m[xalor:debug] ✅ Data shape confirmed via isPackageManifest contract criteria.\x1b[0m`,
      );

      const filesWhitelistArray = parsedManifestObj.files;
      const targetSearchPaths = new Set<string>();

      // FIX LOGIC BREAKPOINT DETECTED: Do NOT return early if files array is undefined!
      // NPM defaults to packing the project root when 'files' is omitted.
      if (isUndefined(filesWhitelistArray)) {
        console.log(
          `\x1b[33m[xalor:debug] ℹ️ 'files' array is absent. Applying global fallback include templates strategy.\x1b[0m`,
        );
      } else {
        console.log(
          `\x1b[33m[xalor:debug] 📋 'files' array detected containing ${filesWhitelistArray.length} whitelist entry items.\x1b[0m`,
        );
      }

      // A. REGISTRY-DRIVEN WHITELIST DISTRIBUTION CAPTURE
      this.whitelistSetUp(filesWhitelistArray, targetSearchPaths);
      console.log(
        `\x1b[33m[xalor:debug] 🗺️ Whitelist target setup complete. Tracking paths count: ${targetSearchPaths.size}\x1b[0m`,
      );
      for (const trackedPath of targetSearchPaths) {
        console.log(
          `\x1b[33m[xalor:debug]     -> Scannable Target: ${trackedPath}\x1b[0m`,
        );
      }

      // B: MANDATORY IMPLICIT NPM INCLUSIONS
      const implicitBytes = this.npmPackageInclusions(); // Fixed method typo name resolution
      verifiedBundleBytes += implicitBytes;
      console.log(
        `\x1b[33m[xalor:debug] 📎 Mandatory implicit inclusions parsed. Added weight: ${implicitBytes} bytes.\x1b[0m`,
      );

      // C: BOUNDED DIRECTORY WEIGHT ACCUMULATION LOOP
      const dynamicDirBytes = this.dirWeightAccumulation(targetSearchPaths);
      verifiedBundleBytes += dynamicDirBytes;
      console.log(
        `\x1b[33m[xalor:debug] 🗄️ Bounded directory sweep complete. Crawl added weight: ${dynamicDirBytes} bytes.\x1b[0m`,
      );

      const dependenciesBlock = parsedManifestObj.dependencies;
      if (dependenciesBlock !== undefined) {
        prodDepCount = Object.keys(dependenciesBlock).length;
        console.log(
          `\x1b[33m[xalor:debug] 🔗 Found ${prodDepCount} production dependencies inside metadata fields.\x1b[0m`,
        );
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

    console.log(
      `\x1b[32m[xalor:debug] 🎉 Telemetry pipeline successfully derived and populated without exceptions.\x1b[0m`,
    );
    return auditSizeMetrics;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0.00 B';

    const KILOBYTE_FACTOR = 1024;
    const sizeSizes = ['B', 'KB', 'MB', 'GB'];

    // Determine the base-1024 exponent layer natively
    const exponentIndex = Math.floor(
      Math.log(bytes) / Math.log(KILOBYTE_FACTOR),
    );
    const calculatedValue = bytes / Math.pow(KILOBYTE_FACTOR, exponentIndex);

    return `${calculatedValue.toFixed(2)} ${sizeSizes[exponentIndex]}`;
  }
  public renderDashboard(metrics: TAuditSizeMetrics): void {
    const divider = '='.repeat(60);
    const subDivider = '-'.repeat(60);

    console.log('\n' + divider);
    console.log(' 🛰️  XALOR COMPILER SYSTEM — PRE-PUBLISH DISTRIBUTION REPORT');
    console.log(divider);

    if (metrics.isMissingManifest) {
      console.log(
        ' ❌ CRITICAL TRACE ERROR: package.json manifest could not be located.',
      );
      console.log(divider + '\n');
      return;
    }

    // 1. Unpacked Core Bundle Weights Column Mapping
    console.log(
      ` 📦 Unpacked Bundle Size   :  \x1b[32m${this.formatBytes(metrics.bundleSizeBytes)}\x1b[0m`,
    );
    console.log(
      `    (Includes tsup compilation files and mandatory npm assets)`,
    );
    console.log(subDivider);

    // 2. Structural Dependency Metadata Column Mapping
    console.log(
      ` 🔗 Production Dependencies:  \x1b[36m${metrics.productionDependenciesCount} packages\x1b[0m`,
    );
    console.log(
      `    (Directly listed modules pulled down during end-user installation)`,
    );
    console.log(subDivider);

    // 3. Projected Down-wire Hard Drive Expansion Capacity Allocation
    console.log(
      ` 🪐 Projected Install Weight: \x1b[35m${this.formatBytes(metrics.estimatedInstallFootprintBytes)}\x1b[0m`,
    );
    console.log(
      `    (Total footprint added to a user's node_modules workspace)`,
    );

    console.log(divider + '\n');
  }
}

export const packageAuditorService = new PackageAuditorService();
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
