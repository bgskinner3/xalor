import type { TShapeMockMapperMap } from '../../models/types';
import {
  yieldAllKeyValuePairs,
  yieldItems,
  isObject,
  isRecord,
  isUndefined,
  IS_SOLID_CONFIG_ITEMS,
} from '../../../shared';
import { generateRandomString } from '../../utils/transformers';
import { xalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import type { TSolidShapePrimitiveKeys } from '../../../shared';
import { shapeKindUtilsService } from '../../../shared/service';
import { xalethorVaultDiagnostics } from '../../xalor-service/vault-diagnostics';
/**
 * ============================================================================
 * 🎲 DESIGN SYSTEM MAPPER: MOCK SHAPE MATERIALIZER
 * ============================================================================
 *
 * ROLE:
 * The "Simulacrum." Materializes highly realistic, randomized data structures
 * that respect your static blueprint limits while introducing structural entropy.
 *
 * @see produceMock
 */

/* prettier-ignore */
const PRIMITIVE_MOCK_GENERATORS: Record<TSolidShapePrimitiveKeys, () => unknown> = {
  string:    () => generateRandomString(10),
  number:    () => Math.floor(Math.random() * 1000),
  boolean:   () => Math.random() > 0.5,
  bigint:    () => BigInt(Math.floor(Math.random() * 1000000)),
  symbol:    () => Symbol(generateRandomString(4)),
  null:      () => null,
  undefined: () => undefined,
  void:      () => undefined,
  never:     () => undefined,
  unknown:   () => `unknown_val_${Math.random().toString(36).substring(7)}`,
  any:       () => `any_val_${Math.random().toString(36).substring(7)}`,
} satisfies Record<TSolidShapePrimitiveKeys, () => unknown>;

export const MOCK_SHAPE_MATERIALIZER: TShapeMockMapperMap = {
  primitive: (shape) => {
    const generator = PRIMITIVE_MOCK_GENERATORS[shape.type];
    if (generator) {
      return generator();
    }
    return PRIMITIVE_MOCK_GENERATORS.unknown();
  },

  literal: (shape) => {
    if (Math.random() < 0.8) return shape.value;
    return undefined;
  },

  object: (shape, depth, recurse) => {
    const obj: Record<string, unknown> = {};

    for (const [key, metadata] of yieldAllKeyValuePairs(shape.properties)) {
      const shouldInclude = !metadata.optional || Math.random() > 0.5;
      if (shouldInclude) {
        const value = recurse(metadata.shape, depth + 1);
        if (!isUndefined(value)) obj[key] = value;
      }
    }
    return obj;
  },

  array: (shape, depth, recurse) => {
    const arr: unknown[] = [];
    const count = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < count; i++) {
      arr.push(recurse(shape.items, depth + 1));
    }
    return arr;
  },

  union: (shape, depth, recurse) => {
    if (shape.values.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * shape.values.length);
    const targetBranch = shape.values[randomIndex];
    return targetBranch ? recurse(targetBranch, depth + 1) : undefined;
  },

  reference: (shape, depth, recurse) => {
    if (depth > IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) {
      return {};
    }

    const subShape = xalethorVaultKeeper.peek('blueprint', shape.name);

    if (!subShape) {
      return xalethorVaultDiagnostics.panic(
        shape.name,
        `[Xalor Graph Integrity Error]: Broken internal reference key "${shape.name}" detected during recursive traversal loops.`,
      );
    }

    return recurse(subShape, depth + 1);
  },

  branded: (shape, depth, recurse) => recurse(shape.base, depth + 1),

  /* prettier-ignore */
  function: (shape, depth, recurse) => {
    return (..._args: unknown[]): unknown => recurse(shape.returnType, depth + 1);
  },

  intersection: (shape, depth, recurse) => {
    const result: Record<string, unknown> = {};

    // Commandment VIII: Stream-iterates part interfaces safely without mapping intermediate arrays
    for (const part of yieldItems(shape.values)) {
      const value = recurse(part, depth + 1);
      /* prettier-ignore */
      if (value && isObject(value) && isRecord(value)) {
        for (const [k, v] of yieldAllKeyValuePairs(value)) {
          if (isUndefined(result[k])) {
            result[k] = v;
          }
        }
      }
    }
    return result;
  },
  instanceof: (shape) => {
    const instanceKind = shapeKindUtilsService.getInstanceOfKind(shape.name);
    return instanceKind.def();
  },
} satisfies TShapeMockMapperMap;
