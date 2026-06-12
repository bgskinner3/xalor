import type { TShapeMockMapperMap } from '../../models/types';
import { ObjectUtils } from '../../../shared';
import { generateRandomString } from '../../utils/transformers';
import { XalethorVaultKeeper } from '../../xalor-service/vault-keeper';
import type { TSolidShape } from '../../../shared';

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
/* prettier-ignore */ const PRIMITIVE_MOCK_GENERATORS: Record<string,(shape: TSolidShape) => unknown> = {
  string: () => generateRandomString(10),
  number: () => Math.floor(Math.random() * 1000),
  boolean: () => Math.random() > 0.5,
  bigint: () => BigInt(Math.floor(Math.random() * 1000000)),
  unknown: () => `unknown_val_${Math.random().toString(36).substring(7)}`,
} satisfies Record<string,(shape: TSolidShape) => unknown>

export const MOCK_SHAPE_MATERIALIZER: TShapeMockMapperMap = {
  // TODO HANDLE UNKNWON
  primitive: (shape) => {
    const generator = PRIMITIVE_MOCK_GENERATORS[shape.type];
    return generator
      ? generator(shape)
      : PRIMITIVE_MOCK_GENERATORS.unknown(shape);
  },

  literal: (shape) => {
    if (Math.random() < 0.8) return shape.value;
    return undefined;
  },

  object: (shape, depth, recurse) => {
    const obj: Record<string, unknown> = {};
    const keys = ObjectUtils.keys(shape.properties);

    for (const key of keys) {
      const metadata = shape.properties[key];

      const shouldInclude = !metadata.optional || Math.random() > 0.5;

      if (shouldInclude) {
        const value = recurse(metadata.shape, depth + 1);
        if (value !== undefined) {
          obj[key] = value;
        }
      }
    }
    return obj;
  },

  array: (shape, depth, recurse) => {
    const count = Math.floor(Math.random() * 3) + 1;
    return Array.from({ length: count }, () => recurse(shape.items, depth + 1));
  },

  union: (shape, depth, recurse) => {
    const randomIndex = Math.floor(Math.random() * shape.values.length);
    const targetBranch = shape.values[randomIndex];
    return targetBranch ? recurse(targetBranch, depth + 1) : undefined;
  },
  //TODO: ircular reference test WILL eventually break mock generator
  reference: (shape, depth, recurse) => {
    if (depth > 20) return undefined;

    const subShape = XalethorVaultKeeper.peek('blueprint', shape.name);
    return subShape ? recurse(subShape, depth + 1) : undefined;
  },

  branded: (shape, depth, recurse) => recurse(shape.base, depth + 1),
  function: (shape, depth, recurse) => {
    return (..._args: unknown[]) => {
      return recurse(shape.returnType, depth + 1);
    };
  },
  intersection: (shape, depth, recurse) => {
    const result: Record<string, unknown> = {};

    for (const part of shape.values) {
      const value = recurse(part, depth + 1);

      if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          if (result[k] === undefined) {
            result[k] = v;
          }
        }
      }
    }

    return result;
  },
  instanceof: (shape) => {
    switch (shape.name) {
      case 'Date':
        return new Date(0);

      case 'Map':
        return new Map();

      case 'Set':
        return new Set();

      case 'URL':
        return new URL('https://example.com');

      case 'RegExp':
        return /mock/;

      default:
        return null;
    }
  },
} satisfies TShapeMockMapperMap;
// /**
//  *
//  * @description
//  * Standardized polymorphic runtime gateway executing Category 1 (The Generation Pillar Layer) operations.
//  * Seeds, physically scrubs, or structurally coaxes baseline schemas out of precompiled Vault registry blueprints.
//  *
//  * DESIGN INVARIANTS:
//  * - Satisfies Commandment IV (Operation Isolation) and Commandment VIII (Internal Efficiency).
//  * - Coordinates structural seed cloning, mock data synthesis, and deep primitive shape casting.
//  * - Build-time generic parameters <"KEY", "mode"> are stripped and injected at indices 1 and 2 at compilation runtime.
//  *
//  * -------
//  * @mode default
//  * @description
//  * Zero-state blueprint instantiation. Materializes a pristine object model matching your target contract
//  * with guaranteed schema-valid default leaf values, satisfying initial entity baseline setups cleanly.
//  * @example
//  * ```ts
//  * const emptyUser = generateXalor<'User', 'default'>();
//  * // Returns a valid user object initialized with default string/number structures
//  * console.log(emptyUser.username); // ""
//  * ```
//  * -------
//  * @mode mock
//  * @description
//  * Constraint-aware stochastic data simulation. Iterates across your shape graph configurations to dynamically
//  * manufacture realistic, property-compliant mock values, fully optimized for unit testing matrices.
//  * @example
//  * ```ts
//  * const randomUser = generateXalor<'User', 'mock'>();
//  * // Returns a randomly seeded, structurally valid user object instance
//  * console.log(randomUser.email); // "f7x9a@example.com"
//  * ```
//  * -------
//  * @mode clone
//  * @description
//  * Deep property-scrubbing structural wash. Loops down through an untrusted input payload, copy-instantiating
//  * class prototypes while stripping away un-declared rogue properties to preserve strict runtime data memory integrity.
//  * @example
//  * ```ts
//  * const cleanUser = generateXalor<'User', 'clone'>(dirtyIncomingRequestJson);
//  * // Returns a completely stripped clone carrying zero extra properties beyond the 'User' blueprint
//  * console.log(cleanUser.id);
//  * ```
//  * -------
//  * @mode cast
//  * @description
//  * Type coercion data shaping pipeline. Symmetrically coerces, un-boxes, or parses loose incoming runtime properties
//  * into the strict primitive type layouts explicitly demanded by the blueprint schema, matching data layers safely.
//  * @example
//  * ```ts
//  * const correctUser = generateXalor<'User', 'cast'>({
//  *   id: 12345, // Number coerced safely to String if the blueprint demands a string key token
//  *   isActive: "true" // String coerced safely to Boolean
//  * });
//  * ```
//  * -------
//  * @see TGenerateXalorStrategyEngine
//  * @see XalethorVaultGenerator
//  */
