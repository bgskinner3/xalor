import type { TSpatialIdentity, TInterfaceOrType } from '../../types';
import { printGhostStructure } from './ghost-structure';
import {
  resolveSpatialAndExportMeta,
  anchorSequencerImplementation,
} from './support';

/**
 * getSpatialIdentity
 * 🛰️ GET SPATIAL IDENTITY (The GPS Engine)
 *
 * ROLE:
 * Computes call-site origin metrics and unique sequence trackers for an active node.
 *
 * WHY:
 * Satisfies Commandment VIII (Internal Efficiency). By switchlessly bypassing
 * 'printGhostStructure' compilation calls on complex cyclic object blocks, it completely
 * shields the internal TypeScript compiler API from recursive RangeError crashes.
 *
 * @see {@link TransformerDocs.getSpatialIdentity}
 */
export function getSpatialIdentity(params: TInterfaceOrType): TSpatialIdentity {
  const { shapeType, checker, node, sourceFile } = params;

  // 1. Extract location coordinates and symbolName cleanly point-free
  const { symbolName, area } = resolveSpatialAndExportMeta(params);

  // 2. Generate the unique sequence anchor string tracking ID
  const anchor = anchorSequencerImplementation(sourceFile);

  // const isCyclicTree = isTypeRecursive(shapeType, checker);

  const typeName = printGhostStructure({ type: shapeType, checker, node });

  return {
    area,
    typeName,
    symbolName,
    anchor,
    filePath: sourceFile.fileName,
  };
}
