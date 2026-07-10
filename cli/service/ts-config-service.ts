import ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import type { TSearchFileNames } from '../../shared/types';
import type { TXalorParsedConfig, TResolvedConfigPath } from '../models/types';
import { CONFIG_FALLBACK_DEFAULT } from '../models/constants';
import { IS_SOLID_CONFIG_ITEMS, REGEX_PATTERNS } from '../../shared/constants';
import { isArray } from '../../shared/utils';

/**
 * ============================================================================================================
 * 🪐 XALOR ARCHITECTURAL MANIFEST: THE CENTRAL CONFIGURATION PARSER SERVICE
 * ============================================================================================================
 *
 * ROLE:
 * A headless, stateless workspace extraction service engineered to locate, ingest, parse,
 * and translate a local project's native `tsconfig.json` configurations using the official
 * high-fidelity TypeScript Compiler API.
 *
 * MORE DETAILS
 * @see {@link SharedServiceDocs.TSConfigService}
 *
 * FOR COMPILER DICTIONARY
 * @see {@link SharedServiceDocs.TSCOMPILERDICTIONARY}
 */
export class TSConfigService {
  /* prettier-ignore */
  private  readonly searchFileNames = IS_SOLID_CONFIG_ITEMS.searchFileNames;

  private resolveConfigName(
    projectRootPath: string,
    explicitProjectFlag?: string,
  ): string {
    if (explicitProjectFlag?.trim()) {
      return explicitProjectFlag;
    }

    const discoveryList = this.findAllWorkspaceConfigs(projectRootPath);
    return discoveryList[0]?.fileName ?? this.searchFileNames.tsconfig;
  }

  public findAllWorkspaceConfigs(
    projectRootPath: string,
  ): readonly TResolvedConfigPath[] {
    const configBuffer: TResolvedConfigPath[] = [];

    try {
      const rootStat = fs.statSync(projectRootPath);

      if (!rootStat.isDirectory()) return Object.freeze([]);

      // !!! List contents of a directory
      const entries = fs.readdirSync(projectRootPath, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (!entry.isFile()) continue;

        const fileName = entry.name;

        if (!REGEX_PATTERNS.tsConfigFiles.test(fileName)) continue;

        configBuffer.push({
          fileName,
          absolutePath: path.join(projectRootPath, fileName),
        });
      }
    } catch {
      // TODO: ADD ERROR LOGGGER
      return Object.freeze([]);
    }

    const finalPrioritizedList = this.prioritizeTsconfigs(
      configBuffer,
      this.searchFileNames,
    );

    return Object.freeze(finalPrioritizedList);
  }
  private createPriorityMap = (
    searchFileNames: TSearchFileNames,
  ): ReadonlyMap<string, number> =>
    new Map<string, number>([
      [searchFileNames.tsconfigBuild, 0],
      [searchFileNames.tsconfig, 1],
      [searchFileNames.tsconfigBase, 999],
    ]);

  private prioritizeTsconfigs = (
    configs: readonly TResolvedConfigPath[],
    searchFileNames: TSearchFileNames,
  ): TResolvedConfigPath[] => {
    const priorities = this.createPriorityMap(searchFileNames);

    return [...configs].sort((a, b) => {
      const aPriority = priorities.get(a.fileName) ?? 100;
      const bPriority = priorities.get(b.fileName) ?? 100;

      return aPriority !== bPriority
        ? aPriority - bPriority
        : a.fileName.localeCompare(b.fileName);
    });
  };
  /**
   * extractWorkspaceConfig
   * 🪐 MULTI-TARGET CONFIGURATION DISCOVERY ENGINE
   *
   * ROLE:
   * Evaluates the workspace, determines the ideal configuration target file natively,
   * and returns an immutable configuration matrix with perfect type purity.
   */
  public extractWorkspaceConfig(
    projectRootPath: string,
    explicitProjectFlag?: string,
  ): TXalorParsedConfig {
    /* prettier-ignore */
    const chosenConfigName = this.resolveConfigName(projectRootPath, explicitProjectFlag);
    /* prettier-ignore */
    const configPath = ts.findConfigFile(projectRootPath, ts.sys.fileExists, chosenConfigName);

    if (!configPath) {
      console.warn(
        `🛰️ [Xalor Config] Target config '${chosenConfigName}' absent. Utilizing zero-config fallbacks.`,
      );
      return CONFIG_FALLBACK_DEFAULT;
    }

    const readResult = ts.readConfigFile(configPath, ts.sys.readFile);

    if (!readResult.config || readResult.error) {
      return CONFIG_FALLBACK_DEFAULT;
    }
    /* prettier-ignore */
    const parsedContext = ts.parseJsonConfigFileContent(readResult.config, ts.sys, path.dirname(configPath));

    const rawUserJsonConfig = readResult.config;

    const includeArray = isArray(rawUserJsonConfig.include)
      ? rawUserJsonConfig.include
      : [];

    const excludeArray = isArray(rawUserJsonConfig.exclude)
      ? rawUserJsonConfig.exclude
      : [];

    return {
      compilerOptions: parsedContext.options,
      includePatterns: Object.freeze(includeArray),
      excludePatterns: Object.freeze(excludeArray),
      isFallbackMode: false,
    };
  }
}

export const tsConfigService = new TSConfigService();
