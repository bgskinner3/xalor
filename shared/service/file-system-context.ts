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
  TPathFinderOptions,
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
  isString,
  isNull,
} from '../utils';
import { isValidSolidShape } from '../shape-domain';
class FileSystemContextService {
  public vaultFallback: TTripleKV = DEFAULT_VAULT_SHAPE_FALLBACK;
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
  public resolveXalorPaths(
    rootDir: string = this.projectRoot,
  ): TXalorResolvedPaths {
    // const { externalCache } = INTERNAL_EXECUTION_GATES;

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
  public writeText(filePath: string, payload: string): void {
    fs.writeFileSync(filePath, payload, 'utf-8');
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

  public ingestVaultSnapshotFromDiskSync(): TTripleKV {
    try {
      // 1. Guard against uninitialized database cache storage files on disk
      if (!this.fileExists(this.envPaths.vaultFile)) {
        return this.vaultFallback;
      }

      // 2. Execute blocking local read pass to capture disk bytes instantly
      const rawJsonString = this.readText(this.envPaths.vaultFile);
      const parsedVault: unknown = JSON.parse(rawJsonString);

      // 3. Structural Integrity verification check
      if (!parsedVault || !isTripleKVShape(parsedVault)) {
        return this.vaultFallback;
      }

      const candidate = parsedVault;
      const blueprintKeys = ObjectUtils.keys(candidate.blueprints);
      const blueprints = candidate.blueprints;

      // 4. Validate every individual child node shape to protect the registry graph
      for (const key of blueprintKeys) {
        const shapeNode = blueprints[key];
        if (!isValidSolidShape(shapeNode)) {
          return this.vaultFallback;
        }
      }

      return candidate;
    } catch {
      // Return pristine baseline fallback configs on unexpected local I/O anomalies
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

  // ================================================================================
  // ================================================================================
  // ADVANCED FILE SEARCH
  // ================================================================================
  // ================================================================================
  /**
   * locateRuntimeArtifactPath -- ENVIRONMENT-AGNOSTIC RECURSIVE DISCOVERY ENGINE
   *
   * ROLE:
   * Dynamically traverses up the directory tree using functional recursion.
   * Evaluates local sub-directories and structural parent steps exhaustively
   * until the target descriptor filename is matched on disk.
   *
   * Complies with:
   * - COMMANDMENT IV: Strict single semantic responsibility.
   * - COMMANDMENT IX: Zero type escape shortcuts (No 'any', 'as', '!', or 'switch').
   *
   * @param fileName - Target filename layout to find on disk (e.g., 'xalor-vault.json').
   * @param options - Custom overrides to control start directories or lookup buckets.
   * @returns The resolved absolute filesystem path string.
   *
   * @example
   * // 1. Standard Fallback Invocation (Uses process.cwd() base):
   * const targetPath = fsContext.locateRuntimeArtifactPath('xalor-vault.json');
   *
   * @example
   * // 2. Build-to-Runtime Location Context Invocation (Recommended for dist layouts):
   * const targetPath = fsContext.locateRuntimeArtifactPath('xalor-vault.json', {
   *   startingDirectory: fsContext.getFileLoc(import.meta.url),
   *   targetSubDirs: ['dist', 'dist-xalor']
   * });
   */
  public locateRuntimeArtifactPath(
    fileName: string,
    options?: TPathFinderOptions,
  ): string {
    if (!isString(fileName) || fileName.trim().length === 0) {
      throw new Error(
        'Path resolution failed: Target filename must be a valid, non-empty string.',
      );
    }

    // Define fallback defaults cleanly upfront
    let targetSubDirs: readonly string[] = ['dist', 'dist-xalor', '.xalor'];
    let customStartDir = '';

    // Safe parameters extraction using pure language-level safety checks
    if (!isNull(options) && !isUndefined(options)) {
      if (
        !isNull(options.targetSubDirs) &&
        !isUndefined(options.targetSubDirs)
      ) {
        targetSubDirs = options.targetSubDirs;
      }
      if (isString(options.startingDirectory)) {
        customStartDir = options.startingDirectory;
      }
    }

    // Establish base directory context using process.cwd() or explicit service preferences
    // Uses 'this.resolvePath' instead of loose path hooks to enforce class state isolation.
    const runtimeStartDir: string =
      customStartDir.trim().length > 0
        ? this.resolvePath(customStartDir)
        : this.resolvePath(process.cwd());

    // Kick off the recursion engine bound to this instance context
    const resolvedArtifactPath: string = this.findPathRecursive(
      runtimeStartDir,
      fileName,
      targetSubDirs,
    );

    // Testing & Runtime Discovery Observability Log
    console.log(
      `\x1b[35m🔍 [Xalor Path Finder] Discovery complete! Target file: "${fileName}" -> Resolved absolute path: [${resolvedArtifactPath}]\x1b[0m`,
    );

    return resolvedArtifactPath;
  }
  private findPathRecursive(
    currentDir: string,
    fileName: string,
    targetSubDirs: readonly string[],
  ): string {
    const totalSubDirs = targetSubDirs.length;
    for (let i = 0; i < totalSubDirs; i++) {
      const subDir = targetSubDirs[i];
      if (isString(subDir)) {
        const structuralTarget = this.resolvePath(currentDir, subDir, fileName);
        if (this.fileExists(structuralTarget)) {
          return structuralTarget;
        }
      }
    }

    const immediateTarget = this.resolvePath(currentDir, fileName);
    if (this.fileExists(immediateTarget)) return immediateTarget;

    const upperDirectory = this.resolvePath(currentDir, '..');

    if (upperDirectory === currentDir) {
      throw new Error(
        `Runtime filesystem resolution failed: Target artifact "${fileName}" could not be located inside execution context.`,
      );
    }

    // Tail-Recursive Step: Pass state forward cleanly via instance inheritance
    return this.findPathRecursive(upperDirectory, fileName, targetSubDirs);
  }
}

export const fsContext = new FileSystemContextService();
