import type {
  IXalorDriftContext,
  TResolveDriftReturnConstraint,
} from '../models/types';
import { isRegistryKey, isRecord } from '../../shared/utils';
import { isObjectShape } from '../../shared/shape-domain/guards';
import { xalethorVaultKeeper } from './vault-keeper';
import { xalethorVaultValidation } from './vault-validation';
import { xalethorVaultDiagnostics } from './vault-diagnostics';
import {
  refinePayloadContract,
  refineAncestralContract,
  refineToCurrentModel,
  refineToAncestralModel,
  refineToBrandedResult,
} from '../utils';
import { XALOR_MATCH_ERROR_MESSAGES } from '../models';
import { BRAND_SYMBOL } from '../../shared';
class XalethorVaultMatch {
  private pruneUnknownProperties(
    targetBlueprintKey: string, // 🎯 Widened from generic T extends keyof ISolidRegistry to plain string!
    payload: Record<string, unknown>,
  ): void {
    if (!isRegistryKey(targetBlueprintKey)) return;
    const activeBlueprint = xalethorVaultKeeper.peek(
      'blueprint',
      targetBlueprintKey,
    );
    if (!activeBlueprint || !isObjectShape(activeBlueprint)) return;

    const allowedProperties = activeBlueprint.properties;
    const runtimeKeys = Object.keys(payload);
    const totalKeys = runtimeKeys.length;

    // Satisfies COMMANDMENT VIII: Zero-allocation iteration pass over keys vector
    for (let i = 0; i < totalKeys; i++) {
      const currentKey = runtimeKeys[i];
      if (
        !Object.prototype.hasOwnProperty.call(allowedProperties, currentKey)
      ) {
        Reflect.deleteProperty(payload, currentKey);
      }
    }
  }
  private enforceStrictValidation(
    targetBlueprintKey: string, // 🎯 Widened from generic T extends keyof ISolidRegistry to plain string!
    payload: Record<string, unknown>,
  ): boolean {
    if (!isRegistryKey(targetBlueprintKey)) return false;
    const activeBlueprint = xalethorVaultKeeper.peek(
      'blueprint',
      targetBlueprintKey,
    );
    if (!activeBlueprint || !isObjectShape(activeBlueprint)) return false;

    const runtimeKeysCount = Object.keys(payload).length;
    const allowedKeysCount = Object.keys(activeBlueprint.properties).length;
    return runtimeKeysCount === allowedKeysCount;
  }
  /**
   * HYBRID-AWARE STRICT SHAPE VALIDATION
   * Validates that every property on a hybrid payload belongs either to today's active
   * production blueprint OR to yesterday's ancestral blueprint map inside RAM.
   */
  private enforceHybridStrictValidation(
    currentBlueprintKey: string,
    ancestralBlueprintKey: string | undefined,
    payload: Record<string, unknown>,
  ): boolean {
    if (!isRegistryKey(currentBlueprintKey)) return false;
    const modernBlueprint = xalethorVaultKeeper.peek(
      'blueprint',
      currentBlueprintKey,
    );
    if (!modernBlueprint || !isObjectShape(modernBlueprint)) return false;

    const modernProps = modernBlueprint.properties;
    const modernKeys = Object.keys(modernProps);
    const totalModernKeys = modernKeys.length;

    // Inside-Out Check: Enforce today's mandatory modern release fields are physically present!
    for (let i = 0; i < totalModernKeys; i++) {
      const modernKey = modernKeys[i];
      if (!Object.prototype.hasOwnProperty.call(payload, modernKey)) {
        return false;
      }
    }

    const ancestralBlueprint =
      ancestralBlueprintKey && isRegistryKey(ancestralBlueprintKey)
        ? xalethorVaultKeeper.peek('blueprint', ancestralBlueprintKey)
        : undefined;

    const ancestralProps =
      ancestralBlueprint && isObjectShape(ancestralBlueprint)
        ? ancestralBlueprint.properties
        : null;

    const runtimeKeys = Object.keys(payload);
    const totalRuntimeKeys = runtimeKeys.length;

    // Outside-In Check: Verify extra parameters belong safely to yesterday's ancestral layout
    for (let i = 0; i < totalRuntimeKeys; i++) {
      const key = runtimeKeys[i];
      const existsInModern = Object.prototype.hasOwnProperty.call(
        modernProps,
        key,
      );
      const existsInAncestor = ancestralProps
        ? Object.prototype.hasOwnProperty.call(ancestralProps, key)
        : false;

      if (!existsInModern && !existsInAncestor) {
        return false;
      }
    }
    return true;
  }

