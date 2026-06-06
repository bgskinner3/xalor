import type {
  IXalorAuditPayload,
  TScanTelemetryParams,
  TAPIModeCounter,
  TAPIStudioModeCounter,
  TCapturedAPICall,
  TStudioApiUsageMap,
} from '../../models/types';
import { TSConfigService, fsContext } from '../../../shared/service';
import type {
  TDeepWriteable,
  TRuntimeTriggerName,
  TTripleKV,
} from '../../../shared';
import {
  isAllowedFileExt,
  ObjectUtils,
  yieldItems,
} from '../../../shared/utils';
import {
  createDefaultAuditTemplate,
  isTransformerTrigger,
  isValidationTrigger,
  isGeneratorTrigger,
} from '../../utils';
import {
  GENERATOR_MODE_TRIGGERS,
  VALIDATION_MODE_TRIGGERS,
  TRANSFORM_MODE_TRIGGERS,
} from '../../../shared';

export class TelemetryService {
  // Track all possible sub-command strings as the valid matrix
  private runtimeTriggerNames: readonly string[] = [
    ...GENERATOR_MODE_TRIGGERS,
    ...VALIDATION_MODE_TRIGGERS,
    ...TRANSFORM_MODE_TRIGGERS,
  ];

  private triggerCheckRegEx = new RegExp(
    `\\b(${this.runtimeTriggerNames.join('|').replace(/\./g, '\\.')})\\b`,
  );
  private mode: 'audit' | 'studio' = 'audit';

