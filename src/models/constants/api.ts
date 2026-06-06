/**
 * MASTER GENERATOR MODES CONFIGURATION
 *
 * ROLE:
 * The single source of truth for all permitted execution types.
 *
 * STRATEGY:
 * Freezing this array allows your runtime engine to check strings
 * instantly using Set lookups (NO switch statements), while your type
 * engine uses it to lock down auto-complete in the IDE.
 */
export const GENERATOR_MODE_TRIGGERS = [
  'default',
  'mock',
  'clone',
  'cast',
] as const;

/**
 * MASTER VALIDATION MODES CONFIGURATION
 *
 * ROLE:
 * The single source of truth for all permitted execution types.
 *
 * STRATEGY:
 * Freezing this array allows your runtime engine to check strings
 * instantly using Set lookups (NO switch statements), while your type
 * engine uses it to lock down auto-complete in the IDE.
 */
export const VALIDATION_MODE_TRIGGERS = [
  'guard',
  'assert',
  'parse',
  'parseAsync',
  'audit',
] as const;

/**
 * MASTER TRANFORM MODES CONFIGURATION
 *
 * ROLE:
 * The single source of truth for all permitted execution types.
 *
 * STRATEGY:
 * Freezing this array allows your runtime engine to check strings
 * instantly using Set lookups (NO switch statements), while your type
 * engine uses it to lock down auto-complete in the IDE.
 */
export const TRANSFORM_MODE_TRIGGERS = [
  'pick',
  'omit',
  'rename',
  'flatten',
  'merge',
] as const;
