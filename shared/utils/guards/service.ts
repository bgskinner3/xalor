import * as fs from 'fs';
import * as path from 'path';
import {
  IS_SOLID_CONFIG_ITEMS,
  ALLOWED_EXTS_SET,
} from '../../constants/configs';
import { isKeyOfArray, isObject, isArray, isKeyInObject } from './objects';
import { isString, isNull, isUndefined } from './primitives';
import type {
  TTypeGuard,
  TAllowedFileExts,
  TIgnoreDirKeys,
  TPackageIndicatorKeys,
  TRepoBoundaryNames,
  TRootDirBranded,
  TPackageManifestContract,
} from '../../types';
/**
 * @utilType Guard
 * @name isIgnoreDirKey
 * @category Guards Primitive
 * @description
 */
export const isIgnoreDirKey: TTypeGuard<TIgnoreDirKeys> = (
  value: unknown,
): value is TIgnoreDirKeys => {
  const { fileSystemMap } = IS_SOLID_CONFIG_ITEMS;
  return (
    isString(value) && isKeyOfArray(fileSystemMap.ignoreDirectories)(value)
  );
};
/**
 * @utilType Guard
 * @name isRepoBoundaryKey
 * @category Guards Primitive
 * @description
 */
export const isRepoBoundaryKey: TTypeGuard<TRepoBoundaryNames> = (
  value: unknown,
): value is TRepoBoundaryNames => {
  const { fileSystemMap } = IS_SOLID_CONFIG_ITEMS;
  return (
    isString(value) && isKeyOfArray(fileSystemMap.workspaceIndicators)(value)
  );
};

/**
 * @utilType Guard
 * @name isRepoBoundaryKey
 * @category Guards Primitive
 * @description
 */
export const isPkgName: TTypeGuard<TPackageIndicatorKeys> = (
  value: unknown,
): value is TPackageIndicatorKeys => {
  const { fileSystemMap } = IS_SOLID_CONFIG_ITEMS;
  return (
    isString(value) && isKeyOfArray(fileSystemMap.packageIndicators)(value)
  );
};

/**
 * @utilType Guard
 * @name isRepoBoundaryKey
 * @category Guards Primitive
 * @description
 */
export const isAllowedFileExt: TTypeGuard<TAllowedFileExts> = (
  value: unknown,
): value is TAllowedFileExts => isString(value) && ALLOWED_EXTS_SET.has(value);
// (alias) type TPackageManifestContract = {
//     readonly files?: readonly unknown[] | undefined;
//     readonly dependencies?: Readonly<Record<string, unknown>> | undefined;
// }
/**
 * @utilType Guard
 * @name isPackageManifest
 * @category Guards Structural
 * @description Validates that an unknown object structure safely contains the optional
 * 'files' array and 'dependencies' object layers required by the package size auditor.
 */
export const isPackageManifest: TTypeGuard<TPackageManifestContract> = (
  value: unknown,
): value is TPackageManifestContract => {
  if (isNull(value) || !isObject(value) || isArray(value)) return false;
  // if (!isKeyInObject('files')(value) || !isKeyInObject('dependencies')(value))
  //   return false;
  /* prettier-ignore */
  const filesBlock = isKeyInObject('files')(value) ? value.files : undefined;
  /* prettier-ignore */
  const depsBlock = isKeyInObject('dependencies')(value) ? value.dependencies : undefined;

  if (!isUndefined(filesBlock) && !isArray(filesBlock)) return false;

  if (!isUndefined(depsBlock)) {
    if (isNull(depsBlock) || !isObject(depsBlock) || isArray(depsBlock)) {
      return false;
    }
  }

  return true;
};

export function isFilesystemRoot(dir: string): boolean {
  return path.dirname(dir) === dir;
}

export function isWorkspace(dir: string): boolean {
  const { fileSystemMap } = IS_SOLID_CONFIG_ITEMS;
  return fileSystemMap.workspaceIndicators.some((file) =>
    fs.existsSync(path.join(dir, file)),
  );
}
/**
 * @utilType Guard
 * @name isDir
 * @category Guards Primitive
 * @description
 */
export const isDir: TTypeGuard<TRootDirBranded> = (
  value: unknown,
): value is TRootDirBranded => {
  try {
    return (
      isString(value) &&
      fs.existsSync(value) &&
      fs.statSync(value).isDirectory()
    );
  } catch {
    return false; // Fail deterministically and safely
  }
};
