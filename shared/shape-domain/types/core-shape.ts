// /shared/shape-domain/types.ts
import {
  IS_SOLID_SHAPE_KINDS_CONFIG,
  SOLID_SHAPE_PRIMITIVE_KEYS,
  SOLID_SHAPE_LITERAL_KEYS,
  INSTANCE_CATEGORIES,
  INSTANCE_REGISTRY_MAPPER,
} from '../constants';
import type { TDetermineInstance } from '../../types';
// ===============================================================
// ===============================================================
// SOLID TYPE SYSTEM — CORE CONSTANTS + DERIVED TYPES
// ===============================================================
// ===============================================================
// --------------------------------------------------------------------
// ===============================================================
// INSTANCE CONSTANTS
// ===============================================================

/* prettier-ignore */
export type InstanceCategory = (typeof INSTANCE_CATEGORIES)[keyof typeof INSTANCE_CATEGORIES];

/* prettier-ignore */
export type InstanceRegistryKey = keyof typeof INSTANCE_REGISTRY_MAPPER;

/* prettier-ignore */
export type TSolidShapeKinds = keyof typeof IS_SOLID_SHAPE_KINDS_CONFIG;

/* prettier-ignore */
export type TSolidShapePrimitiveKeys = (typeof SOLID_SHAPE_PRIMITIVE_KEYS)[number];

/* prettier-ignore */
export type TSolidShapeLiteralKeys = (typeof SOLID_SHAPE_LITERAL_KEYS)[number];

/* prettier-ignore */
export type TRegistryMap = typeof INSTANCE_REGISTRY_MAPPER;

/* prettier-ignore */
export type TRegisteredInstancesUnion = ReturnType<TRegistryMap[keyof TRegistryMap]['def']>;

// ===============================================================
// ===============================================================
// 🔷 AST CORE TYPE DEFINITIONS
// ===============================================================
// ===============================================================
export type TInstanceConstructorRegistry = {
  /* prettier-ignore */ Date: DateConstructor;
  /* prettier-ignore */ RegExp: RegExpConstructor;
  /* prettier-ignore */ Map: MapConstructor;
  /* prettier-ignore */ Set: SetConstructor;
  /* prettier-ignore */ WeakMap: WeakMapConstructor;
  /* prettier-ignore */ WeakSet: WeakSetConstructor;
  /* prettier-ignore */ URL: typeof URL;
  /* prettier-ignore */ URLSearchParams: typeof URLSearchParams;
  /* prettier-ignore */ Headers: typeof Headers;
  /* prettier-ignore */ Request: typeof Request;
  /* prettier-ignore */ Response: typeof Response;
  /* prettier-ignore */ Blob: typeof Blob;
  /* prettier-ignore */ File: typeof File;
  /* prettier-ignore */ ArrayBuffer: ArrayBufferConstructor;
  /* prettier-ignore */ DataView: DataViewConstructor;
  /* prettier-ignore */ Int8Array: Int8ArrayConstructor;
  /* prettier-ignore */ Uint8Array: Uint8ArrayConstructor;
  /* prettier-ignore */ Uint8ClampedArray: Uint8ClampedArrayConstructor;
  /* prettier-ignore */ Int16Array: Int16ArrayConstructor;
  /* prettier-ignore */ Uint16Array: Uint16ArrayConstructor;
  /* prettier-ignore */ Int32Array: Int32ArrayConstructor;
  /* prettier-ignore */ Uint32Array: Uint32ArrayConstructor;
  /* prettier-ignore */ Float32Array: Float32ArrayConstructor;
  /* prettier-ignore */ Float64Array: Float64ArrayConstructor;
  /* prettier-ignore */ BigInt64Array: BigInt64ArrayConstructor;
  /* prettier-ignore */ BigUint64Array: BigUint64ArrayConstructor;
  /* prettier-ignore */ Promise: PromiseConstructor;
  /* prettier-ignore */ ReadableStream: typeof ReadableStream;
  /* prettier-ignore */ WritableStream: typeof WritableStream;
  /* prettier-ignore */ TransformStream: typeof TransformStream;
};

/** @see {@link GlobalRootTypeDocs.TSolidShape} */
export type TSolidShape =
  | /* prettier-ignore */ { readonly kind: 'primitive'; readonly type: TSolidShapePrimitiveKeys; readonly maxLength?: number; }
  | /* prettier-ignore */ { readonly kind: 'literal'; readonly type: TSolidShapeLiteralKeys; readonly value: string | number | boolean; }
  | /* prettier-ignore */ { readonly kind: 'union'; readonly values: readonly TSolidShape[]; }
  | /* prettier-ignore */ { readonly kind: 'intersection'; readonly values: readonly TSolidShape[]; }
  | /* prettier-ignore */ { readonly kind: 'object'; readonly properties: Readonly<Record<string, TSolidObjectRawShape>>; }
  | /* prettier-ignore */ { readonly kind: 'array'; readonly items: TSolidShape; readonly minLength: number; readonly hasRest: boolean; readonly elementShapes?: readonly TSolidShape[]; }
  | /* prettier-ignore */ { readonly kind: 'function'; readonly parameters: readonly TSolidObjectRawShape[]; readonly returnType: TSolidShape; }
  | /* prettier-ignore */ { readonly kind: 'branded'; readonly name: string; readonly base: TSolidShape; }
  | /* prettier-ignore */ { readonly kind: 'reference'; readonly name: string; }
  | /* prettier-ignore */ { readonly kind: 'instanceof'; readonly name: InstanceRegistryKey; };

// ===============================================================
// ===============================================================
// 🔷 OBJECT PROPERTY DESCRIPTOR
// ===============================================================
// ===============================================================

/** @see {@link GlobalRootTypeDocs.TSolidObjectRawShape } */
export type TSolidObjectRawShape = {
  shape: TSolidShape;
  optional: boolean;
  name: string;
  requiresKeyPresence?: boolean;
};

export type TInstanceRegistryMapper = {
  readonly [K in keyof TInstanceConstructorRegistry]: {
    readonly ctor: TInstanceConstructorRegistry[K];
    readonly category: InstanceCategory;
    readonly def: () => TDetermineInstance<TInstanceConstructorRegistry[K]>;
  };
};
