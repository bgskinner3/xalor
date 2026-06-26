import { XalethorService } from '../../src/xalor-service';
import type {
  TVaultSyncPayload,
  TSolidShape,
  TVaultDriftEntry,
} from '../../shared';

/**
 * 🧪 SEED TEST VAULT
 * Manually injects a type into the Vault so we can test
 * runtime logic without waiting for the Transformer.
 */
export function seedTestVault(
  key: string,
  shape: TSolidShape,
  overrides: Partial<TVaultSyncPayload> = {},
): TVaultSyncPayload {
  const mockPayload: TVaultSyncPayload = {
    key,
    shape,
    // 📍 Realistic defaults that mimic the Miner's GPS output
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

export function seedTestDriftVault(
  tokenKey: string,
  currentKey: string,
  ancestorKey?: string,
): TVaultDriftEntry {
  const mockEntry: TVaultDriftEntry = {
    currentKey,
    ancestorKey,
  };

  const manualDriftSnapshotBlock: Record<string, TVaultDriftEntry> = {
    [tokenKey]: mockEntry,
  };

  XalethorService.solidifyDrifts(manualDriftSnapshotBlock);

  return mockEntry;
}
