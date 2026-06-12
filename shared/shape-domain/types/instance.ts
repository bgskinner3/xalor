// /shared/shape-domain/types.ts
import { INSTANCE_CATEGORIES, INSTANCE_REGISTRY_MAPPER } from '../constants';
import type { TAnyFunction } from '../../types';
/**
 * InstanceCategory
 *
 * Semantic classification layer for runtime constructor-based types.
 * @see {@link FoundationalTypesDocs.InstanceCategory}
 */
/* prettier-ignore */ export type InstanceCategory = (typeof INSTANCE_CATEGORIES)[keyof typeof INSTANCE_CATEGORIES];

/**
 * InstanceRegistryKey
 *
 *  The canonical set of all runtime identity type names.
 *
 * @see {@link FoundationalTypesDocs.InstanceRegistryKey}
 */
/* prettier-ignore */ export type InstanceRegistryKey = keyof typeof INSTANCE_REGISTRY_MAPPER;

// ===============================================================
// ===============================================================
// 🔷 INSTANCE REGISTRY (RUNTIME IDENTITY SYSTEM)
// ===============================================================
// ===============================================================
/**
 * INSTANCE_REGISTRY_MAPPER
 *
 * DESIGN PRINCIPLE:
 * This is the SINGLE SOURCE OF TRUTH for runtime identity types.
 * All InstanceRegistryKey and InstanceEntry types MUST be derived
 * from this object to prevent drift.
 *
 * @see {@link GlobalRootTypeDocs.INSTANCE_REGISTRY}
 */

type TInstanceRegistryTypes = {
  // Core JS Objects
  Date: Date;
  RegExp: RegExp;
  Error: Error;
  TypeError: TypeError;
  RangeError: RangeError;
  ReferenceError: ReferenceError;
  SyntaxError: SyntaxError;
  EvalError: EvalError;
  URIError: URIError;
  // Web / Platform Types
  URL: URL;
  URLSearchParams: URLSearchParams;
  AbortController: AbortController;
  AbortSignal: AbortSignal;
  Headers: Headers;
  Request: Request;
  Response: Response;
  Blob: Blob;
  File: File;

  // Collections (runtime identity types)
  Map: Map<unknown, unknown>;
  Set: Set<unknown>;
  WeakMap: WeakMap<object, unknown>;
  WeakSet: WeakSet<object>;
  // Binary / Buffers
  ArrayBuffer: ArrayBuffer;
  SharedArrayBuffer: SharedArrayBuffer;
  DataView: DataView;
  Int8Array: Int8Array;
  Uint8Array: Uint8Array;
  Uint8ClampedArray: Uint8ClampedArray;
  Int16Array: Int16Array;
  Uint16Array: Uint16Array;
  Int32Array: Int32Array;
  Uint32Array: Uint32Array;
  Float32Array: Float32Array;
  Float64Array: Float64Array;
  BigInt64Array: BigInt64Array;
  BigUint64Array: BigUint64Array;

  // Node.js Specifc / Environment Agnostic Global
  Buffer: Uint8Array; // Using cross-platform base to avoid DOM/Node collision mismatch

  // Streams
  ReadableStream: ReadableStream<unknown>;
  WritableStream: WritableStream<unknown>;
  TransformStream: TransformStream<unknown, unknown>;
  ByteLengthQueuingStrategy: ByteLengthQueuingStrategy;
  CountQueuingStrategy: CountQueuingStrategy;

  // Misc Core Runtime Types
  Promise: Promise<unknown>;
  Function: TAnyFunction;
  Symbol: symbol;
};

/* prettier-ignore */ export type TInstanceRegistry<K extends keyof TInstanceRegistryTypes> = TInstanceRegistryTypes[K];

// ===============================================================
// ===============================================================
// 🔷 DERIVED TYPE MAPPINGS
// ===============================================================
// ===============================================================

/**
 * InstanceCtorMap
 *
 * Derived mapping of registry keys → constructor types.
 *
 * ROLE:
 * Provides compile-time access to constructors without manual duplication.
 */
export type InstanceCtorMap = {
  [K in InstanceRegistryKey]: (typeof INSTANCE_REGISTRY_MAPPER)[K]['ctor'];
};

/**
 * InstanceConstructor
 *
 * Union of all runtime constructor types supported by the system.
 *
 * SOURCE:
 * Derived from instanceRegistry (single source of truth principle).
 *
 * ROLE:
 * Used in runtime evaluation logic for instanceof checks.
 */
export type InstanceConstructor =
  | typeof Date
  | typeof RegExp
  | typeof Map
  | typeof Set
  | typeof WeakMap
  | typeof WeakSet
  | typeof URL
  | typeof URLSearchParams
  | typeof Request
  | typeof Response
  | typeof Headers
  | typeof ArrayBuffer
  | typeof DataView
  | typeof Uint8Array
  | typeof Float32Array
  | typeof Promise
  | typeof Function;

/**
 * InstanceEntry
 *
 * Runtime metadata wrapper for constructor-based types.
 *
 * ROLE:
 * Encapsulates:
 * - runtime constructor (ctor)
 * - semantic execution category
 *
 * USED BY:
 * runtime evaluator + optimization engine
 */
export type InstanceEntry = {
  ctor: InstanceConstructor;
  category: InstanceCategory;
};
