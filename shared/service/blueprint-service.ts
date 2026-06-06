import type { TRebuildShapeMapper, TRebuildParams } from '../types';
import type { TSolidObjectRawShape, TSolidShape } from '../types/blueprints';
import {
  isUndefined,
  isNull,
  isInstanceOf,
  isString,
  isReferenceShape,
  isBrandedShape,
  isUnionShape,
  isLiteralShape,
  isObjectShape,
  isArrayShape,
  isPrimitiveShape,
} from '../../shared/utils/guards';
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
      const { shape, pool, depth } = params;
      if (!isUnionShape(shape)) return 'never';
      const variants = shape.values;
      if (isUndefined(variants) || variants.length === 0) return 'never';

      const len = variants.length;
      const unionBuffer: string[] = [];
      for (let i = 0; i < len; i++) {
        const variant = variants[i];
        if (!isUndefined(variant)) {
          /* prettier-ignore */
          unionBuffer.push(this.generateSolidTypeScriptString(variant, pool, depth));
        }
      }
      return unionBuffer.join(' | ');
    },

    branded: (params: TRebuildParams) => {
      const { shape, pool, depth } = params;
      if (!isBrandedShape(shape)) return 'unknown';
      /* prettier-ignore */
      const baseType = this.generateSolidTypeScriptString(shape.base, pool, depth);
      return `${baseType} /* & Brand<'${String(shape.name)}'> */`;
    },

    reference: (params: TRebuildParams) => {
      const { shape, pool, depth } = params;
      if (!isReferenceShape(shape)) return 'unknown';
      const referencedShape = this.resolveBlueprint(shape.name, pool);
      if (!isUndefined(referencedShape)) {
        /* prettier-ignore */
        return this.generateSolidTypeScriptString(referencedShape, pool, depth);
      }
      return shape.name;
    },

    array: (params: TRebuildParams) => {
      const { shape, pool, depth } = params;
      if (!isArrayShape(shape)) return 'unknown';
      /* prettier-ignore */
      const itemType = this.generateSolidTypeScriptString(shape.items, pool, depth);
      const elements = shape.elementShapes;

      if (!isUndefined(elements) && elements.length > 0) {
        const len = elements.length;
        const tupleBuffer: string[] = [];
        for (let i = 0; i < len; i++) {
          const element = elements[i];
          if (!isUndefined(element)) {
            /* prettier-ignore */
            tupleBuffer.push(this.generateSolidTypeScriptString(element, pool, depth));
          }
        }
        const tupleContents = tupleBuffer.join(', ');
        const restSpread = shape.hasRest ? `, ...${itemType}[]` : '';
        return `[${tupleContents}${restSpread}]`;
      }
      return `${itemType}[]`;
    },

    object: (params: TRebuildParams) => {
      const { shape, pool, depth, spacing } = params;
      if (!isObjectShape(shape)) return '{}';

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
        const valueType = this.generateSolidTypeScriptString(
          property.shape,
          pool,
          nextDepth,
        );

        linesBuffer.push(
          `${innerSpacing}${key}${optionalMarker}: ${valueType};`,
        );
      }

      return `{\n${linesBuffer.join('\n')}\n${spacing}}`;
    },
  } satisfies TRebuildShapeMapper;

  private resolveBlueprint(
    name: string,
    pool: Record<string, TSolidShape> | Map<string, TSolidShape>,
  ): TSolidShape | undefined {
    return isInstanceOf(pool, Map) ? pool.get(name) : pool[name];
  }

  // =============================================================================
  // =============================================================================
  // PUBLIC ENTRY POINT
  // =============================================================================
  // =============================================================================
  public generateSolidTypeScriptString(
    shape: TSolidShape,
    blueprintsPool: Record<string, TSolidShape> | Map<string, TSolidShape>,
    indentDepth = 0,
  ): string {
    if (isUndefined(shape) || isNull(shape)) return 'any';

    const strategy = this.REBUILD_STRATEGY_MAPPER[shape.kind];
    if (isUndefined(shape)) return 'unknown';

    const spacing = ' '.repeat(indentDepth);

    return strategy({
      shape,
      pool: blueprintsPool,
      depth: indentDepth,
      spacing,
    });
  }
}

export const blueprintService = new BlueprintService();
