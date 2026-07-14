// transformer/context/store.ts
import type { TVaultSyncPayload } from '../../shared/types';
import type { TSessionRegistry, TDriftLineageEntry } from '../types';

declare global {
  // ======================================================================
  // TRANSFORMER GlOAB< SESSION AND TEMP FILE CONTEXT
  // ======================================================================
  var __XALOR_GLOBAL_KEY_REGISTRY__: Map<string, TVaultSyncPayload> | undefined;
  var __XALOR_TRACE_CACHE__: TSessionRegistry | undefined;
  var __XALOR_ACTIVE_PASS_KEYS__: Set<string> | undefined;
  var __XALOR_DRIFT_REGISTRY__: Map<string, TDriftLineageEntry> | undefined;

  // ======================================================================
  // BOOTLOADER
  // ======================================================================
  var __XALOR_BOOT_HYDRATED__: boolean | undefined;
  var __XALOR_ROOT_DIR__: string | undefined;
  var __XALOR_COMPILE_LOCK__: boolean | undefined;
}
export {};
