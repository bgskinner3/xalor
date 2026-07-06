import type {
  TTypeGuard,
  TSolidMetadata,
  TVaultSyncPayload,
  TTripleKV,
} from '../../types';
import { isObject, isKeyInObject, isRecord, matchesShape } from './objects';
import { isNull, isString, isFunction, isOptional } from './primitives';
import { XALOR_MATCH_ERROR_MESSAGES } from '../../../src/models';

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
 * IS_TRIPLE_KV_GUARD
 * ROLE: High-velocity boundary discriminator validating vault-snapshot.json schema integrity.
 * STRATEGY: Switchlessly examines top-level storage records point-free. Ensures absolute
 * structural presence of all database drawers before allowing downstream metrics processing.
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
export function isRegistryKey<K extends keyof ISolidRegistry>(
  key: unknown,
): key is K {
  const vault = globalThis.__SOLID_VAULT__;
  return (
    typeof key === 'string' &&
    vault !== undefined &&
    vault.blueprints !== undefined &&
    vault.blueprints.has(key)
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
    throw new Error(
      `[Xalor Ingress Exception] Compilation Gateway Violation:\n` +
        `The engine failed to locate a valid, hydrated structural blueprint token for key: "${String(key)}".\n` +
        `Verify that your background AST transformer is active and your files are swept by ts-patch.`,
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
    throw new Error(
      `[Xalor Ingress Exception] ${XALOR_MATCH_ERROR_MESSAGES.MISSING_COMPILED_INFRASTRUCTURE}\n` +
        `Received key context value: "${String(key)}"`,
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
