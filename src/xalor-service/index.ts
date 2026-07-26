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
  TDriftErrorInterceptor,
} from '../models/types';
// import { isRecord } from '../../shared/utils';
class XalethorService {
  // ============================================================
  // ============================================================
  // ============================================================
  // XalethorVaultKeeper
  // ============================================================
  // ============================================================
  // ============================================================
  /* prettier-ignore */
  public  solidify(raw: TSolidMetadata): void {
    xalethorVaultKeeper.solidify(raw);
  }
  /* prettier-ignore */
  public  solidifyDrifts(driftTracks: TTripleKV['driftTracking']): void {
     xalethorVaultKeeper.solidifyDrifts(driftTracks);
  }
  public blueprintVault(key: string) {
    return xalethorVaultKeeper.peek('blueprint', key);
  }
  public driftTrackingVault(key: string) {
    return xalethorVaultKeeper.peek('driftTracking', key);
  }
  public manifestVault(key: string) {
    return xalethorVaultKeeper.peek('manifest', key);
  }
  public registryVault(key: string) {
    return xalethorVaultKeeper.peek('registry', key);
  }
  public inspectMetaData(key: string) {
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
  public  formatReport(key: string, errors?: readonly TSolidError[]): string {
    return xalethorVaultDiagnostics.formatReport(key, errors);
  }
  /* prettier-ignore */
  public  compileAuditReport(targetKey: string, isValid: boolean, rawErrors: readonly TSolidError[]): TXalorAuditReport {
     return xalethorVaultDiagnostics.compileAuditReport(targetKey, isValid, rawErrors);
  }
  public getKeyErrors(key: string): TSolidError[] {
    return xalethorVaultValidation.getErrors(key);
  }
  public setErrors(key: string, errors: TSolidError[]): void {
    return xalethorVaultValidation.setErrors(key, errors);
  }
  public clearErrors(key?: string): void {
    return xalethorVaultValidation.clearErrors(key);
  }
  public reportError(params: TReportErrorParams): false {
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
  public  validateShapeByKey(data: unknown, key: string): boolean {
    return xalethorVaultValidation.validateShapeByKey(data, key);
  }
  /* prettier-ignore */
  public  validateShapeByKeySafe( data: unknown, key: string): TXalorEvaluationResult {
    return xalethorVaultValidation.validateShapeByKeySafe(data, key);
  }
  /* prettier-ignore */
  public  validateShape(data: unknown,  shape: TSolidShape, ctx: TValidationContext, blueprintId?: string,): boolean {
    return xalethorVaultValidation.validateShape(data, shape, ctx, blueprintId);
  }
  public createInitialContext(key: string): TValidationContext {
    return xalethorVaultValidation.createInitialContext(key);
  }
  public panic(key: string, customMessage?: string | undefined): never {
    return xalethorVaultDiagnostics.panic(key, customMessage);
  }

  // ============================================================
  // ============================================================
  // ============================================================
  // GENERATOR
  // ============================================================
  // ============================================================
  // ============================================================
  public produceDefault<K extends TActiveRegistryKeys>(
    key: K,
  ): TResolveRegistryStructure<K> {
    return xalethorVaultGenerator.getDefaultRaw(key);
  }
  public produceMock<K extends TActiveRegistryKeys>(
    key: K,
  ): TResolveRegistryStructure<K> {
    return xalethorVaultGenerator.getMockRaw(key);
  }

  public produceCast<K extends TActiveRegistryKeys>(
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

  public executeMergeSanitizer<K extends TActiveRegistryKeys>(
    ctx: TXalorMergeContexts<TResolveRegistryStructure<K>>,
    injectedKey: K,
  ): Record<string, unknown> {
    const blueprintShape = this.blueprintVault(injectedKey);
    /* prettier-ignore */
    return xalethorVaultTransform.transformMerge<K, typeof ctx>(ctx, blueprintShape);
  }
  public produceClone<K extends TActiveRegistryKeys>(
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
  public driftErrorHandler: TDriftErrorInterceptor = (...params) => {
    return xalethorVaultMatchDrift.driftErrorInterceptor(...params);
  };
  public executeDriftMatcher<K extends TActiveDriftRegistryKeys>(
    payload: unknown,
    ctx: IXalorDriftContext<K>,
    injectedKey: K,
  ): TResolveDriftReturnConstraint<K> {
    /* prettier-ignore */
    return xalethorVaultMatchDrift.executeDriftMatcher<K>(payload, ctx, injectedKey);
  }
}

export const xalethorCoreService = new XalethorService();
