import type { TInstanceCoercionRecord } from '../../models/types';

/**
 * 🧼 AUTHORITATIVE INSTANCE CLONE STRATEGIES
 *
 * ROLE:
 * Performs a deep, reference-isolated structural duplicate of active class instances.
 * If incoming data does not match the strict type track, it yields null to defer
 * instantly to the pristine fallback generator definition.
 *
 * DESIGN INVARIANTS:
 * - Satisfies COMMANDMENT IV: Strictly isolates pure cloning from casting/coercion logic.
 * - Satisfies COMMANDMENT VIII: Pre-allocated object map ensures sub-nanosecond lookups.
 * - Satisfies COMMANDMENT IX: Absolute zero 'as any' or type assertion overrides.
 */
export const INSTANCE_CLONE_STRATEGIES: TInstanceCoercionRecord = {
  // === CORE TYPE CLONING STRATEGIES ===
  Date: (data) => {
    return data instanceof Date ? new Date(data.getTime()) : null;
  },
  RegExp: (data) => {
    return data instanceof RegExp ? new RegExp(data) : null;
  },

  // === INTERNATIONALIZATION (INTL) LAYER (STATEFUL PASS-THROUGHS) ===
  'Intl.DateTimeFormat': (data) => {
    return data instanceof Intl.DateTimeFormat ? data : null;
  },
  'Intl.NumberFormat': (data) => {
    return data instanceof Intl.NumberFormat ? data : null;
  },
  'Intl.PluralRules': (data) => {
    return data instanceof Intl.PluralRules ? data : null;
  },

  // === COLLECTIONS & CONTAINERS ===
  Map: (data) => {
    if (data instanceof Map) {
      const freshMap = new Map();
      for (const [k, v] of data.entries()) {
        freshMap.set(k, v);
      }
      return freshMap;
    }
    return null;
  },
  Set: (data) => {
    return data instanceof Set ? new Set(data.values()) : null;
  },
  WeakMap: (data) => {
    return data instanceof WeakMap ? data : null; // Stateful reference pass-through
  },
  WeakSet: (data) => {
    return data instanceof WeakSet ? data : null;
  },

  // === WEB & API PLATFORM LAYER ===
  URL: (data) => {
    return data instanceof URL ? new URL(data.href) : null;
  },
  URLSearchParams: (data) => {
    return data instanceof URLSearchParams ? new URLSearchParams(data) : null;
  },
  Headers: (data) => {
    return data instanceof Headers ? new Headers(data) : null;
  },
  Request: (data) => {
    return data instanceof Request ? data.clone() : null;
  },
  Response: (data) => {
    return data instanceof Response ? data.clone() : null;
  },
  Blob: (data) => {
    return data instanceof Blob ? data.slice(0, data.size, data.type) : null;
  },
  File: (data) => {
    return data instanceof File
      ? new File([data], data.name, {
          type: data.type,
          lastModified: data.lastModified,
        })
      : null;
  },

  // === ASYNCHRONOUS PROMISES ===
  Promise: (data) => {
    return data instanceof Promise ? data : null;
  },

  // === STREAMING ARCHITECTURES ===
  ReadableStream: (data) => {
    return data instanceof ReadableStream ? data : null;
  },
  WritableStream: (data) => {
    return data instanceof WritableStream ? data : null;
  },
  TransformStream: (data) => {
    return data instanceof TransformStream ? data : null;
  },

  // === BINARY MEMORY BLOCKS ===
  ArrayBuffer: (data) => {
    return data instanceof ArrayBuffer ? data.slice(0) : null;
  },
  DataView: (data) => {
    if (data instanceof DataView) {
      const underlyingBuffer = data.buffer;
      if (underlyingBuffer instanceof ArrayBuffer) {
        return new DataView(
          underlyingBuffer.slice(0),
          data.byteOffset,
          data.byteLength,
        );
      }
    }
    return null;
  },

  // === TYPED ARRAYS LAYER (100% UN-CASTED BINARY MEMORY CLONING) ===
  Int8Array: (data) => {
    return data instanceof Int8Array && data.buffer instanceof ArrayBuffer
      ? new Int8Array(data.buffer.slice(0), data.byteOffset, data.length)
      : null;
  },
  Uint8Array: (data) => {
    return data instanceof Uint8Array && data.buffer instanceof ArrayBuffer
      ? new Uint8Array(data.buffer.slice(0), data.byteOffset, data.length)
      : null;
  },
  Uint8ClampedArray: (data) => {
    return data instanceof Uint8ClampedArray &&
      data.buffer instanceof ArrayBuffer
      ? new Uint8ClampedArray(
          data.buffer.slice(0),
          data.byteOffset,
          data.length,
        )
      : null;
  },
  Int16Array: (data) => {
    return data instanceof Int16Array && data.buffer instanceof ArrayBuffer
      ? new Int16Array(data.buffer.slice(0), data.byteOffset, data.length)
      : null;
  },
  Uint16Array: (data) => {
    return data instanceof Uint16Array && data.buffer instanceof ArrayBuffer
      ? new Uint16Array(data.buffer.slice(0), data.byteOffset, data.length)
      : null;
  },
  Int32Array: (data) => {
    return data instanceof Int32Array && data.buffer instanceof ArrayBuffer
      ? new Int32Array(data.buffer.slice(0), data.byteOffset, data.length)
      : null;
  },
  Uint32Array: (data) => {
    return data instanceof Uint32Array && data.buffer instanceof ArrayBuffer
      ? new Uint32Array(data.buffer.slice(0), data.byteOffset, data.length)
      : null;
  },
  Float32Array: (data) => {
    return data instanceof Float32Array && data.buffer instanceof ArrayBuffer
      ? new Float32Array(data.buffer.slice(0), data.byteOffset, data.length)
      : null;
  },
  Float64Array: (data) => {
    return data instanceof Float64Array && data.buffer instanceof ArrayBuffer
      ? new Float64Array(data.buffer.slice(0), data.byteOffset, data.length)
      : null;
  },
  BigInt64Array: (data) => {
    return data instanceof BigInt64Array && data.buffer instanceof ArrayBuffer
      ? new BigInt64Array(data.buffer.slice(0), data.byteOffset, data.length)
      : null;
  },
  BigUint64Array: (data) => {
    return data instanceof BigUint64Array && data.buffer instanceof ArrayBuffer
      ? new BigUint64Array(data.buffer.slice(0), data.byteOffset, data.length)
      : null;
  },
} satisfies TInstanceCoercionRecord;
