import type {
  TTelemetryTokenNames,
  IXalorAuditPayload,
  TScanTelemetryParams,
  TAPIModeCounter,
} from '../../models/types';
import { TSConfigService, fsContext } from '../../../shared/service';
import type { TRuntimeTriggerName, TTripleKV } from '../../../shared/types';
import { isAllowedFileExt, ObjectUtils } from '../../../shared/utils';
import { RUNTIME_TRIGGER_NAMES } from '../../../shared/constants';
import { TELEMETRY_API_TOKEN_NAMES } from '../../models/constants';
import { createDefaultAuditTemplate } from '../../utils';

export class TelemetryService {
  /* prettier-ignore */
  private strategyTokensArray: readonly TTelemetryTokenNames[] = TELEMETRY_API_TOKEN_NAMES;
  /* prettier-ignore */
  private runtimeTriggerNames: TRuntimeTriggerName[] = RUNTIME_TRIGGER_NAMES;
  /* prettier-ignore */
  private triggerCheckRegEx = new RegExp(`\\b(${this.runtimeTriggerNames.join('|')})\\b`);

  private createTelemetryScanContext(projectRoot: string) {
    const counters: Record<string, number> = {};

    this.strategyTokensArray.forEach((token) => {
      if (token !== undefined) counters[token] = 0;
    });

    const seenKeys = new Set<string>();
    const configMatrix = TSConfigService.extractWorkspaceConfig(projectRoot);
    const baseIncludePath = configMatrix.includePatterns[0] ?? '';
    const cleanDirName = baseIncludePath.replace('/**/*', '').replace('/*', '');
    const targetDir = fsContext.resolvePath(cleanDirName || '.');

    console.log(
      `\n🔍 [Xalor Debug] Scanning project root context: ${projectRoot}`,
    );
    console.log(
      `🔍 [Xalor Debug] Active Config Fallback Mode Status: ${configMatrix.isFallbackMode}`,
    );
    console.log(
      `✨ [Xalor Debug] SELECTED ANCHOR TARGET PATH: "${targetDir}"\n`,
    );

    return {
      counters,
      seenKeys,
      targetDir,
      excludes: configMatrix.excludePatterns,
    };
  }

  private skipAnnotatedLines(rawFileContentString: string): string[] {
    const rawLinesList = rawFileContentString.split(/\r?\n/);
    const sanitizedLinesBuffer: string[] = [];

    for (const activeLine of rawLinesList) {
      if (activeLine === undefined) continue;
      const trimmedLine = activeLine.trim();
      if (
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith('*') ||
        trimmedLine.startsWith('/*')
      ) {
        sanitizedLinesBuffer.push('');
      } else {
        sanitizedLinesBuffer.push(activeLine);
      }
    }

    return sanitizedLinesBuffer;
  }

  private isPathExcluded(
    absoluteFilePath: string,
    excludePatterns: readonly string[],
  ): boolean {
    const len = excludePatterns.length;
    const sep = fsContext.pathSep;

    for (let e = 0; e < len; e++) {
      const pattern = excludePatterns[e];
      if (pattern === undefined) continue;

      if (absoluteFilePath.includes(`${sep}${pattern}${sep}`)) {
        return true;
      }
    }
    return false;
  }

  private countAPIMethodUsage(params: TAPIModeCounter) {
    const { sanitizedFileString, counters } = params;
    const runtimeTriggersChoiceGroup = this.runtimeTriggerNames.join('|');
    for (const strategyToken of this.strategyTokensArray) {
      const contextualRegex = new RegExp(
        `(?:${runtimeTriggersChoiceGroup})(?:<|\\()\\s*['"][^'"]+['"]\\s*,\\s*['"]${strategyToken}['"]`,
        'g',
      );

      const segments = sanitizedFileString.split(contextualRegex);
      const matchesCount = segments.length - 1;

      if (matchesCount > 0) {
        counters[strategyToken] += matchesCount;
        console.log(
          `      ⚡ STRATEGY INSTANCE LINKED: '${strategyToken}' (${matchesCount} matches)`,
        );
      }
    }
  }