  private createTelemetryScanContext(projectRoot: string) {
    const counters: Record<string, number> = {};
    this.runtimeTriggerNames.forEach((token) => {
      counters[token] = 0;
    });
    const seenKeys = new Set<string>();
    const configMatrix = TSConfigService.extractWorkspaceConfig(projectRoot);
    const baseIncludePath = configMatrix.includePatterns[0] ?? '';
    const cleanDirName = baseIncludePath.replace('/**/*', '').replace('/*', '');
    const targetDir = fsContext.resolvePath(cleanDirName || '.');
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
      if (absoluteFilePath.includes(`${sep}${pattern}${sep}`)) return true;
    }
    return false;
  }

  /**
   * COUNTS SUB-METHOD INSTANCES
   * Matches lines containing instances like xalor.guard<"KEY"> or xalor.guard("KEY")
   */
  private countAPIMethodUsage(params: TAPIModeCounter) {
    const { sanitizedFileString, counters } = params;

    for (const strategyToken of this.runtimeTriggerNames) {
      // Captures things like: xalor.guard<"MY_KEY"> or xalor.guard("MY_KEY")
      const escapedToken = strategyToken.replace(/\./g, '\\.');
      const contextualRegex = new RegExp(
        `\\b${escapedToken}\\b(?:<|\\()\\s*['"][^'"]+['"]`,
        'g',
      );

      const segments = sanitizedFileString.split(contextualRegex);
      const matchesCount = segments.length - 1;
      if (matchesCount > 0) {
        counters[strategyToken] = (counters[strategyToken] ?? 0) + matchesCount;
        console.log(
          ` ⚡ STRATEGY INSTANCE LINKED: '${strategyToken}' (${matchesCount} matches)`,
        );
      }
    }
  }

  private studioAPIUsageCompile(params: TAPIStudioModeCounter) {
    const { sanitizedFileString, counters, apiUsageCollectionMap } = params;
    const capturedCalls = this.scanAndExtractAPICalls(sanitizedFileString);

    for (const call of yieldItems(capturedCalls)) {
      if (call.strategyToken in counters) {
        counters[call.strategyToken]++;
      }

      if (!apiUsageCollectionMap.has(call.targetKey)) {
        apiUsageCollectionMap.set(call.targetKey, {
          generateXalor: new Set<string>(),
          validateXalor: new Set<string>(),
          transformXalor: new Set<string>(),
        });
      }

      const contractMap = apiUsageCollectionMap.get(call.targetKey);
      if (contractMap && call.apiMode in contractMap) {
        contractMap[call.apiMode].add(call.strategyToken);
        console.log(
          ` ⚡ STRATEGY LINKED: Key '${call.targetKey}' -> Category '${call.apiMode}' [${call.strategyToken}]`,
        );
      }
    }
  }

  private async scanTelemetryFiles(
    params: TScanTelemetryParams & {
      apiUsageCollectionMap: Map<string, Record<string, Set<string>>>;
    },
  ): Promise<void> {
    const {
      counters,
      seenKeys,
      registeredKeySet,
      targetDir,
      excludes,
      apiUsageCollectionMap,
    } = params;
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
          apiUsageCollectionMap,
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

      if (this.mode === 'audit') {
        this.countAPIMethodUsage({
          sanitizedFileString,
          registeredKeySet,
          counters,
          seenKeys,
        });
      }
      if (this.mode === 'studio') {
        this.studioAPIUsageCompile({
          sanitizedFileString,
          apiUsageCollectionMap,
          counters,
        });
      }
    }
  }

  /**
   * PARSES NEW RUNTIME EXPRESSIONS
   * Scans for patterns like xalor.assert<"KEY"> or xalor.assert("KEY")
   */
  private scanAndExtractAPICalls(
    sanitizedFileString: string,
  ): readonly TCapturedAPICall[] {
    const apiTriggersGroup = this.runtimeTriggerNames
      .join('|')
      .replace(/\./g, '\\.');

    // Group 1: The precise trigger (e.g. 'xalor.guard'), Group 2: The inner Key payload
    const captureRegex = new RegExp(
      `\\b(${apiTriggersGroup})\\b(?:<|\\()\\s*['"]([^'"]+)['"]`,
      'g',
    );
    const matches: TCapturedAPICall[] = [];

    for (const matchResultNode of sanitizedFileString.matchAll(captureRegex)) {
      const strategyToken = matchResultNode[1]!; // e.g. "xalor.guard"
      const targetKey = matchResultNode[2]!; // e.g. "USER_MODEL"
      let apiMode: TRuntimeTriggerName = 'validationXalor'; // Default bucket fallback

      // Map specific sub-commands back into original parent telemetry buckets
      if (isGeneratorTrigger.has(strategyToken)) apiMode = 'generatorXalor';
      else if (isTransformerTrigger.has(strategyToken))
        apiMode = 'transformXalor';
      else if (isValidationTrigger.has(strategyToken))
        apiMode = 'validationXalor';

      matches.push({ apiMode, targetKey, strategyToken });
    }
    return matches;
  }

  private formatStudioAPICalls(
    apiUsageCollectionMap: Map<
      string,
      Record<TRuntimeTriggerName, Set<string>>
    >,
  ) {
    const apiUsageMap: TDeepWriteable<TStudioApiUsageMap> = Object.create(null);
    for (const [key, modes] of apiUsageCollectionMap.entries()) {
      apiUsageMap[key] = {
        generatorXalor: Array.from(modes.generatorXalor),
        validationXalor: Array.from(modes.validationXalor),
        transformXalor: Array.from(modes.transformXalor),
      };
    }
    return apiUsageMap;
  }

  public async profileRuntimeFootprintAndOrphans(
    vault: TTripleKV,
    mode: 'audit' | 'studio' = 'audit',
  ): Promise<IXalorAuditPayload['telemetry']> {
    this.mode = mode;
    const telemetryObject = createDefaultAuditTemplate('telemetry');
    const apiUsageCollectionMap = new Map<
      string,
      Record<string, Set<string>>
    >();
    const registeredKeys = ObjectUtils.keys(vault.references);
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
      await this.scanTelemetryFiles({
        counters,
        seenKeys,
        registeredKeySet,
        targetDir,
        excludes,
        apiUsageCollectionMap,
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
    if (this.mode === 'studio') {
      const apiUsageMap = this.formatStudioAPICalls(apiUsageCollectionMap);
      telemetryObject.studioAPIMapper = apiUsageMap;
    }
    return telemetryObject;
  }
}
export const telemetryService = new TelemetryService();
