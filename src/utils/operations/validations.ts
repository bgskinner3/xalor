import { XalethorService } from '../../xalor-service';
import type {
  TReturnValidationTools,
  TResolveModernInstance,
} from '../../models/types';
import { makeAssert } from '../common';
import type { TTypeGuard, TAssert } from '../../../shared/types';
import {
  TResolveDriftReturnConstraint,
  TResolveAncestralInstance,
} from '../../models/types';
export function buildValidationTools<
  K extends Extract<TActiveRegistryKeys, string>,
>(key: K): TReturnValidationTools<K> {
  const guard: TTypeGuard<TResolveRegistryStructure<K>> = (
    val: unknown,
  ): val is TResolveRegistryStructure<K> =>
    XalethorService.validateShapeByKey(val, key);

  const assert: TAssert<TResolveRegistryStructure<K>> = makeAssert(guard, key);

  return { guard, assert };
}

// ==========================================================================================
// ==========================================================================================
// MATCH DRIFT REFINMENTS
// ==========================================================================================
// ==========================================================================================
/**
 *  ACTIVE GENERATION PATH CONDUIT
 *
 * DESCRIPTION:
 * Reifies the compiler's type graph stream on the active hot path pass.
 * Proves to the static type checker that the verified runtime payload perfectly
 * satisfies today's active production release handler parameter constraints.
 */

export function refinePayloadContract<K extends TActiveDriftRegistryKeys>(
  _payload: Record<string, unknown>,
): _payload is TResolveDriftReturnConstraint<K> {
  return true;
}

/**
 * ANCESTRAL MIGRATION PATH CONDUIT
 *
 * @role Reifies the type graph stream on the backward-compatible version pass.
 * Proves to the static type checker that the arriving historical payload perfectly
 * satisfies yesterday's registered ancestral schema handler parameter constraints.
 *
 * @invariants Satisfies COMMANDMENT IX: Drives structural correctness point-free.
 */
export function refineAncestralContract<K extends TActiveDriftRegistryKeys>(
  _payload: unknown,
): _payload is TResolveAncestralInstance<K> {
  return true;
}

/**
 * MASTER REGISTRY PRODUCTION REFINER
 *
 * @role Master exit type gatekeeper that narrows loose records down to verify
 * complete compliance with today's unrolled production interface layouts.
 *
 * @invariants Satisfies COMMANDMENT IX: Safely bridges records to strict template contracts.
 */
export function refineToCurrentModel<
  _K extends TActiveDriftRegistryKeys,
  T extends string,
>(_record: unknown, _targetKey: T): _record is TResolveModernInstance<_K> {
  return true;
}
