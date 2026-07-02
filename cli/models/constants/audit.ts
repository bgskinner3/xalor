import { SENTRY_TRIGGER_MODES } from '../../../shared';
import { ObjectUtils, yieldItems } from '../../../shared/utils';
import type {
  TReferenceCollectorMapper,
  TPropertyDeltaContext,
  TPropertyDriftRule,
  TTopologyEdgeStrategyMap,
} from '../types';
import {
  isReferenceShape,
  isObjectShape,
  isArrayShape,
  isBrandedShape,
  isIntersectionShape,
  isFunctionShape,
  isUnionShape,
} from '../../../shared';

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

/**
 * TOPOLOGY_EDGE_MAPPER
 *
 * ROLE: Point-free object lookup dictionary satisfying the exhaustive check constraint.
 * Scans every single compound shape kind to locate and extract reference connectors.
 */
export const TOPOLOGY_EDGE_MAPPER: TTopologyEdgeStrategyMap = {
  // 1. Direct Reference Nodes (The actual edges we want to capture)
  reference: (params) => {
    const { shape, sourceKey, edges } = params;
    if (!isReferenceShape(shape)) return;

    edges.push({ sourceKey, targetKey: shape.name });
  },

  // 2. Compound Containers (Continue recursion down into elements)
  object: (params) => {
    const { shape, recurse } = params;
    if (!isObjectShape(shape)) return;

    const props = shape.properties;
    if (!props) return;

    Object.keys(props).forEach((propKey) => {
      const isDirectProperty = Object.prototype.hasOwnProperty.call(
        props,
        propKey,
      );
      const propEntry = props[propKey];

      if (isDirectProperty && propEntry) {
        recurse(propEntry.shape);
      }
    });
  },

  union: (params) => {
    const { shape, recurse } = params;
    if (!isUnionShape(shape)) return;

    (yieldItems(shape.values) || []).forEach((variant) => {
      recurse(variant);
    });
  },

  intersection: (params) => {
    const { shape, recurse } = params;
    if (!isIntersectionShape(shape)) return;

    (yieldItems(shape.values) || []).forEach((variant) => {
      recurse(variant);
    });
  },

  array: (params) => {
    const { shape, recurse } = params;
    if (!isArrayShape(shape)) return;

    recurse(shape.items);

    const tupleElements = shape.elementShapes;
    if (tupleElements) {
      tupleElements.forEach((el) => {
        recurse(el);
      });
    }
  },

  function: (params) => {
    const { shape, recurse } = params;
    if (!isFunctionShape(shape)) return;

    const parameters = shape.parameters;
    if (parameters) {
      parameters.forEach((param) => {
        recurse(param.shape);
      });
    }
    recurse(shape.returnType);
  },

  branded: (params) => {
    const { shape, recurse } = params;
    if (!isBrandedShape(shape)) return;

    recurse(shape.base);
  },

  // 3. Terminal Leaf Nodes (Explicitly stop recursion threads safely)
  primitive: () => {},
  literal: () => {},
  instanceof: () => {},
} satisfies TTopologyEdgeStrategyMap;
