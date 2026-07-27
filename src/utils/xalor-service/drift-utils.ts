import type { TSolidShape, TValidationContext } from '../../../shared';
import {
  isRecord,
  yieldAllKeyValuePairs,
  isObjectShape,
  hasOwnProperty,
  isArray,
} from '../../../shared';
import type {
  TDriftBuildMapper,
  IXalorDriftContext,
  TRecoveryStrategyParams,
  TMissingKeysStructure,
  TSurgicalFallbackParams,
} from '../../models/types';
import { xalethorVaultGenerator } from '../../xalor-service/vault-generator';
import { xalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import { xalethorVaultValidation } from '../../xalor-service/vault-validation';
import { xalethorCoreService } from '../../xalor-service';
import { blueprintService } from '../../../shared/service';
/**
 * RUNTIME MATRIX PROBER
 * Scans your active build-time blueprint to sort all missing or undefined
 * data fields into explicit, actionable required and optional tracking buckets.
 */

export function getMissingKeysMatrix(
  workingFrame: Record<string, unknown>,
  activeHybridBlueprint?: TSolidShape | null,
): TMissingKeysStructure {
  if (!isObjectShape(activeHybridBlueprint!))
    return { required: [], optional: [] };
  if (!activeHybridBlueprint || !activeHybridBlueprint.properties) {
    return { required: [], optional: [] };
  }

  const required: string[] = [];
  const optional: string[] = [];
  const modernProps = activeHybridBlueprint.properties;

  // Iterate the properties memory map point-free
  for (const targetKey in modernProps) {
    if (hasOwnProperty(modernProps, targetKey)) {
      const propertyDescriptor = modernProps[targetKey];

      // Look up your precise runtime compiler indicators!
      const isStrictlyRequired =
        propertyDescriptor.optional === false ||
        propertyDescriptor.requiresKeyPresence === true;

      const isMissingField =
        !hasOwnProperty(workingFrame, targetKey) ||
        workingFrame[targetKey] === undefined;

      if (isMissingField) {
        if (isStrictlyRequired) {
          required.push(targetKey);
        } else {
          optional.push(targetKey);
        }
      }
    }
  }

  return { required, optional };
}

/**
 * REQUIRED BLUEPRINT FILTER
 * Consumes a multi-generational object blueprint and extracts a pristine structural
 * shape containing exclusively the properties marked optional: false and requiresKeyPresence: true.
 */
export function extractRequiredBlueprintMatrix(
  sourceBlueprint: TSolidShape | null,
): TSolidShape {
  if (!isObjectShape(sourceBlueprint!)) {
    return {
      kind: 'object',
      properties: {},
      strict: undefined,
    };
  }
  if (!sourceBlueprint || !sourceBlueprint.properties) {
    return {
      kind: 'object',
      properties: {},
      strict: undefined,
    };
  }

  const prunedProperties: Record<
    string,
    (typeof sourceBlueprint.properties)[string]
  > = {};

  for (const [propertyKey, propertyDescriptor] of yieldAllKeyValuePairs(
    sourceBlueprint.properties,
  )) {
    const isStrictlyRequired =
      propertyDescriptor.optional === false ||
      propertyDescriptor.requiresKeyPresence === true;

    if (isStrictlyRequired) prunedProperties[propertyKey] = propertyDescriptor;
  }

  return {
    kind: 'object',
    properties: prunedProperties,
    strict: sourceBlueprint.strict,
  };
}
/**
 * @see {@link xalorDriftClassDocs.synthesizeDriftMatrixBlueprint}
 */
export function synthesizeDriftMatrixBlueprint<
  K extends TActiveDriftRegistryKeys,
>(ctx: IXalorDriftContext<K>, payload: unknown): TSolidShape {
  const { ancestralKey, currentKey } = ctx;
  const blueprintsPool = xalethorVaultKeeper.globalBlueprintList;

  // HASH KEYS
  /* prettier-ignore */ const currentBlueprintKey = xalethorVaultKeeper.peek( 'referenceKey', String(currentKey));
  /* prettier-ignore */ const ancestralBlueprintKey = xalethorVaultKeeper.peek( 'referenceKey', String(ancestralKey));

  /* prettier-ignore */
  const activeHybridBlueprint =
      blueprintService.synthesizeDeepHybridBlueprint(currentBlueprintKey, ancestralBlueprintKey, blueprintsPool, payload);

  if (!activeHybridBlueprint) {
    return {
      kind: 'object',
      properties: {},
      strict: ctx?.strict,
    };
  }

  return activeHybridBlueprint;
}

const DRIFT_RECOVERY_STRATEGIES: TDriftBuildMapper = {
  defaultFill: (shape, workingFrame, depth = 0) => {
    /* prettier-ignore */ const systemDefaults = xalethorVaultGenerator.executeDefaultBuild(shape, depth);
    /* prettier-ignore */
    return { ...isRecord(systemDefaults) ? systemDefaults : {}, ...workingFrame };
  },

  mockFill: (shape, workingFrame, depth = 0) => {
    /* prettier-ignore */ const mockDefaults = xalethorVaultGenerator.executeMockBuild(shape, depth);
    /* prettier-ignore */
    return { ...isRecord(mockDefaults) ? mockDefaults : {}, ...workingFrame };
  },

  castFill: (shape, workingFrame, depth = 0) => {
    /* prettier-ignore */ const castedOutput = xalethorVaultGenerator.executeCastBuild(shape, workingFrame, depth);
    /* prettier-ignore */
    return isRecord(castedOutput) ? castedOutput : workingFrame;
  },
} satisfies TDriftBuildMapper;

export function handleRecoveryStrategy({
  workingFrame,
  activeHybridBlueprint,
  mode,
}: TRecoveryStrategyParams): Record<string, unknown> | null {
  const requiredShape = extractRequiredBlueprintMatrix(activeHybridBlueprint);

  const filledResult = DRIFT_RECOVERY_STRATEGIES[mode](
    requiredShape,
    workingFrame,
  );

  const ctxValidation = xalethorVaultValidation.createInitialContext();

  const isRecoveredObjectValid = xalethorVaultValidation.validateShape(
    filledResult,
    activeHybridBlueprint,
    ctxValidation,
  );
  if (isRecoveredObjectValid) {
    return filledResult;
  }

  return xalethorCoreService.driftErrorHandler({
    ruleKey: 'AUTOMATED_FILL_VALIDATION_FAIL',
    customContextMessage: `mode: ${mode}`,
  });
}

/**
 * SURGICAL OPTIONAL PURGER VALVE
 * Iterates through the detected missing optional fields list and unconditionally
 * deletes any lingering explicit undefined markers to prevent structural type bleeding.
 *
 * Satisfies COMMANDMENT VIII: High-velocity register loop avoiding heap spikes.
 */
export function purgeMissingOptionalFields(
  workingFrame: Record<string, unknown>,
  missingOptionalKeys: string[],
): void {
  const totalKeys = missingOptionalKeys.length;
  for (let i = 0; i < totalKeys; i++) {
    const targetKey = missingOptionalKeys[i];
    if (hasOwnProperty(workingFrame, targetKey)) {
      Reflect.deleteProperty(workingFrame, targetKey);
    }
  }
}

/**
 * 🪚 SURGICAL FALLBACK INFLATION ENGINE
 * Analyzes object shapes recursively, detects structural defects or invalid types,
 * and surgically swaps out broken top-level nodes point-free with zero deep-merge corruption.
 *
 * @invariants
 * - Satisfies COMMANDMENT V: Guarantees a fully valid modern object container.
 * - Satisfies COMMANDMENT VIII: Bare-metal array iteration avoids nested closure allocation overhead.
 * - Satisfies COMMANDMENT IX: Operates natively over typed contracts without blind assertions.
 */
export function executeSurgicalFallbackInflation<
  K extends TActiveDriftRegistryKeys,
>({
  workingFrame,
  activeHybridBlueprint,
  customFill,
  injectedKey,
}: TSurgicalFallbackParams<K>): {
  result: Record<string, unknown>;
  ctxContext: TValidationContext;
} {
  /* prettier-ignore */
  const initialCtxValidation = xalethorVaultValidation.createInitialContext(injectedKey);

  /* prettier-ignore */
  const isRawPayloadValid = xalethorVaultValidation.validateShape( workingFrame, activeHybridBlueprint, initialCtxValidation);

  if (isRawPayloadValid) {
    return { result: workingFrame, ctxContext: initialCtxValidation };
  }

  const corruptedOrMissingErrors = initialCtxValidation.errors;

  const filledResult = { ...customFill };

  for (const parentKeyName in workingFrame) {
    if (hasOwnProperty(workingFrame, parentKeyName)) {
      const hasStructuralErrors =
        isArray(corruptedOrMissingErrors) &&
        corruptedOrMissingErrors.some((err) => {
          if (!err) return false;
          const snapshot = err.pathSnapshot;
          // TODO: UPDATE FUTHER TO HANDLE DEEPER ERRORS
          return isArray(snapshot) && snapshot.length > 0
            ? String(snapshot[0]) === parentKeyName
            : String(err.key || '') === parentKeyName;
        });

      if (!hasStructuralErrors) {
        filledResult[parentKeyName] = workingFrame[parentKeyName];
      }
    }
  }

  return {
    result: filledResult,
    ctxContext: initialCtxValidation,
  };
}
