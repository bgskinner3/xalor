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
// class BlueprintService {
//   /**
//    * 🪐 TSOLID SHAPE STRATEGY DICTIONARY (Encapsulated O(1) Polymorphic Mapper)
//    */
//   private readonly REBUILD_STRATEGY_MAPPER: TRebuildShapeMapper = {
//     primitive: (params: TRebuildParams) => {
//       const { shape } = params;
//       if (!isPrimitiveShape(shape)) return 'unknown';
//       return shape.type;
//     },
//     literal: (params: TRebuildParams) => {
//       const { shape } = params;
//       if (!isLiteralShape(shape)) return 'unknown';
//       const val = shape.value;
//       if (isUndefined(val)) return 'unknown';
//       return isString(val) ? `'${val}'` : String(val);
//     },

//     union: (params: TRebuildParams) => {
//       const { shape, pool, depth, visited } = params;
//       if (!isUnionShape(shape)) return 'never';
//       const variants = shape.values;
//       if (isUndefined(variants) || variants.length === 0) return 'never';

//       const len = variants.length;
//       const unionBuffer: string[] = [];
//       for (let i = 0; i < len; i++) {
//         const variant = variants[i];
//         if (!isUndefined(variant)) {
//           unionBuffer.push(
//             this.generateSolidTypeScriptStringCore(
//               variant,
//               pool,
//               depth,
//               visited,
//             ),
//           );
//         }
//       }
//       return unionBuffer.join(' | ');
//     },

//     branded: (params) => {
//       const baseType = this.generateSolidTypeScriptStringCore(
//         params.shape.base,
//         params.pool,
//         params.depth,
//         params.visited,
//       );
//       return `${baseType} /* & Brand<'${String(params.shape.name)}'> */`;
//     },

//     reference: (params) => {
//       const { shape, pool, depth, visited } = params;

//       if (visited.has(shape.name)) {
//         return shape.name;
//       }

//       const referencedShape = this.resolveBlueprint(shape.name, pool);
//       if (!isUndefined(referencedShape)) {
//         const childVisited = new Set<string>(visited);
//         childVisited.add(shape.name);

//         return this.generateSolidTypeScriptStringCore(
//           referencedShape,
//           pool,
//           depth,
//           childVisited,
//         );
//       }
//       return shape.name;
//     },

//     array: (params) => {
//       const { shape, pool, depth, visited } = params;
//       const itemType = this.generateSolidTypeScriptStringCore(
//         shape.items,
//         pool,
//         depth,
//         visited,
//       );
//       const elements = shape.elementShapes;

//       if (!isUndefined(elements) && elements.length > 0) {
//         const len = elements.length;
//         const tupleBuffer: string[] = [];
//         for (let i = 0; i < len; i++) {
//           const element = elements[i];
//           if (!isUndefined(element)) {
//             tupleBuffer.push(
//               this.generateSolidTypeScriptStringCore(
//                 element,
//                 pool,
//                 depth,
//                 visited,
//               ),
//             );
//           }
//         }
//         const tupleContents = tupleBuffer.join(', ');
//         const restSpread = shape.hasRest ? `, ...${itemType}[]` : '';
//         return `[${tupleContents}${restSpread}]`;
//       }
//       return `${itemType}[]`;
//     },

//     object: (params) => {
//       const { shape, pool, depth, spacing, visited } = params;
//       const properties = shape.properties;
//       if (properties === undefined) return '{}';

//       const propertyKeys = ObjectUtils.keys(properties);
//       const len = propertyKeys.length;
//       if (len === 0) return '{}';

//       const nextDepth = depth + 1;
//       const innerSpacing = ' '.repeat(nextDepth);
//       const linesBuffer: string[] = [];

//       for (let i = 0; i < len; i++) {
//         const key = propertyKeys[i];
//         if (isUndefined(key)) continue;
//         const property: TSolidObjectRawShape = properties[key];
//         if (isUndefined(property)) continue;

//         const optionalMarker = property.optional ? '?' : '';
//         const valueType = this.generateSolidTypeScriptStringCore(
//           property.shape,
//           pool,
//           nextDepth,
//           visited,
//         );
//         linesBuffer.push(
//           `${innerSpacing}${key}${optionalMarker}: ${valueType};`,
//         );
//       }
//       return `{\n${linesBuffer.join('\n')}\n${spacing}}`;
//     },

//     intersection: (params) => {
//       return params.shape.values
//         .map((v) =>
//           this.generateSolidTypeScriptStringCore(
//             v,
//             params.pool,
//             params.depth,
//             params.visited,
//           ),
//         )
//         .join(' & ');
//     },

//     function: (params) => {
//       const { shape, pool, depth, visited } = params;
//       const args = shape.parameters
//         .map((p) => {
//           const paramType = this.generateSolidTypeScriptStringCore(
//             p.shape,
//             pool,
//             depth,
//             visited,
//           );
//           return `${p.name}${p.optional ? '?' : ''}: ${paramType}`;
//         })
//         .join(', ');

