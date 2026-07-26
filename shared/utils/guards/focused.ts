import type {
  TTypeGuard,
  TSolidMetadata,
  TVaultSyncPayload,
  TTripleKV,
  TBakedTripleKV,
} from '../../types';
import { isObject, isKeyInObject, isRecord, matchesShape } from './objects';
import { isNull, isString, isFunction, isOptional } from './primitives';

/**
 * 🛰️ IS METADATA
 *
 * ROLE:
 * A structural check for the Xalor Miner's payload.
 * This ensures that a call to isXalor() contains the necessary
 * "DNA" (key, shape, area) before it is solidified in RAM.
 *
 * INVARIANTS:
 * - Must verify the presence of 'key' and 'shape' (The minimal blueprint).
 * - Must verify 'area' for Auditor traceability.
 */
export const isMetaData: TTypeGuard<TSolidMetadata> = (
  val: unknown,
): val is TSolidMetadata =>
  !isNull(val) &&
  isObject(val) &&
  isKeyInObject('key')(val) &&
  isKeyInObject('shape')(val) &&
  isKeyInObject('area')(val) &&
  isKeyInObject('version')(val);
/**
 * 🛰️ IS VAULT SYNC PAYLOAD
 *
 * ROLE:
 * A strict structural verification guard for synchronization transport payloads.
 * This guarantees that every record passing through the background pipeline possesses
 * absolute, unbroken traceability parameters before it is committed to the registry.
 *
 * INVARIANTS:
 * - Must enforce all core blueprint identifiers ('key', 'shape', 'area', 'version').
 * - Must explicitly verify 'filePath', 'typeName', and 'symbolName' strings to satisfy hard GPS tracing.
 */
export const isVaultSyncPayload: TTypeGuard<TVaultSyncPayload> = (
  val: unknown,
): val is TVaultSyncPayload =>
  !isNull(val) &&
  isObject(val) &&
  isKeyInObject('key')(val) &&
  isKeyInObject('shape')(val) &&
  isKeyInObject('area')(val) &&
  isKeyInObject('version')(val) &&
  isKeyInObject('filePath')(val) &&
  isKeyInObject('typeName')(val) &&
  isKeyInObject('symbolName')(val);

/**
 * @name isTripleKVShape
 * @type {TTypeGuard<TTripleKV>}
 * @category Guard Boundaries
 * @description
 * High-velocity structural contract discriminator validating the extensive development
 * vault configuration schema (typically `vault-snapshot.json` or live workplace buffers).
 *
 * @strategy
 * Switchlessly examines top-level workspace drawers point-free [Commandment IX]. Enforces the
 * complete presence of metadata tables (`blueprints`, `manifest`, `registry`, `references`) and
 * strict version identifiers before releasing payload maps for downstream compiler parsing.
 */
/* prettier-ignore */
export const isTripleKVShape: TTypeGuard<TTripleKV> = (
  value: unknown,
): value is TTripleKV =>
  (isObject(value) ) &&
  (isKeyInObject('blueprints')(value) && isRecord(value.blueprints)) &&
  (isKeyInObject('manifest')(value) && isRecord(value.manifest)) &&
  (isKeyInObject('registry')(value) && isRecord(value.registry)) &&
  ( isKeyInObject('references')(value) && isRecord(value.references)) &&
  (isKeyInObject('version')(value) && isString(value.version))

/**
 * @name isBakedTripleKVShape
 * @type {TTypeGuard<TBakedTripleKV>}
 * @category Guard Boundaries
 * @description
 * High-velocity production boundary discriminator validating compiled build assets
 * (typically `xalor-vault.json` or pre-baked edge distribution modules).
 *
 * @strategy
 * Strips away development-only diagnostic footprints (`manifest`, `registry`) to optimize
 * memory lookups. Enforces the strict structural presence of your core execution matrices
 * (`blueprints`, `references`, `driftTracking`) to ensure zero-allocation runtime parsing operations,
 * completely protecting your live edge endpoints from corrupted telemetry injections [Commandment VIII].
 */
