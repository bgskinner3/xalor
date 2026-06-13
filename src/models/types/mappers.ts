import type {
  TSolidShape,
  TStrictSolidMetaData,
  TSolidMetadata,
  TValidationContext,
  TXalorRuleKind,
  TAuditorKeywords,
  TRegisteredInstancesUnion,
} from '../../../shared';

/**
 * TSHAPE_DEFAULT_MATERIALIZE_MAP
 *
 * ROLE:
 * The static type-system contract for the "Materializer" map. It forces exhaustive,
 * zero-assertion functional wiring when constructing new values from blueprints.
 *
 * @see DEFAULT_SHAPE_MATERIALIZER
 * @see produceDefault
 */
export type TShapeDefaultMaterializeMap = {
  [K in TSolidShape['kind']]: (
    shape: Extract<TSolidShape, { kind: K }>,
    depth: number,
    recurse: (s: TSolidShape, d: number) => unknown,
  ) => unknown;
};

/**
 * TSHAPE_MOCK_MAPPER_MAP
 *
 * ROLE:
 * The static type-system contract for the "Simulacrum" map. It coordinates
 * execution formatting parameters for stochastic, constraint-aware random data arrays.
 *
 * @see MOCK_SHAPE_MATERIALIZER
 * @see produceMock
 */
export type TShapeMockMapperMap = {
  [K in TSolidShape['kind']]: (
    shape: Extract<TSolidShape, { kind: K }>,
    depth: number,
    recurse: (s: TSolidShape, d: number) => unknown,
  ) => unknown;
};
/**
 * TSHAPE_CLONE_MAPPER_MAP
 *
 * ROLE:
 * The static type-system contract for the "Sanitizer" map. It governs deep,
 * data-scrubbing operations to physically wash un-declared properties away.
 *
 * @see CLONE_SHAPE_SANITIZER
 * @see produceClone
 */
export type TShapeCloneMapperMap = {
  [K in TSolidShape['kind']]: (
    /* prettier-ignore */ shape: Extract<TSolidShape, { kind: K }>,
    /* prettier-ignore */ data: unknown,
    /* prettier-ignore */ seen: Map<unknown, unknown>,
    /* prettier-ignore */ depth: number,
    /* prettier-ignore */ recurse: (d: unknown, s: TSolidShape, seen: Map<unknown, unknown>, depth: number) => unknown,
  ) => unknown;
};
/**
 * TRectifierRegistryMapper
 *
 * ROLE:
 * The static type-system layout contract for the "Refiner" registry. It forces
 * exhaustive, compile-time verified mapping signatures when upgrading raw
 * metadata packets into high-definition, strict storage containers.
 *
 * @see RECTIFIER_REGISTRY
 * @see preRegisterMetadata
 * @see TStrictSolidMetaData
 */
export type TRectifierRegistryMapper = {
  readonly [K in keyof TStrictSolidMetaData]: (
    input: TSolidMetadata,
  ) => TStrictSolidMetaData[K];
};

/**
 * T_VALIDATOR_MAPPER
 *
 * ROLE:
 * The static runtime constraint contract for Category 2 (Validation API).
 * Maps incoming physical JSON data types instantly to their matching
 * structural check signatures, guaranteeing sub-microsecond parsing traps.
 */
export type TValidatorMapper = {
  [K in TSolidShape['kind']]: (
    data: unknown,
    shape: TSolidShape,
    ctx: TValidationContext,
  ) => boolean;
};
/**
 * T_RULE_AUDITOR_MAPPER
 *
 * ROLE:
 * The static compiler-layer validation matrix schema for the Diagnostic Engine.
 * Enforces strict structural typing bounds on rule classification mappings,
 * ensuring dictionary arrays map token match buckets to concrete category enums.
 *
 * DESIGN:
 * Leverages a dual-tuple multi-dimensional readonly design format to enforce
 * static evaluation safety across deep parsing translation runs.
 */
export type TRuleAuditorMapper = Readonly<
  Record<TAuditorKeywords, TXalorRuleKind>
>;

/**
 * 🎛️ TSHAPE_CAST_MAPPER_MAP
 *
 * ROLE:
 * The static type-system structural graph contract for the Coercion Engine.
 * Enforces exhaustive mapping signatures when safely coercing loose runtime
 * payloads into the exact primitive or structural types demanded by the blueprint.
 */
