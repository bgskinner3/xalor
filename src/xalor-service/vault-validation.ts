import { ensureGlobalVault } from '../utils';
import type {
  TSolidError,
  TSolidVaultMap,
  TValidationContext,
  TSolidShape,
} from '../../shared';
import { isObject, isNull, isFunction } from '../../shared';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared/constants';
import { SHAPE_VALIDATION_MAPPER } from '../mappers';
import type {
  TXalorEvaluationResult,
  TReportErrorParams,
} from '../models/types';
import { xalethorVaultDiagnostics } from './vault-diagnostics';

class XalethorVaultValidation {
  /**
   * Safe registry hook.
   * COMPLIANCE: Eliminates mutations or local variable allocations on the class frame.
   */
  private get vault(): TSolidVaultMap {
    return ensureGlobalVault();
  }

  /**
   * Instantiates a clean, transient evaluation tracking context.
   * COMPLIANCE: Pre-allocates a fixed array buffer of 256 structural tracking locations.
   */
  public createInitialContext(key: string): TValidationContext {
    return {
      seen: new Map(),
      pathStack: new Array(256),
      pathPointer: 0,
      errors: [],
      currentKey: key,
      depth: 0,
    };
  }

  /**
   * Pure Validation Pipeline.
   * Executes deep structural verification over incoming payloads without
   * creating side-effects inside global error tracking registries.
   */
  public evaluateShapeByKey(
    data: unknown,
    key: string,
  ): TXalorEvaluationResult {
    const injectedKey = this.vault.references.get(key);
    if (!injectedKey) {
      return { isValid: false, errors: [] };
    }

    const shape = this.vault.blueprints.get(injectedKey);
    if (!shape) {
      return { isValid: false, errors: [] };
    }

    const ctx = this.createInitialContext(key);
    const isValid = this.validateShape(data, shape, ctx, injectedKey);

    if (!isValid) {
      return { isValid: false, errors: ctx.errors };
    }

    return { isValid: true, errors: null };
  }
  /**
   * Statefully tracks validation results inside global reference registries.
   */
  public validateShapeByKey(data: unknown, key: string): boolean {
    const evaluation = this.evaluateShapeByKey(data, key);

    if (!evaluation.isValid) {
      this.setErrors(key, [...evaluation.errors]);
      return false;
    }

    this.clearErrors(key);
    return true;
  }
  /**
   * Recursive execution loop. Tracks depth limits and memory references.
   * COMPLIANCE: Zero runtime strategy allocations. Direct  lookup.
   */
  public validateShape(
    data: unknown,
    shape: TSolidShape,
    ctx: TValidationContext,
    blueprintId?: string,
  ): boolean {
    const { reifyLimit } = IS_SOLID_CONFIG_ITEMS;
    if (ctx.depth > reifyLimit.maxDepth) return false;

    if (isObject(data) && !isNull(data)) {
      let seenShapes = ctx.seen.get(data);
      if (seenShapes?.has(shape)) return true;

      if (!seenShapes) {
        seenShapes = new Set([shape]);
        ctx.seen.set(data, seenShapes);
      } else {
        seenShapes.add(shape);
      }
    }

    const validator = SHAPE_VALIDATION_MAPPER[shape.kind];
    if (!isFunction(validator)) {
      throw new Error(
        `[xalor] 🚨 Unsupported shape kind: "${shape.kind}". ` +
          `Check your Bunker version against the current Engine.`,
      );
    }

    ctx.depth++;
    const result = validator(data, shape, ctx, blueprintId);
    ctx.depth--;
    return result;
  }

  /**
   * Captures validation failures instantly using flat data markers.
   * COMPLIANCE: Eliminates stack tracing, serialization, and string templates from the hot path.
   */
  public reportError(params: TReportErrorParams): false {
    const { ctx, errorKey, received, shapeContext } = params;
    const snapshot = ctx.pathStack.slice(0, ctx.pathPointer);

    ctx.errors.push({
      key: ctx.currentKey,
      pathSnapshot: snapshot,
      errorKey,
      received,
      shapeContext,
    });

    return false;
  }

  /**
   * Panic and crash mechanisms utilizing pure stream evaluations lazily on failure lanes.
   */
  public panic(key: string, customMessage?: string): never {
    const errors = this.getErrors(key);
    const report = xalethorVaultDiagnostics.formatReport(key, errors);
    const finalMessage =
      report ||
      `[xalor] 🚨 ${customMessage || 'Assertion failure'} for key: ${key}`;
    throw new Error(finalMessage);
  }

  public getErrors(key: string): TSolidError[] {
    return this.vault.errors?.get(key) ?? [];
  }
  public setErrors(key: string, errors: TSolidError[]): void {
    this.vault.errors?.set(key, [...errors]);
  }
  public clearErrors(key?: string): void {
    if (key) this.vault.errors?.delete(key);
    else this.vault.errors?.clear();
  }
}

export const xalethorVaultValidation = new XalethorVaultValidation();
