import type {
  TTelemetryTokenNames,
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
} from '../../../shared/types';
import {
  isAllowedFileExt,
  ObjectUtils,
  yieldItems,
} from '../../../shared/utils';
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

  private mode: 'audit' | 'studio' = 'audit';

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
  private studioAPIUsageCompile(params: TAPIStudioModeCounter) {
    const { sanitizedFileString, counters, apiUsageCollectionMap } = params;
    const capturedCalls = this.scanAndExtractAPICalls(sanitizedFileString);
    for (const call of yieldItems(capturedCalls)) {
      // Increment global counter metrics point-free
      if (call.strategyToken in counters) {
        counters[call.strategyToken]++;
      }

      // Initialize target entry slots if first time seeing this contract symbol key
      if (!apiUsageCollectionMap.has(call.targetKey)) {
        apiUsageCollectionMap.set(call.targetKey, {
          generateXalor: new Set<string>(),
          validateXalor: new Set<string>(),
          transformXalor: new Set<string>(),
        });
      }

      const contractMap = apiUsageCollectionMap.get(call.targetKey);
      if (contractMap && call.apiMode in contractMap) {
        // Add the explicit mode token modifier natively (e.g. 'assert', 'intern')
        contractMap[call.apiMode].add(call.strategyToken);
        console.log(
          ` ⚡ STRATEGY LINKED: Key '${call.targetKey}' -> Mode '${call.apiMode}' [${call.strategyToken}]`,
        );
      }
    }
  }
  private async scanTelemetryFiles(
    params: TScanTelemetryParams & {
      apiUsageCollectionMap: Map<string, Record<string, Set<string>>>;
    },
  ): Promise<void> {
    /* prettier-ignore */
    const { counters, seenKeys, registeredKeySet, targetDir, excludes,   apiUsageCollectionMap } =
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
  private scanAndExtractAPICalls(
    sanitizedFileString: string,
  ): readonly TCapturedAPICall[] {
    const apiTriggersGroup = this.runtimeTriggerNames.join('|');
    const strategyTokensGroup = this.strategyTokensArray.join('|');

    // Captures: Group 1: API Mode, Group 2: Target Key Name, Group 3: Strategy Token modifier
    const captureRegex = new RegExp(
      `\\b(${apiTriggersGroup})\\b(?:<|\\()\\s*['"]([^'"]+)['"]\\s*,\\s*['"](${strategyTokensGroup})['"]`,
      'g',
    );

    const matches: TCapturedAPICall[] = [];

    // 🟢 10X LOOP REFACTOR (Commandment VIII & IX Alignment)
    // matchAll extracts an iterator interface natively, removing mutable exec tracking blocks
    for (const matchResultNode of sanitizedFileString.matchAll(captureRegex)) {
      matches.push({
        apiMode: matchResultNode[1]!, // e.g. "generateXalor"
        targetKey: matchResultNode[2]!, // e.g. "ACCOUNT_META"
        strategyToken: matchResultNode[3]!, // e.g. "intern" / "assert"
      });
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
        generateXalor: Array.from(modes.generateXalor),
        validateXalor: Array.from(modes.validateXalor),
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
    /* prettier-ignore */
    const telemetryObject = createDefaultAuditTemplate('telemetry');
    /* prettier-ignore */
    const apiUsageCollectionMap = new Map<string,Record<string, Set<string>>>();

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
