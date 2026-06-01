import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { Stats } from 'fs';
import type {
  TXalorResolvedPaths,
  TCoreFileNameMapper,
  TRecursiveReadonly,
  TRootDirBranded,
} from '../types';
import { IS_SOLID_CONFIG_ITEMS } from '../constants/configs';
import { createBranding } from '../utils';
import {
  isWorkspace,
  isFilesystemRoot,
  isArray,
  isUndefined,
  isDir,
} from '../utils/guards';

export class FileSystemContextService {
  /* prettier-ignore */
  public fileNames: TRecursiveReadonly<TCoreFileNameMapper> = IS_SOLID_CONFIG_ITEMS.fileNames;
  public searchFileNames = IS_SOLID_CONFIG_ITEMS.searchFileNames;
  //
  public projectRoot: TRootDirBranded;

  public envPaths: TRecursiveReadonly<TXalorResolvedPaths>;
  public readonly pathSep = path.sep;

  constructor(startingPath: string = process.cwd()) {
    this.projectRoot = this.findProjectRoot(startingPath);
    this.envPaths = this.resolveXalorPaths();
  }
  public getProjectRoot(path?: string): TRootDirBranded {
    if (path) {
      this.projectRoot = this.findProjectRoot(path);
    }
    return this.projectRoot;
  }

  // ================================================================================
  // ================================================================================
  // PROJECT ROOT TRUTH BEARER
  // ================================================================================
  // ================================================================================

  private *upwardPathIterator(
    startDir: string,
  ): Generator<string, void, unknown> {
    const len = startDir.split(path.sep).length;
    let current = path.resolve(startDir);
    for (let i = 0; i <= len; i++) {
      yield current;
      if (isFilesystemRoot(current)) break;
      current = path.dirname(current);
    }
  }
  public findProjectRoot(startingPath: string): TRootDirBranded {
    const resolved = path.isAbsolute(startingPath)
      ? path.resolve(startingPath)
      : path.resolve(process.cwd(), startingPath);

    const startDir = isDir(resolved) ? resolved : path.dirname(resolved);

    let nearestPackageRoot: string | null = null;
    let foundWorkspace: string | null = null;

    for (const currentDir of this.upwardPathIterator(startDir)) {
      if (isWorkspace(currentDir)) {
        foundWorkspace = currentDir;
        break;
      }

      const isPackageJson = this.fileExists(
        path.join(currentDir, this.searchFileNames.packageJson),
      );
      if (isPackageJson && !nearestPackageRoot) nearestPackageRoot = currentDir;
    }
    const definitivePath =
      foundWorkspace ?? nearestPackageRoot ?? process.cwd();

    return createBranding(definitivePath, 'Path', 'ProjectRoot');
  }

