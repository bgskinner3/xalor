import type { TSolidObjectShape } from '../../../shared';
import {
  hasOwnProperty,
  isRecord,
  yieldAllKeyValuePairs,
} from '../../../shared';
import type {
  TMissingKeysStructure,
  TDriftBuildMapper,
  IXalorDriftContext,
  TDriftFillMode,
} from '../../models/types';
import { xalethorVaultGenerator } from '../../xalor-service/vault-generator';
import { xalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import { xalethorVaultValidation } from '../../xalor-service/vault-validation';
import { blueprintService } from '../../../shared/service';

/**
 * RUNTIME MATRIX PROBER
 * Scans your active build-time blueprint to sort all missing or undefined
 * data fields into explicit, actionable required and optional tracking buckets.
 */
export function getMissingKeysMatrix(
  workingFrame: Record<string, unknown>,
  activeHybridBlueprint?: TSolidObjectShape | null,
): TMissingKeysStructure {
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
  sourceBlueprint: TSolidObjectShape | null,
): TSolidObjectShape {
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
>(ctx: IXalorDriftContext<K>): TSolidObjectShape {
  const { ancestralKey, currentKey } = ctx;
  const blueprintsPool = xalethorVaultKeeper.globalBlueprintList;

  // HASH KEYS
  /* prettier-ignore */ const currentBlueprintKey = xalethorVaultKeeper.peek( 'referenceKey', String(currentKey));
  /* prettier-ignore */ const ancestralBlueprintKey = xalethorVaultKeeper.peek( 'referenceKey', String(ancestralKey));

  /* prettier-ignore */
  const activeHybridBlueprint =
      blueprintService.synthesizeDeepHybridBlueprint(currentBlueprintKey, ancestralBlueprintKey, blueprintsPool);
  if (!activeHybridBlueprint) {
    return {
      kind: 'object',
      properties: {},
      strict: ctx.strict === true,
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

type TRecoveryStrategyParams = {
  readonly workingFrame: Record<string, unknown>;
  readonly activeHybridBlueprint: TSolidObjectShape;
  readonly mode: Exclude<TDriftFillMode, 'none' | 'custom'>; // Safely locks down to your 3 filling strategies
};
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
  return null;
}
// // ➌ Deep hybrid structural gatekeeper verification pass
