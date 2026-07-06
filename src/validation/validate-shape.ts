// // src/validation/solidify-shape.ts
// import type { TValidationContext, TSolidShape } from '../../shared';
// import { createInitialContext } from './context';
// import {
//   isObject,
//   isNull,
//   isFunction,
//   IS_SOLID_CONFIG_ITEMS,
// } from '../../shared';
// import { SHAPE_VALIDATION_MAPPER } from '../mappers';
// /**
//  * 💎 solidify
//  * Attests that raw data conforms to a TSolidShape blueprint.
//  *
//  * INVARIANTS:
//  * - Prevents infinite recursion via Graph Integrity checks (ctx.seen).
//  * - Routes execution to the specialized Validator Mapper.
//  */
// export function validateShape(
//   data: unknown,
//   shape: TSolidShape,
//   ctx: TValidationContext = createInitialContext(),
// ): boolean {
//   const { reifyLimit } = IS_SOLID_CONFIG_ITEMS;
//   if (ctx.depth > reifyLimit.maxDepth) return false;

//   if (isObject(data) && !isNull(data)) {
//     let seenShapes = ctx.seen.get(data);
//     if (seenShapes?.has(shape)) return true;

//     if (!seenShapes) {
//       seenShapes = new Set([shape]);
//       ctx.seen.set(data, seenShapes);
//     } else {
//       seenShapes.add(shape);
//     }
//   }

//   const validator = SHAPE_VALIDATION_MAPPER[shape.kind];

//   if (!isFunction(validator)) {
//     throw new Error(
//       `[xalor] 🚨 Unsupported shape kind: "${shape.kind}". ` +
//         `Check your Bunker version against the current Engine.`,
//     );
//   }

//   // We increment depth here so nested workers know they are deeper
//   ctx.depth++;
//   const result = validator(data, shape, ctx);
//   ctx.depth--;

//   return result;
// }
