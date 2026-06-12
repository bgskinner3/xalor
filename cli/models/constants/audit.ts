import { SENTRY_TRIGGER_MODES } from '../../../shared';
import { ObjectUtils, yieldItems, isKeyOfArray } from '../../../shared/utils';
import type {
  TAuditDepthMapper,
  TDepthComplexityMapper,
  TReferenceCollectorMapper,
  TPropertyDeltaContext,
  TPropertyDriftRule,
} from '../types';
/**
 * DRIFT_VARIANCE_CATEGORIES
 * ROLE: Evaluation taxonomy categorizing contract mutations over time.
 * SPECIFICATIONS:
 * - BREAKING_MUTATION: Destructive changes (e.g. primitive type swaps). Forces hard pipeline abort.
 * - COMPATIBLE_ADDITION: Safe extensions (e.g. optional fields). Logs note and passes build.
 * - COMPATIBLE_DELETION: Safe removals (e.g. removing optional fields). Logs note and passes build.
 * - STRICTNESS_STRETCH: Optional to required mutation. Threatens legacy data ingestion; forces pipeline abort.
 * - STRICTNESS_RELAXATION: Required to optional mutation. Safe, backward-compatible; passes build.
 */
export const DRIFT_VARIANCE_CATEGORIES = Object.freeze([
  'BREAKING_MUTATION',
  'COMPATIBLE_ADDITION',
  'COMPATIBLE_DELETION',
  'STRICTNESS_STRETCH',
  'STRICTNESS_RELAXATION',
] as const);

/**
 * COMPLEXITY_TAXONOMY_TOKEN_KEYS
 * ROLE: Non-enumerable engineering tokens mapping predictable runtime processing overheads.
 * SPECIFICATIONS:
 * - FLAT_O1: Primitives only. Fast constant-time microsecond-scale execution memory paths.
 * - LINEAR_ON: Simple arrays or records. Traversal cost scales linearly with arriving payload size.
 * - COMPLEX_ON2: Deeply nested layouts, generic tables, or intersections. High recursive CPU risk.
 */
export const COMPLEXITY_TAXONOMY_TOKEN_KEYS = Object.freeze({
  FLAT_O1: 'O(1) Flat',
  LINEAR_ON: 'O(N) Linear',
  COMPLEX_ON2: 'O(N²) High Risk',
} as const);
/**
 * TELEMETRY_API_TOKEN_NAMES
 *
 * ROLE:
 * A flat, immutable dictionary index containing all valid runtime strategy tokens.
 *
 * STRATEGY:
 * - Single Allocation Flattening: Unrolls grouped dictionary strategies point-free on
 *   boot to build a unified index, completely avoiding recurring lookup loops.
 * - High-Efficiency Crawling: Empowers the Static Distribution Crawler to cross-examine
 *   bundle strings using direct, single-pass matches instead of running multiple loops.
 */
export const TELEMETRY_API_TOKEN_NAMES = Object.freeze(
  ObjectUtils.keys(SENTRY_TRIGGER_MODES).flatMap(
    (key) => SENTRY_TRIGGER_MODES[key],
  ),
);

/**
 * DEPTH_STRATEGY_MAPPER
 * ROLE: Immutable dictionary routing shape variants to pure mathematical execution sub-lanes.
 * STRATEGY: Eradicates imperative switch branching to enforce purely declarative processing boundaries.
 */
export const DEPTH_STRATEGY_MAPPER: TAuditDepthMapper = {
  primitive: () => 0,
  literal: () => 0,
  function: () => 0,

  instanceof: () => 0,

  intersection: (shape, blueprints, traversalStack, self) => {
    let max = 0;

    for (const branch of shape.values) {
      const depth = self({
        shape: branch,
        blueprints,
        traversalStack,
      });

      if (depth > max) max = depth;
    }

    return max;
  },

  reference: (shape, blueprints, traversalStack, self) => {
    const targetHash = shape.name;
    if (isKeyOfArray(traversalStack)(targetHash)) return 0;

    const referencedShape = blueprints[targetHash];

    if (!referencedShape) return 0;
    return self({
      shape: referencedShape,
      blueprints,
      traversalStack: [...traversalStack, targetHash],
    });
  },

  object: (shape, blueprints, traversalStack, self) => {
    const propertyKeys = ObjectUtils.keys(shape.properties);

    if (propertyKeys.length === 0) return 1;

    let maximumSubTreeDepth = 0;

    for (const key of yieldItems(propertyKeys)) {
      const propertyDescriptor = shape.properties[key];

      const childDepth = self({
        shape: propertyDescriptor.shape,
        blueprints,
        traversalStack,
      });

      if (childDepth > maximumSubTreeDepth) {
        maximumSubTreeDepth = childDepth;
      }
    }

    return 1 + maximumSubTreeDepth;
  },

  array: (shape, blueprints, traversalStack, self) => {
    return self({ shape: shape.items, blueprints, traversalStack });
  },

  union: (shape, blueprints, traversalStack, self) => {
    const valuesArray = shape.values;

    let maximalUnionBranchDepth = 0;

    for (const value of yieldItems(valuesArray)) {
      const variantDepth = self({ shape: value, blueprints, traversalStack });

      if (variantDepth > maximalUnionBranchDepth) {
        maximalUnionBranchDepth = variantDepth;
      }
    }

    return maximalUnionBranchDepth;
  },

  branded: (shape, blueprints, traversalStack, self) => {
    return self({ shape: shape.base, blueprints, traversalStack });
  },
} satisfies TAuditDepthMapper;

