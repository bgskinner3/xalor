import { inflateAndNormalizeShape } from './support';
import type { TSolidMetadata } from '../types';
import { logDev } from '../utils';

/**
 * 🌿 PURE STREAMING HYDRATION ENGINE
 *
 * ROLE:
 * Decoupled, environment-agnostic blueprint processing loop.
 *
 * STRATEGY:
 * - Pure Function: Accepts a raw JSON content string instead of managing disk files.
 * - Inversion of Control: Accepts an `onSolidify` execution callback parameter.
 *   The caller decides if the data is assigned to compiler maps or runtime heaps.
 *
 * WHY:
 * Satisfies Commandment III and VIII. It performs memory-isolated parsing
 * without leaking file systems or runtime singletons into the shared space.
 */
// shared/genesis/hydrate-from-genesis.ts
export function processGenesisHydration(
  rawJsonContent: string,
  onSolidify: (metadata: TSolidMetadata) => void,
): void {
  try {
    const snapshot = JSON.parse(rawJsonContent);
    const blueprints = snapshot.blueprints || {};
    const nominalKeys = Object.keys(snapshot.references || blueprints);

    // 🔄 THE RECONSTRUCTION LOOP
    for (const key of nominalKeys) {
      if (key === 'Anonymous') continue;

      const shapeHash = snapshot.references ? snapshot.references[key] : key;
      const rawShape = blueprints[shapeHash];
      const manifest = snapshot.manifest?.[key];
      const registry = snapshot.registry?.[key];

      if (!rawShape) continue;

      // Unpack references using your pure recursor loop
      const fullyInflatedShape = inflateAndNormalizeShape(rawShape, blueprints);

      // 🚀 INVERSION TRIGGER: Fire the callback injected by the caller
      onSolidify({
        key,
        shape: fullyInflatedShape,
        area: manifest?.area ?? 'unknown:0:0',
        filePath: manifest?.filePath ?? 'unknown_file.ts',
        anchor: manifest?.anchor ?? '#call',
        symbolName: registry?.symbolName ?? 'unknown',
        typeName: registry?.typeName ?? '{ ... }',
        version: snapshot.version ?? '1.0.0',
      });
    }

    /* prettier-ignore */
    logDev(`[xalor:shared] 🌿 Hydration loop processed ${nominalKeys.length} type models into target memory map.`, { service: 'transformer/boot' });
  } catch (error) {
    /* prettier-ignore */
    logDev(`[xalor:shared] 🚨 Genesis Hydration structural parsing failed: ${error}`, { type: 'error', service: 'transformer/boot', override: true });
    // 🛡️ CRASH PROTECTION: We return cleanly instead of throwing a fatal process crash.
    // This allows the bootloader to gracefully recognize that the file was corrupted,
    // bypass the old records safely, and cleanly write a pristine replacement block on the next save cycle.
    return;
  }
}

/**
 *
 *
 * TODOL ==> ADDDD THIS FOR RUNTIME
 */
// /**
//  * ⚡ HYDRATE MEMORY VAULT FROM RUNTIME ASSET
//  *
//  * ROLE:
//  * Executes high-speed memory-to-memory hydration out of your pre-compiled,
//  * baked JavaScript data payload objects.
//  *
//  * STRATEGY:
//  * Uses Inversion of Control by leveraging your pure shared hydration engine!
//  */
// export function hydrateMemoryVault(bakedVault: TTripleKV): void {
//   const vault = ensureGlobalVault();

//   if (vault._isHydrated) return; // Prevent redundant initialization loops

//   try {
//     // Convert your baked vault data back into an industry-compliant JSON string wrapper,
//     // or pass it natively if your shared utility accepts parsed objects!
//     const rawContentString = JSON.stringify(bakedVault);

//     // Invoke your clean, stateless shared hydration engine pass natively in memory!
//     processGenesisHydration(rawContentString, (metadata) => {
//       vault.blueprints.set(metadata.key, metadata.shape);

//       vault.manifest.set(metadata.key, {
//         area: metadata.area,
//         filePath: metadata.filePath,
//       });

//       vault.registry.set(metadata.key, {
//         symbolName: metadata.symbolName,
//         typeName: metadata.typeName,
//       });
//     });

//     vault._isHydrated = true;
//     console.log(`⚡ [Xalor Runtime] Memory Vault successfully solidified with ${vault.blueprints.size} keys.`);
//   } catch (error) {
//     const errorMsg = error instanceof Error ? error.message : String(error);
//     console.warn(`[xalor] 👻 Runtime Hydration Bypassed: ${errorMsg}`);
//   }
// }
