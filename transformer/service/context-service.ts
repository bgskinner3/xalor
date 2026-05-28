import type { TVaultSyncPayload } from '../../shared/types';
import type {
  TXalorEngineContext,
  TUpdateSessionRegistry,
  TDeleteSessionRegistry,
  TSessionPathKeys,
} from '../types';
import { XalorRoutesService } from './routes-service';

class XalorContextService {
  private static instance: XalorContextService;
  constructor() {
    this.ensureGlobalMemoryRegistries();
  }
  public ensureGlobalMemoryRegistries(): void {
    /* prettier-ignore */
    globalThis.__XALOR_GLOBAL_KEY_REGISTRY__ ||= new Map<string, TVaultSyncPayload>();
    /* prettier-ignore */
    globalThis.__XALOR_TRACE_CACHE__ ||= {};
    /* prettier-ignore */
    globalThis.__XALOR_ACTIVE_PASS_KEYS__ ||= new Set<string>();
    /* prettier-ignore */
    globalThis.__XALOR_ROOT_DIR__ ||= process.cwd();
    /* prettier-ignore */
    globalThis.__XALOR_BOOT_HYDRATED__ ||= false

    /* prettier-ignore */ globalThis.__XALOR_SEQUENCE_COUNTERS__ ||= new Map<string, number>();
  }
  get globalKeyRegistry() {
    return globalThis.__XALOR_GLOBAL_KEY_REGISTRY__!;
  }
  get sessionRegistry() {
    return globalThis.__XALOR_TRACE_CACHE__!;
  }
  get activePassKeys() {
    return globalThis.__XALOR_ACTIVE_PASS_KEYS__!;
  }
  get rootDir() {
    return globalThis.__XALOR_ROOT_DIR__!;
  }
  get isHydrated() {
    return globalThis.__XALOR_BOOT_HYDRATED__!;
  }
  get sequenceCounters() {
    return globalThis.__XALOR_SEQUENCE_COUNTERS__!;
  }

  public static getInstance(): XalorContextService {
    if (!XalorContextService.instance) {
      XalorContextService.instance = new XalorContextService();
    }
    return XalorContextService.instance;
  }
  public get context(): TXalorEngineContext {
    return {
      rootDir: this.rootDir,
      globalKeyRegistry: this.globalKeyRegistry,
      sessionRegistry: this.sessionRegistry,
      activePassKeys: this.activePassKeys,
      isHydrated: this.isHydrated,
    };
  }
  // ============================================================================================
  // ACTIVE PASS KEYS
  // ============================================================================================
  public addActivePassKey(key: string) {
    this.activePassKeys.add(key);
  }
  public resetActivePassKeys() {
    this.activePassKeys.clear();
  }
  // ============================================================================================
  // SESSION REGISTRY
  // ============================================================================================
  public addSessionRegistry(props: TUpdateSessionRegistry) {
    const { area, anchor, filePath, keyName } = props;
    const projectKey = XalorRoutesService.getProjectRelativeKey(filePath);
    this.sessionRegistry[projectKey] ||= {};
    this.sessionRegistry[projectKey][keyName] = { area, anchor, filePath };
  }
  public deleteFromSessionRegistry(props: TDeleteSessionRegistry) {
    const { filePath, keyName } = props;
    const projectKey = XalorRoutesService.getProjectRelativeKey(filePath);
    if (!this.sessionRegistry[projectKey]) return;

    delete this.sessionRegistry[projectKey][keyName];

    if (Object.keys(this.sessionRegistry[projectKey]).length === 0) {
      delete this.sessionRegistry[projectKey];
    }
  }

  public getCurrentSessionPath(filePath: string): TSessionPathKeys {
    const projectKey = XalorRoutesService.getProjectRelativeKey(filePath);
    if (!this.sessionRegistry[projectKey]) return {};

    return this.sessionRegistry[projectKey];
  }

  // ============================================================================================
  // GLOBAL REGISTRY
  // ============================================================================================
  public addGlobalRegistry(props: TVaultSyncPayload) {
    this.globalKeyRegistry.set(props.key, props);
  }
  public deleteFromGlobalRegistry(key: string) {
    this.globalKeyRegistry.delete(key);
  }
  // ============================================================================================
  // SHARED REGISTRY
  // ============================================================================================
  public updateGlobalAndSession(props: TVaultSyncPayload) {
    this.addGlobalRegistry(props);
    this.addSessionRegistry({
      area: props.area,
      anchor: props.anchor,
      filePath: props.filePath,
      keyName: props.key,
    });
  }