export const DEPTH_COMPLEXITY_MAPPER: TDepthComplexityMapper = [
  { key: 'FLAT_O1', test: (d) => d <= 1 },
  { key: 'LINEAR_ON', test: (d) => d <= 4 },
  { key: 'COMPLEX_ON2', test: () => true },
] satisfies TDepthComplexityMapper;

/**
 * REFERENCE_COLLECTOR_STRATEGY
 * ROLE: Immutable mapping dictionary routing shapes to deep reference tracing branches.
 * STRATEGY: Eliminates if-chains and switch blocks to maintain declarative data pipelines.
 */
export const REFERENCE_COLLECTOR_MAPPER: TReferenceCollectorMapper = {
  primitive: () => {},
  literal: () => {},
  function: () => {},

  instanceof: () => {},
  reference: (_shape, _activeSet, _self) => {
    // Note: The parent loop inside executeSelfHealingPruneSweep handles resolving
    // the hash pointer and passes the actual child shape object down the callback.
  },

  object: (shape, _activeSet, self) => {
    for (const propKey in shape.properties) {
      if (Object.prototype.hasOwnProperty.call(shape.properties, propKey)) {
        const childShape = shape.properties[propKey].shape;
        self(childShape);
      }
    }
  },

  array: (shape, _activeSet, self) => {
    self(shape.items);
  },

  union: (shape, _activeSet, self) => {
    const values = shape.values;
    const len = values.length;
    for (let i = 0; i < len; i++) {
      self(values[i]);
    }
  },
  intersection: (shape, _activeSet, self) => {
    for (const value of shape.values) {
      self(value);
    }
  },
  branded: (shape, _activeSet, self) => {
    self(shape.base);
  },
} satisfies TReferenceCollectorMapper;
/**
 * PROPERTY_DRIFT_EVALUATION_RULES
 * ROLE: Immutable array registry mapping property conditions directly to their semantic variance outcomes.
 * STRATEGY: Statically typechecked against TPropertyDriftRule to ensure compile-clean data mappings.
 */
/* prettier-ignore */
export const PROPERTY_DRIFT_EVALUATION_RULES: readonly TPropertyDriftRule[] = [
  {
    test: (ctx) => !ctx.baselineProp && !ctx.activeProp.optional,
    category: 'BREAKING_MUTATION', // Zero casting required! Checked directly against the union type.
    isBreaking: true,
    /* prettier-ignore */
    describe: () => 'New required property field path appended to object layout.',
  },
  {
    test: (ctx: TPropertyDeltaContext) => !ctx.baselineProp && ctx.activeProp.optional,
    category: 'COMPATIBLE_ADDITION',
    isBreaking: false,
    describe: () =>
      'New optional property field path appended to object layout.',
  },
  {
    test: (ctx: TPropertyDeltaContext) => !!ctx.baselineProp && !ctx.activeProp.optional && ctx.baselineProp.optional,
    category: 'STRICTNESS_STRETCH',
    isBreaking: true,
    describe: () => 'Backwards compatibility link broken: Property modified from optional over to required.',
  },
  {

    test: (ctx: TPropertyDeltaContext) => !!ctx.baselineProp && ctx.activeProp.optional && !ctx.baselineProp.optional,
    category: 'STRICTNESS_RELAXATION',
    isBreaking: false,
    describe: () => 'Property criteria widened from required down to optional structure.',
  },
] satisfies TPropertyDriftRule[];
