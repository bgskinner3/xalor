import type { TSolidObjectRawShape, TSolidShape } from '../../shared';
import type {
  TTaxonomyTokenKeys,
  TComplexityCrawlerMapper,
  TCalculatedMetricsResult,
  TComplexityParams,
  TMaxDepthCrawlerMapper,
} from '../models/types';
import {
  isUndefined,
  isNull,
  isInstanceOf,
  isUnionShape,
  isLiteralShape,
  isPrimitiveShape,
  isReferenceShape,
  isBrandedShape,
  isObjectShape,
  isArrayShape,
  isIntersectionShape,
  isFunctionShape,
  isInstanceOfShape,
} from '../../shared';
import { ObjectUtils, yieldItems } from '../../shared/utils';
import {
  INSTANCE_CATEGORY_WEIGHTS,
  COMPLEXITY_WEIGHT_MAPPER,
} from '../models/constants';
import { INSTANCE_REGISTRY_MAPPER } from '../../shared/shape-domain';

class ComplexityService {
  private accumulateSubTreeWeights(
    shapes: readonly TSolidShape[],
    pool: TComplexityParams['pool'],
    depth: number,
    visited: Set<string>,
    telemetry: TComplexityParams['telemetry'],
  ): number {
    return (yieldItems(shapes) || []).reduce((tally, subShape) => {
      if (isUndefined(subShape) || isNull(subShape)) return tally;
      /* prettier-ignore */
      return tally + this.calculateStructuralWeightCore(subShape, pool, depth, visited, telemetry);
    }, 0);
  }

  private readonly COMPLEXITY_CRAWLER_MAPPER: TComplexityCrawlerMapper = {
    primitive: (params) => {
      if (!isPrimitiveShape(params.shape)) return 0;
      return COMPLEXITY_WEIGHT_MAPPER.primitive;
    },

    literal: (params) => {
      if (!isLiteralShape(params.shape)) return 0;
      return COMPLEXITY_WEIGHT_MAPPER.literal;
    },

    union: (params) => {
      if (!isUnionShape(params.shape)) return 0;
      const { shape, pool, currentDepth, visited, telemetry } = params;
      /* prettier-ignore */
      return COMPLEXITY_WEIGHT_MAPPER.union + 
      this.accumulateSubTreeWeights(shape.values, pool, currentDepth, visited, telemetry);
    },
    intersection: (params) => {
      if (!isIntersectionShape(params.shape)) return 0;
      const { shape, pool, currentDepth, visited, telemetry } = params;
      /* prettier-ignore */
      return COMPLEXITY_WEIGHT_MAPPER.intersection + 
        this.accumulateSubTreeWeights(shape.values, pool, currentDepth, visited, telemetry);
    },

    branded: (params) => {
      if (!isBrandedShape(params.shape)) return 0;
      const { shape, pool, currentDepth, visited, telemetry } = params;
      /* prettier-ignore */
      return COMPLEXITY_WEIGHT_MAPPER.branded + 
        this.calculateStructuralWeightCore(shape.base, pool, currentDepth, visited, telemetry);
    },

    array: (params) => {
      if (!isArrayShape(params.shape)) return 0;
      const { shape, pool, currentDepth, visited, telemetry } = params;
      /* prettier-ignore */
      let totalWeight = COMPLEXITY_WEIGHT_MAPPER.array + 
        this.calculateStructuralWeightCore(shape.items, pool, currentDepth, visited, telemetry);

      if (!isUndefined(shape.elementShapes) && shape.elementShapes.length > 0) {
        /* prettier-ignore */
        totalWeight += this.accumulateSubTreeWeights(shape.elementShapes, pool, currentDepth, visited, telemetry);
      }

      return totalWeight;
    },

    object: (params) => {
      if (!isObjectShape(params.shape)) return 0;
      const { shape, pool, currentDepth, visited, telemetry } = params;
      let totalWeight = COMPLEXITY_WEIGHT_MAPPER.object;
      const properties = shape.properties;
      if (isUndefined(properties)) return totalWeight;

      ObjectUtils.keys(properties).forEach((key) => {
        const isDirect = Object.prototype.hasOwnProperty.call(properties, key);
        const property = properties[key];
        if (isDirect && !isUndefined(property)) {
          totalWeight += COMPLEXITY_WEIGHT_MAPPER.object;
          /* prettier-ignore */
          totalWeight += this.calculateStructuralWeightCore(property.shape, pool, currentDepth, visited, telemetry);
        }
      });
      return totalWeight;
    },

    function: (params) => {
      if (!isFunctionShape(params.shape)) return 0;
      const { shape, pool, currentDepth, visited, telemetry } = params;
      let totalWeight = COMPLEXITY_WEIGHT_MAPPER.function;

      (shape.parameters || []).forEach((param) => {
        if (!isUndefined(param)) {
          /* prettier-ignore */
          totalWeight += this.calculateStructuralWeightCore(param.shape, pool, currentDepth, visited, telemetry);
        }
      });
      /* prettier-ignore */
      totalWeight += this.calculateStructuralWeightCore(shape.returnType, pool, currentDepth, visited, telemetry);
      return totalWeight;
    },

    reference: (params) => {
      if (!isReferenceShape(params.shape)) return 0;
      const { shape, pool, currentDepth, visited, telemetry } = params;

      if (visited.has(shape.name)) return 0;

      const referencedShape = this.resolveBlueprint(shape.name, pool);
      if (!isUndefined(referencedShape) && !isNull(referencedShape)) {
        const childVisited = new Set<string>(visited);
        childVisited.add(shape.name);
        /* prettier-ignore */
        return this.calculateStructuralWeightCore(referencedShape, pool, currentDepth, childVisited, telemetry);
      }

      return 0;
    },

    instanceof: (params) => {
      if (!isInstanceOfShape(params.shape)) return 0;

      const targetKey = params.shape.name;
      const instanceMeta = INSTANCE_REGISTRY_MAPPER[targetKey];
      /* prettier-ignore */
      const categoryWeight = instanceMeta ? INSTANCE_CATEGORY_WEIGHTS[instanceMeta.category] : 4;
      return COMPLEXITY_WEIGHT_MAPPER.instanceof + (categoryWeight ?? 4);
    },
  } satisfies TComplexityCrawlerMapper;

