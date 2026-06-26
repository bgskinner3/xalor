import type {
  TApplyNominalBrand,
  IXalorDriftContext,
  TResolveDriftReturnConstraint,
} from '../../../models/types';
import { XalethorService } from '../../../xalor-service';
// import { assertDriftRegistryKey } from '../../../../shared';

/**
 * PUBLIC RUNTIME API: MATCH XALOR DRIFT
 *
 * Synchronously executes a single-pass backward-compatible type migration gateway.
 * Evaluates raw network payload profiles against historical blueprint ancestors and
 * upcasts them on the fly to match active production contract layout specifications.
 *
 * NOTE: Limits ancestral tracking depth strictly to a maximum ceiling of 1 generation back.
 *
 * @see {@link RuntimeApiCoreDocs.matchXalorDrift}
 *
 * !!! FOR in depth notes on how we designed Drift
 * @see {@link RuntimeApiCoreDocs.matchXalorDriftPlan}
 *
 */
export function matchXalorDrift<
  K extends keyof ISolidDriftRegistry,
  R extends TResolveDriftReturnConstraint<K> = TResolveDriftReturnConstraint<K>,
>(
  payload: unknown,
  ctx: IXalorDriftContext<K, R>,
  injectedKey?: K,
): TApplyNominalBrand<R> {
  // assertDriftRegistryKey<K>(injectedKey);

  if (!injectedKey || !ctx) {
    throw new Error(
      `[xalor] 🚨 GATEWAY BLOCK: 'matchXalorDrift' executed without compiled metadata properties.\n` +
        `Ensure your build-time transformer plugin is active.`,
    );
  }

  return XalethorService.executeDriftMatcher(payload, ctx);
}
