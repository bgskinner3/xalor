// /shared/shape-domain/guards/index.ts
import type {
  TSolidShape,
  TSolidShapePrimitiveKeys,
  TSolidShapeLiteralKeys,
  InstanceRegistryKey,
} from '../types';
import type { TTypeGuard } from '../../types';
import {
  isInstanceOf,
  isKeyOfArray,
  isString,
  isKeyInObject,
} from '../../utils/guards';
import {
  SOLID_SHAPE_PRIMITIVE_KEYS,
  IS_SOLID_SHAPE_KINDS_CONFIG,
  SOLID_SHAPE_LITERAL_KEYS,
  INSTANCE_REGISTRY_MAPPER,
} from '../constants';
/**
 * FOCUSED SHAPE GUARDS
 *
 * These utilities provide type-safe narrowing for the TSolidShape union.
 * Essential for the recursive validation engine and AST generation to
 * resolve specific blueprint properties without type casting.
 */
/* prettier-ignore */
export const isPrimitiveShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'primitive' }> => s.kind === 'primitive';
/* prettier-ignore */
export const isLiteralShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'literal' }> => s.kind === 'literal';
/* prettier-ignore */
export const isUnionShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'union' }> => s.kind === 'union';
/* prettier-ignore */
export const isObjectShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'object' }> => s.kind === 'object';
/* prettier-ignore */
export const isArrayShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'array' }> => s.kind === 'array';
/* prettier-ignore */
export const isBrandedShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'branded' }> => s.kind === 'branded';
/* prettier-ignore */
export const isReferenceShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'reference' }> => s.kind === 'reference';
/* prettier-ignore */
export const isInstanceOfShape = (s: TSolidShape ): s is Extract<TSolidShape, { kind: 'instanceof' }> => s.kind === 'instanceof';
/* prettier-ignore */
export const isFunctionShape = (s: TSolidShape ): s is Extract<TSolidShape, { kind: 'function' }> => s.kind === 'function';
/* prettier-ignore */
export const isIntersectionShape = (s: TSolidShape ): s is Extract<TSolidShape, { kind: 'intersection' }> => s.kind === 'intersection';

/**
 * Runtime instanceof discriminator.
 *
 * Narrows unknown values into constructor-bound object instances.
 * Used by AST 'instanceof' shape evaluation.
 */
/* prettier-ignore */
export const isInstanceMatchOf: TTypeGuard<object, [new (...args: unknown[]) => object]> = (
  value: unknown,
  ctor: new (...args: unknown[]) => object,
): value is object => {
  return isInstanceOf(value, ctor) 
};

export const isKeyOfInstanceKind: TTypeGuard<InstanceRegistryKey> = (
  val: unknown,
): val is InstanceRegistryKey =>
  isString(val) && isKeyInObject(val)(INSTANCE_REGISTRY_MAPPER);

/**
 * 🎯 IS SOLID SHAPE PRIMITIVE KEY (THE GATEWAY ACCESS RADAR)
 *
 * ROLE:
 * A high-speed type-narrowing predicate guard used to verify if a runtime string token
 * is a registered member of the immutable primitive compaction matrix.
 *
 * STRATEGY:
 * First confirms the raw value is an evaluation-safe identifier string before executing
 * a zero-assertion, allocation-free array bounds lookup. Passing this guard natively narrows
 * the parameter down to `TSolidShapePrimitiveKeys`, clearing all strict type assignment
 * restrictions across downstream reifiers, normalizers, and runtime Bouncer modules.
 */
export const isSolidShapePrimitiveKey: TTypeGuard<TSolidShapePrimitiveKeys> = (
  key: unknown,
): key is TSolidShapePrimitiveKeys =>
  (typeof key === 'string' ||
    typeof key === 'number' ||
    typeof key === 'symbol') &&
  isKeyOfArray(SOLID_SHAPE_PRIMITIVE_KEYS)(key);

export const isSolidShapeLiteralKey: TTypeGuard<TSolidShapeLiteralKeys> = (
  key: unknown,
): key is TSolidShapeLiteralKeys =>
  (typeof key === 'string' ||
    typeof key === 'number' ||
    typeof key === 'boolean') &&
  isKeyOfArray(SOLID_SHAPE_LITERAL_KEYS)(key);

/**
 * isValidSolidShape
 *
 * ROLE:
 * High-Speed Outer-Boundary Discriminator Guard.
 *
 * STRATEGY:
 * Bypasses intensive recursive graph traversing. It relies on TypeScript's upstream
 * compilation safety and validates only the top-level 'kind' property array slot,
 * delivering sub-nanosecond type refinement speeds.
 */
export const isValidSolidShape: TTypeGuard<TSolidShape> = (
  shape: unknown,
): shape is TSolidShape =>
  isKeyInObject('kind')(shape) &&
  isString(shape.kind) &&
  isKeyInObject(shape.kind)(IS_SOLID_SHAPE_KINDS_CONFIG);
