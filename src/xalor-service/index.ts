import type {
  TSolidMetadata,
  TSolidError,
  TSolidBranded,
  TTripleKV,
} from '../../shared';
import { XalethorVaultKeeper } from './vault-keeper';
import { XalethorVaultValidator } from './vault-validator';
import { XalethorVaultAuditor } from './vault-auditor';
import { XalethorVaultGenerator } from './vault-generator';
import { XalethorVaultTransform } from './vault-transform';
import { XalethorVaultMatch } from './vault-match';
import type {
  IXalorDriftContext,
  TApplyNominalBrand,
  TXalorMergeContext,
  TResolveDriftReturnConstraint,
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
  /* prettier-ignore */ public static solidify(raw: TSolidMetadata): void {
    XalethorVaultKeeper.solidify(raw);
  }
  /* prettier-ignore */ public static solidifyDrifts(driftTracks: TTripleKV['driftTracking']): void {
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
  // VALIDATOR
  // ============================================================
  // ============================================================
  // ============================================================
  public static validateShape(data: unknown, key: string): boolean {
    return XalethorVaultValidator.validateShape(data, key);
  }
  public static has(key: string): boolean {
    return XalethorVaultValidator.has(key);
  }
  // ============================================================
  // ============================================================
  // ============================================================
  // AUDITOR
  // ============================================================
  // ============================================================
  // ============================================================
  public static panic(key: string): never {
    return XalethorVaultAuditor.panic(key);
  }
  public static getKeyErrors(key: string): TSolidError[] {
    return XalethorVaultAuditor.getErrors(key);
  }
  public static auditReport(
    targetKey: string,
    isValid: boolean,
    rawErrors: TSolidError[],
  ) {
    return XalethorVaultAuditor.compileAuditReport(
      targetKey,
      isValid,
      rawErrors,
    );
  }

  // ============================================================
  // ============================================================
  // ============================================================
  // GENERATOR
  // ============================================================
  // ============================================================
  // ============================================================
  public static produceDefault<K extends keyof ISolidRegistry>(
    key: K,
  ): TSolidBranded<K, ISolidRegistry[K]> {
    return XalethorVaultGenerator.getDefault(key);
  }
  public static produceMock<K extends keyof ISolidRegistry>(
    key: K,
  ): TSolidBranded<K, ISolidRegistry[K]> {
    return XalethorVaultGenerator.getMock(key);
  }
  public static produceClone<K extends keyof ISolidRegistry>(
    data: unknown,
    key: K,
  ): TSolidBranded<K, ISolidRegistry[K]> {
    return XalethorVaultGenerator.getClone(data, key);
  }
  public static produceCast<K extends keyof ISolidRegistry>(
    data: unknown,
    key: K,
  ): TSolidBranded<K, ISolidRegistry[K]> {
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
