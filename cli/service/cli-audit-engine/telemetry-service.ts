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
    projectRoot: string,
  ): Promise<IXalorAuditPayload['telemetry']> {
    const telemetryObject = createDefaultAuditTemplate('telemetry');

    const registeredKeys = ObjectUtils.keys(vault.references);
    /* prettier-ignore */
    const { counters, seenKeys, targetDir, excludes } = 
      this.createTelemetryScanContext(projectRoot);

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