  // ================================================= //
  // CENTRALIZED CIRCUIT BREAKER FALLBACK ENGINE
  // ================================================= //

  /**
   * CENTRALIZED CIRCUIT BREAKER FALLBACK ENGINE
   *
   * Satisfies COMMANDMENT V & VI:
   * If a developer supplies a custom default recovery block, it ingests the raw,
   * unverified payload cast to a partial hybrid, processes the emergency salvage output,
   * stamps your framework nominal brand token, and returns the expected typed object safely!
   */
  private executeDefaultFallback<K extends TActiveDriftRegistryKeys>(
    ctx: IXalorDriftContext<K>,
    payload: unknown,
    errorMessageKey: keyof typeof XALOR_MATCH_ERROR_MESSAGES,
    injectedKey: K,
  ): TResolveDriftReturnConstraint<K> {
    // ➊ Open-Recovery Check: If the handler is supplied, run the developer salvage pipeline
    if (ctx.default) {
      // Cast the raw container to a Partial hybrid layout to feed full tooltips autocomplete autocomplete
      const partialHybridInput = isRecord(payload) ? payload : {};
      const fallbackResult = ctx.default(partialHybridInput as any);

      if (isRecord(fallbackResult)) {
        const currentKey = ctx.currentKey as string;
        Reflect.set(fallbackResult, BRAND_SYMBOL, ['Solid', currentKey]);

        if (refineToBrandedResult<K>(fallbackResult)) {
          return fallbackResult;
        }
      }
    }

    // ➋ Complete Crash Fallback: Execute hard panic diagnostics telemetry logs
    const localizedMessage = XALOR_MATCH_ERROR_MESSAGES[errorMessageKey];
    return xalethorVaultDiagnostics.panic(injectedKey, localizedMessage);
  }

  private executeActiveGenerationLane<K extends TActiveDriftRegistryKeys>(
    payload: Record<string, unknown>,
    ctx: IXalorDriftContext<K>,
  ): TResolveDriftReturnConstraint<K> | false {
    const { current, strict } = ctx;
    const currentKey = ctx.currentKey as string;
    const ancestralKey = ctx.ancestralKey as string;

    const isValidCurrentShape = xalethorVaultValidation.validateShapeByKey(
      payload,
      currentKey,
    );
    if (isValidCurrentShape) {
      if (
        !strict ||
        this.enforceHybridStrictValidation(currentKey, ancestralKey, payload)
      ) {
        Reflect.set(payload, BRAND_SYMBOL, ['Solid', currentKey]);

        if (refineToCurrentModel<K, string>(payload, currentKey)) {
          if (refinePayloadContract<K>(payload)) {
            const executionResult = current(payload); // Fires today's modern release block!

            if (isRecord(executionResult)) {
              Reflect.set(executionResult, BRAND_SYMBOL, ['Solid', currentKey]);
              if (refineToBrandedResult<K>(executionResult)) {
                return executionResult as unknown as TResolveDriftReturnConstraint<K>;
              }
            }
          }
        }
      }
    }
    return false;
  }

  private executeAncestralMutationPass<K extends TActiveDriftRegistryKeys>(
    payload: Record<string, unknown>,
    ctx: IXalorDriftContext<K>,
    _injectedKey: K,
  ): Record<string, unknown> | false {
    const { v1_ancestor, prune, strict, default: _defaultHandler } = ctx;
    const currentKey = ctx.currentKey as string;
    const ancestralKey = ctx.ancestralKey as string;

    if (!isRegistryKey(ancestralKey)) {
      return false; // Force immediate escape to let executeDefaultFallback catch it upstream
    }

    if (!xalethorVaultValidation.validateShapeByKey(payload, ancestralKey))
      return false;
    if (strict && !this.enforceStrictValidation(ancestralKey, payload))
      return false;

    Reflect.set(payload, BRAND_SYMBOL, ['Solid', ancestralKey]);

    if (refineToAncestralModel<K, string>(payload, ancestralKey)) {
      if (refineAncestralContract<K>(payload)) {
        // 🎯 THE SEPARATED CONVERSION: Ingests old models and outputs yesterday's partial subset!
        const mutatedLegacyOutput = v1_ancestor(payload);
        if (!isRecord(mutatedLegacyOutput)) return false;

        if (prune) {
          this.pruneUnknownProperties(currentKey, mutatedLegacyOutput);
        }

        // Returns the cleaned raw object container back up to the orchestrator pipeline channel
        return mutatedLegacyOutput;
      }
    }
    return false;
  }

