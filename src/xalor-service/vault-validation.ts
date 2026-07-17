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
  TFastPathMetadata,
} from '../models/types';

class XalethorVaultValidation {
  public STR_FAST_PATH_REGISTRY = new Map<string, TFastPathMetadata>();
  public REF_FAST_PATH_REGISTRY = new WeakMap<object, TFastPathMetadata>();
  public INSTANCE_VALIDATION_REGISTRY = new WeakMap<object, boolean>();
  /**
   * Safe, public clean-up hook to execute during test hydration or re-seeding sweeps.
   */
  public purgeRuntimeCache(): void {
    this.STR_FAST_PATH_REGISTRY.clear();
    this.REF_FAST_PATH_REGISTRY = new WeakMap<object, TFastPathMetadata>();
  }

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
      refStack: new Array(25),
      isInvalidCircular: false,
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

    if (!isValid || ctx.errors.length > 0) {
      return { isValid: false, errors: ctx.errors };
    }

    return { isValid: true, errors: null };
  }
  /**
   * Statefully tracks validation results inside global reference registries.
   */
  public validateShapeByKey(data: unknown, key: string): boolean {
    this.clearErrors(key);
    const evaluation = this.evaluateShapeByKey(data, key);

    if (!evaluation.isValid) {
      this.setErrors(key, [...evaluation.errors]);

      return false;
    }

    return true;
  }
  /* prettier-ignore */
  public validateShapeByKeySafe( data: unknown, key: string): TXalorEvaluationResult {

    const evaluation = this.evaluateShapeByKey(data, key);

    if (!evaluation.isValid) {
      this.setErrors(key, evaluation.errors ? [...evaluation.errors] : []);
      return evaluation;
    }

    this.clearErrors(key);
    return evaluation;
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
      if (ctx.depth > 1) {
        const seenShapes = ctx.seen.get(data);
        if (seenShapes !== undefined) {
          if (seenShapes.has(shape)) return true;
          seenShapes.add(shape);
        } else {
          ctx.seen.set(data, new Set([shape]));
        }
      }
    }

    const validator = SHAPE_VALIDATION_MAPPER[shape.kind];
    if (!isFunction(validator)) {
      return this.reportError({
        ctx,
        errorKey: 'ENGINE_FATAL_UNSUPPORTED_SHAPE_KIND',
        received: shape.kind,
        shapeContext: shape,
      });
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

    ctx.errors.push({
      key: ctx.currentKey,
      pathSnapshot: ctx.pathStack.slice(0, ctx.pathPointer),
      errorKey,
      received,
      shapeContext,
    });

    return false;
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
