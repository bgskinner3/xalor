/**
 * ⚙️ SHAPE KIND CONFIGURATION
 *
 * Defines the definitive list of data "Kinds" recognized by the Xalor engine.
 * This object acts as the central source of truth for both the Miner and
 * the Validator, ensuring that kind-string comparisons remain consistent
 * and protected from accidental mutation at runtime.
 */
export const IS_SOLID_SHAPE_KINDS_CONFIG = Object.freeze({
  primitive: 'primitive',
  literal: 'literal',
  union: 'union',
  intersection: 'intersection',
  branded: 'branded',
  object: 'object',
  array: 'array',
  reference: 'reference',
} as const);

/**
 * 🔑 SOLID SHAPE PRIMITIVE KEYS (THE IMMUTABLE COMPACTION MATRIX)
 *
 * ROLE:
 * The absolute, single source of truth defining the compiled runtime string constants
 * scanned by the diagnostic engine, the Bouncer, and the build-time Miner.
 *
 * THE IMMUTABLE BOUNDARIES MAP:
 * 1. BASE SYSTEM SCALARS - Standard execution properties ('string', 'number', 'boolean', 'bigint').
 * 2. STRUCTURAL TOP/BOTTOMS - Core compiler evaluation limits ('any', 'unknown', 'null', 'undefined').
 * 3. COMPACTION ENTIITES - Complex platform constructors ('Date', 'RegExp', 'Map', 'Set', 'Promise', 'URL')
 *                         flattened into single scalar tokens to prevent deep interface property
 *                         crawling and cache bloat on disk.
 *
 * STRATEGY:
 * Sealed using Object.freeze() and 'as const' to guarantee full runtime immutability.
 * Provides an allocation-free validation radar used for high-speed value checks and user-defined
 * type guard narrowings across application request streams.
 */

export const SOLID_SHAPE_PRIMITIVE_KEYS = Object.freeze([
  'string',
  'number',
  'boolean',
  'bigint',
  'unknown',
  'any',
  'null',
  'undefined',
  'never',
  'void',
  'Date',
  'RegExp',
  'Map',
  'Set',
  'Promise',
  'URL',
] as const);
