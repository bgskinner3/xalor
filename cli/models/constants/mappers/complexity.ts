/**
 * COMPLEXITY_TAXONOMY_TOKEN_KEYS
 * ROLE: Non-enumerable engineering tokens mapping predictable runtime processing overheads.
 * SPECIFICATIONS:
 * @key FLAT_O1 - Primitives/scalars only. Fast constant-time microsecond-scale execution memory paths.
 * @key COMPOUND_LINEAR - Flat arrays or small records. Traversal cost scales linearly 1:1 with payload size.
 * @key COMPLEX_POLY - Utilizes unions or intersections. Forces alternative runtime evaluation path branching.
 * @key DENSE_MATRIX - Massive property counts or deep nesting. High memory allocation and traversal footprint.
 * @key HYPER_GRAPH - Recursive tracks with functional closures or platform streams. Critical recursive CPU risk.
 */
export const COMPLEXITY_TAXONOMY_TOKEN_KEYS = Object.freeze({
  FLAT_O1: 'O(1) Constant',
  COMPOUND_LINEAR: 'O(N) Linear',
  COMPLEX_POLY: 'O(B) Polymorphic',
  DENSE_MATRIX: 'O(M) High Density',
  HYPER_GRAPH: 'O(N²) High Risk',
} as const);
/**
 * INSTANCE_CATEGORY_WEIGHTS
 * ROLE: Pure O(1) weight map tracking execution costs for native categories.
 * STRATEGY: Groups similar platform types to maintain a hard-zero memory footprint.
 * INVARIANT: Derived directly from the authoritative INSTANCE_REGISTRY_MAPPER categories.
 * SPECIFICATIONS:
 * @key core - Low overhead wrappers (Date, RegExp). Allocates 2 structural points.
 * @key collection - Data structure wrappers (Map, Set, WeakMap, WeakSet). Allocates 4 structural points.
 * @key web - Platform entity structures (URL, URLSearchParams, Headers, Request, Response, Blob, File). Allocates 4 structural points.
 * @key binary - Multi-byte memory partitions (ArrayBuffer, DataView, Int/Uint TypedArrays). Allocates 4 structural points.
 * @key stream - Active stream channels (ReadableStream, WritableStream, TransformStream). Allocates 8 structural points.
 * @key async - Event loop macro task orchestration tracks (Promise). Allocates 8 structural points.
 * @key node - Node-specific environment handle primitives. Allocates 4 structural points.
 */
export const INSTANCE_CATEGORY_WEIGHTS = Object.freeze({
  core: 2,
  collection: 4,
  web: 4,
  binary: 4,
  stream: 8,
  async: 8,
  node: 4,
} as const);

/**
 * COMPLEXITY_WEIGHT_MAPPER
 * ROLE: Pure O(1) constant lookup tracking structural density weights per shape kind.
 * STRATEGY: Eliminates branching cycles to maintain a hard-zero execution footprint.
 * SPECIFICATIONS:
 * @key - primitive / literal: 1 point. Basic terminal leaf nodes.
 * @key - object / array / branded: 2 points. Requires path traversal iteration.
 * @key - union / intersection: 3 points. High-cost alternative evaluation path branching.
 * @key - function: 6 points. Peak type-reification complexity tracking inputs and returns.
 * @key - reference: 0 points. Act as jumper pointers; carries zero base weight.
 */
export const COMPLEXITY_WEIGHT_MAPPER = Object.freeze({
  primitive: 1,
  literal: 1,
  object: 2,
  array: 2,
  branded: 2,
  union: 3,
  intersection: 3,
  function: 6,
  reference: 0,
  instanceof: 0,
} as const);
