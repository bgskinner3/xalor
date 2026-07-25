import type {
  TSolidMetadata,
  TSolidError,
  TTripleKV,
  TSolidShape,
  TValidationContext,
} from '../../shared';
import { xalethorVaultKeeper } from './vault-keeper';
import { xalethorVaultGenerator } from './vault-generator';
import { xalethorVaultTransform } from './vault-transform';
import { xalethorVaultMatchDrift } from './vault-match';
import { xalethorVaultValidation } from './vault-validation';
import { xalethorVaultDiagnostics } from './vault-diagnostics';
import type {
  IXalorDriftContext,
  // TApplyNominalBrand,
  TXalorMergeContexts,
  TResolveDriftReturnConstraint,
  TReportErrorParams,
  TXalorAuditReport,
  TXalorEvaluationResult,
  // TCalculateFinalMergeOutput,
} from '../models/types';
// import { isRecord } from '../../shared/utils';
export class XalethorService {
  // ============================================================
  // ============================================================
  // ============================================================
  // XalethorVaultKeeper
  // ============================================================
  // ============================================================
  // ============================================================
  /* prettier-ignore */
  public static solidify(raw: TSolidMetadata): void {
    xalethorVaultKeeper.solidify(raw);
  }
  /* prettier-ignore */
  public static solidifyDrifts(driftTracks: TTripleKV['driftTracking']): void {
     xalethorVaultKeeper.solidifyDrifts(driftTracks);
  }
  public static blueprintVault(key: string) {
    return xalethorVaultKeeper.peek('blueprint', key);
  }
  public static driftTrackingVault(key: string) {
    return xalethorVaultKeeper.peek('driftTracking', key);
  }
  public static manifestVault(key: string) {
    return xalethorVaultKeeper.peek('manifest', key);
  }
  public static registryVault(key: string) {
    return xalethorVaultKeeper.peek('registry', key);
  }
  public static inspectMetaData(key: string) {
    return xalethorVaultKeeper.resolve(key);
  }

  // ============================================================
  // ============================================================
  // ============================================================
  // ERROR AND DIAGNOSTICS
  // ============================================================
  // ============================================================
  // ============================================================
  /* prettier-ignore */
  public static formatReport(key: string, errors?: readonly TSolidError[]): string {
    return xalethorVaultDiagnostics.formatReport(key, errors);
  }
  /* prettier-ignore */
  public static compileAuditReport(targetKey: string, isValid: boolean, rawErrors: readonly TSolidError[]): TXalorAuditReport {
     return xalethorVaultDiagnostics.compileAuditReport(targetKey, isValid, rawErrors);
  }
  public static getKeyErrors(key: string): TSolidError[] {
    return xalethorVaultValidation.getErrors(key);
  }
  public static setErrors(key: string, errors: TSolidError[]): void {
    return xalethorVaultValidation.setErrors(key, errors);
  }
  public static clearErrors(key?: string): void {
    return xalethorVaultValidation.clearErrors(key);
  }
  public static reportError(params: TReportErrorParams): false {
    return xalethorVaultValidation.reportError(params);
  }

  // ============================================================
  // ============================================================
  // ============================================================
  // VALIDATOR
  // ============================================================
  // ============================================================
  // ============================================================
  /* prettier-ignore */
  public static validateShapeByKey(data: unknown, key: string): boolean {
    return xalethorVaultValidation.validateShapeByKey(data, key);
  }
  /* prettier-ignore */
  public static validateShapeByKeySafe( data: unknown, key: string): TXalorEvaluationResult {
    return xalethorVaultValidation.validateShapeByKeySafe(data, key);
  }
  /* prettier-ignore */
  public static validateShape(data: unknown,  shape: TSolidShape, ctx: TValidationContext, blueprintId?: string,): boolean {
    return xalethorVaultValidation.validateShape(data, shape, ctx, blueprintId);
  }
  public static createInitialContext(key: string): TValidationContext {
    return xalethorVaultValidation.createInitialContext(key);
  }
  public static panic(key: string, customMessage?: string | undefined): never {
    return xalethorVaultDiagnostics.panic(key, customMessage);
  }

  // ============================================================
  // ============================================================
  // ============================================================
  // GENERATOR
  // ============================================================
  // ============================================================
  // ============================================================
  public static produceDefault<K extends TActiveRegistryKeys>(
    key: K,
  ): TResolveRegistryStructure<K> {
    return xalethorVaultGenerator.getDefaultRaw(key);
  }
  public static produceMock<K extends TActiveRegistryKeys>(
    key: K,
  ): TResolveRegistryStructure<K> {
    return xalethorVaultGenerator.getMockRaw(key);
  }

  public static produceCast<K extends TActiveRegistryKeys>(
    data: unknown,
    key: K,
  ): TResolveRegistryStructure<K> {
    return xalethorVaultGenerator.getCastRaw(data, key);
  }
  // ============================================================
  // ============================================================
  // ============================================================
  // Transformer
  // ============================================================
  // ============================================================
  // ============================================================

  public static executeMergeSanitizer<K extends TActiveRegistryKeys>(
    ctx: TXalorMergeContexts<TResolveRegistryStructure<K>>,
    injectedKey: K,
  ): Record<string, unknown> {
    const blueprintShape = XalethorService.blueprintVault(injectedKey);
    /* prettier-ignore */
    return xalethorVaultTransform.transformMerge<K, typeof ctx>(ctx, blueprintShape);
  }
  public static produceClone<K extends TActiveRegistryKeys>(
    data: unknown,
    key: K,
  ): TResolveRegistryStructure<K> {
    return xalethorVaultTransform.getClone(data, key);
  }
  // ============================================================
  // ============================================================
  // ============================================================
  // MATCH
  // ============================================================
  // ============================================================
  // ============================================================
  public static executeDriftMatcher<K extends TActiveDriftRegistryKeys>(
    payload: unknown,
    ctx: IXalorDriftContext<K>,
    injectedKey: K,
  ): TResolveDriftReturnConstraint<K> {
    return xalethorVaultMatchDrift.executeDriftMatcher<K>(
      payload,
      ctx,
      injectedKey,
    );
  }
}
