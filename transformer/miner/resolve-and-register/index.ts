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
import { TransformerReportService, XalorInvalidTypeError } from '../../error';

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
  // const { isReifyRuntimeMode } = XalorRoutesService.resolveXalorLifecycle();
  const activeExecuteMode = XalorRoutesService.xalorCLIMode();

  // ========================================================================
  // 🪐 PROTECTION LAYER 1: THE COMPILED TYPE RADAR
  // 🟢 FIXED: Implemented at the absolute top! Analyzes the raw ts.Type before
  // allocating memory fragment maps or compiling spatial identities.
  // ========================================================================
  if (!isCompilerTypePure(shapeType, checker)) {
    const errorDetails =
      'Compiler intercepted un-serializable property structures (functions, raw symbols, or private internal prefixes).';

    TransformerReportService.logAnomaly({
      keyName: 'REGISTRATION_REJECTED_BREACH',
      fileLocation: sourceFile.fileName,
      error: errorDetails,
      mode: activeExecuteMode,
    });

    if (activeExecuteMode === 'compile' || activeExecuteMode === 'vacuum') {
      xalorCentralContext.hardResetAllMemoryStores();

      // Resolve the pristine, compiled full dictionary message text body point-free
      const fallbackPanelMessage = TransformerReportService.getErrorMessage(
        'REGISTRATION_REJECTED_BREACH',
        errorDetails,
      );

      throw new XalorInvalidTypeError(
        keyName, // Retains your actual code UUID key token natively
        sourceFile.fileName,
        {
          rule: 'invalid_type_contract',
          message: fallbackPanelMessage,
        },
        activeExecuteMode,
      );
    }
    return { kind: 'primitive', type: 'unknown' };
  }

  // 1. Run the safe, shallow-probe compatibility validation radar
  // TODO: UPDATE ERROR HANDLING
  // verifyAndValidateType({ shapeType, checker, keyName, sourceFile });

  const identity = getSpatialIdentity({
    node,
    sourceFile,
    shapeType,
    checker,
    callNode,
  });

  // Initialize the memory fragment map buffers
  const fragments = new Map<string, TSolidShape>();
  const ctx = createMiningCtx(keyName, fragments);

  // 3. Unroll and serialize the raw type structure down to your pristine JSON nodes
  const shape: TSolidShape = reifyType({ type: shapeType, checker, ctx });

  // ========================================================================
  // 🪐 PROTECTION LAYER 2: POST-REIFICATION DATA STRUCTURAL VERIFICATION.
  // ========================================================================
  if (!isTypeContractResolvabilityPure(shape)) {
    const errorDetails =
      'Generated JSON schema layout contains un-resolvable primitive fallback masks or prohibited object keys.';

    TransformerReportService.logAnomaly({
      keyName: 'REGISTRATION_REJECTED_BREACH',
      fileLocation: sourceFile.fileName,
      error: errorDetails,
      mode: activeExecuteMode,
    });

    if (activeExecuteMode === 'compile' || activeExecuteMode === 'vacuum') {
      xalorCentralContext.hardResetAllMemoryStores();

      const fallbackPanelMessage = TransformerReportService.getErrorMessage(
        'REGISTRATION_REJECTED_BREACH',
        errorDetails,
      );

      throw new XalorInvalidTypeError(
        keyName,
        sourceFile.fileName,
        {
          rule: 'invalid_type_contract',
          message: fallbackPanelMessage,
        },
        activeExecuteMode,
      );
    }
    return shape;
  }

  // 4. Aggregate parameters point-free into the official database synchronization payload
  const payload: TVaultSyncPayload = createPayLoad({
    keyName,
    sourceFile,
    shape,
    identity,
  });
  // if (!isReifyRuntimeMode) {
  //   xalorCentralContext.updateGlobalAndSession(payload);
  //   return shape;
  // }
  // 5. THE BI-DIRECTIONAL COLLISION OVERRIDE GATE
  const isCollision = validateCollisionBorders({
    keyName,
    activeAreaString: identity.area,
    activeAnchorString: identity.anchor,
    currentActiveAbsoluteFile: sourceFile.fileName,
  });

  // 6. THE MUTATION LIFE-CYCLE EXCLUSION CONTEXT
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

    // Execute terminal logging and initial delta database sync passes securely
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
  }

  // Always return the unrolled authentic type layout tree to prevent breaking bundle generation flows
  return shape;
}
