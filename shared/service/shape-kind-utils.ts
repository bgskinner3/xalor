import type {
  TInstanceConstructorRegistry,
  InstanceRegistryKey,
} from '../shape-domain';
import { INSTANCE_REGISTRY_MAPPER } from '../shape-domain';

export class ShapeKindUtils {
  public resolveInstanceCtor<K extends keyof TInstanceConstructorRegistry>(
    key: K,
  ): TInstanceConstructorRegistry[K] {
    return INSTANCE_REGISTRY_MAPPER[key].ctor;
  }
  public getInstanceOfKind(key: InstanceRegistryKey) {
    return INSTANCE_REGISTRY_MAPPER[key];
  }
}
export const shapeKindUtilsService = new ShapeKindUtils();

// /**
//  * ============================================================================
//  * 🧭 TSOLID SHAPE DISPATCHER (MATCH ENGINE)
//  * ============================================================================
//  *
//  * ROLE:
//  * Core runtime dispatcher for TSolidShape AST nodes.
//  *
//  * This function acts as the central routing layer between:
//  *   - structural AST nodes (TSolidShape)
//  *   - semantic execution logic (validation, materialization, mocking, etc.)
//  *
//  * It enables polymorphic behavior WITHOUT:
//  *   - switch statements
//  *   - class hierarchies
//  *   - runtime type tagging logic duplication
//  *
//  * ----------------------------------------------------------------------------
//  * DESIGN PRINCIPLES:
//  *
//  * 1. COMMANDMENT IV — Operation Isolation
//  *    Each mapper implements exactly one semantic operation per shape kind.
//  *
//  * 2. COMMANDMENT VI — Determinism
//  *    Same shape → same execution path → same output behavior.
//  *
//  * 3. COMMANDMENT IX — No Escape Hatches
//  *    Exhaustive mapping ensures all shape kinds are handled explicitly.
//  *
//  * ----------------------------------------------------------------------------
//  * ARCHITECTURAL ROLE:
//  *
//  * This is a foundational execution primitive used by:
//  *   - Validation engine
//  *   - Default materializer
//  *   - Mock generator
//  *   - Sanitizer / caster pipelines
//  *
//  * It is NOT a validator or transformer itself.
//  * It is the routing mechanism those systems depend on.
//  * ============================================================================
//  */
// export function matchShape<T>(
//   shape: TSolidShape,
//   mappers: {
//     [K in TSolidShape['kind']]: (s: Extract<TSolidShape, { kind: K }>) => T;
//   },
// ): T {
//   if (isPrimitiveShape(shape)) return mappers.primitive(shape);
//   if (isLiteralShape(shape)) return mappers.literal(shape);
//   if (isUnionShape(shape)) return mappers.union(shape);
//   if (isObjectShape(shape)) return mappers.object(shape);
//   if (isArrayShape(shape)) return mappers.array(shape);
//   if (isBrandedShape(shape)) return mappers.branded(shape);
//   if (isReferenceShape(shape)) return mappers.reference(shape);
//   if (isInstanceOfShape(shape)) return mappers.instanceof(shape);
//   if (isFunctionShape(shape)) return mappers.function(shape);
//   if (isIntersectionShape(shape)) return mappers.intersection(shape);

//   // Enforces compilation safety: will throw a compile error if a new shape kind is added to TSolidShape later
//   const _exhaustiveCheck: TSolidShape = shape;
//   return _exhaustiveCheck;
// }
