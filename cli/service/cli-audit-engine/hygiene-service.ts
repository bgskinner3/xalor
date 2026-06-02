import type {
  IXalorAuditPayload,
  TXalorAuditNode,
  TDepthWarning,
  TDuplicateShape,
  TCalculateDepthParams,
  TTaxonomyTokenKeys,
} from '../../models/types';
import type {
  TDeepWriteable,
  TTripleKV,
  TSolidShape,
} from '../../../shared/types';
import {
  DEPTH_STRATEGY_MAPPER,
  DEPTH_COMPLEXITY_MAPPER,
} from '../../models/constants';
import { IS_SOLID_CONFIG_ITEMS } from '../../../shared';

/**  @see {@link AuditServiceDocs.evaluateSystemHygieneAndDepthAlarms} */
class HygieneService {
  /**  @see {@link AuditServiceDocs.calculateBlueprintDepth} */
  private calculateBlueprintDepth({
    traversalStack,
    shape,
    blueprints,
  }: TCalculateDepthParams): number {
    const { reifyLimit } = IS_SOLID_CONFIG_ITEMS;
    if (traversalStack.length >= reifyLimit.maxDepth) return 25;

    const runDistributedStrategy = <K extends TSolidShape['kind']>(
      targetKind: K,
      targetShape: Extract<TSolidShape, { kind: K }>,
    ): number => {
      // Direct lookup from your authoritative DEPTH_STRATEGY_MAPPER constant matrix
      const handler = DEPTH_STRATEGY_MAPPER[targetKind];

      // Safe execution checkpoint guard
      if (!handler) return 0;

      /* prettier-ignore */
      const self = ({shape, blueprints,traversalStack}: TCalculateDepthParams) =>
          this.calculateBlueprintDepth({
            shape,
            blueprints,
            traversalStack,
          });

      return handler(targetShape, blueprints, traversalStack, self);
    };
    return runDistributedStrategy(shape.kind, shape);
  }

  private mapDepthToComplexity(depth: number): TTaxonomyTokenKeys {
    for (const rule of DEPTH_COMPLEXITY_MAPPER) {
      if (rule.test(depth)) return rule.key;
    }
    return 'FLAT_O1';
  }

  public evaluateSystemHygieneAndDepthAlarms(
    vault: TTripleKV,
    compiledNodes: TDeepWriteable<TXalorAuditNode>[],
  ): IXalorAuditPayload['hygiene'] {
    const { reifyLimit } = IS_SOLID_CONFIG_ITEMS;
    const warningAlarmThreshold = reifyLimit.depthAlarmThreshold;

    const depthWarnings: TDepthWarning[] = [];
    const duplicateShapes: TDuplicateShape[] = [];
    const inverseHashCluster: Record<string, string[]> = {};

    let totalCriticalDepthWarnings = 0;

    compiledNodes.forEach((node) => {
      if (node === undefined || node === null) return;

      const { identity, metrics } = node;
      const { typeKey, casFingerprint } = identity;
      const rootShape = vault.blueprints[casFingerprint];

      let calculatedDepth = 0;
      if (rootShape !== undefined) {
        calculatedDepth = this.calculateBlueprintDepth({
          shape: rootShape,
          blueprints: vault.blueprints,
          traversalStack: [],
        });
      }

      metrics.depth = calculatedDepth;
      metrics.complexityScore = this.mapDepthToComplexity(calculatedDepth);

      if (calculatedDepth >= warningAlarmThreshold) {
        totalCriticalDepthWarnings++;
        depthWarnings.push({
          typeKey,
          currentDepth: calculatedDepth,
        });
      }

      const bucket = (inverseHashCluster[casFingerprint] ??= []);
      bucket.push(typeKey);

      if (bucket.length === 2) {
        duplicateShapes.push({
          canonicalHash: casFingerprint,
          conflictingKeys: bucket,
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
