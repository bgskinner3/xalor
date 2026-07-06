import * as fs from 'fs';
import * as path from 'path';
import { IS_SOLID_CONFIG_ITEMS } from '../constants';
import type { TXalorResolvedPaths } from '../types';

export function findProjectRoot(startingPath: string): string {
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

/**
 * RESOLVE XALOR PATHS
 *
 * ROLE:
 * CLI Configuration Workspace Calculator.
 *
 * STRATEGY:
 * Computes absolute system directory anchors switchlessly exactly once per command trigger.
 * Isolates local hard drive path targets completely to shield core transformer compilers.
 */
export function resolveXalorPaths(
  executionContextPath?: string,
): TXalorResolvedPaths {
  const { fileNames } = IS_SOLID_CONFIG_ITEMS;

  // Resolve the project root via the existing fallback finder service tool
  const rootDir = executionContextPath
    ? findProjectRoot(executionContextPath)
    : process.cwd();

  /* prettier-ignore */ const absoluteCacheDir = path.join( rootDir, 'node_modules', '.cache', fileNames.cacheFolderName);
  // /* prettier-ignore */ const absoluteBridgeDir = path.join(rootDir, 'node_modules', '.cache', fileNames.cacheFolderName);
  /* prettier-ignore */ const absoluteBridgeDir = path.join(rootDir, fileNames.intelFolderName); // FILE OUTSIDE MODULES

  return {
    rootDir,
    cacheDir: absoluteCacheDir,
    vaultFile: path.join(absoluteCacheDir, fileNames.vaultFileName),
    baselineFile: path.join(absoluteCacheDir, fileNames.productionBaseline),
    bridgeDir: absoluteBridgeDir,
    bridgeFile: path.join(absoluteBridgeDir, fileNames.bridgeFileName),
    bakedFile: path.join(absoluteBridgeDir, fileNames.bakedFileName),
  };
}
export function buildAbsolutePathTypeLink(area: string, filePath: string) {
  const lineMatch = area.match(/line:\s*(\d+)/);
  const lineNumber = lineMatch ? lineMatch[1] : '1';
  const root = process.cwd();

  const absolutePath = path.resolve(root, filePath).replace(/\\/g, '/');

  return `file://${absolutePath}#L${lineNumber}`;
}
