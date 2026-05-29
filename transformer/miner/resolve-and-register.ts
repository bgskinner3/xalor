// transformer/miner/resolve-and-register.ts
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import type { TSolidShape, TVaultSyncPayload } from '../../shared';
import type {
  TFlushToRegistryParams,
  TCreateVaultSyncPayLoad,
  TTypeResolutionParams,
  TVerifyAndValidateType,
} from '../types';
import * as path from 'path';
import { getSpatialIdentity } from './spatial-identity';
import { reifyType } from '../reifiers';
import { createMiningCtx } from '../utils';
import { executeVaultMutation, determineCUDMode } from '../lifecycle';
import { xalorCentralContext, XalorRoutesService } from '../service';
import { verifyTypeResolvability } from './type-resolver';
import { XalorInvalidTypeError } from '../error';
/**
 * flushToRegistry
 *
 * Unpacks and registers the parent type along with recursive child
 * sub-fragments inside the global process context maps.
 *
 * @see {@link TransformerDocs.flushToRegistry}
 */
function flushToRegistry({
  key,
  fragments,
  payload,
}: TFlushToRegistryParams): void {
  // track the parent key as part of the active compilation pass
  xalorCentralContext.activePassKeys.add(key);

  // prevent from dropping out during 'noop' dev-watch saves!
  xalorCentralContext.addGlobalRegistry(payload);
  xalorCentralContext.addSessionRegistry({
    keyName: payload.key,
    area: payload.area,
    anchor: payload.anchor,
    filePath: payload.filePath,
  });

  const normalizedRelativePath = path
    .relative(process.cwd(), payload.filePath)
    .split(path.sep)
    .join('/');

  // Flush the remaining shredded sub-fragments cleanly into the database drawers
  fragments.forEach((fShape, fKey) => {
    xalorCentralContext.activePassKeys.add(fKey);
    xalorCentralContext.addGlobalRegistry({
      ...payload,
      key: fKey,
      area: `${payload.area} (Fragment)`,
      symbolName: `${payload.symbolName ?? 'unknown'} (Fragment)`,
      typeName: 'Fragment',
      shape: fShape,
      filePath: normalizedRelativePath,
    });

    xalorCentralContext.addSessionRegistry({
      keyName: fKey,
      area: payload.area,
      anchor: payload.anchor,
      filePath: payload.filePath,
    });
  });
}

/**
 * createPayLoad
 *
 * ROLE:
 * Pure, stateless factory allocating the standard TVaultSyncPayload metadata envelope container.
 */
const createPayLoad = ({
  keyName,
  shape,
  sourceFile,
  identity,
}: TCreateVaultSyncPayLoad): TVaultSyncPayload => ({
  key: keyName,
  filePath: sourceFile.fileName,
  area: identity.area,
  symbolName: identity.symbolName ?? 'unknown',
  typeName: identity.typeName,
  anchor: identity.anchor,
  shape,
  version: IS_SOLID_CONFIG_ITEMS.solidVersion,
});

/**
 * verifyAndValidateType
 * THE EXTRACTION GUARDHOUSE FILTER
 *
 * ROLE:
 * Executes the structural eligibility check for a call-site registration type.
 * It immediately halts the build process if a type breaks our data invariants.
 */
const verifyAndValidateType = (params: TVerifyAndValidateType): void => {
  const { shapeType, checker, keyName, sourceFile } = params;
  const mode = XalorRoutesService.xalorCLIMode();
  const validationFailure = verifyTypeResolvability(
    shapeType,
    checker,
    keyName,
  );

  if (validationFailure && validationFailure.rule) {
    throw new XalorInvalidTypeError(
      keyName,
      sourceFile.fileName,
      validationFailure,
      mode,
    );
  }
};
/**
 * resolveAndRegisterType
 *
 * Centralized Type Extraction, Validation, and Flat Ingestion Coordinator.
 *
 * @see {@link TransformerDocs.resolveAndRegisterType}
 */
export function resolveAndRegisterType({
  keyName,
  shapeType,
  node,
  sourceFile,
  checker,
}: TTypeResolutionParams): TSolidShape {
  verifyAndValidateType({ shapeType, checker, keyName, sourceFile });

  const identity = getSpatialIdentity({ node, sourceFile, shapeType, checker });

  const fragments = new Map<string, TSolidShape>();
  const ctx = createMiningCtx(keyName, fragments);

  /* prettier-ignore */
  const shape: TSolidShape = reifyType({ type: shapeType, checker, ctx });
  /* prettier-ignore */
  const payload: TVaultSyncPayload = createPayLoad({ keyName, sourceFile, shape, identity });

  const assignedCudMode = determineCUDMode({
    keyName,
    newTypeName: identity.typeName,
    newArea: identity.area,
    newSymbolName: identity.symbolName,
    newFilePath: identity.filePath,
    newShape: payload.shape,
    newAnchor: identity.anchor,
  });

  // Execute terminal logs and initial delta checks
  executeVaultMutation({
    mode: assignedCudMode,
    payload,
    identityArea: identity.area,
  });

  flushToRegistry({
    key: keyName,
    fragments,
    payload,
  });

  return shape;
}