  /**
   * CENTRAL COORDINATION LOOP: EXECUTE DRIFT MATCHER
   * Synchronously guides the unverified inbound data container through your evolutionary pipeline.
   */
  public executeDriftMatcher<K extends TActiveDriftRegistryKeys>(
    payload: unknown,
    ctx: IXalorDriftContext<K>,
    injectedKey: K,
  ): TResolveDriftReturnConstraint<K> {
    // ➊ Perimeter Guard: Immediately reject primitive trash data profiles (strings/numbers)
    if (!isRecord(payload)) {
      return this.executeDefaultFallback<K>(
        ctx,
        payload,
        'MALFORMED_NON_RECORD_PAYLOAD',
        injectedKey,
      );
    }

    // ➋ PHASE 1: Attempt an initial hot-path validation check (Lane 1 Pass)
    const activeGenerationResult = this.executeActiveGenerationLane<K>(
      payload,
      ctx,
    );
    if (activeGenerationResult !== false) {
      return activeGenerationResult; // Short-circuits instantly if it's already a clean hybrid payload!
    }

    // ➌ PHASE 2: Trigger the Ancestral Pass for raw historical schemas (Lane 2 Pass)
    const upcastedLegacyFields = this.executeAncestralMutationPass<K>(
      payload,
      ctx,
      injectedKey,
    );

    if (upcastedLegacyFields !== false) {
      /**
       * 🛞 THE AUTOMATED STRUCTURAL INFLATION BRIDGE
       * Framework Action: The engine takes the developer's manipulated, filtered partial* legacy output object, automatically backfills or inflates it into today's base structure,* and pipes it straight through Lane 1 so your current() closure runs sequentially in tandem!*/
      // const currentKey = ctx.currentKey as string;
      if (
        !Object.prototype.hasOwnProperty.call(upcastedLegacyFields, 'items')
      ) {
        Reflect.set(upcastedLegacyFields, 'items', []);
      }
      const chainedPipelineResult = this.executeActiveGenerationLane(
        upcastedLegacyFields,
        ctx,
      );
      if (chainedPipelineResult !== false) {
        return chainedPipelineResult;
      }
    }
    return this.executeDefaultFallback(
      ctx,
      payload,
      'UNEXPECTED_STREAM_COLLAPSE',
      injectedKey,
    );
  }
}

export const xalethorVaultMatch = new XalethorVaultMatch();

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// import type { TApplyNominalBrand, IXalorDriftContext } from '../models/types';
// import { isRegistryKey, isRecord } from '../../shared/utils';
// import { isObjectShape } from '../../shared/shape-domain/guards';
// import { xalethorVaultKeeper } from './vault-keeper';
// import { xalethorVaultValidation } from './vault-validation';
// import {
//   markAsSolid,
//   refinePayloadContract,
//   refineAncestralContract,
//   refineToCurrentModel,
//   refineToAncestralModel,
//   refineToBrandedResult,
// } from '../utils';
// import { BRAND_SYMBOL } from '../../shared';
// import { XALOR_MATCH_ERROR_MESSAGES } from '../models/constants';

// export class XalethorVaultMatch {
//   // =================================================
//   // =================================================
//   // Perimeter Guards
//   // =================================================
//   // =================================================
//   private static pruneUnknownProperties<T extends keyof ISolidRegistry>(
//     targetBlueprintKey: T,
//     payload: Record<string, unknown>,
//   ): void {
//     /* prettier-ignore */
//     const activeBlueprint = xalethorVaultKeeper.peek('blueprint', targetBlueprintKey);
//     if (!isRegistryKey(targetBlueprintKey)) return;

//     if (!activeBlueprint || !isObjectShape(activeBlueprint)) return;

//     const allowedProperties = activeBlueprint.properties;

//     for (const currentKey of Object.keys(payload)) {
//       /* prettier-ignore */
//       if (!Object.prototype.hasOwnProperty.call(allowedProperties, currentKey)) {
//        delete payload[currentKey];
//       }
//     }
//   }
//   private static enforceStrictValidation<T extends keyof ISolidRegistry>(
//     targetBlueprintKey: T,
//     payload: Record<string, unknown>,
//   ): boolean {
//     /* prettier-ignore */
//     const activeBlueprint = xalethorVaultKeeper.peek('blueprint', targetBlueprintKey);

//     if (!activeBlueprint || !isObjectShape(activeBlueprint)) return false;

//     const runtimeKeysCount = Object.keys(payload).length;
//     const allowedKeysCount = Object.keys(activeBlueprint.properties).length;

