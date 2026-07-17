// /shared/shape-domain/constant.ts
import type { TInstanceRegistryMapper } from '../types';

/**
 * ⚙️ SHAPE KIND CONFIGURATION (AST NODE TAXONOMY)
 *
 * This is the canonical enumeration of all structural node "kinds"
 * supported by the TSolid AST system.
 *
 * ROLE IN ARCHITECTURE:
 * - Defines the full grammar of the TSolidShape AST
 * - Used by the Miner (build-time transformer) to emit shapes
 * - Used by the Validator (runtime executor) to dispatch evaluation logic
 *
 * DESIGN PRINCIPLE:
 * This is a closed-world enum of structural node types.
 * If a kind is not present here, it is not part of the AST grammar.
 *
 * EXTENSIBILITY RULE:
 * New kinds must be added here AND supported in:
 * - transformer/generator
 * - runtime evaluator
 */
export const IS_SOLID_SHAPE_KINDS_CONFIG = Object.freeze({
  /* prettier-ignore */ primitive: 'primitive',
  /* prettier-ignore */ literal: 'literal',
  /* prettier-ignore */ union: 'union',
  /* prettier-ignore */ intersection: 'intersection',
  /* prettier-ignore */ object: 'object',
  /* prettier-ignore */ array: 'array',
  /* prettier-ignore */ branded: 'branded',
  /* prettier-ignore */ reference: 'reference',
  /* prettier-ignore */ function: 'function',
  /** @see {@link FoundationalTypesDocs} Instance-based runtime identity check (instanceof semantics) */
  /* prettier-ignore */ instanceof: 'instanceof',
} as const);

/**
 * 🔑 SOLID SHAPE PRIMITIVE KEYS (SCALAR TYPE DOMAIN)
 *
 * ROLE:
 * Defines the atomic scalar value space used by TSolidShape primitives.
 *
 * These values represent non-structural, non-recursive type atoms that
 * the compiler treats as terminal nodes in the AST.
 *
 * TYPE CATEGORIES:
 *
 * 1. PRIMITIVE JS SCALARS
 *    - string, number, boolean, bigint, symbol
 *
 * 2. TYPE SYSTEM SENTINELS
 *    - null, undefined, void, never
 *
 * 3. TOP / BOTTOM TYPES (evaluation boundaries)
 *    - any, unknown
 *
 * NOTE:
 * These values are treated as terminal evaluation nodes in the AST
 * and do not participate in structural traversal.
 */
export const SOLID_SHAPE_PRIMITIVE_KEYS = Object.freeze([
  'string',
  'number',
  'boolean',
  'bigint',
  'symbol',
  'null',
  'undefined',
  'void',
  'never',
  'unknown',
  'any',
] as const);
export const SOLID_SHAPE_LITERAL_KEYS = Object.freeze([
  'string',
  'number',
  'boolean',
] as const);

/**
 * 🧭 INSTANCE CATEGORIES (RUNTIME SEMANTIC GROUPING LAYER)
 *
 * ROLE:
 * Provides semantic classification for runtime constructor-based types
 * used in the instanceof evaluation system.
 *
 * WHY THIS EXISTS:
 * Instead of treating all constructors equally, categories allow the system to:
 * - optimize evaluation paths
 * - group runtime types by execution behavior
 * - support environment-aware validation (web vs node vs binary vs async)
 *
 * IMPORTANT:
 * This does NOT affect type checking directly.
 * It is used for optimization, profiling, and execution routing.
 */
export const INSTANCE_CATEGORIES = Object.freeze({
  core: 'core',
  web: 'web',
  node: 'node',
  binary: 'binary',
  stream: 'stream',
  collection: 'collection',
  async: 'async',
} as const);
/**
 * 🧱 INSTANCE REGISTRY MAPPER (RUNTIME IDENTITY RESOLUTION TABLE)
 *
 * ROLE:
 * This is the runtime truth table for all instanceof-based type evaluation.
 *
 * It maps:
 *   string key → { constructor + semantic category }
 *
 * USED BY:
 * - AST evaluator (instanceof node resolution)
 * - runtime validator engine
 * - profiling / categorization system
 *
 * IMPORTANT DESIGN RULE:
 * This registry is the SINGLE SOURCE OF TRUTH for runtime identity types.
 * All InstanceRegistryKey and InstanceEntry types must be derived from this object.
 *
 * EXECUTION MODEL:
 * shape.kind === 'instanceof'
 *   → lookup constructor from this registry
 *   → execute value instanceof ctor
 *   → optionally use category for optimization routing
 */
