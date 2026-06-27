import type {
  IXalorAuditPayload,
  TXalorAuditNode,
  TDepthWarning,
  TDuplicateShape,
  TCalculatedMetricsResult,
} from '../../models/types';
import type { TDeepWriteable, TTripleKV } from '../../../shared/types';
import { IS_SOLID_CONFIG_ITEMS } from '../../../shared/constants';
import { isUndefined, isNull } from '../../../shared/utils/guards';
import { complexityService } from '../complexity-service';

/**  @see {@link AuditServiceDocs.evaluateSystemHygieneAndDepthAlarms} */
class HygieneService {
  /**  @see {@link AuditServiceDocs.calculateBlueprintDepth} */
  /**
   * trackStructuralDuplication
   *
   * ROLE: Executes a high-speed single-pass look-ahead check to register
   * duplicate structures without wasting unnecessary runtime array allocations.
   */
  private trackStructuralDuplication(
    typeKey: string,
    casFingerprint: string,
    casFirstSeenKeyMap: Map<string, string>,
    casConflictArrayMap: Map<string, string[]>,
    duplicateShapes: TDuplicateShape[],
  ): void {
    if (!casFirstSeenKeyMap.has(casFingerprint)) {
      casFirstSeenKeyMap.set(casFingerprint, typeKey);
    } else {
      let conflictBucket = casConflictArrayMap.get(casFingerprint);
      if (!conflictBucket) {
        const initialSeenKey = casFirstSeenKeyMap.get(casFingerprint)!;
        conflictBucket = [initialSeenKey, typeKey];
        casConflictArrayMap.set(casFingerprint, conflictBucket);
        duplicateShapes.push({
          canonicalHash: casFingerprint,
          conflictingKeys: conflictBucket,
        });
      } else {
        conflictBucket.push(typeKey);
      }
    }
  }

  /**
   * evaluateSystemHygieneAndDepthAlarms
   *
   * ROLE: Orchestrates the multi-lane metrics collection sweep point-free, using a two-stage
   * normalization timeline to dynamic-grade 5-tier taxonomy tokens across your workspace.
   */
  public evaluateSystemHygieneAndDepthAlarms(
    vault: TTripleKV,
    compiledNodes: TDeepWriteable<TXalorAuditNode>[],
  ): IXalorAuditPayload['hygiene'] {
    const { reifyLimit } = IS_SOLID_CONFIG_ITEMS;
    const warningAlarmThreshold = reifyLimit.depthAlarmThreshold;

    const depthWarnings: TDepthWarning[] = [];
    const duplicateShapes: TDuplicateShape[] = [];
    let totalCriticalDepthWarnings = 0;

    const casFirstSeenKeyMap = new Map<string, string>();
    const casConflictArrayMap = new Map<string, string[]>();

    const intermediateMetricsMap = new Map<string, TCalculatedMetricsResult>();
    let absoluteWorkspaceMaxScore = 0;

    compiledNodes.forEach((node) => {
      if (isUndefined(node) || isNull(node)) return;

      const { typeKey, casFingerprint } = node.identity;
      const rootShape = vault.blueprints[casFingerprint];

      if (!isUndefined(rootShape) || !isNull(rootShape)) {
        const result = complexityService.harvestBlueprintMetrics(
          rootShape,
          vault.blueprints,
        );

        intermediateMetricsMap.set(casFingerprint, result);

        if (result.rawComplexityScore > absoluteWorkspaceMaxScore) {
          absoluteWorkspaceMaxScore = result.rawComplexityScore;
        }
      }

      /* prettier-ignore */
      this.trackStructuralDuplication( typeKey, casFingerprint, casFirstSeenKeyMap, casConflictArrayMap, duplicateShapes);
    });

    compiledNodes.forEach((node) => {
      if (isUndefined(node) || isNull(node)) return;

      const { typeKey, casFingerprint } = node.identity;
      const cachedMetrics = intermediateMetricsMap.get(casFingerprint);

      // Default safe metrics fallback values for empty or missing blueprint shells
      let depth = 0;
      let nodesCollapsed = 1;
      let rawScore = 0;

      if (cachedMetrics !== undefined) {
        depth = cachedMetrics.depth;
        nodesCollapsed = cachedMetrics.nodesCollapsed;
        rawScore = cachedMetrics.rawComplexityScore;
      }

      // Reflectively assign the fresh, updated metrics block back to your record entries
      Reflect.set(node, 'metrics', {
        depth,
        nodesCollapsed,
        // Scale and assign the extended 5-tier Big-O tokens dynamically based on workspace max!
        complexityScore: complexityService.mapScoreToExtendedTaxonomy(
          rawScore,
          absoluteWorkspaceMaxScore,
        ),
      });

      // Monitor depth line safety boundaries
      if (depth >= warningAlarmThreshold) {
        totalCriticalDepthWarnings++;
        depthWarnings.push({
          typeKey,
          currentDepth: depth,
        });
      }
    });

    return {
      totalOrphanedKeys: 0,
      totalCriticalDepthWarnings,
      depthWarnings: Object.freeze(depthWarnings),
      duplicateShapes: Object.freeze(duplicateShapes),
    };
  }
}

export const hygieneService = new HygieneService();
