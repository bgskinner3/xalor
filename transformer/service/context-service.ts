// transformer/service/context-service.ts
import type { TVaultSyncPayload } from '../../shared/types';
import type {
  TXalorEngineContext,
  TUpdateSessionRegistry,
  TDeleteSessionRegistry,
  TSessionPathKeys,
  TCompilationPhase,
  TDriftLineageEntry,
} from '../types';
import { XalorRoutesService } from './routes-service';

class XalorContextService {
  private static instance: XalorContextService;
  private blacklistedKeys = new Set<string>();
  private activeCompilationPhase: TCompilationPhase = 'STANDARD_INLINE';
  private targetedRuntimeFilesSet = new Set<string>();
  private keyHasExportedType = new Set<string>();
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
    /* prettier-ignore */
    globalThis.__XALOR_SEQUENCE_COUNTERS__ ||= new Map<string, number>();
    /* prettier-ignore */
    globalThis.__XALOR_TARGETED_RUNTIME_FILES_SET__ ||= new Set<string>();
    /* prettier-ignore */
    globalThis.__XALOR_DRIFT_REGISTRY__ ||= new Map<string, TDriftLineageEntry>();
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
  get driftRegistry() {
    return globalThis.__XALOR_DRIFT_REGISTRY__!;
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
      targetedFilesSet: this.targetedRuntimeFilesSet,
      compilationPhase: this.activeCompilationPhase,
      keyHasExportedType: this.keyHasExportedType,
      driftRegistry: this.driftRegistry,
    };
  }
  // ============================================================================================
  // TARGETED RUNTIME FILES SENTRY SET
  // ============================================================================================
  public addTargetedRuntimeFile(filePath: string): void {
    this.targetedRuntimeFilesSet.add(filePath);
  }

  public resetTargetedRuntimeFiles(): void {
    this.targetedRuntimeFilesSet.clear();
  }
  public get targetedFilesCollector(): Set<string> {
    return this.targetedRuntimeFilesSet;
  }
  public setTargetedFilesCollector(collector: Set<string>): void {
    this.targetedRuntimeFilesSet = collector;
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
  public resetExportedTypes(): void {
    this.keyHasExportedType.clear();
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

  public deleteFromSessionRegistry(props: TDeleteSessionRegistry): void {
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
  // COMPILATION PHASE MANAGEMENT GATES
  // ============================================================================================
  public get compilationPhase(): TCompilationPhase {
    return this.activeCompilationPhase;
  }
  public setCompilationPhase(phase: TCompilationPhase): void {
    this.activeCompilationPhase = phase;
  }
  // ============================================================================================
  // 🧬 EVOLUTION DRIFT REGISTRY
  // ============================================================================================
  /* prettier-ignore */
  public addDriftLineage(evolutionToken: string, lineage: TDriftLineageEntry): void {
    this.driftRegistry.set(evolutionToken, lineage);
  }

  /* prettier-ignore */
  public deleteFromDriftRegistry(evolutionToken: string): boolean {
    return this.driftRegistry.delete(evolutionToken);
  }

  /* prettier-ignore */
  public getDriftLineage(evolutionToken: string): TDriftLineageEntry | undefined {
    return this.driftRegistry.get(evolutionToken);
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
  // ============================================================================================
  // RESET HARD
  // ============================================================================================
  public hardResetAllMemoryStores(): void {
    // 1. Clear ambient Map registry allocations cleanly point-free
    this.globalKeyRegistry.clear();
    this.sequenceCounters.clear();
    this.driftRegistry.clear();

    // 2. Clear  transient tracking sets
    this.activePassKeys.clear();
    this.blacklistedKeys.clear();
    this.activeCompilationPhase = 'STANDARD_INLINE';
    this.targetedRuntimeFilesSet.clear();

    globalThis.__XALOR_TRACE_CACHE__ = {};
    globalThis.__XALOR_BOOT_HYDRATED__ = false;

    // Reset root path safely to execute smooth clean slate recovery steps
    globalThis.__XALOR_ROOT_DIR__ = process.cwd();
  }
  // ============================================================================================
  // CLI SPECIFIC METHODS
  // ============================================================================================
  /**
   * clearFileSessionRegistrySlice
   * ROLE: Completely evicts historical cache records for a single file on incremental watch ingress.
   * STRATEGY: Clears the local session drawer and flushes corresponding global key registry map links.
   * INVARIANT: Cleans memory point-free in pure constant/linear paths without touching external files.
   *
   * #######
   *  - Clear out the isolated file data slice drawer inside your Session Registry
   *  - Loop through all keys currently registered inside this file before we delete the drawer
   *
   *  FLUSH GLOBAL MAP REFERENCE: Remove this key from your flat global registry
   *  to prevent crossFileProtection from mistaking it for a collision ghost on re-run!
   *
   */
  public clearFileSessionRegistrySlice(relativeProjectKey: string): void {
    this.sequenceCounters.delete(relativeProjectKey);
    const session = this.sessionRegistry[relativeProjectKey];
    if (session !== undefined) {
      for (const keyName in session.keys) {
        if (Reflect.has(session.keys, keyName)) {
          this.globalKeyRegistry.delete(keyName);
        }
      }

      delete this.sessionRegistry[relativeProjectKey];
    }
  }
}

export const xalorCentralContext = XalorContextService.getInstance();