//       const ret = this.generateSolidTypeScriptStringCore(
//         shape.returnType,
//         pool,
//         depth,
//         visited,
//       );
//       return `(${args}) => ${ret}`;
//     },

//     instanceof: (params) => {
//       return params.shape.name;
//     },
//   } satisfies TRebuildShapeMapper;

//   private resolveBlueprint(
//     name: string,
//     pool: Record<string, TSolidShape> | Map<string, TSolidShape>,
//   ): TSolidShape | undefined {
//     return isInstanceOf(pool, Map) ? pool.get(name) : pool[name];
//   }

//   /**
//    * generateSolidTypeScriptStringCore
//    * 🪐 INTERNAL EVALUATION CORE GATE (Exhaustive Direct Dispatch Pass)
//    */
//   private generateSolidTypeScriptStringCore(
//     shape: TSolidShape,
//     blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
//     indentDepth: number,
//     visited: Set<string>,
//   ): string {
//     const spacing = ' '.repeat(indentDepth);
//     const baseParams = {
//       pool: blueprintsPool,
//       depth: indentDepth,
//       spacing,
//       visited,
//     };

//     // ========================================================================
//     // 🛡️ THE EXHAUSTIVENESS VERIFICATION DISPATCH TABLE
//     // Enforces complete compile-time kind coverage point-free!
//     // ========================================================================
//     const DISPATCHER: {
//       [K in TSolidShape['kind']]: (
//         s: Extract<TSolidShape, { kind: K }>,
//       ) => string;
//     } = {
//       /* prettier-ignore */ primitive:    (s) => this.REBUILD_STRATEGY_MAPPER.primitive({ shape: s, ...baseParams }),
//       /* prettier-ignore */ literal:      (s) => this.REBUILD_STRATEGY_MAPPER.literal({ shape: s, ...baseParams }),
//       /* prettier-ignore */ union:        (s) => this.REBUILD_STRATEGY_MAPPER.union({ shape: s, ...baseParams }),
//       /* prettier-ignore */ branded:      (s) => this.REBUILD_STRATEGY_MAPPER.branded({ shape: s, ...baseParams }),
//       /* prettier-ignore */ reference:    (s) => this.REBUILD_STRATEGY_MAPPER.reference({ shape: s, ...baseParams }),
//       /* prettier-ignore */ array:        (s) => this.REBUILD_STRATEGY_MAPPER.array({ shape: s, ...baseParams }),
//       /* prettier-ignore */ object:       (s) => this.REBUILD_STRATEGY_MAPPER.object({ shape: s, ...baseParams }),
//       /* prettier-ignore */ intersection: (s) => this.REBUILD_STRATEGY_MAPPER.intersection({ shape: s, ...baseParams }),
//       /* prettier-ignore */ function:     (s) => this.REBUILD_STRATEGY_MAPPER.function({ shape: s, ...baseParams }),
//       /* prettier-ignore */ instanceof:   (s) => this.REBUILD_STRATEGY_MAPPER.instanceof({ shape: s, ...baseParams }),
//     };

//     // Safely execute the exact narrowed handler signature token point-free
//     const handler = DISPATCHER[shape.kind];

//     // We execute an un-asserted distributive conversion to map the union type safely
//     return handler(shape as never);
//   }

//   // =============================================================================
//   // PUBLIC ENTRY POINT
//   // =============================================================================
//   public generateSolidTypeScriptString(
//     shape: TSolidShape,
//     blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
//     indentDepth = 0,
//   ): string {
//     if (isUndefined(shape) || isNull(shape)) return 'any';
//     return this.generateSolidTypeScriptStringCore(
//       shape,
//       blueprintsPool,
//       indentDepth,
//       new Set<string>(),
//     );
//   }
// }
/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * TODO REMOVE
 */
// class BlueprintService {
//   /**
//    * 🪐 TSOLID SHAPE STRATEGY DICTIONARY (Encapsulated O(1) Polymorphic Mapper)
//    */
//   private readonly REBUILD_STRATEGY_MAPPER: TRebuildShapeMapper = {
// primitive: (params: TRebuildParams) => {
//   const { shape } = params;
//   if (!isPrimitiveShape(shape)) return 'unknown';
//   return shape.type;
// },

// literal: (params: TRebuildParams) => {
//   const { shape } = params;
//   if (!isLiteralShape(shape)) return 'unknown';
//   const val = shape.value;
//   if (isUndefined(val)) return 'unknown';
//   return isString(val) ? `'${val}'` : String(val);
// },

// union: (params: TRebuildParams) => {
//   const { shape, pool, depth } = params;
//   if (!isUnionShape(shape)) return 'never';
//   const variants = shape.values;
//   if (isUndefined(variants) || variants.length === 0) return 'never';

