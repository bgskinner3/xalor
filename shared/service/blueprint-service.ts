import type { TSolidShape, TSolidObjectRawShape } from '../shape-domain';
import type { TRebuildStrategyMap } from '../types';
import {
  isUndefined,
  isNull,
  isInstanceOf,
  isString,
  isShapeOfKind,
  isLeafShape,
  isRecord,
  hasOwnProperty,
} from '../../shared';
import { yieldItems } from '../../shared/utils';
import {
  INSTANCE_REGISTRY_MAPPER,
  isArrayShape,
  isIntersectionShape,
  isObjectShape,
  isReferenceShape,
  isUnionShape,
  NATIVE_BUILTINS,
} from '../shape-domain';

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

        const liveMockInstance = mappingItem.def();
        if (!liveMockInstance) continue;

        const prototypeKeys = Object.getOwnPropertyNames(
          Object.getPrototypeOf(liveMockInstance) || {},
        );

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

          return key;
        }
      } catch {
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
      return nativeInstanceMatchName;
    }

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
  // =============================================================================
  // =============================================================================
  // =============================================================================
  // =============================================================================
  // DIFT BLUEPRINTS
  // =============================================================================
  // =============================================================================
  // =============================================================================
  // =============================================================================
  /**
   * 🛰️ UTILITY: RUNTIME WIRE-KEY REFLECTION EXTRACTOR
   * Dynamically derives the authoritative top-level property container name from
   * live incoming stream parameters. Falls back to pre-compiled AOT nominal tokens
   * if the wire request payload is an empty buffer or a flat scalar primitive.
   *
   * Satisfies COMMANDMENT VIII (Internal Efficiency) and COMMANDMENT IX (No Escape Hatches).
   */
  private extractDerivedWireName(
    currentBlueprintKey: string,
    payload: unknown, // 👑 THE MISSING ARGUMENT CONTRACT SLOT!
  ): string {
    let derivedWireKeyName = '';

    // ➊ Inspect the live payload keys to extract the authentic wire property node in real-time
    if (isRecord(payload)) {
      const payloadOwnKeys = Object.keys(payload);
      if (payloadOwnKeys.length > 0 && payloadOwnKeys[0] !== undefined) {
        derivedWireKeyName = payloadOwnKeys[0]; // Isolate the true active root wire key name
      }
    }

    // ➋ Symmetrical Fallback: If the inbound payload is a flat primitive or empty stream buffer,
    // dynamically derive the key name token from the precompiled AOT nominal registry string!
    if (!derivedWireKeyName && currentBlueprintKey) {
      derivedWireKeyName = currentBlueprintKey
        .toLowerCase()
        .replace(/_shape|_test|_evolution|_lane|_test_drift/gi, '');
    }

    // ➌ Final bulletproof backup protection shield
    const finalVirtualKeyName = derivedWireKeyName || 'extractedField';

    // 👑 FIXED: Returns the compiled string token straight back up to the parent engine!
    return finalVirtualKeyName;
  }
  /**
   * DEEP HYBRID BLUEPRINT SYNTHESIS ENGINE
   *
   * @role Recursively unrolls, maps, and merges contemporary and historical blueprints
   * into a single unified TSolidShape memory literal frame—safely resolving deep nested
   * references, union blocks, and prototype fingerprint signatures point-free.
   *
   * @invariants
   * - Satisfies COMMANDMENT I & III: Resolves structural keys exclusively via the pre-compiled registry pool.
   * - Deep Reference Safety: Recursively flattens deeply nested pointer trees across both eras to any level of depth.
   * - Satisfies COMMANDMENT IX: 100% type assertion-free and non-null override-free data mapping.
   */
  public synthesizeDeepHybridBlueprint(
    currentBlueprintKey: string | undefined,
    ancestralBlueprintKey: string | undefined,
    blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
    payload: unknown,
  ): TSolidShape | null {
    if (!currentBlueprintKey || !ancestralBlueprintKey) return null;

    const recursivelyUnwrapShape = (
      shapeNode: TSolidShape,
      visitedHashes: Set<string>,
    ): TSolidShape => {
      if (!shapeNode || typeof shapeNode !== 'object') return shapeNode;

      // 1. Resolve references
      if (isReferenceShape(shapeNode)) {
        if (visitedHashes.has(shapeNode.name)) return shapeNode;

        const nextShapeTarget = this.resolveBlueprint(
          shapeNode.name,
          blueprintsPool,
        );

        if (nextShapeTarget) {
          const updatedVisited = new Set<string>(visitedHashes);
          updatedVisited.add(shapeNode.name);

          return recursivelyUnwrapShape(nextShapeTarget, updatedVisited);
        }
        console.warn(
          `[xalor] ⚠️  UNREGISTERED REFERENCE DETECTION: The blueprint symbol reference "${shapeNode.name}" ` +
            `could not be located inside your active database registry pool. This missing dependency ` +
            `will cause a structural blueprint collapse downstream!`,
        );
        return shapeNode;
      }

      // 2. Objects
      if (isObjectShape(shapeNode) && shapeNode.properties) {
        const unwrappedProps: Record<string, TSolidObjectRawShape> = {};

        for (const propKey in shapeNode.properties) {
          if (hasOwnProperty(shapeNode.properties, propKey)) {
            const descriptor = shapeNode.properties[propKey];

            unwrappedProps[propKey] = {
              ...descriptor,
              shape: recursivelyUnwrapShape(descriptor.shape, visitedHashes),
            };
          }
        }

        return {
          ...shapeNode,
          properties: unwrappedProps,
        };
      }

      if (isArrayShape(shapeNode) && shapeNode.items) {
        return {
          ...shapeNode,
          items: recursivelyUnwrapShape(shapeNode.items, visitedHashes),
        };
      }

      if (isIntersectionShape(shapeNode) && shapeNode.values) {
        return {
          ...shapeNode,
          values: shapeNode.values.map((subShape) =>
            recursivelyUnwrapShape(subShape, visitedHashes),
          ),
        };
      }

      if (isUnionShape(shapeNode) && shapeNode.values) {
        return {
          ...shapeNode,
          values: shapeNode.values.map((subShape) =>
            recursivelyUnwrapShape(subShape, visitedHashes),
          ),
        };
      }

      return shapeNode;
    };

    // =============================================================================
    // PHASE 1: TODAY'S ACTIVE PRODUCTION SPECIFICATION UNROLLING
    // =============================================================================
    /* prettier-ignore */
    const modernShapeBase = this.resolveBlueprint( currentBlueprintKey, blueprintsPool);

    if (isUndefined(modernShapeBase)) return null;

    /* prettier-ignore */
    const modernShape = recursivelyUnwrapShape( modernShapeBase, new Set<string>());

    // =============================================================================
    // PHASE 2: UNIVERSAL SHAPE PASSTHROUGH GATEWAY (VIRTUAL OBJECT WRAPPING)
    // =============================================================================
    // eslint-disable-next-line no-useless-assignment
    let modernProps: Record<string, TSolidObjectRawShape> = {};
    let modernStrict = isObjectShape(modernShape) ? modernShape?.strict : true;

    if (isLeafShape(modernShape)) {
      const finalVirtualKeyName = this.extractDerivedWireName(
        currentBlueprintKey,
        payload,
      );

      modernProps = {
        [finalVirtualKeyName]: {
          shape: modernShape,
          optional: false,
          name: finalVirtualKeyName,
          requiresKeyPresence: true,
          allowsExplicitUndefined: false,
        },
      };

      modernStrict = true;
    } else if (isObjectShape(modernShape) && modernShape.properties) {
      modernProps = modernShape.properties;
    } else {
      return null;
    }

    // =============================================================================
    // PHASE 3: COMPLEX MULTI-ERA FIELD MATRIX MERGING
    // =============================================================================
    const ancestralShapeBase = this.resolveBlueprint(
      ancestralBlueprintKey,
      blueprintsPool,
    );

    const ancestralShape = ancestralShapeBase
      ? recursivelyUnwrapShape(ancestralShapeBase, new Set<string>())
      : undefined;

    const ancestralProps =
      ancestralShape && ancestralShape.kind === 'object'
        ? ancestralShape.properties
        : null;
    const combinedProperties: Record<string, TSolidObjectRawShape> = {};

    // ➊ Ingest today's required or virtually-wrapped properties
    for (const key in modernProps) {
      if (hasOwnProperty(modernProps, key)) {
        combinedProperties[key] = modernProps[key];
      }
    }

    if (ancestralProps) {
      for (const key in ancestralProps) {
        if (hasOwnProperty(ancestralProps, key)) {
          if (!Object.prototype.hasOwnProperty.call(combinedProperties, key)) {
            const legacyDescriptor = ancestralProps[key];
            combinedProperties[key] = {
              shape: legacyDescriptor.shape,
              optional: true, // FORCED DRIFT STATUS
              name: legacyDescriptor.name,
              requiresKeyPresence: false,
              allowsExplicitUndefined: true,
            };
          }
        }
      }
    }

    return {
      kind: 'object',
      properties: combinedProperties,
      strict: modernStrict,
    };
  }
}
export const blueprintService = new BlueprintService();