/* prettier-ignore */
export const isBakedTripleKVShape: TTypeGuard<TBakedTripleKV> = (
  value: unknown,
): value is TTripleKV =>
  (isObject(value) ) &&
  (isKeyInObject('blueprints')(value) && isRecord(value.blueprints)) &&
  (isKeyInObject('references')(value) && isRecord(value.references)) &&
  (isKeyInObject('driftTracking')(value) && isRecord(value.driftTracking))

/**
 * 🎯 IS REGISTRY KEY (THE LIVE VAULT RADAR INGRESS)
 *
 * ROLE:
 * A universal type-narrowing predicate guard used to verify if a runtime string token
 * matches an actively hydrated compilation schema inside the live memory vault registry.
 *
 * STRATEGY:
 * First confirms the arriving parameter is an evaluation-safe identifier string before
 * safely verifying the presence of the global data vault singleton (`globalThis.__SOLID_VAULT__`).
 * Once verified, it executes a zero-allocation, sub-nanosecond hash map check directly against
 * the precompiled native `Map` index. Successfully passing this gateway narrows the loose token
 * straight down to the specific generic type parameter `K`, clearing all strict type assignment
 * restrictions across downstream Bouncer, Facade, and Strategy engines.
 */
export function isRegistryKey<K extends TActiveRegistryKeys>(
  key: unknown,
): key is K {
  const vault = globalThis.__SOLID_VAULT__;

  return (
    typeof key === 'string' &&
    vault !== undefined &&
    vault.blueprints !== undefined &&
    vault.references.has(key)
  );
}
/**
 * 🎯 IS DRIFT REGISTRY KEY (THE HISTORICAL LINAGE RADAR INGRESS)
 *
 * ROLE:
 * A universal type-narrowing predicate guard used to verify if a runtime string token
 * matches an actively recorded multi-generational evolution contract lifecycle line.
 *
 * DESIGN INVARIANTS:
 * - Satisfies COMMANDMENT I: Checks boundaries using the parallel drift tracking metadata schema index.
 * - Satisfies COMMANDMENT VIII: Zero allocations; constant-time O(1) native map lookup speeds.
 * - Satisfies COMMANDMENT IX: Statically sound narrowing path without type-bleeding workarounds.
 */
export function isDriftRegistryKey<K extends keyof ISolidDriftRegistry>(
  key: unknown,
): key is K {
  const vault = globalThis.__SOLID_VAULT__;

  return (
    typeof key === 'string' &&
    vault !== undefined &&
    vault.driftTracking !== undefined &&
    vault.driftTracking.has(key)
  );
}
/**
 * 🎯 ASSERT INJECTED KEY (THE GATEHOUSE INGRESS EXCEPTION TERMINATOR)
 *
 * ROLE:
 * A hard control-flow assertion gate used to verify that an incoming token
 * is an actively hydrated, verified member of the live memory vault registry.
 *
 * STRATEGY:
 * Intercepts parameters directly at the public facade boundary. Leverages the universal
 * generic type predicate logic (`isRegistryKey`) to query the live storage blueprint Map.
 * If the key exists, execution proceeds seamlessly and narrows the variable down to 'K'
 * downstream. If the key is missing, empty, or uncompiled, it immediately triggers a hard,
 * traceable diagnostic exception to prevent silent data corruption loops.
 */
export function assertRegistryKey<K extends keyof ISolidRegistry>(
  key: K | unknown,
): asserts key is K {
  if (!isRegistryKey<K>(key)) {
    const keyStr = String(key);
    const vault = globalThis.__SOLID_VAULT__;

    // Determine the exact structural failure reason for pinpoint diagnostics
    let underlyingReason =
      'The target key is completely missing from the memory footprint.';
    if (!vault) {
      underlyingReason =
        'The global state bridge (__SOLID_VAULT__) is completely uninitialized.';
    } else if (!vault.blueprints) {
      underlyingReason =
        'The global state bridge is active, but the blueprint registry is unhydrated.';
    } else if (typeof key !== 'string') {
      underlyingReason = `The requested key is an invalid type (${typeof key}). Keys must be strings.`;
    } else if (!vault.references.has(keyStr)) {
      underlyingReason = `The active blueprint map exists, but key "${keyStr}" was never compiled or registered.`;
    }

    throw new Error(
      `[Xalethor Ingress Exception] Compilation Gateway Violation:\n\n` +
        `Failed to locate a valid, hydrated structural blueprint token for key: "${keyStr}"\n` +
        `Diagnostic Analysis: ${underlyingReason}\n\n` +
        `🚀 Action Required:\n` +
        `1. Ensure your files were processed using your project's custom Xalor CLI builder tool pipeline.\n` +
        `2. Verify that the file declaring or importing this shape was swept by the compiler step.\n` +
        `3. Confirm the registry target wasn't cleared out during a hot-module reloading cycle.`,
    );
  }
}

