import type { TTopologyEdge, IXalorAuditPayload } from '../../models/types';
import type { TTripleKV } from '../../../shared/types';
import type { TSolidShape } from '../../../shared/shape-domain';
import { ObjectUtils } from '../../../shared/utils';
import {
  // isReferenceShape,
  // isObjectShape,
  // isUnionShape,
  // isArrayShape,
  // isBrandedShape,
  yieldItems,
} from '../../../shared';
import { TOPOLOGY_EDGE_MAPPER } from '../../models';
class TopologyAuditService {
  private executeEdgeExtractionCrawl(
    shape: TSolidShape,
    sourceKey: string,
    edges: TTopologyEdge[],
  ): void {
    if (!shape || typeof shape !== 'object' || !('kind' in shape)) return;

    const strategy = TOPOLOGY_EDGE_MAPPER[shape.kind];
    if (!strategy) return;

    strategy({
      shape,
      sourceKey,
      edges,
      recurse: (nextShape) => {
        this.executeEdgeExtractionCrawl(nextShape, sourceKey, edges);
      },
    });
  }
  /** @see {@link AuditServiceDocs.buildTopologyEdge} */
  private buildTopologyEdge(
    blueprintKeys: string[],
    vault: TTripleKV,
  ): TTopologyEdge[] {
    const edges: TTopologyEdge[] = [];

    (yieldItems(blueprintKeys) || []).forEach((sourceKey) => {
      const parentShape = vault.blueprints[sourceKey];
      if (!parentShape) return;

      // Fires the exhaustive recursion engine over the current root node
      this.executeEdgeExtractionCrawl(parentShape, sourceKey, edges);
    });

    return edges;
  }

  /** @see {@link AuditServiceDocs.mapTopologyGraphCycles} */
  private mapTopologyGraphCycles(
    roots: readonly string[],
    adjacencyMap: Record<string, readonly string[]>,
  ): string[][] {
    const visited = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (node: string, stack: string[]): void => {
      const cycleIndex = stack.indexOf(node);
      if (cycleIndex !== -1) {
        cycles.push([...stack.slice(cycleIndex), node]);
        return;
      }

      if (visited.has(node)) return;
      visited.add(node);

      const nextStack = [...stack, node];
      const neighbors = adjacencyMap[node];
      if (!neighbors) return;

      yieldItems(neighbors).forEach((child) => {
        dfs(child, nextStack);
      });
    };

    yieldItems(roots).forEach((root) => {
      dfs(root, []);
    });

    return cycles;
  }

  /** @see {@link AuditServiceDocs.buildAdjacencyMap} */
  private buildAdjacencyMap(
    blueprintKeys: readonly string[],
    edges: readonly TTopologyEdge[],
  ): Record<string, string[]> {
    const adjacencyMap: Record<string, string[]> = {};

    blueprintKeys.forEach((key) => {
      adjacencyMap[key] = [];
    });

    edges.forEach((edge) => {
      const bucket = adjacencyMap[edge.sourceKey];
      if (bucket) {
        bucket.push(edge.targetKey);
      }
    });

    return adjacencyMap;
  }

  /** @see {@link AuditServiceDocs.analyzeDependencyGraphTopology} */
  public analyzeDependencyGraphTopology(
    vault: TTripleKV,
  ): IXalorAuditPayload['topology'] {
    const blueprintKeys = ObjectUtils.keys(vault.blueprints);

    /* prettier-ignore */
    const edges: TTopologyEdge[] = this.buildTopologyEdge(blueprintKeys, vault);
    /* prettier-ignore */
    const adjacencyMap: Record<string, string[]> = this.buildAdjacencyMap(blueprintKeys, edges);
    /* prettier-ignore */
    const cyclicPaths: string[][] = this.mapTopologyGraphCycles(blueprintKeys, adjacencyMap);

    const frozenCyclicPaths: readonly (readonly string[])[] = cyclicPaths.map(
      (path) => Object.freeze(path),
    );

    return {
      edges: Object.freeze(edges),
      cyclicPaths: Object.freeze(frozenCyclicPaths),
    };
  }
  // /** @see {@link AuditServiceDocs.buildTopologyEdge} */
  // private buildTopologyEdge(
  //   blueprintKeys: string[],
  //   vault: TTripleKV,
  // ): TTopologyEdge[] {
  //   const edges: TTopologyEdge[] = [];
  //   for (const sourceKey of yieldItems(blueprintKeys) || []) {
  //     const parentShape = vault.blueprints[sourceKey];
  //     if (!parentShape) continue;

