import type { TSolidShape, TTripleKV } from '../../shared/types';
import type {
  TTopologyEdge,
  TDefaultObjectKeys,
  TDefaultReturnKeyMap,
} from '../models/types';
import {
  REFERENCE_COLLECTOR_MAPPER,
  DEFAULT_OBJECT_MAPPER,
} from '../models/constants';
import {
  isReferenceShape,
  isObjectShape,
  isUnionShape,
  isArrayShape,
  isBrandedShape,
  yieldItems,
  cloneDeep,
} from '../../shared/utils';

/** @see {@link AuditServiceDocs.recursiveReferenceTracerPipeline} */
export function recursiveReferenceTracerPipeline(
  shape: TSolidShape,
  blueprints: TTripleKV['blueprints'],
  activeHashesInUse: Set<string>,
): void {
  if (!shape) return;

  if (isReferenceShape(shape)) {
    const targetHash = shape.name;
    if (!activeHashesInUse.has(targetHash)) {
      activeHashesInUse.add(targetHash);
      const referencedShape = blueprints[targetHash];
      if (referencedShape) {
        /* prettier-ignore */
        recursiveReferenceTracerPipeline(referencedShape, blueprints, activeHashesInUse);
      }
    }
    return;
  }

  const executeDistributedCollector = <K extends TSolidShape['kind']>(
    targetKind: K,
    targetShape: Extract<TSolidShape, { kind: K }>,
  ): void => {
    const handler = REFERENCE_COLLECTOR_MAPPER[targetKind];
    if (handler) {
      handler(targetShape, activeHashesInUse, (child: TSolidShape) =>
        recursiveReferenceTracerPipeline(child, blueprints, activeHashesInUse),
      );
    }
  };

  // Dispatch point-free with complete static safety, zero errors, and zero casting overrides
  executeDistributedCollector(shape.kind, shape);
}

/** @see {@link AuditServiceDocs.buildTopologyEdge} */
export function buildTopologyEdge(
  blueprintKeys: string[],
  vault: TTripleKV,
): TTopologyEdge[] {
  const edges: TTopologyEdge[] = [];
  for (const sourceKey of yieldItems(blueprintKeys) || []) {
    const parentShape = vault.blueprints[sourceKey];
    if (!parentShape) continue;

    if (isObjectShape(parentShape)) {
      for (const propKey in parentShape.properties) {
        /* prettier-ignore */
        const isDirectProperty = Object.prototype.hasOwnProperty.call(parentShape.properties, propKey);

        if (isDirectProperty) {
          const childShape = parentShape.properties[propKey].shape;

          if (isReferenceShape(childShape)) {
            edges.push({ sourceKey, targetKey: childShape.name });
          }
        }
      }
    }
    if (isUnionShape(parentShape)) {
      for (const variant of yieldItems(parentShape.values) || []) {
        if (isReferenceShape(variant)) {
          edges.push({ sourceKey, targetKey: variant.name });
        }
      }
    }

    if (isArrayShape(parentShape)) {
      const childShape = parentShape.items;
      if (isReferenceShape(childShape)) {
        edges.push({ sourceKey, targetKey: childShape.name });
      }
    }

    if (isBrandedShape(parentShape)) {
      const childShape = parentShape.base;
      if (isReferenceShape(childShape)) {
        edges.push({ sourceKey, targetKey: childShape.name });
      }
    }
  }
  return edges;
}

/** @see {@link AuditServiceDocs.mapTopologyGraphCycles} */
export function mapTopologyGraphCycles(
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

    for (const child of yieldItems(neighbors)) {
      dfs(child, nextStack);
    }
  };

  for (const root of yieldItems(roots)) {
    dfs(root, []);
  }

  return cycles;
}

/** @see {@link AuditServiceDocs.buildAdjacencyMap} */
export function buildAdjacencyMap(
  blueprintKeys: readonly string[],
  edges: readonly TTopologyEdge[],
): Record<string, string[]> {
  const adjacencyMap: Record<string, string[]> = {};

  blueprintKeys.forEach((_, i) => (adjacencyMap[blueprintKeys[i]] = []));

  for (const edge of edges) {
    const bucket = adjacencyMap[edge.sourceKey];
    if (bucket) {
      bucket.push(edge.targetKey);
    }
  }

  return adjacencyMap;
}
/**
 * generateDefaultPayload
 *
 * ROLE: Generates the default audit payload based on the provided type.
 *
 * @see {@link AuditServiceDocs.generateDefaultPayload}
 */
export function createDefaultAuditTemplate<T extends TDefaultObjectKeys>(
  defaultType: T,
): TDefaultReturnKeyMap<T> {
  const baseStaticTemplate = DEFAULT_OBJECT_MAPPER[defaultType];

  return cloneDeep(baseStaticTemplate);
}
