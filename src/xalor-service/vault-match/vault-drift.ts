import type {
  IXalorDriftContext,
  TResolveDriftReturnConstraint,
  TDriftErrorInterceptor,
} from '../../models/types';
import type { TSolidShape } from '../../../shared';
import {
  isRegistryKey,
  isRecord,
  isString,
  isNull,
  hasOwnProperty,
  isKeyInObject,
  isInstanceOf,
  isArray,
  isUndefined,
  // mergeDeep,
  isFunction,
} from '../../../shared/utils';
import {
  isObjectShape,
  isArrayShape,
} from '../../../shared/shape-domain/guards';
import { xalethorVaultKeeper } from '../vault-keeper';
// import { xalethorVaultValidation } from '../vault-validation';
import { xalethorVaultDiagnostics } from '../vault-diagnostics';
import {
  XALOR_MATCH_DRIFT_ERROR_MAPPER,
  XALOR_MATCH_DRIFT_RULE_KEYS,
} from '../../models';
import {
  synthesizeDriftMatrixBlueprint,
  getMissingKeysMatrix,
  handleRecoveryStrategy,
  // seedCurrentProductionFrame,
  purgeMissingOptionalFields,
  refineAncestralContract,
  refineToCurrentModel,
  refinePayloadContract,
  executeSurgicalFallbackInflation,
} from '../../utils';

class XalethorVaultMatchDrift {
  /**
   * @see {@link xalorDriftClassDocs.projectPrunedFrame}
   */
  private projectPrunedFrame(
    hybridBlueprint: TSolidShape,
    targetPayload: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!isObjectShape(hybridBlueprint)) return targetPayload;
    if (!hybridBlueprint || !hybridBlueprint.properties) return targetPayload;

    const allowedProperties = hybridBlueprint.properties;
    const pristineEgressFrame: Record<string, unknown> = {};

    for (const currentKey in targetPayload) {
      if (hasOwnProperty(targetPayload, currentKey)) {
        /* prettier-ignore */
        if (hasOwnProperty(allowedProperties, currentKey)) {
          pristineEgressFrame[currentKey] = targetPayload[currentKey];
        }
      }
    }

