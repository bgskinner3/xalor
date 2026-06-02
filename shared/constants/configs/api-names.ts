import { ObjectUtils } from '../../utils';

/**
 * SENTRY_TRIGGER_NAMES
 *
 * ROLE:
 * The primary identifier matrix used by the compiler's static analysis layer.
 * These string literals represent the exact public API macro entry points.
 *
 * STRATEGY:
 * - High-Velocity Screening: Used by the Scout Pass (`shouldProcessFile`) to
 *   perform rapid string token scans before running recursive AST visitors.
 * - Toolchain Synchronization: Ensures that any module invoking these runtime
 *   functions is intercepted, mined, and compiled into the CAS database cache.
 */
export const SENTRY_TRIGGER_NAMES = [
  'registerXalor',
  'validateXalor',
  'generateXalor',
  'transformXalor',
] as const;

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
/**
 * SENTRY_TRIGGER_MODES
 *
 * ROLE:
 * Concrete sub-command taxonomy configurations partitioning strategy tokens into
 * distinct runtime operational disciplines.
 *
 * STRATEGY:
 * - Deterministic Validation Boundary: Forces strict compilation-time isolation of
 *   sub-commands across core synthesis, boundary routing, and shape transformation loops.
 * - Strategy Taxonomy Enforcement: Serves as the authoritative list used by the static
 *   crawler to filter parameter structures and flag illegal runtime API tokens.
 */
export const SENTRY_TRIGGER_MODES = {
  generateXalor: GENERATOR_MODE_TRIGGERS,
  validateXalor: VALIDATION_MODE_TRIGGERS,
  transformXalor: TRANSFORM_MODE_TRIGGERS,
};

// Unrolls your parent function keys natively into a strict compile-time list matrix
export const RUNTIME_TRIGGER_NAMES = ObjectUtils.keys(SENTRY_TRIGGER_MODES);

/**
 * STEPS TO UPDATE TRANFORMER REGISTRY
 *
 * I. CONSTANTS, TYPES AND KEYS
 *  - include a const object like above including all the different modes
 *  - import const object to create the necessary type
 *  - ADD NEW API NAME TO object SENTRY_TRIGGER_NAMES
 *
 * II. CONSTANTS, TYPES AND KEYS PT 2
 *   - in our transformer file another type file exists we need to update fields
 *   a. miner-targets.ts b. processor-targets.ts
 *   - miner-targets.ts
 *     - create a new RawPayload type
 *     - apply the payload type to the TXalorMinerRouterMap and teh TResolvedMiningRouterReturn
 *   - processor-targets.ts
 *     - create a new Processor type tied to our new API
 *     - add new processor type to the TProcessorRewriteMap with proepr key
 *     - ctreate a new ProcessorTarget type
 *     - add new ProcessorTarget type to TProcessorTarget
 *
 *  III. UTILS & GUARDS
 *   - under predicate-guards.ts we will create a api gaurd
 *   - labeled is--name of api--Target
 *
 *   IV. MIeNR FILE PT.I "MAPPERs"
 *   - here we will touch two files miner-resolver.ts and processor-rewrite.ts
 *   - miner-resolver.ts: we will update teh XALOR_MINING_ROUTER_MAPPER
 *     - importing the necessary 'raw payload', 'mode triggers object' and its typed value
 *   - processor-rewrite.ts: here we will update teh PROCESSOR_REWRITE_MAPPER
 *    - adding the apprpirate key to the new map
 *
 *  V. MIeNR FILE PT.II "CORE"
 *  - here we will touch two files mining-target.ts and processor.ts
 *  a. mining-target.ts
 *    - we will add our new api naem to the contiontionals in resolveMiningTarget
 *  b. processor.ts
 *    - here we will use our type guard for the correct processor condtiontional
 *
 *  VI. index.ts file!!
 */
