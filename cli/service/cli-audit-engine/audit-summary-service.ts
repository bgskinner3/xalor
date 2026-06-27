import type {
  IXalorAuditPayload,
  TXalorAuditNode,
  TUnrolledCountCrawlerMapper,
} from '../../models/types';
import type { TTripleKV, TDeepWriteable, TSolidShape } from '../../../shared';
import { fsContext } from '../../../shared/service';
import {
  isUndefined,
  isNull,
  isInstanceOf,
  isUnionShape,
  isReferenceShape,
  isBrandedShape,
  isObjectShape,
  isArrayShape,
  isIntersectionShape,
  isFunctionShape,
  ObjectUtils,
  isKeyInObject,
  yieldItems,
} from '../../../shared';

/** @see {@link AuditServiceDocs.calculateCasStorageOptimizationLedger} */
class AuditSummaryService {
  private sumArrayNodes(
    shapes: readonly TSolidShape[],
    blueprints: TTripleKV['blueprints'],
    visited: Set<string>,
  ): number {
    let tally = 0;
    const len = shapes.length;
    for (let i = 0; i < len; i++) {
      const subShape = shapes[i];
      if (!isUndefined(subShape) || !isNull(subShape)) {
        /* prettier-ignore */
        tally += this.countUnrolledStructuralNodesCore(subShape, blueprints, visited);
      }
    }
    return tally;
  }
  private readonly UNROLLED_COUNT_STRATEGY_MAPPER: TUnrolledCountCrawlerMapper =
    {
      primitive: () => 1,
      literal: () => 1,
      instanceof: () => 1,

      branded: (params) => {
        const { shape, blueprints, visited } = params;
        if (!isBrandedShape(shape)) return 0;
        /* prettier-ignore */
        return this.countUnrolledStructuralNodesCore(shape.base, blueprints, visited);
      },

      array: (params) => {
        const { shape, blueprints, visited } = params;
        if (!isArrayShape(shape)) return 0;
        /* prettier-ignore */
        return 1 + this.countUnrolledStructuralNodesCore(shape.items, blueprints, visited);
      },

      union: (params) => {
        const { shape, blueprints, visited } = params;
        if (!isUnionShape(shape)) return 0;
        return 1 + this.sumArrayNodes(shape.values, blueprints, visited);
      },

      intersection: (params) => {
        const { shape, blueprints, visited } = params;
        if (!isIntersectionShape(shape)) return 0;
        return 1 + this.sumArrayNodes(shape.values, blueprints, visited);
      },

      reference: (params) => {
        const { shape, blueprints, visited } = params;
        if (!isReferenceShape(shape)) return 0;

        // Cyclic Loop protection shield: returns 1 to count the loop reference node pointer
        if (visited.has(shape.name)) return 1;

        const childNode = blueprints[shape.name];
        if (!childNode) return 0;

        const nextVisited = new Set<string>(visited);
        nextVisited.add(shape.name);
        /* prettier-ignore */
        return this.countUnrolledStructuralNodesCore(childNode, blueprints, nextVisited);
      },

      object: (params) => {
        const { shape, blueprints, visited } = params;
        if (!isObjectShape(shape)) return 1;

        const properties = shape.properties;
        if (properties === undefined) return 1;

        let objectTally = 1;
        const propertyKeys = ObjectUtils.keys(properties);
        const len = propertyKeys.length;

        for (let i = 0; i < len; i++) {
          const key = propertyKeys[i];
          if (isUndefined(key)) continue;

          /* prettier-ignore */ objectTally += 1;
          /* prettier-ignore */ objectTally += this.countUnrolledStructuralNodesCore(properties[key].shape, blueprints, visited);
        }
        return objectTally;
      },

      function: (params) => {
        const { shape, blueprints, visited } = params;
        if (!isFunctionShape(shape)) return 0;

        // Extract parameter object shapes natively using our un-nested shared helper
        /* prettier-ignore */ const paramsArray = shape.parameters.map((param) => param.shape);
        /* prettier-ignore */ const paramsTally = this.sumArrayNodes(paramsArray, blueprints, visited);

        /* prettier-ignore */ const returnTally = this.countUnrolledStructuralNodesCore(shape.returnType, blueprints, visited);
        return 1 + paramsTally + returnTally;
      },
    } satisfies TUnrolledCountCrawlerMapper;

