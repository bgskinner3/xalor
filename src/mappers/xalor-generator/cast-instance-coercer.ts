import type { TInstanceCoercionRecord } from '../../models/types';
import {
  isString,
  isArray,
  isNumber,
  isRegExp,
  isDate,
  isInstanceOf,
  isArrayOf,
  isBigInt,
} from '../../../shared';
import {
  isHeaderTuple,
  isStringDictionary,
  verifyTupleEntries,
} from './helpers';

/**
 * ============================================================================
 * 🪐 EXHAUSTIVE SYSTEM INSTANCE COERCION REGISTRY
 * ============================================================================
 *
 * ROLE:
 * Translates arrived text/payload properties into live platform structures.
 * If data parsing fails, it yields null to defer straight to the def() fallback.
 */
export const INSTANCE_CAST_COERCERS: TInstanceCoercionRecord = {
  Date: (input: unknown) => {
    if (isDate(input)) return input;

    if (isString(input) || isNumber(input)) {
      const d = new Date(input);
      return !Number.isNaN(d.getTime()) ? d : null;
    }
    return null;
  },
  RegExp: (input) => {
    if (isRegExp(input)) return input;
    if (isString(input)) return new RegExp(input);
    return null;
  },
  'Intl.DateTimeFormat': (input: unknown) => {
    if (isInstanceOf(input, Intl.DateTimeFormat)) return input;
    if (isString(input)) return new Intl.DateTimeFormat(input);
    if (isArrayOf(isString, input)) return new Intl.DateTimeFormat(input);
    return null;
  },

  'Intl.NumberFormat': (input: unknown) => {
    if (isInstanceOf(input, Intl.NumberFormat)) return input;
    if (isString(input)) return new Intl.NumberFormat(input);
    if (isArrayOf(isString, input)) return new Intl.NumberFormat(input);
    return null;
  },

  'Intl.PluralRules': (input: unknown) => {
    if (isInstanceOf(input, Intl.PluralRules)) return input;
    if (isString(input)) return new Intl.PluralRules(input);
    if (isArrayOf(isString, input)) return new Intl.PluralRules(input);
    return null;
  },
  // === COLLECTIONS ===

  Map: (input: unknown) => {
    if (input instanceof Map) return input;

    if (isArray(input)) {
      const cleanEntries = verifyTupleEntries(input);
      return new Map(cleanEntries);
    }
    return null;
  },

  Set: (input) => {
    if (input instanceof Set) return input;
    if (isArray(input)) {
      return new Set(input);
    }
    return null;
  },
  WeakMap: () => null,
  WeakSet: () => null,
  // === WEB PLATFORM NETWORKING DATA FRAMES ===
  URL: (input) => {
    if (isInstanceOf(input, URL)) return input;
    if (isString(input)) return new URL(input); // Left bare!
    return null;
  },

  URLSearchParams: (input) => {
    if (isInstanceOf(input, URLSearchParams)) return input;
    if (isString(input) || isStringDictionary(input))
      return new URLSearchParams(input);
    return null;
  },

  Headers: (input) => {
    if (isInstanceOf(input, Headers)) return input;
    if (isStringDictionary(input)) return new Headers(input);

    if (isArray(input)) {
      const cleanTuples: [string, string][] = [];
      for (let i = 0; i < input.length; i++) {
        const entry = input[i];
        if (isHeaderTuple(entry)) {
          cleanTuples.push(entry);
        }
      }
      return new Headers(cleanTuples);
    }
    return null;
  },

  Request: (input) => {
    if (input instanceof Request) return input;
    if (isString(input)) return new Request(input);
    return null;
  },

  Response: (input: unknown) => {
    if (input instanceof Response) return input;

    if (isString(input)) return new Response(input);

    // 2. Pure logical narrowing for explicit streamable Web API objects.
    // Each isInstanceOf check updates the type tracker point-free without an "as" cast.
    if (
      isInstanceOf(input, Blob) ||
      isInstanceOf(input, ArrayBuffer) ||
      isInstanceOf(input, URLSearchParams) ||
      isInstanceOf(input, FormData)
    ) {
      // Left bare! The root centralized try/catch capsule traps any internal faults.
      return new Response(input);
    }

    return null;
  },

  Blob: (input: unknown) => {
    if (input instanceof Blob) {
      return input;
    }

    if (isString(input)) {
      // The native Blob constructor expects a sequential array sequence of parts [BlobPart[]]
      return new Blob([input]);
    }

    if (isArrayOf(isString, input)) return new Blob(input);

    return null;
  },

  File: (input: unknown) => {
    if (input instanceof File) {
      return input;
    }

    if (isString(input)) {
      return new File([input], 'casted_file.txt');
    }

    if (isArrayOf(isString, input)) {
      return new File(input, 'casted_file.txt');
    }

    return null;
  },

  ArrayBuffer: (input: unknown) => {
    if (input instanceof ArrayBuffer) return input;

    if (isArrayOf(isNumber, input)) return new Uint8Array(input).buffer;

    if (isNumber(input)) return new ArrayBuffer(input);

    return null;
  },

  DataView: (input) => {
    if (input instanceof DataView) return input;
    if (input instanceof ArrayBuffer) {
      return new DataView(input);
    }
    return null;
  },
  Int8Array: (input: unknown) => {
    if (input instanceof Int8Array) return input;
    if (isArrayOf(isNumber, input)) return new Int8Array(input);
    if (input instanceof ArrayBuffer) return new Int8Array(input);
    return null;
  },

  Uint8Array: (input: unknown) => {
    if (input instanceof Uint8Array) return input;
    if (isArrayOf(isNumber, input)) return new Uint8Array(input);
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    return null;
  },

  Uint8ClampedArray: (input: unknown) => {
    if (input instanceof Uint8ClampedArray) return input;
    if (isArrayOf(isNumber, input)) return new Uint8ClampedArray(input);
    if (input instanceof ArrayBuffer) return new Uint8ClampedArray(input);
    return null;
  },

  Int16Array: (input: unknown) => {
    if (input instanceof Int16Array) return input;
    if (isArrayOf(isNumber, input)) return new Int16Array(input);
    if (input instanceof ArrayBuffer) return new Int16Array(input);
    return null;
  },

  Uint16Array: (input: unknown) => {
    if (input instanceof Uint16Array) return input;
    if (isArrayOf(isNumber, input)) return new Uint16Array(input);
    if (input instanceof ArrayBuffer) return new Uint16Array(input);
    return null;
  },

  Int32Array: (input: unknown) => {
    if (input instanceof Int32Array) return input;
    if (isArrayOf(isNumber, input)) return new Int32Array(input);
    if (input instanceof ArrayBuffer) return new Int32Array(input);
    return null;
  },

  Uint32Array: (input: unknown) => {
    if (input instanceof Uint32Array) return input;
    if (isArrayOf(isNumber, input)) return new Uint32Array(input);
    if (input instanceof ArrayBuffer) return new Uint32Array(input);
    return null;
  },

  Float32Array: (input: unknown) => {
    if (input instanceof Float32Array) return input;
    if (isArrayOf(isNumber, input)) return new Float32Array(input);
    if (input instanceof ArrayBuffer) return new Float32Array(input);
    return null;
  },

  Float64Array: (input: unknown) => {
    if (input instanceof Float64Array) return input;
    if (isArrayOf(isNumber, input)) return new Float64Array(input);
    if (input instanceof ArrayBuffer) return new Float64Array(input);
    return null;
  },

  BigInt64Array: (input: unknown) => {
    if (input instanceof BigInt64Array) return input;
    if (isArrayOf(isBigInt, input)) return new BigInt64Array(input);
    if (input instanceof ArrayBuffer) return new BigInt64Array(input);
    return null;
  },

  BigUint64Array: (input: unknown) => {
    if (input instanceof BigUint64Array) return input;
    if (isArrayOf(isBigInt, input)) return new BigUint64Array(input);
    if (input instanceof ArrayBuffer) return new BigUint64Array(input);
    return null;
  },

  // === ASYNC & STRATEGIC PIPELINE RUNNERS ===
  Promise: (input) => {
    if (input instanceof Promise) return input;
    if (input !== undefined) return Promise.resolve(input);
    return null;
  },

  ReadableStream: (input) => {
    if (input instanceof ReadableStream) return input;
    if (isString(input)) {
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(input));
          controller.close();
        },
      });
    }
    return null;
  },

  WritableStream: (input) => {
    if (input instanceof WritableStream) return input;
    return null;
  },

  TransformStream: (input) => {
    if (input instanceof TransformStream) return input;
    return null;
  },
} satisfies TInstanceCoercionRecord;
