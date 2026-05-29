// transformer/service/routes-service.ts
import * as fs from 'fs';
import * as path from 'path';
import type {
  TXalorResolvedPaths,
  TTransformerExecuteMode,
} from '../../shared';
import { IS_SOLID_CONFIG_ITEMS, XALOR_ENV_KEYS } from '../../shared';
import type { TXalorLifecycleContext } from '../types';
import { xalorCentralContext } from './context-service';

export class XalorRoutesService {
  public static findProjectRoot(startingPath: string): string {
    const resolvedPath = path.isAbsolute(startingPath)
      ? path.resolve(startingPath)
      : path.resolve(process.cwd(), startingPath);

    const startingDir = fs.statSync(resolvedPath).isDirectory()
      ? resolvedPath
      : path.dirname(resolvedPath);

    const pathSegments = startingDir.split(path.sep);
    const parsedRoot = path.parse(startingDir).root;

    const ancestralPaths = pathSegments.map((_, index) => {
      const activeSegments = pathSegments.slice(0, pathSegments.length - index);
      return path.join(parsedRoot, ...activeSegments);
    });

    const discoveredRoot = ancestralPaths.find((dir) =>
      fs.existsSync(path.join(dir, 'package.json')),
    );
    return discoveredRoot || process.cwd();
  }

  public static resolveXalorLifecycle(): TXalorLifecycleContext {
    const watchFlag = process.env[XALOR_ENV_KEYS.watch] === 'true';
    const compileFlag = process.env[XALOR_ENV_KEYS.compile] === 'true';
    const vacuumFlag = process.env[XALOR_ENV_KEYS.vacuum] === 'true';
    const studioFlag = process.env[XALOR_ENV_KEYS.studio] === 'true';
    const nodeEnv = process.env.NODE_ENV;
    const isTestEnvironment = nodeEnv === 'test';

    const isWatchMode = watchFlag && !isTestEnvironment;
    const isOneShotCompileMode = compileFlag && !isTestEnvironment;
    const isStudioMode = studioFlag && !isTestEnvironment; // 🚀 Isolated clear mode tracking frame

    // Enforce production vacuum if flag is present OR if executing a native production build pass
    const isProductionVacuumMode =
      vacuumFlag || (nodeEnv === 'production' && !watchFlag && !compileFlag);

    const isDevelopmentPass = isWatchMode || isOneShotCompileMode;

    return {
      isWatchMode,
      isOneShotCompileMode,
      isProductionVacuumMode,
      isTestEnvironment,
      isDevelopmentPass,
      isStudioMode,
    };
  }

  public static xalorCLIMode(): TTransformerExecuteMode {
    const lifecycle = XalorRoutesService.resolveXalorLifecycle();

    if (lifecycle.isProductionVacuumMode) return 'vacuum';
    if (lifecycle.isOneShotCompileMode) return 'compile';
    if (lifecycle.isStudioMode) return 'studio';

    return 'watch';
  }

  public static getProjectRelativeKey(absoluteFilePath: string): string {
    const rootDir = xalorCentralContext.rootDir;

    const relativePath = path.relative(rootDir, absoluteFilePath);

    const standardizedPath = relativePath
      .split(path.sep)
      .join('/')
      .toLowerCase();

    return standardizedPath.startsWith('/')
      ? standardizedPath
      : `/${standardizedPath}`;
  }

  public static resolveXalorPaths(
    executionContextPath?: string,
  ): TXalorResolvedPaths {
    const { fileNames } = IS_SOLID_CONFIG_ITEMS;
    const rootDir = executionContextPath
      ? this.findProjectRoot(executionContextPath)
      : process.cwd();

    /* prettier-ignore */ const absoluteCacheDir = path.join( rootDir, 'node_modules', '.cache', fileNames.cacheFolderName);
    /* prettier-ignore */ const absoluteBridgeDir = path.join(rootDir, fileNames.intelFolderName);

    return {
      rootDir,
      cacheDir: absoluteCacheDir,
      vaultFile: path.join(absoluteCacheDir, fileNames.vaultFileName),
      bridgeDir: absoluteBridgeDir,
      bridgeFile: path.join(absoluteBridgeDir, fileNames.bridgeFileName),
      bakedFile: path.join(absoluteBridgeDir, fileNames.bakedFileName),
    };
  }

  public static getPackageRootDir(activeDirName: string): string {
    if (
      activeDirName.includes('transformer') ||
      activeDirName.includes('cli')
    ) {
      return path.resolve(activeDirName, '..');
    }

    return path.resolve(activeDirName);
  }
}
