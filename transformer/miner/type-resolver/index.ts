import {
  verifyUnboundGenericCompliance,
  verifyDeferredResolutionCompliance,
  verifyTerminalBoundaryCompliance,
  verifyExecutableSignatureCompliance,
  verifyRecursiveGraphCompliance,
  verifyMappedStructureCompliance,
  verifyTupleSequenceCompliance,
  verifyPropertyLayoutCompliance,
} from './rules';
import type { Type, TypeChecker, CallExpression } from 'typescript';
import type { TTypeGuardErrorFailure } from '../../../shared/error';
import { isUndefined } from '../../../shared';

export function verifyTypeResolvability(
  type: Type,
  checker: TypeChecker,
  keyName: string,
  callNode?: CallExpression,
): TTypeGuardErrorFailure | undefined {
  const flags = type.getFlags();

  // Gate 1: Check Variable Scope & Standalone Unbound Parameters
  /* prettier-ignore */
  const unboundGenericFailure = verifyUnboundGenericCompliance(flags, keyName, callNode);
  if (!isUndefined(unboundGenericFailure)) return unboundGenericFailure;

  // Gate 2: Check Conditional Equations, Index Access, & Substitutions
  /* prettier-ignore */
  const deferredResolutionFailure = verifyDeferredResolutionCompliance(type, flags, keyName);
  if (!isUndefined(deferredResolutionFailure)) return deferredResolutionFailure;

  // Gate 3: Check Intrinsic Errors, Collapse Sentinel States, & Contradictions
  /* prettier-ignore */
  const terminalBoundaryFailure = verifyTerminalBoundaryCompliance(type, flags, keyName);
  if (!isUndefined(terminalBoundaryFailure)) return terminalBoundaryFailure;

  // Gate 4: Check Pure Data Structural Boundaries (Signatures & ESSymbols)
  /* prettier-ignore */
  const excSignatureFailure = verifyExecutableSignatureCompliance(type, flags, keyName);
  if (!isUndefined(excSignatureFailure)) return excSignatureFailure;

  // Gate 5: Check Deep Recursive Loops & Graph Calculations
  /* prettier-ignore */
  const recursiveGraphFailure = verifyRecursiveGraphCompliance(type, flags, checker, keyName);
  if (!isUndefined(recursiveGraphFailure)) return recursiveGraphFailure;

  // Gate 6: Check Mapped Layout Blueprint Mutations
  /* prettier-ignore */
  const mappedStructureFailure = verifyMappedStructureCompliance(type, checker, keyName);
  if (!isUndefined(mappedStructureFailure)) return mappedStructureFailure;

  // Gate 7: Check Array Length Constraints & Variadic Tuple Spreads
  /* prettier-ignore */
  const tupleSequenceFailure = verifyTupleSequenceCompliance(type, checker, keyName);
  if (!isUndefined(tupleSequenceFailure)) return tupleSequenceFailure;

  // Gate 8: Check Nested Child Lookups & Open Index Records
  /* prettier-ignore */
  const propertyLayoutFailure = verifyPropertyLayoutCompliance(type, flags, checker, keyName);
  if (!isUndefined(propertyLayoutFailure)) return propertyLayoutFailure;

  return undefined;
}
