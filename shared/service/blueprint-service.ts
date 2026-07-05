import type { TSolidShape } from '../shape-domain';
import type { TRebuildStrategyMap } from '../types';
import {
  isUndefined,
  isNull,
  isInstanceOf,
  isString,
  isShapeOfKind,
} from '../../shared';
import { yieldItems } from '../../shared/utils';
import { INSTANCE_REGISTRY_MAPPER, NATIVE_BUILTINS } from '../shape-domain';

/**
 * ============================================================================================================
 * TSOLID BLUEPRINT TRANSPILER SERVICE
 * ============================================================================================================
 *
 * ROLE:
 * Transpiles custom TSolidShape JSON layout tokens directly back into
 * completely valid, beautifully aligned, human-readable TypeScript definitions.
 *
 * MORE DETAILS
 * @see {@link SharedServiceDocs.BlueprintService}
 *
 */
class BlueprintService {
  private REBUILD_STRATEGY_MAPPER: TRebuildStrategyMap = {
    primitive: (params) => {
      const { shape } = params;
      if (!isShapeOfKind('primitive')(shape)) return 'unknown';
      return shape.type;
    },

    literal: (params) => {
      const { shape } = params;
      if (!isShapeOfKind('literal')(shape)) return 'unknown';
      const val = shape.value;
      if (isUndefined(val)) return 'unknown';
      return isString(val) ? `'${val}'` : String(val);
    },

    union: (params) => {
      const { shape, pool, depth, visited, generate } = params;
      if (!isShapeOfKind('union')(shape)) return 'never';
      const variants = shape.values;
      if (isUndefined(variants) || variants.length === 0) return 'never';

      // FIX: Replaced manual pointer loops with point-free reduction array stream mapping
      return (yieldItems(variants) || [])
        .reduce((buffer: string[], variant) => {
          if (!isUndefined(variant)) {
            buffer.push(generate(variant, pool, depth, visited));
          }
          return buffer;
        }, [])
        .join(' | ');
    },

    branded: (params) => {
      const { shape, pool, depth, visited, generate } = params;
      if (!isShapeOfKind('branded')(shape)) return 'unknown';

      const baseType = generate(shape.base, pool, depth, visited);
      return `${baseType} /* & Brand<'${String(shape.name)}'> */`;
    },

    reference: (params) => {
      if (!isShapeOfKind('reference')(params.shape)) return 'unknown';

      if (NATIVE_BUILTINS.has(params.shape.name)) {
        return params.shape.name; // Instantly returns "Error" cleanly
      }

      if (params.visited.has(params.shape.name)) {
        return params.shape.name;
      }

      const referencedShape = params.resolve(params.shape.name, params.pool);
      if (referencedShape) {
        const childVisited = new Set<string>(params.visited);
        childVisited.add(params.shape.name);
        return params.generate(
          referencedShape,
          params.pool,
          params.depth,
          childVisited,
        );
      }

      return params.shape.name;
    },

    array: (params) => {
      const { shape, pool, depth, visited, generate } = params;
      if (!isShapeOfKind('array')(shape)) return 'unknown';
      const itemType = generate(shape.items, pool, depth, visited);
      const elements = shape.elementShapes;

      if (!isUndefined(elements) && elements.length > 0) {
        // FIX: Replaced tuple index loops with functional pipeline collectors
        const tupleContents = (yieldItems(elements) || [])
          .reduce((buffer: string[], element) => {
            if (!isUndefined(element)) {
              buffer.push(generate(element, pool, depth, visited));
            }
            return buffer;
          }, [])
          .join(', ');

        const restSpread = shape.hasRest ? `, ...${itemType}[]` : '';
        return `[${tupleContents}${restSpread}]`;
      }
      return `${itemType}[]`;
    },

    object: (params) => {
      const { shape, pool, depth, visited, generate } = params;
      if (!isShapeOfKind('object')(shape)) return '{}';
      const properties = shape.properties;
      if (properties === undefined) return '{}';

      const propertyKeys = Object.keys(properties);
      if (propertyKeys.length === 0) return '{}';

      const nextDepth = depth + 2;
      const innerSpacing = ' '.repeat(nextDepth);
      const trailingSpacing = ' '.repeat(depth);

      // FIX: Clean own-keys map conversion eradicating imperative loop declarations
      const linesBuffer = Object.keys(properties).reduce(
        (buffer: string[], key) => {
          const isDirect = Object.prototype.hasOwnProperty.call(
            properties,
            key,
          );
          const property = properties[key];
          if (isDirect && !isUndefined(property)) {
            const optionalMarker = property.optional ? '?' : '';
            const valueType = generate(
              property.shape,
              pool,
              nextDepth,
              visited,
            );
            buffer.push(
              `${innerSpacing}${key}${optionalMarker}: ${valueType};`,
            );
          }
          return buffer;
        },
        [],
      );

      return `{\n${linesBuffer.join('\n')}\n${trailingSpacing}}`;
    },

    intersection: (params) => {
      const { shape, pool, depth, visited, generate } = params;
      if (!isShapeOfKind('intersection')(shape)) return 'unknown';

      // FIX: Functional map reduction pipeline eliminates the manual index array loop
      return (shape.values || [])
        .reduce((buffer: string[], variant) => {
          buffer.push(generate(variant, pool, depth, visited));
          return buffer;
        }, [])
        .join(' & ');
    },

    function: (params) => {
      const { shape, pool, depth, visited, generate } = params;
      if (!isShapeOfKind('function')(shape)) return 'unknown';

      // FIX: Clean point-free array map replaces the custom arguments builder loop
      const argsBuffer = (shape.parameters || []).map((param) => {
        const paramType = generate(param.shape, pool, depth, visited);
        return `${param.name}${param.optional ? '?' : ''}: ${paramType}`;
      });

      const ret = generate(shape.returnType, pool, depth, visited);
      return `(${argsBuffer.join(', ')}) => ${ret}`;
    },
    instanceof: (params) => {
      if (!isShapeOfKind('instanceof')(params.shape)) return 'unknown';
      return params.shape.name;
    },
  };
  private collapseKnownNativeInstanceShape(shape: TSolidShape): string | null {
    if (!shape || shape.kind !== 'object' || !shape.properties) return null;

    const shapeKeys = Object.keys(shape.properties);
    if (shapeKeys.length === 0) return null;

    // Fast-path override for Error (since it may omit prototype methods in some AST setups)
    if (
      shapeKeys.includes('name') &&
      shapeKeys.includes('message') &&
      shapeKeys.includes('stack')
    ) {
      return 'Error';
    }

    // =============================================================================
    // DYNAMIC REGISTRY FINGERPRINTING ENGINE
    // Ingests keys directly from your shared INSTANCE_REGISTRY_MAPPER object
    // =============================================================================
    const registryKeys = Object.keys(INSTANCE_REGISTRY_MAPPER);

    for (let i = 0; i < registryKeys.length; i++) {
      const key = registryKeys[i] as keyof typeof INSTANCE_REGISTRY_MAPPER;

      try {
        const mappingItem = INSTANCE_REGISTRY_MAPPER[key];
        if (!mappingItem || typeof mappingItem.def !== 'function') continue;

        // 1. Fire your factory function to spin up a safe local runtime instance archetype
        const liveMockInstance = mappingItem.def();
        if (!liveMockInstance) continue;

        // 2. Fetch the real method properties exposed on its prototype chain
        const prototypeKeys = Object.getOwnPropertyNames(
          Object.getPrototypeOf(liveMockInstance) || {},
        );

        // 3. Filter out universal base-object overrides to create a unique fingerprint signature
        const coreArchetypeKeys = prototypeKeys.filter(
          (k) =>
            k !== 'constructor' && k !== 'toString' && k !== 'toLocaleString',
        );

        if (coreArchetypeKeys.length === 0) continue;

        // 4. Compare your shape properties keys against this real archetype fingerprint
        let matchingKeysCount = 0;
        for (let j = 0; j < coreArchetypeKeys.length; j++) {
          if (shapeKeys.includes(coreArchetypeKeys[j])) {
            matchingKeysCount++;
          }
        }

        // If it matches more than 60% of the authentic API footprint, it's a match!
        const matchThreshold = Math.max(
          1,
          Math.floor(coreArchetypeKeys.length * 0.6),
        );
        if (matchingKeysCount >= matchThreshold) {
          // Micro-disambiguation safety valves for highly similar overlapping structures
          if (key === 'Map' && !shapeKeys.includes('clear')) continue;
          if (key === 'Set' && !shapeKeys.includes('clear')) continue;
          if (key === 'Blob' && shapeKeys.includes('lastModified'))
            return 'File';
          if (key === 'Blob' && !shapeKeys.includes('lastModified'))
            return 'Blob';

          return key; // Instantly returns 'URLSearchParams', 'TransformStream', etc.
        }
      } catch {
        // Structural safety catch boundary to prevent runtime context crashes
        continue;
      }
    }

    return null;
  }

