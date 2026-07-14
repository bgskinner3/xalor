import type {
  TPrimitiveValidationMapper,
  TRuntimeShapeValidationErrorKey,
} from '../../models/types';

export const PRIMITIVE_VALIDATION_CHECKERS: TPrimitiveValidationMapper = {
  string: (d) => typeof d === 'string',
  number: (d) => typeof d === 'number',
  boolean: (d) => typeof d === 'boolean',
  bigint: (d) => typeof d === 'bigint',
  symbol: (d) => typeof d === 'symbol',
  null: (d) => d === null,
  undefined: (d) => d === undefined,
  void: (d) => d === undefined,
  any: () => true,
  unknown: () => true,
  never: () => false,
} satisfies TPrimitiveValidationMapper;

/**
 * Static Monomorphic Mapping Table.
 * Maps raw type primitive keys directly to their flat error keys.
 * COMPLIANCE: Zero runtime strategy allocations or nested closure evaluations.
 */
/* prettier-ignore */
export const PRIMITIVE_ERROR_KEY_MAP: Record<string,TRuntimeShapeValidationErrorKey> = {
  string: 'PRIMITIVE_VALIDATION_STRING_EXPECTED',
  number: 'PRIMITIVE_VALIDATION_NUMBER_EXPECTED',
  boolean: 'PRIMITIVE_VALIDATION_BOOLEAN_EXPECTED',
  bigint: 'PRIMITIVE_VALIDATION_BIGINT_EXPECTED',
  null: 'PRIMITIVE_VALIDATION_NULL_EXPECTED',
  undefined: 'PRIMITIVE_VALIDATION_UNDEFINED_EXPECTED',
  void: 'PRIMITIVE_VALIDATION_UNDEFINED_EXPECTED',
} satisfies Record<string,TRuntimeShapeValidationErrorKey>