  // ================================================================================
  // ================================================================================
  // CORE REGISTERED FILE PATHS
  // ================================================================================
  // ===============================================================================
  private resolveXalorPaths(
    rootDir: string = this.projectRoot,
  ): TXalorResolvedPaths {
    const fileNames = this.fileNames;
    // CRASH FIX: Enforce string evaluation via explicit valueOf casting
    // to shield path.join from runtime type metadata tokens.
    const rootStr = rootDir.valueOf();
    /* prettier-ignore */ const absoluteCacheDir = path.join( rootStr, 'node_modules', '.cache', fileNames.cacheFolderName);
    /* prettier-ignore */ const absoluteBridgeDir = path.join(rootStr, fileNames.intelFolderName);

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

  // !!! =============================================================================
  // ================================================================================
  // File SYSTEM OPERATIONS
  // ================================================================================
  // !!! =============================================================================

  public resolvePath(...segments: string[]): string;
  public resolvePath(root: string, ...segments: string[]): string;
  /* prettier-ignore */
  public resolvePath( firstOrRoot?: string, ...remainingSegments: string[] ): string {
    if (isUndefined(firstOrRoot))  return this.projectRoot;

    if (isArray(firstOrRoot)) {
      return path.isAbsolute(firstOrRoot)
        ? firstOrRoot
        : path.join(this.projectRoot, firstOrRoot);
    }

    return path.join(firstOrRoot, ...remainingSegments);
  }

  public fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
  public fileStats(filePath: string): Stats {
    return fs.statSync(filePath);
  }
  public getFileLoc(metaUrl: string): string {
    return path.dirname(fileURLToPath(metaUrl));
  }

  public getExt(filePath: string): string {
    return path.extname(filePath);
  }

  public getFileSizeBytes(filePath: string): number {
    const stats = this.fileStats(filePath);

    if (!stats) return 0;
    if (!stats.isFile()) return 0;

    return stats.size;
  }

  public readDir(filePath: string): fs.Dirent[] {
    try {
      return fs.readdirSync(filePath, { withFileTypes: true });
    } catch {
      return [];
    }
  }
  public async asyncReadDir(filePath: string): Promise<fs.Dirent[]> {
    try {
      return await fs.promises.readdir(filePath, { withFileTypes: true });
    } catch {
      return [];
    }
  }
  public async asyncReadText(absoluteFilePath: string): Promise<string> {
    return await fs.promises.readFile(absoluteFilePath, 'utf8');
  }
  public async asyncFileStats(filePath: string): Promise<Stats> {
    return await fs.promises.stat(filePath);
  }
  public getFileName(filePath: string): string {
    return path.basename(filePath);
  }
  public readText(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }
  // ================================================================================
  // ================================================================================
  // FILE STATS AND EXISTANCE
  // ================================================================================
  // ================================================================================
}

export const fsContext = new FileSystemContextService();

// // =========================================================
// // PATH HELPERS
// // =========================================================

// public resolve(...segments: string[]): string {
//   return path.join(this.projectRoot, ...segments);
// }

// // =========================================================
// EXISTENCE + STATS
// // =========================================================

// public getFileSizeBytes(filePath: string): number {
//   const stats = this.getStats(filePath);

//   if (!stats) return 0;
//   if (!stats.isFile()) return 0;

//   return stats.size;
// }

// public getDirectorySizeBytes(dirPath: string): number {
//   if (!this.exists(dirPath)) return 0;

//   try {
//     const stats = fs.statSync(dirPath);
//     if (!stats.isDirectory()) return 0;

//     let total = 0;

//     const entries = fs.readdirSync(dirPath, {
//       withFileTypes: true,
//     });

//     for (const entry of entries) {
//       const fullPath = path.join(dirPath, entry.name);

//       if (entry.isDirectory()) {
//         total += this.getDirectorySizeBytes(fullPath);
//       } else if (entry.isFile()) {
//         total += this.getFileSizeBytes(fullPath);
//       }
//     }

//     return total;
//   } catch {
//     return 0;
//   }
// }

// // =========================================================
// // FILE READ HELPERS
// // =========================================================

// public readText(filePath: string): string | null {
//   if (!this.exists(filePath)) return null;

//   try {
//     return fs.readFileSync(filePath, 'utf-8');
//   } catch {
//     return null;
//   }
// }

// public readJson<T>(filePath: string): T | null {
//   const raw = this.readText(filePath);
//   if (!raw) return null;

//   try {
//     return JSON.parse(raw) as T;
//   } catch {
//     return null;
//   }
// }

// // =========================================================
// // DIRECTORY HELPERS
// // =========================================================

// public readDir(filePath: string): fs.Dirent[] {
//   if (!this.exists(filePath)) return [];

//   try {
//     return fs.readdirSync(filePath, {
//       withFileTypes: true,
//     });
//   } catch {
//     return [];
//   }
// }

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
 * OLD CRAWLER
 */
// private crawlUpwards(
//   dir: string,
//   nearestPackageRoot: string | null,
// ): TRootDirBranded | null {
//   if (isFilesystemRoot(dir)) return nearestPackageRoot;

//   if (isWorkspace(dir)) return dir;

//   // 2. Local Package Boundary Logging (Deferred Capture)
//   const hasPackageJson = this.fileExists(path.join(dir, 'package.json'));
//   // Update the tracker only on the first package.json discovery (the closest one to execution)
//   const updatedPackageRoot =
//     hasPackageJson && !nearestPackageRoot ? dir : nearestPackageRoot;

//   return this.crawlUpwards(path.dirname(dir), updatedPackageRoot);
// }
// public findProjectRoot(startingPath: string): TRootDirBranded {
//   const resolved = path.isAbsolute(startingPath)
//     ? path.resolve(startingPath)
//     : path.resolve(process.cwd(), startingPath);

//   const startDir =
//     this.fileExists(resolved) && fs.statSync(resolved).isDirectory()
//       ? resolved
//       : path.dirname(resolved);

//   // Kick off a single-pass crawl starting with no package fallback found yet
//   return this.crawlUpwards(startDir, null) ?? process.cwd();
// }
