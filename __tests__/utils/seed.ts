import { XalethorService } from '../../src/xalor-service';
import type {
  TVaultSyncPayload,
  TSolidShape,
  TVaultDriftEntry,
} from '../../shared';

/**
 * 🧪 SEED TEST VAULT
 *
 * ROLE:
 * Manually injects type blueprints directly into the global environment
 * using Strategy A (References + Blueprints) to allow runtime parsing tests
 * to execute identically to your compiled production binaries.
 */
export function seedTestVault(
  key: string,
  shape: TSolidShape,
  overrides: Partial<TVaultSyncPayload> = {},
): TVaultSyncPayload {
  // 1. Instantiate the global container singleton structure if it hasn't booted yet
  if (!globalThis.__SOLID_VAULT__) {
    globalThis.__SOLID_VAULT__ = {
      references: new Map(),
      blueprints: new Map(),
      driftTracking: new Map(),
    };
  }

  // 2. Derive a clean, deterministic content-addressable hash key for this layout
  const uniqueCasHash = `sh_${key.toLowerCase()}`;

  // Keep your legacy service hydration layers active to preserve auxiliary metadata metrics
  const mockPayload: TVaultSyncPayload = {
    key,
    reference: uniqueCasHash,
    shape,
    area: overrides.area ?? `__tests__/runtime/operations/is-xalor.test.ts:1:1`,
    filePath:
      overrides.filePath ?? `__tests__/runtime/operations/is-xalor.test.ts`,
    symbolName:
      overrides.symbolName ?? `T${key.charAt(0) + key.slice(1).toLowerCase()}`,
    typeName: overrides.typeName ?? '{ ... }',
    version: '1.0.0',
    anchor: overrides?.anchor ?? '',
    ...overrides,
  };

  XalethorService.solidify(mockPayload);
  return mockPayload;
}

/**
 * 🧪 SEED TEST DRIFT VAULT
 */
export function seedTestDriftVault(
  tokenKey: string,
  currentKey: string,
  ancestorKey?: string,
): TVaultDriftEntry {
  if (!globalThis.__SOLID_VAULT__) {
    globalThis.__SOLID_VAULT__ = {
      references: new Map(),
      blueprints: new Map(),
      driftTracking: new Map(),
    };
  }

  const mockEntry: TVaultDriftEntry = { currentKey, ancestorKey };

  // Directly attach the schema evolutions tracking logs to global memory
  globalThis.__SOLID_VAULT__.driftTracking[tokenKey] = mockEntry;

  const manualDriftSnapshotBlock: Record<string, TVaultDriftEntry> = {
    [tokenKey]: mockEntry,
  };
  XalethorService.solidifyDrifts(manualDriftSnapshotBlock);
  return mockEntry;
}
// import { XalethorService } from '../../src/xalor-service';
// import type {
//   TVaultSyncPayload,
//   TSolidShape,
//   TVaultDriftEntry,
// } from '../../shared';

// /**
//  * 🧪 SEED TEST VAULT
//  * Manually injects a type into the Vault so we can test
//  * runtime logic without waiting for the Transformer.
//  */
// export function seedTestVault(
//   key: string,
//   shape: TSolidShape,
//   overrides: Partial<TVaultSyncPayload> = {},
// ): TVaultSyncPayload {
//   const mockPayload: TVaultSyncPayload = {
//     key,
//     shape,
//     // 📍 Realistic defaults that mimic the Miner's GPS output
//     area: overrides.area ?? `__tests__/runtime/operations/is-xalor.test.ts:1:1`,
//     filePath:
//       overrides.filePath ?? `__tests__/runtime/operations/is-xalor.test.ts`,
//     symbolName:
//       overrides.symbolName ?? `T${key.charAt(0) + key.slice(1).toLowerCase()}`,
//     typeName: overrides.typeName ?? '{ ... }',
//     version: '1.0.0',
//     anchor: overrides?.anchor ?? '',
//     ...overrides,
//   };

//   XalethorService.solidify(mockPayload);

//   return mockPayload;
// }

// export function seedTestDriftVault(
//   tokenKey: string,
//   currentKey: string,
//   ancestorKey?: string,
// ): TVaultDriftEntry {
//   const mockEntry: TVaultDriftEntry = {
//     currentKey,
//     ancestorKey,
//   };

//   const manualDriftSnapshotBlock: Record<string, TVaultDriftEntry> = {
//     [tokenKey]: mockEntry,
//   };

//   XalethorService.solidifyDrifts(manualDriftSnapshotBlock);

//   return mockEntry;
// }