  private async scanTelemetryFiles(
    params: TScanTelemetryParams,
  ): Promise<void> {
    const { counters, seenKeys, registeredKeySet, targetDir, excludes } =
      params;
    const directoryEntries = await fsContext.asyncReadDir(targetDir);
    const { length } = directoryEntries;

    for (let i = 0; i < length; i++) {
      const entry = directoryEntries[i]!;
      const fileName = entry.name;
      const absoluteFilePath = fsContext.resolvePath(targetDir, fileName);

      if (this.isPathExcluded(absoluteFilePath, excludes)) continue;

      if (entry.isDirectory()) {
        await this.scanTelemetryFiles({
          counters,
          seenKeys,
          registeredKeySet,
          targetDir: absoluteFilePath,
          excludes,
        });
        continue;
      }

      if (!isAllowedFileExt(fsContext.getExt(fileName))) continue;

      const rawFileString = await fsContext.asyncReadText(absoluteFilePath);

      if (!this.triggerCheckRegEx.test(rawFileString)) continue;

      const fileContent = this.skipAnnotatedLines(rawFileString);

      const sanitizedFileString = fileContent.join('\n');

      registeredKeySet.forEach((key) => {
        if (sanitizedFileString.includes(key)) {
          seenKeys.add(key);
          console.log(` ✅ CONTRACT ENCOUNTERED: "${key}"`);
        }
      });

      console.log(
        ` 📄 [Xalor Scout] Processing Active Runtime API Script: ${fileName}`,
      );

      this.countAPIMethodUsage({
        sanitizedFileString,
        registeredKeySet,
        counters,
      });
    }
  }
  public async profileRuntimeFootprintAndOrphans(
    vault: TTripleKV,
  ): Promise<IXalorAuditPayload['telemetry']> {
    const telemetryObject = createDefaultAuditTemplate('telemetry');

    const registeredKeys = ObjectUtils.keys(vault.references);
    /* prettier-ignore */
    const { counters, seenKeys, targetDir, excludes } = 
      this.createTelemetryScanContext(fsContext.projectRoot);

    if (!fsContext.fileExists(targetDir)) {
      console.warn(
        `⚠️ [Xalor Debug Warning]: Target directory path "${targetDir}" absent on disk.`,
      );
      telemetryObject.orphanedKeys = [...registeredKeys];
      return telemetryObject;
    }

    try {
      const registeredKeySet = new Set(registeredKeys);
      // Execute your high-speed inline contextual regex splits and line-erasure comment masks
      await this.scanTelemetryFiles({
        counters,
        seenKeys,
        registeredKeySet,
        targetDir,
        excludes,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Unknown file-system exception';
      console.error(
        `❌ [Xalor Debug Error] File scanner channel failure: ${errorMsg}`,
      );
    }
    const keysLen = registeredKeys.length;
    for (let k = 0; k < keysLen; k++) {
      const key = registeredKeys[k];
      if (key !== undefined && !seenKeys.has(key)) {
        if (!telemetryObject.orphanedKeys.includes(key)) {
          telemetryObject.orphanedKeys.push(key);
        }
      }
    }

    const distributionList = telemetryObject.strategyDistribution;
    const distLen = distributionList.length;
    for (let d = 0; d < distLen; d++) {
      const entry = distributionList[d];
      if (entry !== undefined) {
        entry.invocationCount = counters[entry.strategyToken] ?? 0;
      }
    }

    return telemetryObject;
  }
}

export const telemetryService = new TelemetryService();

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
 *
 *
 * TODO: DELETE WHEN FINISHED
 */
// private createTelemetryScanContext(
//   strategyTokensArray: readonly TTelemetryTokenNames[],
//   projectRoot: string,
// ) {
//   const strategyCounters: Record<string, number> = {};

//   strategyTokensArray.forEach((token) => {
//     if (token !== undefined) {
//       strategyCounters[token] = 0;
//     }
//   });

//   const activeEncounteredKeysSet = new Set<string>();
//   const configMatrix = TSConfigService.extractWorkspaceConfig(projectRoot);

//   const baseIncludePath = configMatrix.includePatterns[0] ?? '';
//   const cleanDirName = baseIncludePath.replace('/**/*', '').replace('/*', '');
//   const activeTargetDir = path.join(projectRoot, cleanDirName || '.');

//   // 🪐 DEBUG TRACE CHECKPOINT: Validate compiler directory resolution choices
//   console.log(
//     `\n🔍 [Xalor Debug] Scanning project root context: ${projectRoot}`,
//   );
//   console.log(
//     `🔍 [Xalor Debug] Active Config Fallback Mode Status: ${configMatrix.isFallbackMode}`,
//   );
//   console.log(
//     `✨ [Xalor Debug] SELECTED ANCHOR TARGET PATH: "${activeTargetDir}"\n`,
//   );

//   return {
//     strategyCounters,
//     activeEncounteredKeysSet,
//     activeTargetDir,
//     excludePatterns: configMatrix.excludePatterns,
//   };
// }
// private async scanTelemetryFiles(
//   strategyTokensArray: readonly TTelemetryTokenNames[],
//   strategyCounters: Record<string, number>,
//   activeEncounteredKeysSet: Set<string>,
//   registeredKeys: string[],
//   activeTargetDir: string,
//   excludePatterns: readonly string[],
// ): Promise<void> {
//   // 1. 🟢 FIXED: Added withFileTypes: true to extract native fs.Dirent directory entry objects!
//   const directoryEntries = await fs.promises.readdir(activeTargetDir, {
//     withFileTypes: true,
//   });
//   const entriesLen = directoryEntries.length;

//   const runtimeTriggersLen = RUNTIME_TRIGGER_NAMES.length;
//   const tokensLen = strategyTokensArray.length;
//   const keysLen = registeredKeys.length;
//   const exclusionsLen = excludePatterns.length;

//   for (let i = 0; i < entriesLen; i++) {
//     const entry = directoryEntries[i];
//     if (entry === undefined) continue;

//     const fileName = entry.name;
//     const absoluteFilePath = path.join(activeTargetDir, fileName);

//     // ========================================================================
//     // 🪐 THE MANDATORY EXCLUSION SENTRY SHIELD
//     // ========================================================================
//     let isPathBlacklisted = false;
//     for (let e = 0; e < exclusionsLen; e++) {
//       const exclusionPattern = excludePatterns[e];
//       if (
//         exclusionPattern !== undefined &&
//         absoluteFilePath.includes(`${path.sep}${exclusionPattern}${path.sep}`)
//       ) {
//         isPathBlacklisted = true;
//         break;
//       }
//     }

//     if (isPathBlacklisted) {
//       continue;
//     }

//     // ========================================================================
//     // 🔀 THE RECURSIVE SUB-DIRECTORY FORK SENTRY
//     // 🟢 FIXED: If the entry is an active directory, re-invoke scanTelemetryFiles
//     // recursively down the nested absolute path to map deeper tracks immediately!
//     // ========================================================================
//     if (entry.isDirectory()) {
//       await this.scanTelemetryFiles(
//         strategyTokensArray,
//         strategyCounters,
//         activeEncounteredKeysSet,
//         registeredKeys,
//         absoluteFilePath, // Downstream target path step
//         excludePatterns,
//       );
//       continue; // Move smoothly to the next entry in the current folder tier
//     }

//     // ========================================================================
//     // 🪐 FILE TYPE BOUNDARY VERIFICATION
//     // 🟢 FIXED: Evaluated ONLY for files now that directories are safely forked above!
//     // ========================================================================
//     if (
//       !fileName.endsWith('.js') &&
//       !fileName.endsWith('.mjs') &&
//       !fileName.endsWith('.ts') &&
//       !fileName.endsWith('.tsx')
//     ) {
//       continue;
//     }

//     const rawFileContentString = await fs.promises.readFile(
//       absoluteFilePath,
//       'utf-8',
//     );

//     // 🪐 STEP 1: INITIAL COMPLIANCE GATEWAY SWEEP
//     let isFileActiveTelemetryTarget = false;
//     for (let p = 0; p < runtimeTriggersLen; p++) {
//       const triggerFnToken = RUNTIME_TRIGGER_NAMES[p];
//       if (
//         triggerFnToken !== undefined &&
//         rawFileContentString.includes(triggerFnToken)
//       ) {
//         isFileActiveTelemetryTarget = true;
//         break;
//       }
//     }

//     if (!isFileActiveTelemetryTarget) {
//       continue;
//     }

//     // 🪐 STEP 2: HIGH-SPEED COMMENT ERASURE MASK (Zero-Leak Protection)
//     const rawLinesList = rawFileContentString.split(/\r?\n/);
//     const linesCount = rawLinesList.length;
//     const sanitizedLinesBuffer: string[] = [];

//     for (let L = 0; L < linesCount; L++) {
//       const activeLineText = rawLinesList[L];
//       if (activeLineText === undefined) continue;

//       const trimmedLine = activeLineText.trim();
//       if (
//         trimmedLine.startsWith('//') ||
//         trimmedLine.startsWith('*') ||
//         trimmedLine.startsWith('/*')
//       ) {
//         sanitizedLinesBuffer.push('');
//       } else {
//         sanitizedLinesBuffer.push(activeLineText);
//       }
//     }

//     const fileContentString = sanitizedLinesBuffer.join('\n');

//     console.log(
//       `   📄 [Xalor Scout] Processing Active Runtime API Script: ${fileName}`,
//     );

//     // 🪐 STEP 3: EXTRACT CONTRACT REFERENCE KEYS NATIVELY
//     for (let j = 0; j < keysLen; j++) {
//       const currentKey = registeredKeys[j];
//       if (
//         currentKey !== undefined &&
//         fileContentString.includes(currentKey)
//       ) {
//         activeEncounteredKeysSet.add(currentKey);
//         console.log(`      ✅ CONTRACT ENCOUNTERED: "${currentKey}"`);
//       }
//     }

//     // ========================================================================
//     // 🪐 STEP 4: TAXONOMY RUNTIME STRATEGY PARSING MATRIX
//     // ========================================================================
//     const runtimeTriggersChoiceGroup = RUNTIME_TRIGGER_NAMES.join('|');

//     for (let s = 0; s < tokensLen; s++) {
//       const strategyToken = strategyTokensArray[s];
//       if (strategyToken === undefined) continue;

//       const contextualRegex = new RegExp(
//         `(?:${runtimeTriggersChoiceGroup})(?:<|\\()\\s*['"][^'"]+['"]\\s*,\\s*['"]${strategyToken}['"]`,
//         'g',
//       );

//       const segments = fileContentString.split(contextualRegex);
//       const matchesCount = segments.length - 1;

//       if (matchesCount > 0) {
//         strategyCounters[strategyToken] += matchesCount;
//         console.log(
//           `      ⚡ STRATEGY INSTANCE LINKED: '${strategyToken}' (${matchesCount} matches)`,
//         );
//       }
//     }
//   }
// }

// /** @see {@link AuditServiceDocs.profileRuntimeFootprintAndOrphans}*/
// public async profileRuntimeFootprintAndOrphans(
//   vault: TTripleKV,
// ): Promise<IXalorAuditPayload['telemetry']> {
//   const telemetryObject = createDefaultAuditTemplate('telemetry');
//   const strategyTokensArray = TELEMETRY_API_TOKEN_NAMES;
//   const registeredKeys = ObjectUtils.keys(vault.references);
//   /* prettier-ignore */
//   const { strategyCounters, activeEncounteredKeysSet, activeTargetDir, excludePatterns } =
//   this.createTelemetryScanContext(strategyTokensArray, this.projectRoot);

//   if (!fs.existsSync(activeTargetDir)) {
//     console.warn(
//       `⚠️ [Xalor Debug Warning]: Target directory path "${activeTargetDir}" absent on disk.`,
//     );
//     telemetryObject.orphanedKeys = [...registeredKeys];
//     return telemetryObject;
//   }

//   try {
//     // Execute your high-speed inline contextual regex splits and line-erasure comment masks
//     await this.scanTelemetryFiles(
//       strategyTokensArray,
//       strategyCounters,
//       activeEncounteredKeysSet,
//       registeredKeys,
//       activeTargetDir,
//       excludePatterns,
//     );
//   } catch (error) {
//     const errorMsg =
//       error instanceof Error
//         ? error.message
//         : 'Unknown file-system exception';
//     console.error(
//       `❌ [Xalor Debug Error] File scanner channel failure: ${errorMsg}`,
//     );
//   }
//   // 🪐 POPULATE RE-ARRANGED DATA PAYLOAD STRUCTURAL ARRAYS UNIFORMLY
//   registeredKeys.forEach((key) => {
//     if (key !== undefined && !activeEncounteredKeysSet.has(key)) {
//       if (!telemetryObject.orphanedKeys.includes(key)) {
//         telemetryObject.orphanedKeys.push(key);
//       }
//     }
//   });

//   const distributionList = telemetryObject.strategyDistribution;
//   distributionList.forEach((entry) => {
//     if (entry !== undefined) {
//       entry.invocationCount = strategyCounters[entry.strategyToken] ?? 0;
//     }
//   });

//   return telemetryObject;
// }
