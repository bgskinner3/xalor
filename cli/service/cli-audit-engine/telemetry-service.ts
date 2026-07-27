import type {
  IXalorAuditPayload,
  TScanTelemetryParams,
  TAPIModeCounter,
  TAPIStudioModeCounter,
  TCapturedAPICall,
  TStudioApiUsageMap,
} from '../../models/types';
import { fsContext } from '../../../shared/service';
import { tsConfigService } from '../ts-config-service';
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
  createDefaultTemplate,
  isTransformerTrigger,
  isValidationTrigger,
  isGeneratorTrigger,
  isMatchTrigger,
} from '../../utils';
import {
  GENERATOR_MODE_TRIGGERS,
  VALIDATION_MODE_TRIGGERS,
  TRANSFORM_MODE_TRIGGERS,
  MATCH_MODE_TRIGGERS,
} from '../../../shared';
import { isUndefined } from '../../../shared';

export class TelemetryService {
  private readonly runtimeTriggerNames: readonly string[] = [
    ...GENERATOR_MODE_TRIGGERS,
    ...VALIDATION_MODE_TRIGGERS,
    ...TRANSFORM_MODE_TRIGGERS,
    ...MATCH_MODE_TRIGGERS,
  ];

  private readonly triggerCheckRegEx = new RegExp(
    `\\b(${this.runtimeTriggerNames.join('|').replace(/\./g, '\\.')})\\b`,
  );

  private mode: 'audit' | 'studio' = 'audit';

  private createTelemetryScanContext(projectRoot: string) {
    const counters: Record<string, number> = {};
    this.runtimeTriggerNames.forEach((token) => {
      counters[token] = 0;
    });

    const seenKeys = new Set<string>();
    const configMatrix = tsConfigService.extractWorkspaceConfig(projectRoot);
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

    // FIX: Replaced custom imperative markers with clean functional processing array steps
    rawLinesList.forEach((activeLine) => {
      if (isUndefined(activeLine)) return;
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
    });

    return sanitizedLinesBuffer;
  }

  private isPathExcluded(
    absoluteFilePath: string,
    excludePatterns: readonly string[],
  ): boolean {
    const sep = fsContext.pathSep;

    return excludePatterns.some((pattern) => {
      if (isUndefined(pattern)) return false;
      return absoluteFilePath.includes(`${sep}${pattern}${sep}`);
    });
  }

  private countAPIMethodUsage(params: TAPIModeCounter) {
    const { sanitizedFileString, counters } = params;

    this.runtimeTriggerNames.forEach((strategyToken) => {
      const escapedToken = strategyToken.replace(/\./g, '\\.');
      const contextualRegex = new RegExp(
        `\\b${escapedToken}\\b(?:<|\\()\\s*['"][^'"]+['"]`,
        'g',
      );
      const segments = sanitizedFileString.split(contextualRegex);
      const matchesCount = segments.length - 1;

      if (matchesCount > 0) {
        counters[strategyToken] = (counters[strategyToken] ?? 0) + matchesCount;
      }
    });
  }

  /**
   * COMPILES STUDIO MAPPER WITH FREQUENCY COUNTS - STUDIO ONLY
   */
  private studioAPIUsageCompile(params: TAPIStudioModeCounter) {
    const { sanitizedFileString, counters, apiUsageCollectionMap } = params;
    const capturedCalls = this.scanAndExtractAPICalls(sanitizedFileString);

    (yieldItems(capturedCalls) || []).forEach((call) => {
      if (call.strategyToken in counters) {
        counters[call.strategyToken]++;
      }

      if (!apiUsageCollectionMap.has(call.targetKey)) {
        apiUsageCollectionMap.set(call.targetKey, {
          generatorXalor: {},
          validationXalor: {},
          transformXalor: {},
          matchXalor: {},
        });
      }

      const contractMap = apiUsageCollectionMap.get(call.targetKey);
      if (contractMap && call.apiMode in contractMap) {
        const modeCounters = contractMap[call.apiMode];
        modeCounters[call.strategyToken] =
          (modeCounters[call.strategyToken] ?? 0) + 1;
        console.log(
          ` ⚡ STUDIO STRATEGY LINKED: Key '${call.targetKey}' -> Category '${call.apiMode}' [${call.strategyToken}: ${modeCounters[call.strategyToken]}]`,
        );
      }
    });
  }

