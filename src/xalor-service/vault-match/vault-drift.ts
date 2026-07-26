import type {
  IXalorDriftContext,
  TResolveDriftReturnConstraint,
  // TXalorMatchDriftKeys,
  TDriftErrorInterceptor,
} from '../../models/types';
import { TSolidObjectShape } from '../../../shared';
import {
  isRegistryKey,
  isRecord,
  isString,
  isNull,
  hasOwnProperty,
  isKeyInObject,
  isInstanceOf,
  isArray,
} from '../../../shared/utils';
import {
  isObjectShape,
  isArrayShape,
} from '../../../shared/shape-domain/guards';
import { xalethorVaultKeeper } from '../vault-keeper';
import { xalethorVaultValidation } from '../vault-validation';
import { xalethorVaultDiagnostics } from '../vault-diagnostics';
import {
  refineAncestralContract,
  refineToCurrentModel,
  refinePayloadContract,
} from '../../utils';
import {
  XALOR_MATCH_DRIFT_ERROR_MAPPER,
  XALOR_MATCH_DRIFT_RULE_KEYS,
} from '../../models';
import {
  synthesizeDriftMatrixBlueprint,
  getMissingKeysMatrix,
  handleRecoveryStrategy,
} from '../../utils';

class XalethorVaultMatchDrift {
  /**
   * @see {@link xalorDriftClassDocs.projectPrunedFrame}
   */
  private projectPrunedFrame(
    hybridBlueprint: TSolidObjectShape,
    targetPayload: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!hybridBlueprint || !hybridBlueprint.properties) {
      return targetPayload;
    }

    // Cache the flat properties register dictionary for maximum microsecond lookup velocities
    const allowedProperties = hybridBlueprint.properties;
    const pristineEgressFrame: Record<string, unknown> = {};

