// /shared/shape-domain/constant.ts
import type { InstanceEntry } from '../types';

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
  /* prettier-ignore */ instanceof: 'instanceof' /** @see {@link FoundationalTypesDocs} Instance-based runtime identity check (instanceof semantics) */,
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
export const INSTANCE_REGISTRY_MAPPER = {
  Date: { ctor: Date, category: INSTANCE_CATEGORIES.core },
  RegExp: { ctor: RegExp, category: INSTANCE_CATEGORIES.core },

  Map: { ctor: Map, category: INSTANCE_CATEGORIES.collection },
  Set: { ctor: Set, category: INSTANCE_CATEGORIES.collection },
  WeakMap: { ctor: WeakMap, category: INSTANCE_CATEGORIES.collection },
  WeakSet: { ctor: WeakSet, category: INSTANCE_CATEGORIES.collection },

  URL: { ctor: URL, category: INSTANCE_CATEGORIES.web },
  URLSearchParams: { ctor: URLSearchParams, category: INSTANCE_CATEGORIES.web },

  Request: { ctor: Request, category: INSTANCE_CATEGORIES.web },
  Response: { ctor: Response, category: INSTANCE_CATEGORIES.web },
  Headers: { ctor: Headers, category: INSTANCE_CATEGORIES.web },

  ArrayBuffer: { ctor: ArrayBuffer, category: INSTANCE_CATEGORIES.binary },
  DataView: { ctor: DataView, category: INSTANCE_CATEGORIES.binary },

  Uint8Array: { ctor: Uint8Array, category: INSTANCE_CATEGORIES.binary },
  Float32Array: { ctor: Float32Array, category: INSTANCE_CATEGORIES.binary },

  Promise: { ctor: Promise, category: INSTANCE_CATEGORIES.async },
} as const satisfies Record<string, InstanceEntry>;

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * TODO: REMOVE
 */

// /**
//  * ⚙️ SHAPE KIND CONFIGURATION
//  *
//  * Defines the definitive list of data "Kinds" recognized by the Xalor engine.
//  * This object acts as the central source of truth for both the Miner and
//  * the Validator, ensuring that kind-string comparisons remain consistent
//  * and protected from accidental mutation at runtime.
//  */
// export const IS_SOLID_SHAPE_KINDS_CONFIG = Object.freeze({
//   primitive: 'primitive',
//   literal: 'literal',

//   union: 'union',
//   intersection: 'intersection',

//   object: 'object',
//   array: 'array',

//   branded: 'branded',
//   reference: 'reference',

//   function: 'function',
//   instanceof: 'instanceof',
// } as const);

// /**
//  * 🔑 SOLID SHAPE PRIMITIVE KEYS (THE IMMUTABLE COMPACTION MATRIX)
//  *
//  * ROLE:
//  * The absolute, single source of truth defining the compiled runtime string constants
//  * scanned by the diagnostic engine, the Bouncer, and the build-time Miner.
//  *
//  * THE IMMUTABLE BOUNDARIES MAP:
//  * 1. BASE SYSTEM SCALARS - Standard execution properties ('string', 'number', 'boolean', 'bigint').
//  * 2. STRUCTURAL TOP/BOTTOMS - Core compiler evaluation limits ('any', 'unknown', 'null', 'undefined').
//  * 3. COMPACTION ENTIITES - Complex platform constructors ('Date', 'RegExp', 'Map', 'Set', 'Promise', 'URL')
//  *                         flattened into single scalar tokens to prevent deep interface property
//  *                         crawling and cache bloat on disk.
//  *
//  * STRATEGY:
//  * Sealed using Object.freeze() and 'as const' to guarantee full runtime immutability.
//  * Provides an allocation-free validation radar used for high-speed value checks and user-defined
//  * type guard narrowings across application request streams.
//  */
// export const SOLID_SHAPE_PRIMITIVE_KEYS = Object.freeze([
//   'string',
//   'number',
//   'boolean',
//   'bigint',
//   'symbol',
//   'null',
//   'undefined',
//   'void',
//   'never',
//   'unknown',
//   'any',
// ] as const);

// export const INSTANCE_CATEGORIES = Object.freeze({
//   core: 'core',
//   web: 'web',
//   node: 'node',
//   binary: 'binary',
//   stream: 'stream',
//   collection: 'collection',
//   async: 'async',
// } as const);

/**
 *
 *
 *
 *
 *
 *
 * OLDDDD
 */
// /**
//  * ⚙️ SHAPE KIND CONFIGURATION
//  *
//  * Defines the definitive list of data "Kinds" recognized by the Xalor engine.
//  * This object acts as the central source of truth for both the Miner and
//  * the Validator, ensuring that kind-string comparisons remain consistent
//  * and protected from accidental mutation at runtime.
//  */
// export const IS_SOLID_SHAPE_KINDS_CONFIG = Object.freeze({
//   primitive: 'primitive',
//   literal: 'literal',
//   union: 'union',
//   intersection: 'intersection',
//   branded: 'branded',
//   object: 'object',
//   array: 'array',
//   reference: 'reference',
// } as const);

// /**
//  * 🔑 SOLID SHAPE PRIMITIVE KEYS (THE IMMUTABLE COMPACTION MATRIX)
//  *
//  * ROLE:
//  * The absolute, single source of truth defining the compiled runtime string constants
//  * scanned by the diagnostic engine, the Bouncer, and the build-time Miner.
//  *
//  * THE IMMUTABLE BOUNDARIES MAP:
//  * 1. BASE SYSTEM SCALARS - Standard execution properties ('string', 'number', 'boolean', 'bigint').
//  * 2. STRUCTURAL TOP/BOTTOMS - Core compiler evaluation limits ('any', 'unknown', 'null', 'undefined').
//  * 3. COMPACTION ENTIITES - Complex platform constructors ('Date', 'RegExp', 'Map', 'Set', 'Promise', 'URL')
//  *                         flattened into single scalar tokens to prevent deep interface property
//  *                         crawling and cache bloat on disk.
//  *
//  * STRATEGY:
//  * Sealed using Object.freeze() and 'as const' to guarantee full runtime immutability.
//  * Provides an allocation-free validation radar used for high-speed value checks and user-defined
//  * type guard narrowings across application request streams.
//  */

// export const SOLID_SHAPE_PRIMITIVE_KEYS = Object.freeze([
//   'string',
//   'number',
//   'boolean',
//   'bigint',
//   'unknown',
//   'any',
//   'null',
//   'undefined',
//   'never',
//   'void',
//   'Date',
//   'RegExp',
//   'Map',
//   'Set',
//   'Promise',
//   'URL',
// ] as const);