  private async scanTelemetryFiles(
    params: TScanTelemetryParams,
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

    // FIX: Functional promise collections mapping handles directory walking loop-free
    await Promise.all(
      directoryEntries.map(async (entry) => {
        if (!entry) return;
        const fileName = entry.name;
        const absoluteFilePath = fsContext.resolvePath(targetDir, fileName);

        if (this.isPathExcluded(absoluteFilePath, excludes)) return;

        if (entry.isDirectory()) {
          await this.scanTelemetryFiles({
            counters,
            seenKeys,
            registeredKeySet,
            targetDir: absoluteFilePath,
            excludes,
            apiUsageCollectionMap,
          });
          return;
        }

        if (!isAllowedFileExt(fsContext.getExt(fileName))) return;

        const rawFileString = await fsContext.asyncReadText(absoluteFilePath);
        if (!this.triggerCheckRegEx.test(rawFileString)) return;

        const fileContent = this.skipAnnotatedLines(rawFileString);
        const sanitizedFileString = fileContent.join('\n');

        // !!! Core Orphan Extraction Correction.
        // Instead of a blunt .includes() text sweep across registrations, keys are
        // only flagged as active if a real uncommented runtime hook handles them!
        const livingCalls = this.scanAndExtractAPICalls(sanitizedFileString);
        livingCalls.forEach((call) => {
          if (registeredKeySet.has(call.targetKey)) {
            seenKeys.add(call.targetKey);
            console.log(
              ` ✅ COMPLIANT RUNTIME REFERENCE BOUND: "${call.targetKey}"`,
            );
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
      }),
    );
  }

  private scanAndExtractAPICalls(
    sanitizedFileString: string,
  ): readonly TCapturedAPICall[] {
    const apiTriggersGroup = this.runtimeTriggerNames
      .join('|')
      .replace(/\./g, '\\.');
    const captureRegex = new RegExp(
      `\\b(${apiTriggersGroup})\\b(?:<|\\()\\s*['"]([^'"]+)['"]`,
      'g',
    );
    const matches: TCapturedAPICall[] = [];
    const capturedMatchNodes = Array.from(
      sanitizedFileString.matchAll(captureRegex),
    );

    capturedMatchNodes.forEach((matchResultNode) => {
      if (!matchResultNode) return;
      const strategyToken = matchResultNode[1];
      const targetKey = matchResultNode[2];

      if (!strategyToken || !targetKey) return;

      // Ignore initial setup tokens to protect your runtime execution scores
      if (strategyToken === 'register') return;

      let apiMode: TRuntimeTriggerName = 'validationXalor';
      if (isGeneratorTrigger.has(strategyToken)) apiMode = 'generatorXalor';
      else if (isTransformerTrigger.has(strategyToken))
        apiMode = 'transformXalor';
      else if (isValidationTrigger.has(strategyToken))
        apiMode = 'validationXalor';
      else if (isMatchTrigger.has(strategyToken)) apiMode = 'matchXalor';

      matches.push({ apiMode, targetKey, strategyToken });
    });

    return matches;
  }

  private formatStudioAPICalls(
    apiUsageCollectionMap: Map<
      string,
      Record<TRuntimeTriggerName, Record<string, number>>
    >,
  ) {
    const apiUsageMap: TDeepWriteable<TStudioApiUsageMap> = Object.create(null);

    Array.from(apiUsageCollectionMap.entries()).forEach(([key, modes]) => {
      apiUsageMap[key] = {
        generatorXalor: { ...modes.generatorXalor },
        validationXalor: { ...modes.validationXalor },
        transformXalor: { ...modes.transformXalor },
        matchXalor: { ...modes.matchXalor },
      };
    });

    return apiUsageMap;
  }

  public async profileRuntimeFootprintAndOrphans(
    vault: TTripleKV,
    mode: 'audit' | 'studio' = 'audit',
  ): Promise<IXalorAuditPayload['telemetry']> {
    this.mode = mode;
    const telemetryObject = createDefaultTemplate('telemetry');

    // Type dynamically map value based on mode to maintain total runtime isolation
    // TODO: FIX ANY
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiUsageCollectionMap = new Map<string, Record<string, any>>();

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

    // Isolated execution branch for studio compilation tracking
    if (this.mode === 'studio') {
      const apiUsageMap = this.formatStudioAPICalls(apiUsageCollectionMap);
      telemetryObject.studioAPIMapper = apiUsageMap;
    }

    return telemetryObject;
  }
}
export const telemetryService = new TelemetryService();