    // Satisfies COMMANDMENT VIII: Iterates direct memory references without Object.keys() heap clutter
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
          // Lane C: Rigid structural gatekeeping
        } else {
          if (isStrictEnabled) {
            return false;
          }
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
      if (refineToCurrentModel<K, string>(processedPayload, currentKey)) {
        const executionResult = ctx.current(processedPayload);

        if (isRecord(executionResult)) {
          /* prettier-ignore */
          // if (xalethorVaultValidation.validateShapeByKey(executionResult, currentKey)) {
          //   return executionResult;
          // }
          return executionResult;
        }
      }
    }
    if (laneMode === 'ancestor') {
      if (refineAncestralContract<K>(processedPayload)) {
        const mutatedLegacyOutput = ctx.v1_ancestor(processedPayload);

        if (isRecord(mutatedLegacyOutput)) {
          /* prettier-ignore */
          if (xalethorVaultValidation.validateShapeByKey(mutatedLegacyOutput, ancestralKey)) {
            return mutatedLegacyOutput;
          }
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
  ): TResolveDriftReturnConstraint<K> | null {
    const { ancestralKey, currentKey } = ctx;

    // Guard 1: Verify inbound packet is a physical dynamic record collection dictionary
    if (!isRecord(payload)) {
      /* prettier-ignore */
      const fallbackResult = this.executeDefaultFallback<K>(ctx, {}, injectedKey);
      if (refinePayloadContract<K>(fallbackResult)) {
        return fallbackResult;
      }
      /* prettier-ignore */
      return this.driftErrorInterceptor({injectedKey, ruleKey: 'MALFORMED_NON_RECORD_PAYLOAD'})
    }

    // Guard 2: Verify both registry token identifiers are properly synchronized
    if (!isRegistryKey(currentKey) || !isRegistryKey(ancestralKey)) {
      /* prettier-ignore */
      const fallbackResult = this.executeDefaultFallback<K>(ctx, payload, injectedKey);
      if (refinePayloadContract<K>(fallbackResult)) {
        return fallbackResult;
      }
    }

    return null; // Both security perimeters cleared safely!
  }

  /**
   * @see {@link xalorDriftClassDocs.hydrateMissingBlueprintStructures}
   */
  private hydrateMissingBlueprintStructures(
    hybridBlueprint: TSolidObjectShape | null,
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
   * @see {@link xalorDriftClassDocs.executeEgressSanitizationPipeline}
   */
  private executeEgressSanitizationPipeline<K extends TActiveDriftRegistryKeys>(
    workingFrame: Record<string, unknown>,
    activeHybridBlueprint: TSolidObjectShape,
    ctx: IXalorDriftContext<K>,
  ): TResolveDriftReturnConstraint<K> | null {
    const { currentKey, omit: omitPathsList } = ctx;

    // ➊ Filter privacy tokens via specified omit config parameter targets
    const hasOmitPaths = isRecord(omitPathsList) || isArray(omitPathsList);
    const cleanOutput = this.projectOmitProperties(
      workingFrame,
      hasOmitPaths ? omitPathsList : undefined,
    );

    // ➋ Prune out unknown outlier attributes point-free across both version eras
    const pristineEgressFrame = this.projectPrunedFrame(
      activeHybridBlueprint,
      cleanOutput,
    );

    // ➌ Deep hybrid structural gatekeeper verification pass
    const ctxValidation = xalethorVaultValidation.createInitialContext(
      String(currentKey),
    );
    const isFinalHybridShapeValid = xalethorVaultValidation.validateShape(
      pristineEgressFrame,
      activeHybridBlueprint,
      ctxValidation,
    );

    if (isFinalHybridShapeValid) {
      if (refinePayloadContract<K>(pristineEgressFrame)) {
        return pristineEgressFrame; // Clean, fully verified layout ready for asset exit!
      }
    }

    return null; // Soft failure alerts master loop to trigger fallback circuit breakers
  }

  /**
   * @see {@link xalorDriftClassDocs.executeDriftMatcher}
   */
  public executeDriftMatcher<K extends TActiveDriftRegistryKeys>(
    payload: unknown,
    ctx: IXalorDriftContext<K>,
    injectedKey: K,
  ): TResolveDriftReturnConstraint<K> {
    const activeHybridBlueprint = synthesizeDriftMatrixBlueprint(ctx);

    /* prettier-ignore */ const perimeterGuardFailureResult = this.executeIngressPerimeterGuards<K>(payload, ctx, injectedKey);
    /* prettier-ignore */ if (!isNull(perimeterGuardFailureResult)) return perimeterGuardFailureResult;

    /* prettier-ignore */ if (!isRecord(payload)) return this.driftErrorInterceptor({injectedKey, ruleKey: 'MALFORMED_NON_RECORD_PAYLOAD'})
    // xalethorVaultTransform
    const chronologicalWorkingFrame: Record<string, unknown> = { ...payload };
    // const res = extractRequiredBlueprintMatrix(activeHybridBlueprint);

    // console.log(res);
    // =============================================================================
    // STEP A: Yesterday's Phase (Ancestral Evolution Pass)
    // =============================================================================
    /* prettier-ignore */
    const upCastedLegacyFields = this.executeEvolutionaryLane<K>(payload, ctx, 'ancestor');

    if (upCastedLegacyFields !== false) {
      for (const targetKey in upCastedLegacyFields) {
        if (hasOwnProperty(upCastedLegacyFields, targetKey)) {
          chronologicalWorkingFrame[targetKey] =
            upCastedLegacyFields[targetKey];
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
      // Non-destructive contemporary patch loop
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
    const finalEgressAsset = this.executeEgressSanitizationPipeline<K>(
      chronologicalWorkingFrame,
      activeHybridBlueprint,
      ctx,
    );

    if (finalEgressAsset) return finalEgressAsset;

    // =============================================================================
    // STEP D: Circuit Breaker Fallback (Un-nested vertical fallback path)
    // =============================================================================
    const terminalFallback = this.executeDefaultFallback<K>(
      ctx,
      chronologicalWorkingFrame,
      injectedKey,
    );

    if (refinePayloadContract<K>(terminalFallback)) {
      return terminalFallback;
    }

    // Edge-case fallback panic log guarantees absolute single-threaded loop crash protection
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
  //  * @see {@link xalorDriftClassDocs}
   */
  /* prettier-ignore */
  public driftErrorInterceptor: TDriftErrorInterceptor = ({
    ctx,
    injectedKey = 'fallback',
    ruleKey = XALOR_MATCH_DRIFT_RULE_KEYS.DEFAULT_ERROR, // 'default_error'
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

    // --- ➊ INTERNAL SYSTEM DIAGNOSTICS & TELEMETRY LOGGING ---
    if (ctx?.strict && isKeyInObject(ruleKey)(XALOR_MATCH_DRIFT_RULE_KEYS)) {
      console.warn(
        `[XALOR INTERNAL] Cascade failure detected for key: ${String(injectedKey)}`,
      );
    }

    return xalethorVaultDiagnostics.panic(
      String(injectedKey),
      finalDiagnosticMessage,
    );
  }
  /**
   * @see {@link xalorDriftClassDocs.executeDefaultFallback}
   */
  private executeDefaultFallback<K extends TActiveDriftRegistryKeys>(
    ctx: IXalorDriftContext<K>,
    workingFrame: Record<string, unknown>,
    injectedKey: K,
    activeHybridBlueprint?: TSolidObjectShape | null,
  ): TResolveDriftReturnConstraint<K> {
    const { required: missingRequiredFields } = getMissingKeysMatrix(
      workingFrame,
      activeHybridBlueprint,
    );

    if (missingRequiredFields.length === 0) {
      return workingFrame as TResolveDriftReturnConstraint<K>;
    }

    const { mode = 'defaultFill', customFill } = ctx.default ?? {};

    if (mode === 'none') {
      return this.driftErrorInterceptor({
        ctx,
        injectedKey,
        ruleKey: 'UNEXPECTED_STREAM_COLLAPSE',
        customContextMessage: `Strict fallback mode ("none") activated. Automatic structure inflation and recovery bridges bypassed. Missing required production keys: [${missingRequiredFields.join(', ')}].`,
      });
    }
    if (mode === 'custom') {
      if (!customFill) {
        return this.driftErrorInterceptor({
          ctx,
          injectedKey,
          ruleKey: 'DEFAULT_ERROR',
          customContextMessage: `Mode was set to 'custom', but 'customFill' options object was completely omitted.`,
        });
      }

      // Verify that their manual configuration contains the properties that are missing on the wire
      for (const missingKey of missingRequiredFields) {
        if (
          !hasOwnProperty(customFill, missingKey) ||
          customFill[missingKey] === undefined
        ) {
          return this.driftErrorInterceptor({
            ctx,
            injectedKey,
            ruleKey: 'DEFAULT_ERROR',
            customContextMessage: `The 'customFill' matrix is missing a mandatory default value for required property: "${missingKey}".`,
          });
        }
      }

      return {
        ...customFill,
        ...workingFrame,
      } as TResolveDriftReturnConstraint<K>;
    }

    if (mode === 'defaultFill' || mode === 'mockFill' || mode === 'castFill') {
      if (!activeHybridBlueprint) {
        /* prettier-ignore */
        return this.driftErrorInterceptor({ ctx, injectedKey, ruleKey: 'DETACHED_COMPILER_METADATA'});
      }

      const finalizedHealedFrame = handleRecoveryStrategy({
        mode,
        workingFrame,
        activeHybridBlueprint,
      });
      if (!isNull(finalizedHealedFrame)) {
        if (refinePayloadContract<K>(finalizedHealedFrame)) {
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
