import type { TApplyNominalBrand, IXalorDriftContext } from '../models/types';
import { isRegistryKey, isRecord } from '../../shared/utils';
import { isObjectShape } from '../../shared/shape-domain/guards';
import { XalethorVaultKeeper } from './vault-keeper';
import { XalethorVaultValidator } from './vault-validator';
import { markAsSolid } from '../utils';
import { BRAND_SYMBOL } from '../../shared';
import { XALOR_MATCH_ERROR_MESSAGES } from '../models/constants';

export class XalethorVaultMatch {
  // =================================================
  // =================================================
  // PRIVATE REFINERS
  // =================================================
  // =================================================
  /* prettier-ignore */
  private static refineToCurrentModel<K extends keyof ISolidDriftRegistry, T extends keyof ISolidRegistry>(
    _record: unknown, _targetKey: T,
  ): _record is ISolidDriftRegistry[K]['current'] {
    return true;
  }
  /* prettier-ignore */
  private static refineToAncestralModel<K extends keyof ISolidDriftRegistry, T extends keyof ISolidRegistry>(
    _record: unknown, _targetKey: T,
  ): _record is ISolidDriftRegistry[K]['v1_ancestor'] {
    return true;
  }
  /* prettier-ignore */
  private static refineToBrandedResult<K extends keyof ISolidDriftRegistry, R extends ISolidDriftRegistry[K]['current']>
  (_result: R): _result is TApplyNominalBrand<R> {
    return true;
  }

  // =================================================
  // =================================================
  // Perimeter Guards
  // =================================================
  // =================================================
  private static pruneUnknownProperties<T extends keyof ISolidRegistry>(
    targetBlueprintKey: T,
    payload: Record<string, unknown>,
  ): void {
    /* prettier-ignore */
    const activeBlueprint = XalethorVaultKeeper.peek('blueprint', targetBlueprintKey);
    if (!isRegistryKey(targetBlueprintKey)) return;

    if (!activeBlueprint || !isObjectShape(activeBlueprint)) return;

    const allowedProperties = activeBlueprint.properties;

    for (const currentKey of Object.keys(payload)) {
      /* prettier-ignore */
      if (!Object.prototype.hasOwnProperty.call(allowedProperties, currentKey)) {
       delete payload[currentKey];
      }
    }
  }
  private static enforceStrictValidation<T extends keyof ISolidRegistry>(
    targetBlueprintKey: T,
    payload: Record<string, unknown>,
  ): boolean {
    /* prettier-ignore */
    const activeBlueprint = XalethorVaultKeeper.peek('blueprint', targetBlueprintKey);

    if (!activeBlueprint || !isObjectShape(activeBlueprint)) return false;

    const runtimeKeysCount = Object.keys(payload).length;
    const allowedKeysCount = Object.keys(activeBlueprint.properties).length;

    return runtimeKeysCount === allowedKeysCount;
  }
  // =================================================
  // =================================================
  // DEFAULT HANDLER
  // =================================================
  // =================================================
  /* prettier-ignore */
  public static executeDefaultFallback<K extends keyof ISolidDriftRegistry ,R extends ISolidDriftRegistry[K]['current'],>
  (defaultHandler: () => R, errorMessage: keyof typeof XALOR_MATCH_ERROR_MESSAGES): TApplyNominalBrand<R> {
    const fallbackResult = defaultHandler();

    if (this.refineToBrandedResult<K, R>(fallbackResult)) return fallbackResult;

    throw new Error(`[xalor] 🚨 ${XALOR_MATCH_ERROR_MESSAGES[errorMessage]}`);
  }
  // =================================================
  // =================================================
  // DRIFT ACTIONS
  // =================================================
  // =================================================
  public static executeActiveGenerationLane<
    K extends keyof ISolidDriftRegistry,
    R extends ISolidDriftRegistry[K]['current'],
  >(
    payload: Record<string, unknown>,
    ctx: IXalorDriftContext<K, R>,
  ): TApplyNominalBrand<R> | false {
    const { current, currentKey, strict } = ctx;

    /* prettier-ignore */
    const isValidCurrentShape = XalethorVaultValidator.validateShape(payload, currentKey);
    if (isValidCurrentShape) {
      if (!strict || this.enforceStrictValidation(currentKey, payload)) {
        Reflect.set(payload, BRAND_SYMBOL, ['Solid', currentKey]);
        /* prettier-ignore */
        if (markAsSolid<typeof currentKey, ISolidRegistry[typeof currentKey]>(payload)) {
           /* prettier-ignore */
          if (this.refineToCurrentModel<K, typeof currentKey>(payload, currentKey)) {
            const executionResult = current(payload);

            if (this.refineToBrandedResult<K, R>(executionResult)) return executionResult;
          }
        }
      }
    }
    return false;
  }

  public static executeAncestralMigrationLane<
    K extends keyof ISolidDriftRegistry,
    R extends ISolidDriftRegistry[K]['current'],
  >(
    payload: Record<string, unknown>,
    ctx: IXalorDriftContext<K, R>,
  ): TApplyNominalBrand<R> | false {
    /* prettier-ignore */
    const { v1_ancestor, prune, strict, currentKey, ancestralKey, default: defaultHandler } = ctx;
    if (!isRegistryKey(ancestralKey)) {
      /* prettier-ignore */
      return this.executeDefaultFallback<K, R>(defaultHandler, 'ANCESTRAL_KEY_MISSING_FROM_VAULT');
    }
    /* prettier-ignore */
    if (!XalethorVaultValidator.validateShape(payload, ancestralKey)) return false;

    /* prettier-ignore */
    if (strict && !this.enforceStrictValidation(ancestralKey, payload)) return false;

    // Guard 3: Stamp legacy tracking indicators and execute static compiler narrowing checks
    Reflect.set(payload, BRAND_SYMBOL, ['Solid', ancestralKey]);
    /* prettier-ignore */
    if (!markAsSolid<typeof ancestralKey, ISolidRegistry[typeof ancestralKey]>(payload)) return false;

    /* prettier-ignore */
    if (!this.refineToAncestralModel<K, typeof ancestralKey>(payload, ancestralKey)) return false;

    // 🟢 EXECUTION PHASE: Fire the user's type-safe translation closure map pipeline
    const upcastOutput = v1_ancestor(payload);
    if (!isRecord(upcastOutput)) return false;

    // Sanitation Phase: Shears away lingering legacy properties directly from the RAM block frame in-place
    if (prune) {
      this.pruneUnknownProperties(currentKey, upcastOutput);
    }

    /* prettier-ignore */
    if (!XalethorVaultValidator.validateShape(upcastOutput, currentKey)) return false;
    /* prettier-ignore */
    if (strict && !this.enforceStrictValidation(currentKey, upcastOutput)) return false;

    Reflect.set(upcastOutput, BRAND_SYMBOL, ['Solid', currentKey]);
    /* prettier-ignore */
    if (!markAsSolid<typeof currentKey, ISolidRegistry[typeof currentKey]>(upcastOutput)) {
      return false;
    }

    if (this.refineToBrandedResult<K, R>(upcastOutput)) {
      return upcastOutput;
    }

    return false;
  }
}