export type TShapeCastMapperMapper = {
  [K in TSolidShape['kind']]: (
    shape: Extract<TSolidShape, { kind: K }>,
    data: unknown,
    depth: number,
    recurse: (shape: TSolidShape, data: unknown, depth: number) => unknown,
  ) => unknown;
};
type TPrimitiveTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  bigint: bigint;
  unknown: unknown;
};
export type TCastingPrimitiveMapper = {
  [K in keyof TPrimitiveTypeMap]: (
    data: unknown,
  ) => TPrimitiveTypeMap[K] | unknown;
};
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// TRANSFORMER API
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
export type TPickOmitDependency = {
  readonly mode: 'pick' | 'omit';
  readonly set: Set<string>;
};

export type TMergeDependency = {
  readonly mode: 'merge';
  readonly patchData: unknown;
};

/** 🎛️ AUTHORITATIVE MASTER STRATEGY DEPENDENCY UNION */
export type TTransformDependency = TPickOmitDependency | TMergeDependency;

// ========================================================================
// 🎛️ RECURSIVE ROUTER MATRIX SCHEMAS (Zero Repetition / Zero Any)
// ========================================================================

/**
 * 🎛️ RECURSIVE TRANSFORMATION STRUCTURAL WORKER CONTRACT
 *
 * ROLE:
 * Governs the signature loop callback driving deep recursive tree walks.
 *
 * WHY:
 * Parameterized to default directly to your authoritative TTransformDependency
 * contract union. This allows selection, renaming, and merging tracks to share
 * the exact same recursion wire with absolute static type safety.
 */
export type TTransformRecursionLoop<D = TTransformDependency> = (
  data: unknown,
  shape: TSolidShape,
  dependency: D,
  depth: number,
) => unknown;

/**
 * 🗺️ UNIVERSAL AUTOMATED SHAPE TRANSFORMATION MAPPER SCHEMA
 *
 * ROLE:
 * Types the single-allocation master matrix table with absolute precision.
 *
 * WHY:
 * Guarantees that every method row inside the polymorphic lookup map matches
 * your universal dependencies contract shape natively, clearing compilation blocks.
 */
export type TUniversalTransformMapper = {
  readonly [Kind in TSolidShape['kind']]: (
    shape: Extract<TSolidShape, { kind: Kind }>,
    data: unknown,
    dependency: TTransformDependency,
    depth: number,
    recurse: TTransformRecursionLoop<TTransformDependency>,
  ) => unknown;
};

export type TMapperObject = {
  shape: Parameters<TUniversalTransformMapper['object']>[0];
  data: Parameters<TUniversalTransformMapper['object']>[1];
  dependency: Parameters<TUniversalTransformMapper['object']>[2];
  depth: Parameters<TUniversalTransformMapper['object']>[3];
  recurse: Parameters<TUniversalTransformMapper['object']>[4];
};
export type TMapperArray = {
  shape: Parameters<TUniversalTransformMapper['array']>[0];
  data: Parameters<TUniversalTransformMapper['array']>[1];
  dependency: Parameters<TUniversalTransformMapper['array']>[2];
  depth: Parameters<TUniversalTransformMapper['array']>[3];
  recurse: Parameters<TUniversalTransformMapper['array']>[4];
};
// ---------------------------------------------------------------------------------------------------
/**
 * 🗺️ FIXED HIERARCHICAL FLATTEN SHAPE MAP SCHEMA
 *
 * ROLE:
 * Governs the rigid lookup contract for the universal matrix decompression engine.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation) and Commandment V (Graph Integrity).
 * Bounding each row's signature parameter to its extracted shape kind constraint
 * ensures that your flat map handlers compile seamlessly with absolute 100% static
 * type validation, completely eliminating the 'any' keyword from your processing loops.
 */

export type TFlattenAccumulator =
  | Record<string, string | number | boolean | null>
  | TRegisteredInstancesUnion;

export type TShapeFlattenMapper = {
  readonly [K in TSolidShape['kind']]: (
    shape: Extract<TSolidShape, { kind: K }>,
    val: unknown,
    accumulator: TFlattenAccumulator,

    currentPath: string,
    depth: number,
    seenObjectsMap: Set<unknown>,
    recurse: (
      v: unknown,
      s: TSolidShape,
      a: TFlattenAccumulator,
      p: string,
      d: number,
      seen: Set<unknown>,
    ) => void,
  ) => void;
};
