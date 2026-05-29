// transformer/service/context-service.ts
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
  private blacklistedKeys = new Set<string>();
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
      blacklistedKeys: this.blacklistedKeys,
    };
  }
  // ============================================================================================
  // BLACK LISTED KEYS
  // ============================================================================================
  public addBlacklistKey(key: string): void {
    this.blacklistedKeys.add(key);
  }
  public resetBlacklist(): void {
    this.blacklistedKeys.clear();
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

    // Initialize the bi-directional session container if empty
    this.sessionRegistry[projectKey] ||= { keys: {}, anchors: {} };
    const session = this.sessionRegistry[projectKey];

    // 1. Map Key -> Anchor details
    session.keys[keyName] = { anchor, area, filePath };

    session.anchors[anchor] = { keyName, area, filePath };
  }
  // TODO: OPTMIZE (BREAK ??)
  public deleteFromSessionRegistry(props: TDeleteSessionRegistry) {
    const { filePath, keyName } = props;
    const projectKey = XalorRoutesService.getProjectRelativeKey(filePath);
    const session = this.sessionRegistry[projectKey];

    if (!session) return;

    const meta = session.keys[keyName];
    if (meta) {
      delete session.anchors[meta.anchor];
    }
    delete session.keys[keyName];

    let hasActiveKeys = false;
    for (const remainingKey in session.keys) {
      if (Reflect.has(session.keys, remainingKey)) {
        hasActiveKeys = true;
        break;
      }
    }

    if (!hasActiveKeys) {
      delete this.sessionRegistry[projectKey];
    }
  }

  public getCurrentSessionPath(filePath: string): TSessionPathKeys {
    const projectKey = XalorRoutesService.getProjectRelativeKey(filePath);
    if (!this.sessionRegistry[projectKey]) {
      return {
        keys: {},
        anchors: {},
      };
    }

    return this.sessionRegistry[projectKey];
  }
  public getKeyByAnchor(filePath: string, anchor: string): string | undefined {
    const projectKey = XalorRoutesService.getProjectRelativeKey(filePath);
    return this.sessionRegistry[projectKey]?.anchors[anchor]?.keyName;
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

  /**
   * hardResetAllMemoryStores
   * 🪐 THE ATOMIC LIFECYCLE ROLLBACK SWITCH
   *
   * ROLE:
   * Completely purges and reconstructs every long-lived compiler registry bound
   * to globalThis. It acts as an elite build-fail safety valve to prevent
   * state memory contamination inside long-running bundler runners like Vite.
   *
   * WHY:
   * Satisfies Commandment IV (Operation Isolation). Centralizes cleanup mechanics
   * point-free, ensuring that a compilation crash completely clears the memory slate
   * before handing control back to a persistent dev watch environment thread.
   */
  public hardResetAllMemoryStores(): void {
    // 1. Clear out your ambient Map registry allocations cleanly point-free
    this.globalKeyRegistry.clear();
    this.sequenceCounters.clear();

    // 2. Clear out your transient tracking sets
    this.activePassKeys.clear();
    this.blacklistedKeys.clear(); // Clear local private instance scratchpad

    // 3. 🟢 FIXED: Overwrite and reset object dictionary layout states to match your exact names!
    globalThis.__XALOR_TRACE_CACHE__ = {};
    globalThis.__XALOR_BOOT_HYDRATED__ = false;

    // Reset root path safely to execute smooth clean slate recovery steps
    globalThis.__XALOR_ROOT_DIR__ = process.cwd();
  }
}

export const xalorCentralContext = XalorContextService.getInstance();