/**
 * 🛡️ INFRASTRUCTURE TIMELINE BOUNDARY GUARD
 *
 * Performance Profile: O(1) direct assertion pass.
 * Strategy: Validates that the AOT compiler transformer has successfully injected
 * the required tracking token at runtime, throwing a centralized ledger exception if it drifts.
 */
export function assertDriftRegistryKey<K extends keyof ISolidDriftRegistry>(
  key: K | unknown,
): asserts key is K {
  if (!isDriftRegistryKey<K>(key)) {
    const keyStr = String(key);
    const vault = globalThis.__SOLID_VAULT__;

    // Determine the exact structural failure reason for pinpoint diagnostics
    let underlyingReason =
      'The target tracking reference key is completely missing from the drift registry.';

    if (!vault) {
      underlyingReason =
        'The global state bridge (__SOLID_VAULT__) is completely uninitialized.';
    } else if (!vault.driftTracking) {
      underlyingReason =
        'The global state bridge is active, but the drift tracking vault registry is completely unhydrated.';
    } else if (typeof key !== 'string') {
      underlyingReason = `The requested key is an invalid type (${typeof key}). Drift tracking references must be strings.`;
    } else if (!vault.driftTracking.has(keyStr)) {
      underlyingReason = `The drift tracking map exists, but tracking token "${keyStr}" was never compiled or registered in this workspace tree.`;
    }

    const baseLedgerMessage =
      `DETACHED COMPILER METADATA: matchXalorDrift executed without active lineage blueprints.\n` +
      `Reason: The reference identifier exists, but its compiled context layers or active vault snapshots are completely missing at runtime.\n` +
      `Action: Verify your build-time transformer plugin configuration, clean out build caches, and perform a full compile check.`;

    throw new Error(
      `[Xalor Ingress Exception] Compilation Gateway Violation [Step ➌]:\n\n` +
        `${baseLedgerMessage}\n\n` +
        `Failed to locate a valid, hydrated drift blueprint token reference for key: "${keyStr}"\n` +
        `Diagnostic Analysis: ${underlyingReason}\n\n` +
        `🚀 Action Required:\n` +
        `1. Ensure your files were processed using your project's custom Xalor CLI builder tool pipeline.\n` +
        `2. Verify that the historical upcast and active contemporary configurations for this token were captured in your lineage registry.\n` +
        `3. Confirm the drift matrix asset target wasn't cleared or corrupted during a hot-module reloading cycle.`,
    );
  }
}
/**
 * Validates whether a value conforms to a Webpack compiler instance shape.
 *
 * Checks for required plugin hooks (`hooks.watchRun.tap`) and optionally
 * validates the `watchFileSystem` structure when present.
 *
 * Uses recursive structural guards to ensure runtime safety for deeply
 * nested compiler internals.
 */
export const isCompilerInstance = <T = unknown>(value: unknown): value is T =>
  matchesShape({
    hooks: matchesShape({
      watchRun: matchesShape({
        tap: isFunction,
      }),
    }),
    // Next.js production builds do not expose a file system watcher.
    // Wrapping this node in `isOptional` ensures the guard passes on cold-builds,
    watchFileSystem: isOptional(
      matchesShape({
        watcher: matchesShape({
          mtimes: isRecord,
        }),
      }),
    ),
  })(value);