  private resolveBlueprint(
    name: string,
    pool: Record<string, TSolidShape> | Map<string, TSolidShape>,
  ): TSolidShape | undefined {
    return isInstanceOf(pool, Map) ? pool.get(name) : pool[name];
  }
  private generateSolidTypeScriptStringCore(
    shape: TSolidShape,
    blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
    indentDepth: number,
    visited: Set<string>,
  ): string {
    if (!shape || typeof shape !== 'object' || !('kind' in shape))
      return 'unknown';

    // =============================================================================
    // DYNAMIC INTERCEPTION PIVOT LAYER
    // Intercepts expanded object sub-shapes matching your registry signatures
    // =============================================================================
    const nativeInstanceMatchName =
      this.collapseKnownNativeInstanceShape(shape);
    if (nativeInstanceMatchName !== null) {
      return nativeInstanceMatchName; // Returns "Error", "Headers", "Promise" cleanly!
    }

    // Baseline mapper processing falls back to your static strategy table objects seamlessly
    const spacing = ' '.repeat(indentDepth);
    const handler = this.REBUILD_STRATEGY_MAPPER[shape.kind];
    if (!handler) return 'unknown';

    return handler({
      shape,
      pool: blueprintsPool,
      depth: indentDepth,
      spacing,
      visited,
      generate: (s, p, d, v) =>
        this.generateSolidTypeScriptStringCore(s, p, d, v),
      resolve: (n, p) => this.resolveBlueprint(n, p),
    });
  }

  // =============================================================================
  // PUBLIC ENTRY POINT
  // =============================================================================
  public generateSolidTypeScriptString(
    shape: TSolidShape,
    blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
    symbolName: string,
    indentDepth = 0,
  ): string {
    if (isUndefined(shape) || isNull(shape)) {
      return `export type ${symbolName} = any;`;
    }

    const coreShapeString = this.generateSolidTypeScriptStringCore(
      shape,
      blueprintsPool,
      indentDepth,
      new Set<string>(),
    );

    return `export type ${symbolName} = ${coreShapeString};`;
  }
}
export const blueprintService = new BlueprintService();
