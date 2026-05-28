import * as fs from 'fs';
import * as path from 'path';
import type { TXalorResolvedPaths } from '../../shared';
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
    const clearFlag = process.env[XALOR_ENV_KEYS.clear] === 'true';
    const nodeEnv = process.env.NODE_ENV;
    const isTestEnvironment = nodeEnv === 'test';

    const isWatchMode = watchFlag && !isTestEnvironment;
    const isOneShotCompileMode = compileFlag && !isTestEnvironment;
    const isClearMode = clearFlag && !isTestEnvironment; // 🚀 Isolated clear mode tracking frame

    // Enforce production vacuum if flag is present OR if executing a native production build pass
    const isProductionVacuumMode =
      vacuumFlag || (nodeEnv === 'production' && !watchFlag && !compileFlag);

    // Development passes require rich telemetry and IDE store emissions
    const isDevelopmentPass = isWatchMode || isOneShotCompileMode;

    return {
      isWatchMode,
      isOneShotCompileMode,
      isProductionVacuumMode,
      isTestEnvironment,
      isDevelopmentPass,
      isClearMode,
    };
  }

  public static getProjectRelativeKey(absoluteFilePath: string): string {
    const rootDir = xalorCentralContext.rootDir;
    // Compute the relative difference route natively
    const relativePath = path.relative(rootDir, absoluteFilePath);

    // Normalize Windows backslashes (\) to standard web forward slashes (/)
    const standardizedPath = relativePath.split(path.sep).join('/');

    // Prepend a leading forward slash if it doesn't already have one to seal the format contract
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
// // transformer/utils/paths-resolver.ts
// import * as fs from 'fs';
// import * as path from 'path';
// import type { TXalorResolvedPaths } from '../../shared';
// import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
// /**
//  * findProjectRoot
//  *
//  * @see {@link SharedUtilitiesDocs.findProjectRoot }
//  */
// export function findProjectRoot(startingPath: string): string {
//   const resolvedPath = path.isAbsolute(startingPath)
//     ? path.resolve(startingPath)
//     : path.resolve(process.cwd(), startingPath);

//   const startingDir = fs.statSync(resolvedPath).isDirectory()
//     ? resolvedPath
//     : path.dirname(resolvedPath);

//   const pathSegments = startingDir.split(path.sep);
//   const parsedRoot = path.parse(startingDir).root;

//   const ancestralPaths = pathSegments.map((_, index) => {
//     const activeSegments = pathSegments.slice(0, pathSegments.length - index);
//     return path.join(parsedRoot, ...activeSegments);
//   });

//   const discoveredRoot = ancestralPaths.find((dir) =>
//     fs.existsSync(path.join(dir, 'package.json')),
//   );
//   return discoveredRoot || process.cwd();
// }

// /**
//  * resolveXalorPaths
//  *
//  * @see {@link SharedUtilitiesDocs.resolveXalorPaths }
//  */
// export function resolveXalorPaths(
//   executionContextPath?: string,
// ): TXalorResolvedPaths {
//   const { fileNames } = IS_SOLID_CONFIG_ITEMS;
//   const rootDir = executionContextPath
//     ? findProjectRoot(executionContextPath)
//     : process.cwd();

//   /* prettier-ignore */ const absoluteCacheDir = path.join( rootDir, 'node_modules', '.cache', fileNames.cacheFolderName);
//   /* prettier-ignore */ const absoluteBridgeDir = path.join(rootDir, fileNames.intelFolderName);

//   return {
//     rootDir,
//     cacheDir: absoluteCacheDir,
//     vaultFile: path.join(absoluteCacheDir, fileNames.vaultFileName),
//     bridgeDir: absoluteBridgeDir,
//     bridgeFile: path.join(absoluteBridgeDir, fileNames.bridgeFileName),
//     bakedFile: path.join(absoluteBridgeDir, fileNames.bakedFileName),
//   };
// }

// /**
//  * getProjectRelativeKey
//  * 🧭 COORDINATE METRIC SLICER
//  *
//  * ROLE:
//  * Converts an absolute system path into a standardized project-relative key format.
//  *
//  * STRATEGY:
//  * Computes the relative layout tree between the root workspace boundary and the
//  * targeted source file. Prepends a unified forward slash to normalize lookup index consistency
//  * across different operating systems (Mac, Linux, Windows).
//  *
//  * @example
//  * Input:  "/Users/bgskinner2/Projects/xalor/__tests__/xalor-live.test.ts"
//  * Output: "/__tests__/xalor-live.test.ts"
//  */
// export function getProjectRelativeKey(
//   rootDir: string,
//   absoluteFilePath: string,
// ): string {
//   // Compute the relative difference route natively
//   const relativePath = path.relative(rootDir, absoluteFilePath);

//   // Normalize Windows backslashes (\) to standard web forward slashes (/)
//   const standardizedPath = relativePath.split(path.sep).join('/');

//   // Prepend a leading forward slash if it doesn't already have one to seal the format contract
//   return standardizedPath.startsWith('/')
//     ? standardizedPath
//     : `/${standardizedPath}`;
// }
// /**
//  * getPackageRootDir
//  * 📦 NPM PACKAGE SOURCE ANCHOR UTILITY
//  *
//  * ROLE:
//  * Locates the absolute root directory of your compiled npm package bundle,
//  * completely independent of the host developer's active terminal folder navigation.
//  *
//  * STRATEGY:
//  * Checks the execution folder path context. If it is currently executing deep
//  * inside your bundled 'transformer' or 'cli' distribution directories, it traces
//  * backward one directory tier ('..') to resolve the authoritative root where
//  * your 'static-templates' directory physically lives.
//  *
//  * @param activeDirName - Pass the local module's native __dirname or folder string context
//  * @returns The absolute path string pointing to your package root directory
//  */
// export function getPackageRootDir(activeDirName: string): string {
//   if (activeDirName.includes('transformer') || activeDirName.includes('cli')) {
//     return path.resolve(activeDirName, '..');
//   }

//   return path.resolve(activeDirName);
// }
