import type { TPrimitiveValidationMapper } from '../../models/types';
import { errorService } from '../../error';
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

export const PRIMITIVE_ERROR_METADATA = {
  /* prettier-ignore */ string: { expected: 'string', msg: () => errorService.shapeValErrs.PRIMITIVE_VALIDATION_STRING_EXPECTED.message },
  /* prettier-ignore */ number: { expected: 'number', msg: () => errorService.shapeValErrs.PRIMITIVE_VALIDATION_NUMBER_EXPECTED.message },
  /* prettier-ignore */ boolean: { expected: 'boolean', msg: () => errorService.shapeValErrs.PRIMITIVE_VALIDATION_BOOLEAN_EXPECTED.message },
  /* prettier-ignore */ null: { expected: 'null', msg: () => errorService.shapeValErrs.PRIMITIVE_VALIDATION_NULL_EXPECTED.message },
  /* prettier-ignore */ undefined: { expected: 'undefined', msg: () => errorService.shapeValErrs.PRIMITIVE_VALIDATION_UNDEFINED_EXPECTED.message },
  /* prettier-ignore */ void: { expected: 'void', msg: () => errorService.shapeValErrs.PRIMITIVE_VALIDATION_UNDEFINED_EXPECTED.message },
  /* prettier-ignore */ bigint: { expected: 'bigint', msg: () => errorService.shapeValErrs.PRIMITIVE_VALIDATION_BIGINT_EXPECTED.message },
  /* prettier-ignore */ never: { expected: 'never', msg: () => 'Type evaluated as unreachable never.' },
  /* prettier-ignore */ symbol: { expected: 'symbol', msg: () => 'Target type is symbol but data is not a symbol.' },
} satisfies Record<string, { expected: string; msg: () => string }>;
