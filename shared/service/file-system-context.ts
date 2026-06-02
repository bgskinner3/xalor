import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { Stats } from 'fs';
import type {
  TXalorResolvedPaths,
  TCoreFileNameMapper,
  TRecursiveReadonly,
  TRootDirBranded,
  TTripleKV,
} from '../types';
import {
  IS_SOLID_CONFIG_ITEMS,
  DEFAULT_VAULT_SHAPE_FALLBACK,
} from '../constants';
import { createBranding, ObjectUtils } from '../utils';
import {
  isWorkspace,
  isFilesystemRoot,
  isArray,
  isUndefined,
  isDir,
  isTripleKVShape,
  isValidSolidShape,
} from '../utils/guards';

export class FileSystemContextService {
  private vaultFallback: TTripleKV = DEFAULT_VAULT_SHAPE_FALLBACK;
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
  public async asyncWrite(filePath: string, payload: string): Promise<void> {
    await fs.promises.writeFile(filePath.valueOf(), payload, 'utf8');
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
  // METADATA HANDLERS
  // ================================================================================
  // ================================================================================
  public async ingestVaultSnapshotFromDisk(): Promise<TTripleKV> {
    try {
      if (!this.fileExists(this.envPaths.vaultFile)) return this.vaultFallback;

      const rawJsonString = await this.asyncReadText(this.envPaths.vaultFile);
      const parsedVault: unknown = JSON.parse(rawJsonString);

      if (!parsedVault || !isTripleKVShape(parsedVault))
        return this.vaultFallback;
      const candidate = parsedVault;

      const blueprintKeys = ObjectUtils.keys(candidate.blueprints);
      const blueprints = candidate.blueprints;

      for (const key of blueprintKeys) {
        const shapeNode = blueprints[key];
        if (!isValidSolidShape(shapeNode)) return this.vaultFallback;
      }

      return candidate;
    } catch {
      // TODO: ERROR HANDLER
      return this.vaultFallback;
    }
  }

  /** @see {@link AuditServiceDocs.syncAuditBaselineFile} */
  public async syncAuditedBaselineFile(vault: TTripleKV): Promise<void> {
    try {
      const optimizedJsonString = JSON.stringify(vault, null, 2);

      await this.asyncWrite(this.envPaths.baselineFile, optimizedJsonString);
    } catch {
      // TODO: add our Error handler logger
    }
  }

  /* prettier-ignore */
  public async ingestBaselineVault(baselineFilePath: string): Promise<TTripleKV> {
    try {
      const rawBaselineString = await this.asyncReadText(baselineFilePath);
      return JSON.parse(rawBaselineString);
    } catch {
      // TODO: ADD ERROR LOGGER
      return this.vaultFallback;
    }
  }
}

export const fsContext = new FileSystemContextService();