//   const len = variants.length;
//   const unionBuffer: string[] = [];
//   for (let i = 0; i < len; i++) {
//     const variant = variants[i];
//     if (!isUndefined(variant)) {
//       /* prettier-ignore */
//       unionBuffer.push(this.generateSolidTypeScriptString(variant, pool, depth));
//     }
//   }
//   return unionBuffer.join(' | ');
// },

//     branded: (params: TRebuildParams) => {
//       const { shape, pool, depth } = params;
//       if (!isBrandedShape(shape)) return 'unknown';
//       /* prettier-ignore */
//       const baseType = this.generateSolidTypeScriptString(shape.base, pool, depth);
//       return `${baseType} /* & Brand<'${String(shape.name)}'> */`;
//     },

//     reference: (params: TRebuildParams) => {
//       const { shape, pool, depth } = params;
//       if (!isReferenceShape(shape)) return 'unknown';
//       const referencedShape = this.resolveBlueprint(shape.name, pool);
//       if (!isUndefined(referencedShape)) {
//         /* prettier-ignore */
//         return this.generateSolidTypeScriptString(referencedShape, pool, depth);
//       }
//       return shape.name;
//     },

//     array: (params: TRebuildParams) => {
//       const { shape, pool, depth } = params;
//       if (!isArrayShape(shape)) return 'unknown';
//       /* prettier-ignore */
//       const itemType = this.generateSolidTypeScriptString(shape.items, pool, depth);
//       const elements = shape.elementShapes;

//       if (!isUndefined(elements) && elements.length > 0) {
//         const len = elements.length;
//         const tupleBuffer: string[] = [];
//         for (let i = 0; i < len; i++) {
//           const element = elements[i];
//           if (!isUndefined(element)) {
//             /* prettier-ignore */
//             tupleBuffer.push(this.generateSolidTypeScriptString(element, pool, depth));
//           }
//         }
//         const tupleContents = tupleBuffer.join(', ');
//         const restSpread = shape.hasRest ? `, ...${itemType}[]` : '';
//         return `[${tupleContents}${restSpread}]`;
//       }
//       return `${itemType}[]`;
//     },

//     object: (params: TRebuildParams) => {
//       const { shape, pool, depth, spacing } = params;
//       if (!isObjectShape(shape)) return '{}';

//       const properties = shape.properties;
//       if (properties === undefined) return '{}';

//       const propertyKeys = ObjectUtils.keys(properties);
//       const len = propertyKeys.length;
//       if (len === 0) return '{}';

//       const nextDepth = depth + 1;
//       const innerSpacing = ' '.repeat(nextDepth);
//       const linesBuffer: string[] = [];

//       for (let i = 0; i < len; i++) {
//         const key = propertyKeys[i];
//         if (isUndefined(key)) continue;

//         const property: TSolidObjectRawShape = properties[key];
//         if (isUndefined(property)) continue;

//         const optionalMarker = property.optional ? '?' : '';
//         const valueType = this.generateSolidTypeScriptString(
//           property.shape,
//           pool,
//           nextDepth,
//         );

//         linesBuffer.push(
//           `${innerSpacing}${key}${optionalMarker}: ${valueType};`,
//         );
//       }

//       return `{\n${linesBuffer.join('\n')}\n${spacing}}`;
//     },
//     intersection: (params) => {
//       const { shape, pool, depth } = params;

//       if (shape.kind !== 'intersection') return 'unknown';

//       return shape.values
//         .map((v) => this.generateSolidTypeScriptString(v, pool, depth))
//         .join(' & ');
//     },

//     function: (params) => {
//       const { shape, pool, depth } = params;

//       if (shape.kind !== 'function') return 'unknown';

//       const args = shape.parameters
//         .map((p) => this.generateSolidTypeScriptString(p.shape, pool, depth))
//         .join(', ');

//       const ret = this.generateSolidTypeScriptString(
//         shape.returnType,
//         pool,
//         depth,
//       );

//       return `(${args}) => ${ret}`;
//     },

//     instanceof: (params) => {
//       const { shape } = params;

//       if (shape.kind !== 'instanceof') return String(null);

//       return shape.name;
//     },
//   } satisfies TRebuildShapeMapper;

//   private resolveBlueprint(
//     name: string,
//     pool: Record<string, TSolidShape> | Map<string, TSolidShape>,
//   ): TSolidShape | undefined {
//     return isInstanceOf(pool, Map) ? pool.get(name) : pool[name];
//   }

//   // =============================================================================
//   // =============================================================================
//   // PUBLIC ENTRY POINT
//   // =============================================================================
//   // =============================================================================
//   public generateSolidTypeScriptString(
//     shape: TSolidShape,
//     blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
//     indentDepth = 0,
//   ): string {
//     if (isUndefined(shape) || isNull(shape)) return 'any';

//     const strategy = this.REBUILD_STRATEGY_MAPPER[shape.kind];
//     if (isUndefined(shape)) return 'unknown';

//     const spacing = ' '.repeat(indentDepth);

//     return strategy({
//       shape,
//       pool: blueprintsPool,
//       depth: indentDepth,
//       spacing,
//     });
//   }
// }
