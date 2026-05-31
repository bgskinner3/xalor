import { REGEX_PATTERNS } from '../../shared/constants';
import type {
  TVaultManifestEntry,
  TDeepWriteable,
  TSolidShape,
  TTripleKV,
} from '../../shared/types';
import type {
  TParsedLocation,
  TXalorAuditNode,
  TTaxonomyTokenKeys,
  TTopologyEdge,
} from '../models/types';
import {
  DEPTH_COMPLEXITY_MAPPER,
  REFERENCE_COLLECTOR_MAPPER,
} from '../models/constants';
import {
  isReferenceShape,
  isObjectShape,
  isUnionShape,
  isArrayShape,
  isBrandedShape,
  yieldItems,
} from '../../shared/utils';

export function parseManifestCoordinates(
  manifestRow?: TVaultManifestEntry,
): TParsedLocation {
  const filePath = manifestRow ? manifestRow.filePath : 'unknown_source';
  let line = 0;
  let column = 0;
  let anchor = 0;

  if (!manifestRow) {
    return { line, column, anchor, filePath };
  }

  const lineMatch = manifestRow.area?.match(REGEX_PATTERNS.line);
  const colMatch = manifestRow.area?.match(REGEX_PATTERNS.column);
  const anchorMatch = manifestRow.anchor?.match(REGEX_PATTERNS.anchor);

  if (lineMatch?.[1]) line = Number.parseInt(lineMatch[1], 10);
  if (colMatch?.[1]) column = Number.parseInt(colMatch[1], 10);
  if (anchorMatch?.[1]) anchor = Number.parseInt(anchorMatch[1], 10);

  return { line, column, anchor, filePath };
}

/**
 * CREATE BASE AUDIT NODE RECORD
 * ROLE: Factory utility generating an unallocated, unique object template to insulate properties.
 */
export const createBaseAuditNodeRecord =
  (): TDeepWriteable<TXalorAuditNode> => ({
    identity: {
      typeKey: '',
      symbolName: '',
      casFingerprint: '',
    },
    location: {
      filePath: '',
      line: 0,
      column: 0,
      anchor: 0,
    },
    metrics: {
      depth: 0,
      complexityScore: 'FLAT_O1',
      nodesCollapsed: 1,
    },
  });

export function mapDepthToComplexity(depth: number): TTaxonomyTokenKeys {
  for (const rule of DEPTH_COMPLEXITY_MAPPER) {
    if (rule.test(depth)) return rule.key;
  }

  return 'FLAT_O1';
}

/**
 * RECURSIVE REFERENCE TRACER PIPELINE
 * ROLE: Standalone recursive graph unroller tracing CAS dependency networks switchlessly.
 * STRATEGY: Leverages user-defined type-guards inside explicit sequential branches to narrow
 * parameter signatures simultaneously, bypassing the generic 'never' intersection array collapse.
 *
 * @param shape Targeted structural schema description block currently being evaluated
 * @param blueprints Authoritative content-addressed storage repository registry map
 * @param activeHashesInUse Set-based mutation tracker accumulating living fingerprint hashes
 */
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

/**
 * BUILD TOPOLOGY EDGES
 * ROLE: Standalone relationship matrix extractor charting direct multi-node dependency lines.
 * STRATEGY: Processes shape categories as flat, un-chained blocks to maintain clear reading layout symmetry.
 */
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
/**
 * MAP TOPOLOGY GRAPH CYCLES
 * ROLE: Tarjan-inspired linear path discoverer isolating closed-circuit circular dependency tracks.
 * STRATEGY: Tracks data nodes via copy-on-write stack arrays to avoid variable pollution.
 * Intercepts duplicate tokens early to block stack overflow loops and protect V8 engine stability.
 *
 * @param roots Readonly collection slice containing all base project fingerprint keys to initialize scanning
 * @param adjacencyMap Optimized reference map indexing directional source-to-target dependency edges
 * @returns Multi-dimensional array tracing every individual circular path network vector found
 */
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