export const INSTANCE_REGISTRY_MAPPER: TInstanceRegistryMapper = {
  /* prettier-ignore */ Date: { ctor: Date, category: INSTANCE_CATEGORIES.core, def: () => new Date(0) },
  // FIX: Grouped natively under core to prevent layout or optimization routing bloat
  /* prettier-ignore */ "Intl.DateTimeFormat": { ctor: Intl.DateTimeFormat, category: INSTANCE_CATEGORIES.core, def: () => new Intl.DateTimeFormat('en') },
  /* prettier-ignore */ "Intl.NumberFormat": { ctor: Intl.NumberFormat, category: INSTANCE_CATEGORIES.core, def: () => new Intl.NumberFormat('en') },
  /* prettier-ignore */ "Intl.PluralRules": { ctor: Intl.PluralRules, category: INSTANCE_CATEGORIES.core, def: () => new Intl.PluralRules('en') },
  /* prettier-ignore */ RegExp: { ctor: RegExp, category: INSTANCE_CATEGORIES.core, def: () => /(?:)/ },
  /* prettier-ignore */ Map: { ctor: Map, category: INSTANCE_CATEGORIES.collection, def: () => new Map() },
  /* prettier-ignore */ Set: { ctor: Set, category: INSTANCE_CATEGORIES.collection, def: () => new Set() },
  /* prettier-ignore */ WeakMap: { ctor: WeakMap, category: INSTANCE_CATEGORIES.collection, def: () => new WeakMap() },
  /* prettier-ignore */ WeakSet: { ctor: WeakSet, category: INSTANCE_CATEGORIES.collection, def: () => new WeakSet() },
  /* prettier-ignore */ URL: { ctor: URL, category: INSTANCE_CATEGORIES.web, def: () => new URL('http://localhost') },
  /* prettier-ignore */ URLSearchParams: { ctor: URLSearchParams, category: INSTANCE_CATEGORIES.web, def: () => new URLSearchParams() },
  /* prettier-ignore */ Headers: { ctor: Headers, category: INSTANCE_CATEGORIES.web, def: () => new Headers() },
  /* prettier-ignore */ Request: { ctor: Request, category: INSTANCE_CATEGORIES.web, def: () => new Request('http://localhost') },
  /* prettier-ignore */ Response: { ctor: Response, category: INSTANCE_CATEGORIES.web, def: () => new Response() },
  /* prettier-ignore */ Blob: { ctor: Blob, category: INSTANCE_CATEGORIES.web, def: () => new Blob() },
  /* prettier-ignore */ File: { ctor: File, category: INSTANCE_CATEGORIES.web, def: () => new File([], '') },
  /* prettier-ignore */ ArrayBuffer: { ctor: ArrayBuffer, category: INSTANCE_CATEGORIES.binary, def: () => new ArrayBuffer(0) },
  /* prettier-ignore */ DataView: { ctor: DataView, category: INSTANCE_CATEGORIES.binary, def: () => new DataView(new ArrayBuffer(0)) },
  /* prettier-ignore */ Int8Array: { ctor: Int8Array, category: INSTANCE_CATEGORIES.binary, def: () => new Int8Array(0) },
  /* prettier-ignore */ Uint8Array: { ctor: Uint8Array, category: INSTANCE_CATEGORIES.binary, def: () => new Uint8Array(0) },
  /* prettier-ignore */ Uint8ClampedArray: { ctor: Uint8ClampedArray, category: INSTANCE_CATEGORIES.binary, def: () => new Uint8ClampedArray(0) },
  /* prettier-ignore */ Int16Array: { ctor: Int16Array, category: INSTANCE_CATEGORIES.binary, def: () => new Int16Array(0) },
  /* prettier-ignore */ Uint16Array: { ctor: Uint16Array, category: INSTANCE_CATEGORIES.binary, def: () => new Uint16Array(0) },
  /* prettier-ignore */ Int32Array: { ctor: Int32Array, category: INSTANCE_CATEGORIES.binary, def: () => new Int32Array(0) },
  /* prettier-ignore */ Uint32Array: { ctor: Uint32Array, category: INSTANCE_CATEGORIES.binary, def: () => new Uint32Array(0) },
  /* prettier-ignore */ Float32Array: { ctor: Float32Array, category: INSTANCE_CATEGORIES.binary, def: () => new Float32Array(0) },
  /* prettier-ignore */ Float64Array: { ctor: Float64Array, category: INSTANCE_CATEGORIES.binary, def: () => new Float64Array(0) },
  /* prettier-ignore */ BigInt64Array: { ctor: BigInt64Array, category: INSTANCE_CATEGORIES.binary, def: () => new BigInt64Array(0) },
  /* prettier-ignore */ BigUint64Array: { ctor: BigUint64Array, category: INSTANCE_CATEGORIES.binary, def: () => new BigUint64Array(0) },
  /* prettier-ignore */ Promise: { ctor: Promise, category: INSTANCE_CATEGORIES.async, def: () => Promise.resolve() },
  /* prettier-ignore */ ReadableStream: { ctor: ReadableStream, category: INSTANCE_CATEGORIES.stream, def: () => new ReadableStream() },
  /* prettier-ignore */ WritableStream: { ctor: WritableStream, category: INSTANCE_CATEGORIES.stream, def: () => new WritableStream() },
  /* prettier-ignore */ TransformStream: { ctor: TransformStream, category: INSTANCE_CATEGORIES.stream, def: () => new TransformStream() },
} as const satisfies TInstanceRegistryMapper;

export const NATIVE_BUILTINS = new Set<string>([
  'Error',
  ...Object.keys(INSTANCE_REGISTRY_MAPPER),
]);