//     return runtimeKeysCount === allowedKeysCount;
//   }
//   // =================================================
//   // =================================================
//   // DEFAULT HANDLER
//   // =================================================
//   // =================================================

//   public static executeDefaultFallback<K extends keyof ISolidDriftRegistry, R>(
//     defaultHandler: () => R,
//     errorMessage: keyof typeof XALOR_MATCH_ERROR_MESSAGES,
//   ): TApplyNominalBrand<R> {
//     const fallbackResult = defaultHandler();

//     if (refineToBrandedResult<K, R>(fallbackResult)) return fallbackResult;

//     throw new Error(`[xalor] 🚨 ${XALOR_MATCH_ERROR_MESSAGES[errorMessage]}`);
//   }
//   // =================================================
//   // =================================================
//   // DRIFT ACTIONS
//   // =================================================
//   // =================================================
//   /* prettier-ignore */
//   public static executeActiveGenerationLane<K extends keyof ISolidDriftRegistry, R>(
//     payload: Record<string, unknown>,
//     ctx: IXalorDriftContext<K, R>,
//   ): TApplyNominalBrand<R> | false {
//     const { current, currentKey, strict } = ctx;
//     /* prettier-ignore */
//     const isValidCurrentShape = xalethorVaultValidation.validateShapeByKey(payload, currentKey);

//     if (isValidCurrentShape) {
//       if (!strict || this.enforceStrictValidation(currentKey, payload)) {
//         Reflect.set(payload, BRAND_SYMBOL, ['Solid', currentKey]);
//         /* prettier-ignore */
//         if (markAsSolid<typeof currentKey, ISolidRegistry[typeof currentKey]>(payload)) {
//           /* prettier-ignore */
//           if (refineToCurrentModel<K, typeof currentKey>(payload, currentKey)) {

//             // 🟢 THE ATOMIC REFINEMENT POINT:
//             // Establishes an uncompromised structural typing bridge natively.
//             // TypeScript traces this branch and unlocks safe variable passing.
//             if (refinePayloadContract<K>(payload)) {
//               const executionResult = current(payload);

//               if (refineToBrandedResult<K, R>(executionResult)) {
//                 return executionResult;
//               }
//             }
//           }
//         }
//       }
//     }
//     return false;
//   }
//   /* prettier-ignore */
//   public static executeAncestralMigrationLane<K extends keyof ISolidDriftRegistry, R>(
//     payload: Record<string, unknown>,
//     ctx: IXalorDriftContext<K, R>,
//   ): TApplyNominalBrand<R> | false {
//     /* prettier-ignore */
//     const { v1_ancestor, prune, strict, currentKey, ancestralKey, default: defaultHandler } = ctx;

//     if (!isRegistryKey(ancestralKey)) {
//       return this.executeDefaultFallback<K, R>(
//         defaultHandler,
//         'ANCESTRAL_KEY_MISSING_FROM_VAULT',
//       );
//     }

//     /* prettier-ignore */
//     if (!xalethorVaultValidation.validateShapeByKey(payload, ancestralKey)) return false;
//     /* prettier-ignore */
//     if (strict && !this.enforceStrictValidation(ancestralKey, payload)) return false;

//     Reflect.set(payload, BRAND_SYMBOL, ['Solid', ancestralKey]);
//     /* prettier-ignore */
//     if (!markAsSolid<typeof ancestralKey, ISolidRegistry[typeof ancestralKey]>(payload)) return false;
//     /* prettier-ignore */
//     if (!refineToAncestralModel<K, typeof ancestralKey>(payload, ancestralKey)) return false;

//     if (refineAncestralContract<K>(payload)) {
//       const upcastOutput = v1_ancestor(payload);
//       if (!isRecord(upcastOutput)) return false;

//       if (prune) {
//         this.pruneUnknownProperties(currentKey, upcastOutput);
//       }

//       /* prettier-ignore */
//       if (!xalethorVaultValidation.validateShapeByKey(upcastOutput, currentKey)) return false;
//       /* prettier-ignore */
//       if (strict && !this.enforceStrictValidation(currentKey, upcastOutput)) return false;

//       Reflect.set(upcastOutput, BRAND_SYMBOL, ['Solid', currentKey]);
//       /* prettier-ignore */
//       if (!markAsSolid<typeof currentKey, ISolidRegistry[typeof currentKey]>(upcastOutput)) {
//         return false;
//       }

//       if (refineToBrandedResult<K, R>(upcastOutput)) {
//         return upcastOutput;
//       }
//     }
//     return false;
//   }
// }