  private countUnrolledStructuralNodesCore(
    shape: TSolidShape,
    blueprints: TTripleKV['blueprints'],
    visited: Set<string>,
  ): number {
    if (isUndefined(shape) || isNull(shape)) return 0;

    const baseParams = { blueprints, visited };

    /* prettier-ignore */
    const EXPANSION_DISPATCHER: { [K in TSolidShape['kind']]: (s: Extract<TSolidShape, { kind: K }>) => number } = {
      /* prettier-ignore */ primitive: (s) => this.UNROLLED_COUNT_STRATEGY_MAPPER.primitive({ shape: s, ...baseParams }),
      /* prettier-ignore */ literal: (s) => this.UNROLLED_COUNT_STRATEGY_MAPPER.literal({ shape: s, ...baseParams }),
      /* prettier-ignore */ union: (s) => this.UNROLLED_COUNT_STRATEGY_MAPPER.union({ shape: s, ...baseParams }),
      /* prettier-ignore */ branded: (s) => this.UNROLLED_COUNT_STRATEGY_MAPPER.branded({ shape: s, ...baseParams }),
      /* prettier-ignore */ reference: (s) => this.UNROLLED_COUNT_STRATEGY_MAPPER.reference({ shape: s, ...baseParams }),
      /* prettier-ignore */ array: (s) => this.UNROLLED_COUNT_STRATEGY_MAPPER.array({ shape: s, ...baseParams }),
      /* prettier-ignore */ object: (s) => this.UNROLLED_COUNT_STRATEGY_MAPPER.object({ shape: s, ...baseParams }),
      /* prettier-ignore */ intersection: (s) => this.UNROLLED_COUNT_STRATEGY_MAPPER.intersection({ shape: s, ...baseParams }),
      /* prettier-ignore */ function: (s) => this.UNROLLED_COUNT_STRATEGY_MAPPER.function({ shape: s, ...baseParams }),
      /* prettier-ignore */ instanceof: (s) => this.UNROLLED_COUNT_STRATEGY_MAPPER.instanceof({ shape: s, ...baseParams }),
    };

    const handler = EXPANSION_DISPATCHER[shape.kind];

    return handler(shape as never);
  }

  private computeCompressionRatio(
    unrolledPropVol: number,
    compactedPropVol: number,
  ): number {
    if (unrolledPropVol === 0 || compactedPropVol >= unrolledPropVol) {
      return 0;
    }
    return 1 - compactedPropVol / unrolledPropVol;
  }
  private async getDatabaseDiskSize(): Promise<number> {
    try {
      const vaultPath = fsContext.envPaths.vaultFile;
      const stats = await fsContext.asyncFileStats(vaultPath);
      return stats.size;
    } catch (error) {
      /* prettier-ignore */
      const isMissing = isInstanceOf(error, Error)  && isKeyInObject('code')(error) && error.code === 'ENOENT';
      if (!isMissing) {
        /* prettier-ignore */
        const errorMsg = isInstanceOf(error, Error) ? error.message : 'Unknown disk exception';
        /* prettier-ignore */
        console.error(`❌ [Xalor Vault Error] Failed to retrieve database metrics: ${errorMsg}`);
      }
      return 0;
    }
  }
  public async calculateCasStorageSavings(
    vault: TTripleKV,
    nodes: TXalorAuditNode[],
    _debug: boolean = false,
  ): Promise<TDeepWriteable<IXalorAuditPayload['summary']>> {
    const userVaultKeys = ObjectUtils.keys(vault.references);
    const unqHashes = ObjectUtils.keys(vault.blueprints);

    // DEFAULT VAULES
    let highestGraphDepthRecorded = 0;
    let compactedPropVol = 0;
    let unrolledPropVol = 0;

    // =========================================================================
    // CALCULATE COMPACTED VOLUME (WHAT XALOR WRITES TO DISK)
    // =========================================================================

    for (const hash of yieldItems(unqHashes)) {
      if (isUndefined(hash)) continue;

      const blueprintNode = vault.blueprints[hash];
      if (!blueprintNode) continue;

      if (isObjectShape(blueprintNode)) {
        compactedPropVol += ObjectUtils.keys(blueprintNode.properties).length;
      } else {
        compactedPropVol += 1;
      }
    }

    // =========================================================================
    // CALCULATE UNROLLED VOLUME (THE USER CODEBASE EXPANSION)
    // =========================================================================

    for (const rootKey of yieldItems(userVaultKeys)) {
      if (isUndefined(rootKey)) continue;

      const rootHash = vault.references[rootKey];
      if (isUndefined(rootHash)) continue;

      const rootShape = vault.blueprints[rootHash];
      if (!isUndefined(rootShape) || !isNull(rootShape)) {
        unrolledPropVol += this.countUnrolledStructuralNodesCore(
          rootShape,
          vault.blueprints,
          new Set<string>([rootHash]),
        );
      }
    }

    const casCompressionRatio = this.computeCompressionRatio(
      unrolledPropVol,
      compactedPropVol,
    );
    const totalDatabaseDiskBytes = await this.getDatabaseDiskSize();

    // =========================================================================
    //  COMPILATION PASS
    // =========================================================================
    for (const node of yieldItems(nodes)) {
      if (isUndefined(node) || isNull(node)) continue;

      const d = node.metrics.depth;
      if (d > highestGraphDepthRecorded) {
        highestGraphDepthRecorded = d;
      }
    }

    return {
      totalRegisteredKeys: userVaultKeys.length,
      totalUniqueFingerprints: unqHashes.length,
      casCompressionRatio,
      totalDatabaseDiskBytes,
      highestGraphDepthRecorded,
      compileTimeOverheadMs: 0,
    };
  }
}

export const auditSummaryService = new AuditSummaryService();
// export type TXalorAuditSummary = {
//   readonly totalRegisteredKeys: number;
//   readonly totalUniqueFingerprints: number;
//   readonly casCompressionRatio: number;
//   readonly totalDatabaseDiskBytes: number;
//   readonly highestGraphDepthRecorded: number;
//   readonly compileTimeOverheadMs: number;
// };
