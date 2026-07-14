import type {
  TSolidMetadata,
  TSolidError,
  TSolidBranded,
  TTripleKV,
  TSolidShape,
  TValidationContext,
} from '../../shared';
import { XalethorVaultKeeper } from './vault-keeper';
import { XalethorVaultGenerator } from './vault-generator';
import { XalethorVaultTransform } from './vault-transform';
import { XalethorVaultMatch } from './vault-match';
import { xalethorVaultValidation } from './vault-validation';
import { xalethorVaultDiagnostics } from './vault-diagnostics';
import type {
  IXalorDriftContext,
  TApplyNominalBrand,
  TXalorMergeContext,
  TResolveDriftReturnConstraint,
  TReportErrorParams,
  TXalorAuditReport,
} from '../models/types';
import { isRecord } from '../../shared/utils';
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
    XalethorVaultKeeper.solidify(raw);
  }
  /* prettier-ignore */
  public static solidifyDrifts(driftTracks: TTripleKV['driftTracking']): void {
     XalethorVaultKeeper.solidifyDrifts(driftTracks);
  }
  public static blueprintVault(key: string) {
    return XalethorVaultKeeper.peek('blueprint', key);
  }
  public static manifestVault(key: string) {
    return XalethorVaultKeeper.peek('manifest', key);
  }
  public static registryVault(key: string) {
    return XalethorVaultKeeper.peek('registry', key);
  }
  public static inspectMetaData(key: string) {
    return XalethorVaultKeeper.resolve(key);
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
  public static validateShapeByKey(data: unknown, key: string): boolean {
    return xalethorVaultValidation.validateShapeByKey(data, key);
  }
  /* prettier-ignore */
  public static validateShape(data: unknown,  shape: TSolidShape, ctx: TValidationContext, blueprintId?: string,): boolean {
    return xalethorVaultValidation.validateShape(data, shape, ctx, blueprintId);
  }
  public static createInitialContext(key: string): TValidationContext {
    return xalethorVaultValidation.createInitialContext(key);
  }
  public static panic(key: string, customMessage?: string | undefined): never {
    return xalethorVaultValidation.panic(key, customMessage);
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
  ): TSolidBranded<K, TResolveRegistryStructure<K>> {
    return XalethorVaultGenerator.getDefault(key);
  }
  public static produceMock<K extends TActiveRegistryKeys>(
    key: K,
  ): TSolidBranded<K, TResolveRegistryStructure<K>> {
    return XalethorVaultGenerator.getMock(key);
  }

  public static produceCast<K extends TActiveRegistryKeys>(
    data: unknown,
    key: K,
  ): TSolidBranded<K, TResolveRegistryStructure<K>> {
    return XalethorVaultGenerator.getCast(data, key);
  }
  // ============================================================
  // ============================================================
  // ============================================================
  // Transformer
  // ============================================================
  // ============================================================
  // ============================================================
  public static executeMergeSanitizer<K extends keyof ISolidRegistry>(
    ctx: TXalorMergeContext<ISolidRegistry[K]>,
  ): unknown {
    /* prettier-ignore */
    return XalethorVaultTransform.transformMerge<K>(ctx);
  }
  public static produceClone<K extends keyof ISolidRegistry>(
    data: unknown,
    key: K,
  ): TSolidBranded<K, ISolidRegistry[K]> {
    return XalethorVaultTransform.getClone(data, key);
  }
  // ============================================================
  // ============================================================
  // ============================================================
  // MATCH
  // ============================================================
  // ============================================================
  // ============================================================
  /* prettier-ignore */
  public static executeDriftMatcher<
    K extends keyof ISolidDriftRegistry,
    R extends TResolveDriftReturnConstraint<K> = TResolveDriftReturnConstraint<K>
  >(payload: unknown, ctx: IXalorDriftContext<K, R>): TApplyNominalBrand<R> {
    const { default: defaultHandler } = ctx;

    // Direct O(1) Perimeter Guard: Reject immediately if payload is not a record object
    if (!isRecord(payload)) {
      return XalethorVaultMatch.executeDefaultFallback<K, R>(
        defaultHandler,
        'MALFORMED_NON_RECORD_PAYLOAD',
      );
    }

    // PATH 1: THE ACTIVE GENERATION CHANNEL (The Hot Path Pass)
    const activeGenerationResult =
      XalethorVaultMatch.executeActiveGenerationLane<K, R>(payload, ctx);
    if (activeGenerationResult !== false) {
      return activeGenerationResult;
    }

    // PATH 2: THE ANCESTRAL MIGRATION CHANNEL (The Upcast Pass)
    const ancestralMigrationResult =
      XalethorVaultMatch.executeAncestralMigrationLane<K, R>(payload, ctx);
    if (ancestralMigrationResult !== false) {
      return ancestralMigrationResult;
    }

    //  TOTAL CIRCUIT BREAKER (Fallback Lane)
    return XalethorVaultMatch.executeDefaultFallback<K, R>(
      defaultHandler,
      'UNEXPECTED_STREAM_COLLAPSE',
    );
  }
}
