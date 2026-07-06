// transformer/miner/resolve-and-register.ts
import type { TSolidShape, TVaultSyncPayload } from '../../../shared';
import type { TTypeResolutionParams } from '../../types';
import { getSpatialIdentity } from '../spatial-identity';
import { reifyType } from '../../reifiers';
import { createMiningCtx } from '../../utils';
import { validateCollisionBorders } from '../collision-border';
import { executeVaultMutation, determineCUDMode } from '../../lifecycle';
import { createPayLoad } from './support';
import { flushToRegistry } from './flush-to-registry';
import { XalorRoutesService, xalorCentralContext } from '../../service';
import {
  isCompilerTypePure,
  isTypeContractResolvabilityPure,
} from '../sentry-layer';

import { XalorError, errorReportService } from '../../../shared';
/**
 * resolveAndRegisterType
 * 🪐 THE INGESTION COORDINATOR GATEHOUSE
 *
 * ROLE:
 * Coordinates the full extraction, shape unrolling, boundary verification,
 * and persistence mapping passes for an incoming validation type node block.
 *
 * @see {@link TransformerDocs.resolveAndRegisterType}
 *
 */
export function resolveAndRegisterType({
  keyName,
  shapeType,
  node,
  sourceFile,
  checker,
  callNode,
}: TTypeResolutionParams): TSolidShape {
  const activeExecuteMode = XalorRoutesService.xalorCLIMode();
  const lifecycle = XalorRoutesService.resolveXalorLifecycle();

  // ========================================================================
  // 1: THE COMPILED TYPE RADAR
  // Analyzes the raw ts.Type before allocating memory fragment maps.
  // ========================================================================
  if (!isCompilerTypePure(shapeType, checker)) {
    const errorDetails =
      'Compiler intercepted un-serializable property structures (functions, raw symbols, or private internal prefixes).';
    errorReportService.logAnomaly<'TRANSFORMER_DIAGNOSTIC_COMPILER'>(
      'TRANSFORMER_DIAGNOSTIC_COMPILER',
      {
        keyName: 'REGISTRATION_REJECTED_BREACH',
        fileLocation: sourceFile.fileName,
        error: errorDetails,
        mode: activeExecuteMode,
      },
    );
    if (activeExecuteMode === 'compile' || activeExecuteMode === 'vacuum') {
      xalorCentralContext.hardResetAllMemoryStores();
      const fallbackPanelMessage =
        errorReportService.getTransformerErrorMessage(
          'TRANSFORMER_DIAGNOSTIC_COMPILER',
          'REGISTRATION_REJECTED_BREACH',
          errorDetails,
        );
      throw XalorError.InvalidType(
        keyName,
        sourceFile.fileName,
        { rule: 'invalid_type_contract', message: fallbackPanelMessage },
        activeExecuteMode,
      );
    }
    return { kind: 'primitive', type: 'unknown' };
  }

  const identity = getSpatialIdentity({
    node,
    sourceFile,
    shapeType,
    checker,
    callNode,
  });
  const fragments = new Map<string, TSolidShape>();
  const ctx = createMiningCtx(keyName, fragments);
  const shape: TSolidShape = reifyType({ type: shapeType, checker, ctx });

  // ========================================================================
  //  2: POST-REIFICATION DATA STRUCTURAL VERIFICATION
  // ========================================================================
  if (!isTypeContractResolvabilityPure(shape)) {
    const errorDetails =
      'Generated JSON schema layout contains un-resolvable primitive fallback masks or prohibited object keys.';
    errorReportService.logAnomaly('TRANSFORMER_DIAGNOSTIC_COMPILER', {
      keyName: 'REGISTRATION_REJECTED_BREACH',
      fileLocation: sourceFile.fileName,
      error: errorDetails,
      mode: activeExecuteMode,
    });
    if (activeExecuteMode === 'compile' || activeExecuteMode === 'vacuum') {
      xalorCentralContext.hardResetAllMemoryStores();
      const fallbackPanelMessage =
        errorReportService.getTransformerErrorMessage(
          'TRANSFORMER_DIAGNOSTIC_COMPILER',
          'REGISTRATION_REJECTED_BREACH',
          errorDetails,
        );
      throw XalorError.InvalidType(
        keyName,
        sourceFile.fileName,
        { rule: 'invalid_type_contract', message: fallbackPanelMessage },
        activeExecuteMode,
      );
    }
    return shape;
  }

  const payload: TVaultSyncPayload = createPayLoad({
    keyName,
    sourceFile,
    shape,
    identity,
  });

  const isCollision = lifecycle.isReifyRuntimeMode
    ? false
    : validateCollisionBorders({
        keyName,
        activeAreaString: identity.area,
        activeAnchorString: identity.anchor,
        currentActiveAbsoluteFile: sourceFile.fileName,
      });

  // ========================================================================
  // THE MUTATION LIFE-CYCLE EXCLUSION CONTEXT
  // ========================================================================
  if (!isCollision) {
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
    flushToRegistry({ key: keyName, fragments, payload });
  }

  return shape;
}