  public deleteGlobalAndSession(props: TDeleteSessionRegistry) {
    this.deleteFromSessionRegistry(props);
    this.deleteFromGlobalRegistry(props.keyName);
  }

  // ============================================================================================
  // 🛰️ SEQUENCE SEQUENCE COUNTERS (THE GPS ANCHOR GENERATOR)
  // ============================================================================================
  public resetFileCounters(filePath: string): void {
    this.sequenceCounters.delete(filePath);
  }
  /**
   * INCREMENT AND GET SEQUENCE INDEX
   * Increments the sequential match value for a specific file and returns the anchor.
   */
  public getNextSequenceAnchor(filePath: string): string {
    const currentCount = this.sequenceCounters.get(filePath) || 0;
    const nextCount = currentCount + 1;
    this.sequenceCounters.set(filePath, nextCount);
    return `#call:${nextCount}`;
  }
}

export const xalorCentralContext = XalorContextService.getInstance();

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// // transformer/transformer-compiler/context-generator.ts
// import type { TVaultSyncPayload } from '../../shared/types';
// import type {
//   TXalorTransformerRootContext,
//   TContextGeneratorParams,
// } from '../types';

// declare global {
//   // long-lived cache containers directly to globalThis process RAM safely
//   var __XALOR_GLOBAL_KEY_REGISTRY__: Map<string, TVaultSyncPayload> | undefined;
//   var __XALOR_SESSION_REGISTRY__: Map<string, string> | undefined;
//   // 🚀 THE SYSTEM ANCHOR: Stores the single unmovable active operational mode token!
//   // var __XALOR_EXECUTE_MODE__: TTransformerExecuteMode | undefined;
//   // BOOTLOADER
//   var __XALOR_BOOT_HYDRATED__: boolean | undefined;
// }
// /**
//  * ensureGlobalMemoryRegistries
//  *
//  * ROLE:
//  * Guarantees the long-lived global process maps are instantiated safely on globalThis.
//  */
// export function ensureGlobalMemoryRegistries(): void {
//   if (!globalThis.__XALOR_GLOBAL_KEY_REGISTRY__) {
//     /* prettier-ignore */
//     globalThis.__XALOR_GLOBAL_KEY_REGISTRY__ = new Map<string, TVaultSyncPayload>();
//   }
//   if (!globalThis.__XALOR_SESSION_REGISTRY__) {
//     /* prettier-ignore */
//     globalThis.__XALOR_SESSION_REGISTRY__ = new Map<string, string>();
//   }
// }
// /**
//  * buildTransformerRootContext
//  *
//  * ROLE:
//  * Master Context Inception Factory for the Xalor Engine.
//  *
//  * STRATEGY:
//  * Invokes ensureGlobalMemoryRegistries to guarantee global container presence.
//  * Because the global mappings are guaranteed, it extracts the references natively by pointer,
//  * removing redundant fallback allocations entirely.
//  */
// export function generateTransformerRootContext({
//   sourceFile,
//   freshKeysHarvestedInThisPass,
// }: TContextGeneratorParams): TXalorTransformerRootContext {
//   // Enforce global container presence before extraction boundaries map
//   ensureGlobalMemoryRegistries();

//   // Clean extraction directly by reference pointer. No double operators, no silent fallback allocation leaks.
//   const globalKeyRegistry = globalThis.__XALOR_GLOBAL_KEY_REGISTRY__!;
//   const sessionRegistry = globalThis.__XALOR_SESSION_REGISTRY__!;

//   return {
//     // 🪐 THE PRESENT: Ephemeral, file-isolated execution tracking variables
//     currentActiveAbsoluteFile: sourceFile.fileName,
//     freshKeysHarvestedInThisPass,

//     // 🏛️ THE PAST: Long-lived process-level tracking database maps (Passed cleanly by reference)
//     globalKeyRegistry,
//     sessionRegistry,
//   };
// }
/**
 interface ContextOne_GlobalRegistry {
  [invocationKey: string]: {
    filePath: string;
    lineNumber: number;
    objectString: string;
  };
}


 */
