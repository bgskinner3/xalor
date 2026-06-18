import type { TRebuildShapeMapper, TRebuildParams } from '../types';
import type { TSolidObjectRawShape, TSolidShape } from '../shape-domain';
import {
  isUndefined,
  isNull,
  isInstanceOf,
  isString,
  isUnionShape,
  isLiteralShape,
  isPrimitiveShape,
  // isReferenceShape,
  // isBrandedShape,
  // isObjectShape,
  // isArrayShape,
} from '../../shared';
import { ObjectUtils } from '../../shared/utils';

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
  /**
   * 🪐 TSOLID SHAPE STRATEGY DICTIONARY (Encapsulated O(1) Polymorphic Mapper)
   */
  private readonly REBUILD_STRATEGY_MAPPER: TRebuildShapeMapper = {
    primitive: (params: TRebuildParams) => {
      const { shape } = params;
      if (!isPrimitiveShape(shape)) return 'unknown';
      return shape.type;
    },
    literal: (params: TRebuildParams) => {
      const { shape } = params;
      if (!isLiteralShape(shape)) return 'unknown';
      const val = shape.value;
      if (isUndefined(val)) return 'unknown';
      return isString(val) ? `'${val}'` : String(val);
    },

    union: (params: TRebuildParams) => {
      const { shape, pool, depth, visited } = params;
      if (!isUnionShape(shape)) return 'never';
      const variants = shape.values;
      if (isUndefined(variants) || variants.length === 0) return 'never';

      const len = variants.length;
      const unionBuffer: string[] = [];
      for (let i = 0; i < len; i++) {
        const variant = variants[i];
        if (!isUndefined(variant)) {
          unionBuffer.push(
            this.generateSolidTypeScriptStringCore(
              variant,
              pool,
              depth,
              visited,
            ),
          );
        }
      }
      return unionBuffer.join(' | ');
    },

    branded: (params) => {
      const baseType = this.generateSolidTypeScriptStringCore(
        params.shape.base,
        params.pool,
        params.depth,
        params.visited,
      );
      return `${baseType} /* & Brand<'${String(params.shape.name)}'> */`;
    },

    reference: (params) => {
      const { shape, pool, depth, visited } = params;

      if (visited.has(shape.name)) {
        return shape.name;
      }

      const referencedShape = this.resolveBlueprint(shape.name, pool);
      if (!isUndefined(referencedShape)) {
        const childVisited = new Set<string>(visited);
        childVisited.add(shape.name);

        return this.generateSolidTypeScriptStringCore(
          referencedShape,
          pool,
          depth,
          childVisited,
        );
      }
      return shape.name;
    },

    array: (params) => {
      const { shape, pool, depth, visited } = params;
      const itemType = this.generateSolidTypeScriptStringCore(
        shape.items,
        pool,
        depth,
        visited,
      );
      const elements = shape.elementShapes;

      if (!isUndefined(elements) && elements.length > 0) {
        const len = elements.length;
        const tupleBuffer: string[] = [];
        for (let i = 0; i < len; i++) {
          const element = elements[i];
          if (!isUndefined(element)) {
            tupleBuffer.push(
              this.generateSolidTypeScriptStringCore(
                element,
                pool,
                depth,
                visited,
              ),
            );
          }
        }
        const tupleContents = tupleBuffer.join(', ');
        const restSpread = shape.hasRest ? `, ...${itemType}[]` : '';
        return `[${tupleContents}${restSpread}]`;
      }
      return `${itemType}[]`;
    },

    object: (params) => {
      const { shape, pool, depth, spacing, visited } = params;
      const properties = shape.properties;
      if (properties === undefined) return '{}';

      const propertyKeys = ObjectUtils.keys(properties);
      const len = propertyKeys.length;
      if (len === 0) return '{}';

      const nextDepth = depth + 1;
      const innerSpacing = ' '.repeat(nextDepth);
      const linesBuffer: string[] = [];

      for (let i = 0; i < len; i++) {
        const key = propertyKeys[i];
        if (isUndefined(key)) continue;
        const property: TSolidObjectRawShape = properties[key];
        if (isUndefined(property)) continue;

        const optionalMarker = property.optional ? '?' : '';
        const valueType = this.generateSolidTypeScriptStringCore(
          property.shape,
          pool,
          nextDepth,
          visited,
        );
        linesBuffer.push(
          `${innerSpacing}${key}${optionalMarker}: ${valueType};`,
        );
      }
      return `{\n${linesBuffer.join('\n')}\n${spacing}}`;
    },

    intersection: (params) => {
      return params.shape.values
        .map((v) =>
          this.generateSolidTypeScriptStringCore(
            v,
            params.pool,
            params.depth,
            params.visited,
          ),
        )
        .join(' & ');
    },

    function: (params) => {
      const { shape, pool, depth, visited } = params;
      const args = shape.parameters
        .map((p) => {
          const paramType = this.generateSolidTypeScriptStringCore(
            p.shape,
            pool,
            depth,
            visited,
          );
          return `${p.name}${p.optional ? '?' : ''}: ${paramType}`;
        })
        .join(', ');

      const ret = this.generateSolidTypeScriptStringCore(
        shape.returnType,
        pool,
        depth,
        visited,
      );
      return `(${args}) => ${ret}`;
    },

    instanceof: (params) => {
      return params.shape.name;
    },
  } satisfies TRebuildShapeMapper;

  private resolveBlueprint(
    name: string,
    pool: Record<string, TSolidShape> | Map<string, TSolidShape>,
  ): TSolidShape | undefined {
    return isInstanceOf(pool, Map) ? pool.get(name) : pool[name];
  }

  /**
   * generateSolidTypeScriptStringCore
   * 🪐 INTERNAL EVALUATION CORE GATE (Exhaustive Direct Dispatch Pass)
   */
  private generateSolidTypeScriptStringCore(
    shape: TSolidShape,
    blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
    indentDepth: number,
    visited: Set<string>,
  ): string {
    const spacing = ' '.repeat(indentDepth);
    const baseParams = {
      pool: blueprintsPool,
      depth: indentDepth,
      spacing,
      visited,
    };

    // ========================================================================
    // 🛡️ THE EXHAUSTIVENESS VERIFICATION DISPATCH TABLE
    // Enforces complete compile-time kind coverage point-free!
    // ========================================================================
    const DISPATCHER: {
      [K in TSolidShape['kind']]: (
        s: Extract<TSolidShape, { kind: K }>,
      ) => string;
    } = {
      /* prettier-ignore */ primitive:    (s) => this.REBUILD_STRATEGY_MAPPER.primitive({ shape: s, ...baseParams }),
      /* prettier-ignore */ literal:      (s) => this.REBUILD_STRATEGY_MAPPER.literal({ shape: s, ...baseParams }),
      /* prettier-ignore */ union:        (s) => this.REBUILD_STRATEGY_MAPPER.union({ shape: s, ...baseParams }),
      /* prettier-ignore */ branded:      (s) => this.REBUILD_STRATEGY_MAPPER.branded({ shape: s, ...baseParams }),
      /* prettier-ignore */ reference:    (s) => this.REBUILD_STRATEGY_MAPPER.reference({ shape: s, ...baseParams }),
      /* prettier-ignore */ array:        (s) => this.REBUILD_STRATEGY_MAPPER.array({ shape: s, ...baseParams }),
      /* prettier-ignore */ object:       (s) => this.REBUILD_STRATEGY_MAPPER.object({ shape: s, ...baseParams }),
      /* prettier-ignore */ intersection: (s) => this.REBUILD_STRATEGY_MAPPER.intersection({ shape: s, ...baseParams }),
      /* prettier-ignore */ function:     (s) => this.REBUILD_STRATEGY_MAPPER.function({ shape: s, ...baseParams }),
      /* prettier-ignore */ instanceof:   (s) => this.REBUILD_STRATEGY_MAPPER.instanceof({ shape: s, ...baseParams }),
    };

    // Safely execute the exact narrowed handler signature token point-free
    const handler = DISPATCHER[shape.kind];

    // We execute an un-asserted distributive conversion to map the union type safely
    return handler(shape as never);
  }

  // =============================================================================
  // PUBLIC ENTRY POINT
  // =============================================================================
  public generateSolidTypeScriptString(
    shape: TSolidShape,
    blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
    indentDepth = 0,
  ): string {
    if (isUndefined(shape) || isNull(shape)) return 'any';
    return this.generateSolidTypeScriptStringCore(
      shape,
      blueprintsPool,
      indentDepth,
      new Set<string>(),
    );
  }
}
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

export const blueprintService = new BlueprintService();
