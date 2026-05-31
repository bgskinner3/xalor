// transformer/service/routes-service.ts
import * as path from 'path';
import type {
  TXalorResolvedPaths,
  TTransformerExecuteMode,
} from '../../shared';
import { XALOR_ENV_KEYS } from '../../shared';
import { resolveXalorPaths } from '../../shared/utils';
import type { TXalorLifecycleContext } from '../types';
import { xalorCentralContext } from './context-service';

export class XalorRoutesService {
  public static resolveXalorLifecycle(): TXalorLifecycleContext {
    const watchFlag = process.env[XALOR_ENV_KEYS.watch] === 'true';
    const compileFlag = process.env[XALOR_ENV_KEYS.compile] === 'true';
    const vacuumFlag = process.env[XALOR_ENV_KEYS.vacuum] === 'true';
    const studioFlag = process.env[XALOR_ENV_KEYS.studio] === 'true';
    const clearFlag = process.env[XALOR_ENV_KEYS.clear] === 'true';
    const nodeEnv = process.env.NODE_ENV;
    const isTestEnvironment = nodeEnv === 'test';

    const isWatchMode = watchFlag && !isTestEnvironment;
    const isOneShotCompileMode = compileFlag && !isTestEnvironment;
    const isStudioMode = studioFlag && !isTestEnvironment;
    const isClearMode = clearFlag && !isTestEnvironment;

    // Enforce production vacuum if flag is present OR if executing a native production build pass
    const isProductionVacuumMode =
      vacuumFlag || (nodeEnv === 'production' && !watchFlag && !compileFlag);

    const isDevelopmentPass = isWatchMode || isOneShotCompileMode;

    // ===============================================================
    // COMPILE PHASE MODES
    // ===============================================================
    const compilationPhase = xalorCentralContext.compilationPhase;
    /* prettier-ignore */
    const isIngestRegistryMode = isOneShotCompileMode && compilationPhase === 'INGEST_REGISTRY';
    /* prettier-ignore */
    const isReifyRuntimeMode = isOneShotCompileMode && compilationPhase === 'REIFY_RUNTIME';
    /* prettier-ignore */
    const isStandardInlineMode = !isOneShotCompileMode && compilationPhase === 'STANDARD_INLINE';
    return {
      isWatchMode,
      isOneShotCompileMode,
      isProductionVacuumMode,
      isTestEnvironment,
      isDevelopmentPass,
      isStudioMode,
      isClearMode,
      isIngestRegistryMode,
      isReifyRuntimeMode,
      isStandardInlineMode,
    };
  }

  public static xalorCLIMode(): TTransformerExecuteMode {
    const lifecycle = XalorRoutesService.resolveXalorLifecycle();

    if (lifecycle.isProductionVacuumMode) return 'vacuum';
    if (lifecycle.isOneShotCompileMode) return 'compile';
    if (lifecycle.isStudioMode) return 'studio';
    if (lifecycle.isClearMode) return 'clear';
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
    return resolveXalorPaths(executionContextPath);
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
