import type { TSolidShape, TVaultSyncPayload } from '../../../shared/types';
import { isStringMirrored } from './predicate-guards';
import type { TManifestChecks } from '../../types';

export function isManifestModified({
  existingPayload,
  newArea,
  newFilePath,
  newAnchor,
}: TManifestChecks): boolean {
  const { area, filePath, anchor } = existingPayload;

  const isFileUnchanged = isStringMirrored([filePath, newFilePath]);
  const isAreaUnchanged = isStringMirrored([area, newArea]);
  const isAnchorUnchanged = isStringMirrored([anchor, newAnchor]);

  return !isFileUnchanged || !isAreaUnchanged || !isAnchorUnchanged;
}

/**
 *  GRAPH INSTANCE COMPARER
 *
 * !!! Compares interned memory address pointers to check for shape alterations.
 * !!! Runs at sub-nanosecond speeds by bypassing deep loops and string parsing.
 *
 * @see {@link TransformerDocs.isBluePrintModified}
 */
export function isBlueprintModified(
  existingPayload: TVaultSyncPayload,
  newShape: TSolidShape,
): boolean {
  // Bypasses deep loops and serialization checks completely during fast file saves
  return existingPayload.shape !== newShape;
}
type TRegistryChecks = {
  readonly existingPayload: TVaultSyncPayload;
  readonly newTypeName: TVaultSyncPayload['typeName'];
  readonly newSymbolName: TVaultSyncPayload['symbolName'];
};
export function isRegistryModified({
  existingPayload,
  newTypeName,
  newSymbolName,
}: TRegistryChecks): boolean {
  /* prettier-ignore */
  const isTypeUnchanged = isStringMirrored([existingPayload.typeName, newTypeName]);
  /* prettier-ignore */
  const isSymbolUnchanged = isStringMirrored([existingPayload.symbolName, newSymbolName]);

  return !isTypeUnchanged || !isSymbolUnchanged;
}

/**
 * isKeyNameModified
 * 🔑 ANCHOR SHIELD: UNIQUE KEY MATCH ROUTINE
 *
 * ROLE:
 * Evaluates whether an incoming key identifier name differs from its historical target.
 */
export function resolveModifiedKeyName(
  keyName: string,
  newKeyName: string,
): { resolvedKeyName: string; isModified: boolean } {
  const resolvedKeyName = keyName !== newKeyName ? keyName : newKeyName;
  // Direct primitive string check; returns true if the user changed the key string label
  return { resolvedKeyName, isModified: keyName !== newKeyName };
}
