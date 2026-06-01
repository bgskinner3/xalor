import ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import type { TXalorParsedConfig, TResolvedConfigPath } from '../types';
import {
  CONFIG_FALLBACK_DEFAULT,
  IS_SOLID_CONFIG_ITEMS,
  REGEX_PATTERNS,
} from '../constants';
import { prioritizeTsconfigs } from '../utils';
import { isArray } from '../utils/guards';

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
  private static readonly searchFileNames = IS_SOLID_CONFIG_ITEMS.searchFileNames;

  private static resolveConfigName(
    projectRootPath: string,
    explicitProjectFlag?: string,
  ): string {
    if (explicitProjectFlag?.trim()) {
      return explicitProjectFlag;
    }

    const discoveryList = this.findAllWorkspaceConfigs(projectRootPath);
    return discoveryList[0]?.fileName ?? this.searchFileNames.tsconfig;
  }

  public static findAllWorkspaceConfigs(
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

    const finalPrioritizedList = prioritizeTsconfigs(
      configBuffer,
      this.searchFileNames,
    );

    return Object.freeze(finalPrioritizedList);
  }

  /**
   * extractWorkspaceConfig
   * 🪐 MULTI-TARGET CONFIGURATION DISCOVERY ENGINE
   *
   * ROLE:
   * Evaluates the workspace, determines the ideal configuration target file natively,
   * and returns an immutable configuration matrix with perfect type purity.
   */
  public static extractWorkspaceConfig(
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

    console.log(
      `🛰️ [Xalor Config] Authoritative configuration profile locked: "${chosenConfigName}"`,
    );

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