  //     if (isObjectShape(parentShape)) {
  //       for (const propKey in parentShape.properties) {
  //         /* prettier-ignore */
  //         const isDirectProperty = Object.prototype.hasOwnProperty.call(parentShape.properties, propKey);

  //         if (isDirectProperty) {
  //           const childShape = parentShape.properties[propKey].shape;

  //           if (isReferenceShape(childShape)) {
  //             edges.push({ sourceKey, targetKey: childShape.name });
  //           }
  //         }
  //       }
  //     }
  //     if (isUnionShape(parentShape)) {
  //       for (const variant of yieldItems(parentShape.values) || []) {
  //         if (isReferenceShape(variant)) {
  //           edges.push({ sourceKey, targetKey: variant.name });
  //         }
  //       }
  //     }

  //     if (isArrayShape(parentShape)) {
  //       const childShape = parentShape.items;
  //       if (isReferenceShape(childShape)) {
  //         edges.push({ sourceKey, targetKey: childShape.name });
  //       }
  //     }

  //     if (isBrandedShape(parentShape)) {
  //       const childShape = parentShape.base;
  //       if (isReferenceShape(childShape)) {
  //         edges.push({ sourceKey, targetKey: childShape.name });
  //       }
  //     }
  //   }
  //   return edges;
  // }

  // /** @see {@link AuditServiceDocs.mapTopologyGraphCycles} */
  // private mapTopologyGraphCycles(
  //   roots: readonly string[],
  //   adjacencyMap: Record<string, readonly string[]>,
  // ): string[][] {
  //   const visited = new Set<string>();
  //   const cycles: string[][] = [];

  //   const dfs = (node: string, stack: string[]): void => {
  //     const cycleIndex = stack.indexOf(node);

  //     if (cycleIndex !== -1) {
  //       cycles.push([...stack.slice(cycleIndex), node]);
  //       return;
  //     }

  //     if (visited.has(node)) return;

  //     visited.add(node);

  //     const nextStack = [...stack, node];
  //     const neighbors = adjacencyMap[node];

  //     if (!neighbors) return;

  //     for (const child of yieldItems(neighbors)) {
  //       dfs(child, nextStack);
  //     }
  //   };

  //   for (const root of yieldItems(roots)) {
  //     dfs(root, []);
  //   }

  //   return cycles;
  // }

  // /** @see {@link AuditServiceDocs.buildAdjacencyMap} */
  // private buildAdjacencyMap(
  //   blueprintKeys: readonly string[],
  //   edges: readonly TTopologyEdge[],
  // ): Record<string, string[]> {
  //   const adjacencyMap: Record<string, string[]> = {};

  //   blueprintKeys.forEach((_, i) => (adjacencyMap[blueprintKeys[i]] = []));

  //   for (const edge of edges) {
  //     const bucket = adjacencyMap[edge.sourceKey];
  //     if (bucket) {
  //       bucket.push(edge.targetKey);
  //     }
  //   }

  //   return adjacencyMap;
  // }

  // /** @see {@link AuditServiceDocs.analyzeDependencyGraphTopology} */
  // public analyzeDependencyGraphTopology(
  //   vault: TTripleKV,
  // ): IXalorAuditPayload['topology'] {
  //   const blueprintKeys = ObjectUtils.keys(vault.blueprints);

  //   /* prettier-ignore */
  //   const edges: TTopologyEdge[] = this.buildTopologyEdge(blueprintKeys, vault);
  //   /* prettier-ignore */
  //   const adjacencyMap: Record<string, string[]> = this.buildAdjacencyMap(blueprintKeys, edges)
  //   /* prettier-ignore */
  //   const cyclicPaths: string[][] =this.mapTopologyGraphCycles(blueprintKeys, adjacencyMap);

  //   const frozenCyclicPaths: readonly (readonly string[])[] = cyclicPaths.map(
  //     (path) => Object.freeze(path),
  //   );

  //   return {
  //     edges: Object.freeze(edges),
  //     cyclicPaths: Object.freeze(frozenCyclicPaths),
  //   };
  // }
}

export const topologyAuditService = new TopologyAuditService();
