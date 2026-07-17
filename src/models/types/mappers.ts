import type {
  TSolidShape,
  TStrictSolidMetaData,
  TSolidMetadata,
  TValidationContext,
} from '../../../shared';
import type { TRuntimeShapeValidationErrorKey } from './error-types';
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
    blueprintId?: string,
  ) => boolean;
};

export type TPrimitiveValidationMapper = Record<
  string,
  (d: unknown) => boolean
>;
export type TPrimitiveErrorTuple = {
  expected: string;
  getMessage: () => string;
};
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
export type TFastPathMetadata = {
  readonly check: (d: Record<string, unknown>) => boolean;
  readonly keys: readonly string[];
  readonly errorKeys: readonly TRuntimeShapeValidationErrorKey[];
  readonly complexKeys?: readonly string[];
};
