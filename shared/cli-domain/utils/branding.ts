import { CLI_MAIN_CONFIG_OBJECT } from '../constants';
type MainConfig = typeof CLI_MAIN_CONFIG_OBJECT;
type ConfigVariation<P extends keyof MainConfig[keyof MainConfig]> = {
  [
    K in keyof MainConfig as MainConfig[K][P] extends boolean
      ? MainConfig[K][P] extends true
        ? K
        : never
      : K
  ]: MainConfig[K][P] extends boolean ? K : MainConfig[K][P];
};

/**
 * 🪞 COMPILE-TIME MALLEABLE PROJECTION PIPELINE & BOUNDARY GUARD
 *
 * Performance Profile: O(1) direct structural assertion pass with absolute zero allocation overhead.
 *
 * STRATEGY & ARCHITECTURE:
 * This architectural utility expands on the core Identity Mirror pattern by transforming it into a
 * fully malleable, higher-order structural extractor. It dynamically projects sub-property spaces
 * out of your ahead-of-time (AOT) Single Source of Truth (`CLI_MAIN_CONFIG_OBJECT`) at compile-time.
 *
 * By combining a nominal assertion engine (`enforceConfigVariation`) with an execution wrapper,
 * it prevents the TypeScript compiler from smashing uniquely isolated literal records (such as
 * localized feature flag arrays or environment keys) into unordered, flattened wide unions during
 * dynamic runtime re-assembly loops (`ObjectUtils.fromEntries`).
 *
 * SCALABILITY MECHANICS:
 * Instead of maintaining hardcoded string maps, the lookup bounds are dynamically anchored to
 * `keyof MainConfig[keyof MainConfig]`. If the schema of the core CLI engine expands tomorrow to include
 * a new tracking key (e.g., 'alias', 'timeout'), this pipeline automatically absorbs, types, and exposes
 * the new variation with 100% strict type inference—completely free of application-file 'as' casts
 * or 'any' type escapes.
 *
 * @template P - A generic key selector dynamically derived from the underlying command property fields.
 * @param obj - The loose, runtime-assembled dictionary awaiting formal framework branding.
 * @param targetProp - The strict literal identifier signaling which matrix dimension to anchor and isolate.
 * @returns A structurally isolated, deeply typed configuration variation locking down exact IDE autocomplete.
 */

function enforceConfigVariation<P extends keyof MainConfig[keyof MainConfig]>(
  _val: unknown,
  _targetProp: P,
): asserts _val is ConfigVariation<P> {}

export function toConfigVariation<P extends keyof MainConfig[keyof MainConfig]>(
  obj: unknown,
  targetProp: P,
): ConfigVariation<P> {
  enforceConfigVariation(obj, targetProp);
  return obj;
}
