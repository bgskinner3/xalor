import type { TTripleKV } from '../../shared/types';
import type {
  TTopologyEdge,
  TDefaultObjectKeys,
  TDefaultReturnKeyMap,
} from '../models/types';
import { DEFAULT_OBJECT_MAPPER } from '../models/constants';
import {
  isReferenceShape,
  isObjectShape,
  isUnionShape,
  isArrayShape,
  isBrandedShape,
  yieldItems,
  cloneDeep,
} from '../../shared';
import {
  GENERATOR_MODE_TRIGGERS,
  VALIDATION_MODE_TRIGGERS,
  TRANSFORM_MODE_TRIGGERS,
  MATCH_MODE_TRIGGERS,
} from '../../shared/auto';

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
export const isGeneratorTrigger = new Set<string>(GENERATOR_MODE_TRIGGERS);
export const isValidationTrigger = new Set<string>(VALIDATION_MODE_TRIGGERS);
export const isTransformerTrigger = new Set<string>(TRANSFORM_MODE_TRIGGERS);
export const isMatchTrigger = new Set<string>(MATCH_MODE_TRIGGERS);