  private resolveBlueprint(
    name: string,
    pool: Record<string, TSolidShape> | Map<string, TSolidShape>,
  ): TSolidShape | undefined {
    return isInstanceOf(pool, Map) ? pool.get(name) : pool[name];
  }
  private calculateStructuralWeightCore(
    shape: TSolidShape,
    blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
    indentDepth: number,
    visited: Set<string>,
    telemetry: { nodesCount: number },
  ): number {
    telemetry.nodesCount += 1;
    /* prettier-ignore */
    const baseParams = { pool: blueprintsPool, currentDepth: indentDepth, visited, telemetry };

    const handler = this.COMPLEXITY_CRAWLER_MAPPER[shape.kind];
    return handler({ shape, ...baseParams });
  }
  private calculateMaxArrayDepth(
    shapes: readonly TSolidShape[],
    pool: Record<string, TSolidShape> | Map<string, TSolidShape>,
    visited: Set<string>,
  ): number {
    return (yieldItems(shapes) || []).reduce((absoluteMax, subShape) => {
      if (isUndefined(subShape) || isNull(subShape)) return absoluteMax;
      const currentDepth = this.calculateMaxDepthCore(subShape, pool, visited);
      return currentDepth > absoluteMax ? currentDepth : absoluteMax;
    }, 0);
  }

  private readonly MAX_DEPTH_STRATEGY_MAPPER: TMaxDepthCrawlerMapper = {
    primitive: () => 1,
    literal: () => 1,
    instanceof: () => 1,

    branded: (params) => {
      /* prettier-ignore */ return this.calculateMaxDepthCore(params.shape.base, params.pool, params.visited);
    },

    array: (params) => {
      /* prettier-ignore */ return 1 + this.calculateMaxDepthCore(params.shape.items, params.pool, params.visited);
    },

    union: (params) => {
      /* prettier-ignore */ return this.calculateMaxArrayDepth(params.shape.values, params.pool, params.visited);
    },

    intersection: (params) => {
      /* prettier-ignore */ return this.calculateMaxArrayDepth(params.shape.values, params.pool, params.visited);
    },

    reference: (params) => {
      const { shape, pool, visited } = params;
      if (visited.has(shape.name)) return 0;

      const refShape = this.resolveBlueprint(shape.name, pool);
      if (!refShape) return 0;

      const subVisited = new Set<string>(visited);
      subVisited.add(shape.name);
      return this.calculateMaxDepthCore(refShape, pool, subVisited);
    },

    object: (params) => {
      const { shape, pool, visited } = params;
      const properties = shape.properties;
      if (isUndefined(properties)) return 1;

      const propertyKeys = ObjectUtils.keys(properties);
      const len = propertyKeys.length;
      if (len === 0) return 1;

      let maxSubDepth = 0;
      for (let i = 0; i < len; i++) {
        const key = propertyKeys[i];
        if (isUndefined(key)) continue;

        const property: TSolidObjectRawShape = properties[key];
        if (isUndefined(property)) continue;

        const d = this.calculateMaxDepthCore(property.shape, pool, visited);
        if (d > maxSubDepth) maxSubDepth = d;
      }
      return 1 + maxSubDepth;
    },

    function: (params) => {
      const { shape, pool, visited } = params;
      const paramsArray = shape.parameters.map((p) => p.shape);

      /* prettier-ignore */
      const maxParamDepth = this.calculateMaxArrayDepth(paramsArray, pool, visited);
      /* prettier-ignore */
      const retDepth = this.calculateMaxDepthCore(shape.returnType, pool, visited);
      return 1 + Math.max(maxParamDepth, retDepth);
    },
  } satisfies TMaxDepthCrawlerMapper;

