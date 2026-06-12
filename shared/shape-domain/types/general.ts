import type { TSolidShape } from './core-shape';

/**
 * 🛡️ SHAPE GATE TYPES
 *
 * These utility types extract specific variants from the master TSolidShape union.
 * They are used to type-gate sub-validator functions, ensuring that a logic
 * block specifically designed for an "object" or "array" only receives the
 * corresponding shape metadata.
 */
/* prettier-ignore */
export type TSolidPrimitiveShape = Extract<TSolidShape, { kind: 'primitive' }>;
/* prettier-ignore */
export type TSolidLiteralShape   = Extract<TSolidShape, { kind: 'literal' }>;
/* prettier-ignore */
export type TSolidUnionShape     = Extract<TSolidShape, { kind: 'union' }>;
/* prettier-ignore */
export type TSolidObjectShape    = Extract<TSolidShape, { kind: 'object' }>;
/* prettier-ignore */
export type TSolidArrayShape     = Extract<TSolidShape, { kind: 'array' }>;
/* prettier-ignore */
export type TSolidBrandedShape   = Extract<TSolidShape, { kind: 'branded' }>;
/* prettier-ignore */
export type TSolidReferenceShape = Extract<TSolidShape, { kind: 'reference' }>;
/* prettier-ignore */
export type TSolidFunctionShape = Extract<TSolidShape, { kind: 'function' }>;
/* prettier-ignore */
export type TSolidIntersectionShape = Extract<TSolidShape, { kind: 'intersection' }>;
/* prettier-ignore */
export type TSolidInstanceOfShape = Extract<TSolidShape, { kind: 'instanceof' }>;
