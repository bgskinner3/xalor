// transformer/miner/resolve-and-register.ts
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import type { TSolidShape, TVaultSyncPayload } from '../../shared';
import type {
  TFlushToRegistryParams,
  TCreateVaultSyncPayLoad,
  TTypeResolutionParams,
} from '../types';
import * as path from 'path';
import { getSpatialIdentity } from './spatial-identity';
import { reifyType } from '../reifiers';
import { createMiningCtx } from '../utils';
import { executeVaultMutation, determineCUDMode } from '../lifecycle';
import { xalorCentralContext } from '../service';
/**
 *  flushToRegistry
 *
 *  Unpacks and registers recursive child sub-fragments inside the global process cache.
 *
 * @see {@link TransformerDocs.flushToRegistry}
 */
function flushToRegistry({
  key,
  fragments,
  payload,
}: TFlushToRegistryParams): void {
  xalorCentralContext.activePassKeys.add(key);

  const normalizedRelativePath = path
    .relative(process.cwd(), payload.filePath)
    .split(path.sep)
    .join('/');

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
  anchor: identity?.anchor,
  shape,
  version: IS_SOLID_CONFIG_ITEMS.solidVersion,
});

/**
 *  resolveAndRegisterType
 *
 *  Centralized Type Extraction, Validation, and Flat Ingestion Coordinator.
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
  // const lifecycle = resolveXalorLifecycle();

  // 1. Compute spatial origin metrics safely passing sourceFile
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

  executeVaultMutation({
    mode: assignedCudMode,
    payload,
    identityArea: identity.area,
  });

  // THE REGISTRATION FLUSH HANDSHAKE:
  flushToRegistry({
    key: keyName,
    fragments,
    payload,
  });

  return shape;
}
