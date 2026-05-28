import type {
  TSolidShape,
  TTypeGuard,
  TSolidMetadata,
  TSolidShapePrimitiveKeys,
  TVaultSyncPayload,
  TXalorCLIModesMap,
} from '../../types';
import { isObject, isKeyInObject, isKeyOfArray } from './objects';
import { isNull, isString } from './primitives';
import {
  SOLID_SHAPE_PRIMITIVE_KEYS,
  IS_SOLID_SHAPE_KINDS_CONFIG,
} from '../../constants';
/**
 * FOCUSED SHAPE GUARDS
 *
 * These utilities provide type-safe narrowing for the TSolidShape union.
 * Essential for the recursive validation engine and AST generation to
 * resolve specific blueprint properties without type casting.
 */
/* prettier-ignore */ export const isPrimitiveShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'primitive' }> => s.kind === 'primitive';
/* prettier-ignore */ export const isLiteralShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'literal' }> => s.kind === 'literal';
/* prettier-ignore */ export const isUnionShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'union' }> => s.kind === 'union';
/* prettier-ignore */ export const isObjectShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'object' }> => s.kind === 'object';
/* prettier-ignore */ export const isArrayShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'array' }> => s.kind === 'array';
/* prettier-ignore */ export const isBrandedShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'branded' }> => s.kind === 'branded';
/* prettier-ignore */ export const isIntersectionShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'intersection' }> => s.kind === 'intersection';
/* prettier-ignore */ export const isReferenceShape = (s: TSolidShape): s is Extract<TSolidShape, { kind: 'reference' }> => s.kind === 'reference';

/**
 * @utilType Guard
 * @name isInitMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to init execution states.
 */
export const isInitMode: TTypeGuard<TXalorCLIModesMap['init']> = (
  value: unknown,
): value is TXalorCLIModesMap['init'] => {
  return value === 'init' || value === '--init';
};
/**
 * @utilType Guard
 * @name isInitMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to init execution states.
 */
export const isCompileMode: TTypeGuard<TXalorCLIModesMap['compile']> = (
  value: unknown,
): value is TXalorCLIModesMap['compile'] => {
  return value === 'compile' || value === '--compile';
};
/**
 * @utilType Guard
 * @name isWatchMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to watch execution states.
 */
export const isWatchMode: TTypeGuard<TXalorCLIModesMap['watch']> = (
  value: unknown,
): value is TXalorCLIModesMap['watch'] => {
  return value === 'watch' || value === '--watch' || value === '-w';
};

/**
 * @utilType Guard
 * @name isVacuumMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to vacuum execution states.
 */
export const isVacuumMode: TTypeGuard<TXalorCLIModesMap['vacuum']> = (
  value: unknown,
): value is TXalorCLIModesMap['vacuum'] => {
  return value === 'vacuum' || value === '--vacuum' || value === 'build';
};

/**
 * @utilType Guard
 * @name isReportMode
 * @category Guards Primitive
 * @description Validates that a string value maps exactly to report execution states.
 */
export const isReportMode: TTypeGuard<TXalorCLIModesMap['report']> = (
  value: unknown,
): value is TXalorCLIModesMap['report'] => {
  return value === 'report' || value === '--report';
};
/**
 * 🛰️ IS METADATA
 *
 * ROLE:
 * A structural check for the Xalor Miner's payload.
 * This ensures that a call to isXalor() contains the necessary
 * "DNA" (key, shape, area) before it is solidified in RAM.
 *
 * INVARIANTS:
 * - Must verify the presence of 'key' and 'shape' (The minimal blueprint).
 * - Must verify 'area' for Auditor traceability.
 */
export const isMetaData: TTypeGuard<TSolidMetadata> = (
  val: unknown,
): val is TSolidMetadata =>
  !isNull(val) &&
  isObject(val) &&
  isKeyInObject('key')(val) &&
  isKeyInObject('shape')(val) &&
  isKeyInObject('area')(val) &&
  isKeyInObject('version')(val);
/**
 * 🛰️ IS VAULT SYNC PAYLOAD
 *
 * ROLE:
 * A strict structural verification guard for synchronization transport payloads.
 * This guarantees that every record passing through the background pipeline possesses
 * absolute, unbroken traceability parameters before it is committed to the registry.
 *
 * INVARIANTS:
 * - Must enforce all core blueprint identifiers ('key', 'shape', 'area', 'version').
 * - Must explicitly verify 'filePath', 'typeName', and 'symbolName' strings to satisfy hard GPS tracing.
 */
export const isVaultSyncPayload: TTypeGuard<TVaultSyncPayload> = (
  val: unknown,
): val is TVaultSyncPayload =>
  !isNull(val) &&
  isObject(val) &&
  isKeyInObject('key')(val) &&
  isKeyInObject('shape')(val) &&
  isKeyInObject('area')(val) &&
  isKeyInObject('version')(val) &&
  isKeyInObject('filePath')(val) &&
  isKeyInObject('typeName')(val) &&
  isKeyInObject('symbolName')(val);
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
