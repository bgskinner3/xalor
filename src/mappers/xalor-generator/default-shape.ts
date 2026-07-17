import type { TShapeDefaultMaterializeMap } from '../../models/types';
import { PRIMITIVE_DEFAULTS } from '../../models/constants';
import { xalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import { xalethorVaultDiagnostics } from '../../xalor-service/vault-diagnostics';
import {
  isObject,
  yieldItems,
  yieldAllKeyValuePairs,
  isRecord,
  isUndefined,
} from '../../../shared';
import { shapeKindUtilsService } from '../../../shared/service';

/**
 * ============================================================================
 * 🏗️ DESIGN SYSTEM MAPPER: DEFAULT SHAPE MATERIALIZER
 * ============================================================================
 *
 * ROLE:
 * The "Materializer." Converts static structural TSolidShape blueprints into
 * physical, clean, zero-value JavaScript objects. It acts as the core
 * "3D Printer" of the Factory Layer (Category 3 Generator API).
 * @see produceDefault
 */
export const DEFAULT_SHAPE_MATERIALIZER: TShapeDefaultMaterializeMap = {
  primitive: (shape) => PRIMITIVE_DEFAULTS[shape.type],
  literal: (shape) => shape.value,

  object: (shape, depth, recurse) => {
    const obj: Record<string, unknown> = {};

    for (const [key, propDescriptor] of yieldAllKeyValuePairs(
      shape.properties,
    )) {
      if (!propDescriptor.optional) {
        obj[key] = recurse(propDescriptor.shape, depth + 1);
      }
    }
    return obj;
  },

  array: () => [],

  union: (shape, depth, recurse) => {
    if (shape.values.length === 0) {
      return undefined;
    }
    const firstBranch = shape.values[0];
    return firstBranch ? recurse(firstBranch, depth + 1) : undefined;
  },

  reference: (shape, depth, recurse) => {
    const subShape = xalethorVaultKeeper.peek('blueprint', shape.name);

    if (!subShape) {
      return xalethorVaultDiagnostics.panic(
        shape.name,
        `[Xalor Graph Integrity Error]: Broken internal reference key "${shape.name}" detected during recursive traversal.`,
      );
    }

    return recurse(subShape, depth + 1);
  },

  branded: (shape, depth, recurse) => recurse(shape.base, depth + 1),

  function: (shape, depth, recurse) => {
    return (..._args: unknown[]): unknown =>
      recurse(shape.returnType, depth + 1);
  },
  instanceof: (shape) => {
    const instanceKind = shapeKindUtilsService.getInstanceOfKind(shape.name);
    return instanceKind.def();
  },
  intersection: (shape, depth, recurse) => {
    const result: Record<string, unknown> = {};
    for (const part of yieldItems(shape.values)) {
      const value = recurse(part, depth + 1);

      if (value && isObject(value) && isRecord(value)) {
        for (const [k, v] of yieldAllKeyValuePairs(value)) {
          if (isUndefined(result[k])) result[k] = v;
        }
      }
    }
    return result;
  },
} satisfies TShapeDefaultMaterializeMap;
