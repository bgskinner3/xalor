import type { TApplyNominalBrand, IXalorDriftContext } from '../models/types';
import { isRegistryKey, isRecord } from '../../shared/utils';
import { isObjectShape } from '../../shared/shape-domain/guards';
import { XalethorVaultKeeper } from './vault-keeper';
import { XalethorVaultValidator } from './vault-validator';
import {
  markAsSolid,
  refinePayloadContract,
  refineAncestralContract,
  refineToCurrentModel,
  refineToAncestralModel,
  refineToBrandedResult,
} from '../utils';
import { BRAND_SYMBOL } from '../../shared';
import { XALOR_MATCH_ERROR_MESSAGES } from '../models/constants';

export class XalethorVaultMatch {
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

  public static executeDefaultFallback<K extends keyof ISolidDriftRegistry, R>(
    defaultHandler: () => R,
    errorMessage: keyof typeof XALOR_MATCH_ERROR_MESSAGES,
  ): TApplyNominalBrand<R> {
    const fallbackResult = defaultHandler();

    if (refineToBrandedResult<K, R>(fallbackResult)) return fallbackResult;

    throw new Error(`[xalor] 🚨 ${XALOR_MATCH_ERROR_MESSAGES[errorMessage]}`);
  }
  // =================================================
  // =================================================
  // DRIFT ACTIONS
  // =================================================
  // =================================================
  /* prettier-ignore */
  public static executeActiveGenerationLane<K extends keyof ISolidDriftRegistry, R>(
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
          if (refineToCurrentModel<K, typeof currentKey>(payload, currentKey)) {
            
            // 🟢 THE ATOMIC REFINEMENT POINT:
            // Establishes an uncompromised structural typing bridge natively.
            // TypeScript traces this branch and unlocks safe variable passing.
            if (refinePayloadContract<K>(payload)) {
              const executionResult = current(payload);
              
              if (refineToBrandedResult<K, R>(executionResult)) {
                return executionResult;
              }
            }
          }
        }
      }
    }
    return false;
  }
  /* prettier-ignore */
  public static executeAncestralMigrationLane<K extends keyof ISolidDriftRegistry, R>(
    payload: Record<string, unknown>,
    ctx: IXalorDriftContext<K, R>,
  ): TApplyNominalBrand<R> | false {
    /* prettier-ignore */
    const { v1_ancestor, prune, strict, currentKey, ancestralKey, default: defaultHandler } = ctx;

    if (!isRegistryKey(ancestralKey)) {
      return this.executeDefaultFallback<K, R>(
        defaultHandler,
        'ANCESTRAL_KEY_MISSING_FROM_VAULT',
      );
    }

    /* prettier-ignore */
    if (!XalethorVaultValidator.validateShape(payload, ancestralKey)) return false;
    /* prettier-ignore */
    if (strict && !this.enforceStrictValidation(ancestralKey, payload)) return false;

    Reflect.set(payload, BRAND_SYMBOL, ['Solid', ancestralKey]);
    /* prettier-ignore */
    if (!markAsSolid<typeof ancestralKey, ISolidRegistry[typeof ancestralKey]>(payload)) return false;
    /* prettier-ignore */
    if (!refineToAncestralModel<K, typeof ancestralKey>(payload, ancestralKey)) return false;

    if (refineAncestralContract<K>(payload)) {
      const upcastOutput = v1_ancestor(payload);
      if (!isRecord(upcastOutput)) return false;

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

      if (refineToBrandedResult<K, R>(upcastOutput)) {
        return upcastOutput;
      }
    }
    return false;
  }
}