    return pristineEgressFrame;
  }
  /**
   * @see {@link xalorDriftClassDocs.projectOmitProperties}
   */
  private projectOmitProperties(
    targetPayload: Record<string, unknown>,
    omitPaths?: string[],
  ): Record<string, unknown> {
    const cleanOutput: Record<string, unknown> = {};

    for (const key in targetPayload) {
      if (hasOwnProperty(targetPayload, key)) {
        if (!omitPaths || !omitPaths.includes(key)) {
          cleanOutput[key] = targetPayload[key];
        }
      }
    }

    return cleanOutput;
  }

  /**
   * @see {@link xalorDriftClassDocs.tryProjectionGate}
   */
  private tryProjectionGate(
    currentBlueprintKey: string,
    ancestralBlueprintKey: string | undefined,
    payload: Record<string, unknown>,
    isStrictEnabled: boolean,
  ): Record<string, unknown> | false {
    if (!isRegistryKey(currentBlueprintKey)) return false;
    /* prettier-ignore */
    const modernBlueprint = xalethorVaultKeeper.peek('blueprint', currentBlueprintKey);

    if (!modernBlueprint || !isObjectShape(modernBlueprint)) return false;

    const modernProps = modernBlueprint.properties;

    const ancestralBlueprint =
      ancestralBlueprintKey && isRegistryKey(ancestralBlueprintKey)
        ? xalethorVaultKeeper.peek('blueprint', ancestralBlueprintKey)
        : undefined;
    const ancestralProps =
      ancestralBlueprint && isObjectShape(ancestralBlueprint)
        ? ancestralBlueprint.properties
        : null;

    const projectedContainer: Record<string, unknown> = {};

    for (const currentKey in payload) {
      if (hasOwnProperty(payload, currentKey)) {
        // Lane A: Validate against today's released production layout contract mapping
        if (hasOwnProperty(modernProps, currentKey)) {
          projectedContainer[currentKey] = payload[currentKey];
          // Lane B: Fallback to historical blueprint constraints mapping
        } else if (
          ancestralProps &&
          hasOwnProperty(ancestralProps, currentKey)
        ) {
          projectedContainer[currentKey] = payload[currentKey];
          // Lane C: Rigid structural gatekeeper
        } else {
          if (isStrictEnabled) return false;
        }
      }
    }

    return projectedContainer;
  }

  /**
   * @see {@link xalorDriftClassDocs.executeEvolutionaryLane}
   */
  private executeEvolutionaryLane<K extends TActiveDriftRegistryKeys>(
    payload: Record<string, unknown>,
    ctx: IXalorDriftContext<K>,
    laneMode: 'current' | 'ancestor',
  ): Record<string, unknown> | false {
    const { ancestralKey, currentKey } = ctx;
    if (!isString(currentKey) || !isString(ancestralKey)) return false;

    const processedPayload = ctx.strict
      ? this.tryProjectionGate(currentKey, ancestralKey, payload, true)
      : payload;

    if (processedPayload === false) return false;
    if (laneMode === 'current') {
      // const hydratedFrame = seedCurrentProductionFrame({
      //   processedPayload,
      //   currentKey,
      // });
      if (refineToCurrentModel<K, string>(processedPayload, currentKey)) {
        const executionResult = ctx.current(processedPayload);
        if (isRecord(executionResult)) {
          return executionResult;
        }
      }
    }
    if (laneMode === 'ancestor') {
      if (refineAncestralContract<K>(processedPayload)) {
        const mutatedLegacyOutput = ctx.v1_ancestor(processedPayload);
        if (isRecord(mutatedLegacyOutput)) {
          return mutatedLegacyOutput;
        }
      }
    }
    return false;
  }

  // ====================================================================================================
  // ====================================================================================================
  // ====================================================================================================
  // MATCH SERVICE DRIFT HANDLER & METHODS
  // ====================================================================================================
  // ====================================================================================================
  // ====================================================================================================

  /**
   * @see {@link xalorDriftClassDocs.executeIngressPerimeterGuards}
   */
  private executeIngressPerimeterGuards<K extends TActiveDriftRegistryKeys>(
    payload: unknown,
    ctx: IXalorDriftContext<K>,
    injectedKey: K,
  ): Record<string, unknown> {
    const { ancestralKey, currentKey } = ctx;

    // =============================================================================
    // GUARD 1: VERIFY INBOUND PACKET IS A VALID Object RECORD
    // =============================================================================
    if (!isRecord(payload)) {
      return this.driftErrorInterceptor({
        ctx,
        injectedKey,
        ruleKey: 'MALFORMED_NON_RECORD_PAYLOAD',
        customContextMessage:
          'The inbound network stream payload failed basic dictionary record layout checks. Traversal aborted.',
      });
    }

    // =============================================================================
    // GUARD 2: VERIFY SYSTEM REGISTRY LOGISTICS IDENTIFIERS
    // =============================================================================
    if (!isRegistryKey(currentKey) || !isRegistryKey(ancestralKey)) {
      return this.driftErrorInterceptor({
        ctx,
        injectedKey,
        ruleKey: 'MALFORMED_REGISTRY_KEYS',
        customContextMessage: `currentKey: "${String(currentKey)}", ancestralKey: "${String(ancestralKey)}".`,
      });
    }

    return payload;
  }

  /**
   * @see {@link xalorDriftClassDocs.hydrateMissingBlueprintStructures}
   */
  private hydrateMissingBlueprintStructures(
    hybridBlueprint: TSolidShape | null,
    workingFrame: Record<string, unknown>,
  ): void {
    /* prettier-ignore */
    if (!hybridBlueprint || hybridBlueprint.kind !== 'object' || !hybridBlueprint.properties) {
      return;
    }

    const modernProps = hybridBlueprint.properties;

    // Satisfies COMMANDMENT VIII: Fast register loop iterating memory properties point-free
    for (const targetKey in modernProps) {
      if (hasOwnProperty(modernProps, targetKey)) {
        if (!hasOwnProperty(workingFrame, targetKey)) {
          const propertyDescriptor = modernProps[targetKey];
          const internalShape = propertyDescriptor.shape;

          if (isArrayShape(internalShape)) {
            Reflect.set(workingFrame, targetKey, []);
          } else if (isObjectShape(internalShape)) {
            Reflect.set(workingFrame, targetKey, {});
          }
        }
      }
    }
  }

  /**
   * @see {@link xalorDriftClassDocs.executeEgressSanitization}
   */
  private executeEgressSanitization<K extends TActiveDriftRegistryKeys>(
    workingFrame: Record<string, unknown>,
    activeHybridBlueprint: TSolidShape,
    ctx: IXalorDriftContext<K>,
  ): Record<string, unknown> | null {
    const { omit: omitPathsList } = ctx;

    const hasOmitPaths = isRecord(omitPathsList) || isArray(omitPathsList);
    const cleanOutput = this.projectOmitProperties(
      workingFrame,
      hasOmitPaths ? omitPathsList : undefined,
    );

    const pristineEgressFrame = this.projectPrunedFrame(
      activeHybridBlueprint,
      cleanOutput,
    );

    /* prettier-ignore */
    if (!isNull(pristineEgressFrame) && !isUndefined(pristineEgressFrame)) return pristineEgressFrame;

    return null;
  }

  /**
   * @see {@link xalorDriftClassDocs.executeDriftMatcher}
   */
  public executeDriftMatcher<K extends TActiveDriftRegistryKeys>(
    payload: unknown,
    ctx: IXalorDriftContext<K>,
    injectedKey: K,
  ): TResolveDriftReturnConstraint<K> {
    const activeHybridBlueprint = synthesizeDriftMatrixBlueprint(ctx, payload);
    // console.dir(activeHybridBlueprint, {
    //   depth: null,
    //   colors: true,
    // });

    /* prettier-ignore */
    const guardedPayload = this.executeIngressPerimeterGuards<K>(payload, ctx, injectedKey);

    /* prettier-ignore */
    const chronologicalWorkingFrame: Record<string, unknown> = { ...guardedPayload };
    // =============================================================================
    // STEP A: Yesterday's Phase (Ancestral Evolution Pass)
    // =============================================================================
    /* prettier-ignore */
    const upCastedLegacyFields = this.executeEvolutionaryLane<K>(guardedPayload, ctx, 'ancestor');

    if (upCastedLegacyFields !== false) {
      for (const targetKey in upCastedLegacyFields) {
        if (hasOwnProperty(upCastedLegacyFields, targetKey)) {
          const upCastedValue = upCastedLegacyFields[targetKey];
          if (!isUndefined(upCastedValue)) {
            chronologicalWorkingFrame[targetKey] = upCastedValue;
          }
        }
      }
    }

    // =============================================================================
    // THE AUTOMATED BLUEPRINT METADATA INFLATION BRIDGE
    // =============================================================================
    /* prettier-ignore */
    this.hydrateMissingBlueprintStructures(activeHybridBlueprint, chronologicalWorkingFrame);

    // =============================================================================
    // STEP B: Today's Phase (Active Generation Pass Handshake)
    // =============================================================================
    /* prettier-ignore */
    const chainedPipelineResult = this.executeEvolutionaryLane<K>(chronologicalWorkingFrame, ctx, 'current');

    if (chainedPipelineResult !== false) {
      for (const targetKey in chainedPipelineResult) {
        if (hasOwnProperty(chainedPipelineResult, targetKey)) {
          chronologicalWorkingFrame[targetKey] =
            chainedPipelineResult[targetKey];
        }
      }
    }

    // =============================================================================
    // STEP C: Centralized Surgical Egress Sanitization Pass
    // =============================================================================
    const prunedEgressAsset = this.executeEgressSanitization<K>(
      chronologicalWorkingFrame,
      activeHybridBlueprint,
      ctx,
    );
    if (!isNull(prunedEgressAsset)) {
      /* prettier-ignore */
      return this.executeDefaultFallback<K>( ctx, prunedEgressAsset, injectedKey, activeHybridBlueprint);
    }

    /* prettier-ignore */
    return this.driftErrorInterceptor({injectedKey, ruleKey: 'UNEXPECTED_STREAM_COLLAPSE'})
  }

  // ====================================================================================================
  // ====================================================================================================
  // ====================================================================================================
  // MATCH SERVICE DRIFT ERROR HANLDER
  // ====================================================================================================
  // ====================================================================================================
  // ====================================================================================================
  /**
   * @see {@link xalorDriftClassDocs.driftErrorInterceptor}
   */
  /* prettier-ignore */
  public driftErrorInterceptor: TDriftErrorInterceptor = ({
    ctx,
    injectedKey = 'fallback',
    ruleKey = 'DEFAULT_ERROR',
    customContextMessage,
    caughtError,
  }) => {
    const systemLedgerEntry = XALOR_MATCH_DRIFT_ERROR_MAPPER[ruleKey];
    let finalDiagnosticMessage = systemLedgerEntry.message();

    // Append dynamic contextual trace strings if supplied by the running lane manager
    if (customContextMessage) {
      finalDiagnosticMessage += `\n👉 RUNTIME TRACE: ${customContextMessage}`;
    }

    // Extract third-party or native execution stack traces safely using framework utilities
    if (isInstanceOf(caughtError, Error)) {
      finalDiagnosticMessage += `\n💥 ORIGINATING EXCEPTION: ${caughtError.message}`;
    }
    if (ctx && isFunction(ctx.onError)) {
      ctx.onError({
        rule: ruleKey,
        customMessage: customContextMessage,
      });
    }
  
    if (ctx?.strict && isKeyInObject(ruleKey)(XALOR_MATCH_DRIFT_RULE_KEYS)) {
      console.warn(
        `[XALOR INTERNAL] Cascade failure detected for key: ${String(injectedKey)}`,
      );
    }

    return xalethorVaultDiagnostics.panic(
      String(injectedKey),
      finalDiagnosticMessage,
    );
  };
  /**
   * @see {@link xalorDriftClassDocs.executeDefaultFallback}
   */
  private executeDefaultFallback<K extends TActiveDriftRegistryKeys>(
    ctx: IXalorDriftContext<K>,
    workingFrame: Record<string, unknown>,
    injectedKey: K,
    activeHybridBlueprint: TSolidShape,
  ): TResolveDriftReturnConstraint<K> {
    const { mode = 'defaultFill', customFill } = ctx.default ?? {};

    if (mode === 'none') {
      /* prettier-ignore */
      const { required: missingRequiredFields, optional: missingOptionalFields } =
      getMissingKeysMatrix(workingFrame, activeHybridBlueprint);

      if (missingRequiredFields.length === 0) {
        purgeMissingOptionalFields(workingFrame, missingOptionalFields);

        if (refinePayloadContract<K>(workingFrame)) return workingFrame;
      }
      return this.driftErrorInterceptor({
        ctx,
        injectedKey,
        ruleKey: 'STRICT_FALLBACK_VIOLATION',
      });
    }

    if (mode === 'custom') {
      if (!customFill || !isObjectShape(activeHybridBlueprint)) {
        return this.driftErrorInterceptor({
          ctx,
          injectedKey,
          ruleKey: 'CUSTOM_FILL_OMISSION',
        });
      }

      const { result, ctxContext: _ } = executeSurgicalFallbackInflation<K>({
        workingFrame,
        activeHybridBlueprint,
        customFill: customFill as Record<string, unknown>,
        injectedKey: String(injectedKey),
      });
      // console.dir(ctxContext);
      if (isRecord(result) && refinePayloadContract<K>(result)) {
        return result;
      }

      return this.driftErrorInterceptor({
        ctx,
        injectedKey,
        ruleKey: 'CUSTOM_FILL_VALIDATION_FAIL',
      });
    }
    if (isObjectShape(activeHybridBlueprint)) {
      /* prettier-ignore */
      if (mode === 'defaultFill' || mode === 'mockFill' || mode === 'castFill') {
        /* prettier-ignore */
        if (!activeHybridBlueprint) return this.driftErrorInterceptor({ ctx, injectedKey, ruleKey: 'DETACHED_COMPILER_METADATA'});
        /* prettier-ignore */
        const finalizedHealedFrame = handleRecoveryStrategy({ mode, workingFrame, activeHybridBlueprint });

        /* prettier-ignore */
        if (!isNull(finalizedHealedFrame) && refinePayloadContract<K>(finalizedHealedFrame)) {
          return finalizedHealedFrame;
      }
      }
    }

    return this.driftErrorInterceptor({
      ctx,
      injectedKey,
      ruleKey: 'UNEXPECTED_STREAM_COLLAPSE',
      customContextMessage:
        'Recovery path collapsed. Active filling matrix configurations failed structural refinement.',
    });
  }
}

export const xalethorVaultMatchDrift = new XalethorVaultMatchDrift();
