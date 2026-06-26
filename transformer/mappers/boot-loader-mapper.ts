// /transformer/mappers/boot-loader-mapper.ts
import type { TBootStrategyParams, TBootLoaderMapper } from '../types';
import { isUndefined } from '../../shared';
import { xalorCentralContext } from '../service';
import { hydrateCacheToRegistries } from '../cache-hydration';

/**
 * BOOT_MODE_STRATEGY_MAPPER
 *
 * Master Boot-Time Environment Configuration Routing Engine.
 *
 * @see {@link TransformerDocs.BOOT_MODE_STRATEGY_MAPPER  }
 */
export const BOOT_MODE_STRATEGY_MAPPER: TBootLoaderMapper = {
  watch: ({ sampleFile }: TBootStrategyParams) => {
    xalorCentralContext.ensureGlobalMemoryRegistries();

    const { globalKeyRegistry, sessionRegistry } = xalorCentralContext.context;
    // TODO: CONFIRM TO ADD
    const isHydrated = globalThis.__XALOR_BOOT_HYDRATED__;
    if (
      !isUndefined(globalKeyRegistry) &&
      Object.keys(globalKeyRegistry).length === 0 &&
      !isHydrated
    ) {
      globalThis.__XALOR_BOOT_HYDRATED__ = true;
      hydrateCacheToRegistries(sampleFile, globalKeyRegistry, sessionRegistry);
    }
  },
  compile: ({ runtimePaths: _ }: TBootStrategyParams) => {
    // One-shot local development compile passes wipe out old in-memory cache states
    // to guarantee a completely clean, non-polluted workspace generation pass run
    if (!isUndefined(globalThis.__XALOR_GLOBAL_KEY_REGISTRY__)) {
      globalThis.__XALOR_GLOBAL_KEY_REGISTRY__.clear();
    }
    if (!isUndefined(globalThis.__XALOR_SESSION_REGISTRY__)) {
      globalThis.__XALOR_SESSION_REGISTRY__.clear();
    }
  },
  vacuum: ({ runtimePaths: _ }: TBootStrategyParams) => {
    // Production vacuuming completely cleans registries to optimize system cycles
    // for flat minified production artifact generation
    if (!isUndefined(globalThis.__XALOR_GLOBAL_KEY_REGISTRY__)) {
      globalThis.__XALOR_GLOBAL_KEY_REGISTRY__.clear();
    }
    if (!isUndefined(globalThis.__XALOR_SESSION_REGISTRY__)) {
      globalThis.__XALOR_SESSION_REGISTRY__.clear();
    }
  },
  studio: ({ runtimePaths: _ }: TBootStrategyParams) => {
    // Production vacuuming completely cleans registries to optimize system cycles
    // for flat minified production artifact generation
    if (!isUndefined(globalThis.__XALOR_GLOBAL_KEY_REGISTRY__)) {
      globalThis.__XALOR_GLOBAL_KEY_REGISTRY__.clear();
    }
    if (!isUndefined(globalThis.__XALOR_SESSION_REGISTRY__)) {
      globalThis.__XALOR_SESSION_REGISTRY__.clear();
    }
  },
  clear: ({ runtimePaths: _ }: TBootStrategyParams) => {
    console.log('⚡ [Xalor Boot] Evacuating long-lived RAM allocation maps...');

    xalorCentralContext.hardResetAllMemoryStores();

    console.log(
      '✨ [Xalor Boot] In-memory tracking registries successfully flashed.',
    );
  },
} satisfies TBootLoaderMapper;