  private calculateMaxDepthCore(
    shape: TSolidShape,
    pool: Record<string, TSolidShape> | Map<string, TSolidShape>,
    visited: Set<string>,
  ): number {
    if (isUndefined(shape) || isNull(shape)) return 0;

    const baseParams = { pool, visited };

    // ======================================================================== //
    // 🛡️ THE EXHAUSTIVENESS VERIFICATION DEPTH DISPATCH TABLE
    // Enforces complete compile-time kind coverage point-free with zero switches!
    // ======================================================================== //
    const DEPTH_DISPATCHER: {
      [K in TSolidShape['kind']]: (
        s: Extract<TSolidShape, { kind: K }>,
      ) => number;
    } = {
      /* prettier-ignore */ primitive: (s) => this.MAX_DEPTH_STRATEGY_MAPPER.primitive({ shape: s, ...baseParams }),
      /* prettier-ignore */ literal: (s) => this.MAX_DEPTH_STRATEGY_MAPPER.literal({ shape: s, ...baseParams }),
      /* prettier-ignore */ union: (s) => this.MAX_DEPTH_STRATEGY_MAPPER.union({ shape: s, ...baseParams }),
      /* prettier-ignore */ branded: (s) => this.MAX_DEPTH_STRATEGY_MAPPER.branded({ shape: s, ...baseParams }),
      /* prettier-ignore */ reference: (s) => this.MAX_DEPTH_STRATEGY_MAPPER.reference({ shape: s, ...baseParams }),
      /* prettier-ignore */ array: (s) => this.MAX_DEPTH_STRATEGY_MAPPER.array({ shape: s, ...baseParams }),
      /* prettier-ignore */ object: (s) => this.MAX_DEPTH_STRATEGY_MAPPER.object({ shape: s, ...baseParams }),
      /* prettier-ignore */ intersection: (s) => this.MAX_DEPTH_STRATEGY_MAPPER.intersection({ shape: s, ...baseParams }),
      /* prettier-ignore */ function: (s) => this.MAX_DEPTH_STRATEGY_MAPPER.function({ shape: s, ...baseParams }),
      /* prettier-ignore */ instanceof: (s) => this.MAX_DEPTH_STRATEGY_MAPPER.instanceof({ shape: s, ...baseParams }),
    };

    const handler = DEPTH_DISPATCHER[shape.kind];

    // Pass a pure distributive call to ensure structural subtyping compliance
    return handler(shape as never);
  }

  // =============================================================================
  // PUBLIC ENTRY POINT
  // =============================================================================
  public harvestBlueprintMetrics(
    shape: TSolidShape,
    blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
  ): TCalculatedMetricsResult {
    if (isUndefined(shape) || isNull(shape)) {
      return { depth: 0, nodesCollapsed: 1, rawComplexityScore: 0 };
    }

    const telemetry = { nodesCount: 0 };

    /* prettier-ignore */
    const computedDepth = this.calculateMaxDepthCore( shape, blueprintsPool, new Set<string>());

    /* prettier-ignore */
    const baseDensityWeight = this.calculateStructuralWeightCore( shape, blueprintsPool, 0, new Set<string>(), telemetry);

    const finalRawComplexityScore = baseDensityWeight * (computedDepth || 1);

    return {
      depth: computedDepth,
      nodesCollapsed: telemetry.nodesCount,
      rawComplexityScore: finalRawComplexityScore,
    };
  }

  /**
   * ADAPTIVE TAXONOMY AGGREGATOR
   *
   * Compares a raw weight score against the highest apex found across the workspace,
   * assigning the extended 5-tier tokens on a dynamic percentage relative ratio basis.
   */
  public mapScoreToExtendedTaxonomy(
    rawScore: number,
    workspaceMaxScore: number,
  ): TTaxonomyTokenKeys {
    if (workspaceMaxScore <= 5 || rawScore <= 5) {
      return 'FLAT_O1';
    }

    const relativePercentage = (rawScore / workspaceMaxScore) * 100;

    if (relativePercentage <= 20) return 'FLAT_O1';
    if (relativePercentage <= 45) return 'COMPOUND_LINEAR';
    if (relativePercentage <= 65) return 'COMPLEX_POLY';
    if (relativePercentage <= 85) return 'DENSE_MATRIX';
    return 'HYPER_GRAPH';
  }
}

export const complexityService = new ComplexityService();
