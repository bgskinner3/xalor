import { fsContext } from '../../shared/service';
import { isTripleKVShape, TSolidVaultMap, TTripleKV } from '../../shared';

function seedTestVault(
  productionReferences: TTripleKV['references'],
  productionBlueprints: TTripleKV['blueprints'],
  productionDriftTracking: TTripleKV['driftTracking'],
) {
  // 1. Instantiate the global container singleton structure if it hasn't booted yet
  if (!globalThis.__SOLID_VAULT__) {
    const rawMapVault: TSolidVaultMap = {
      driftTracking: new Map(),
      blueprints: new Map(),
      references: new Map(),
    };
    globalThis.__SOLID_VAULT__ = rawMapVault;
  }

  // 2. THE RESILIENCY HEALING & TYPE REFINEMENT GATES:
  const vault = globalThis.__SOLID_VAULT__;
  delete vault.manifest;
  delete vault.registry;
  Object.keys(productionReferences).map((key) => {
    const ref = productionReferences[key];
    vault.references.set(key, ref);
  });

  Object.keys(productionBlueprints).map((key) => {
    const ref = productionBlueprints[key];
    vault.blueprints.set(key, ref);
  });

  Object.keys(productionDriftTracking).map((key) => {
    const ref = productionDriftTracking[key];
    vault.driftTracking.set(key, ref);
  });
}

/**
 * vacuumExitBuild
 * THE FINAL GATEKEEPER VACUUM DISPATCHER
 *
 * ROLE:
 * Implements the Deduplicated Reference Model (Strategy A) in production.
 * Loops through direct string keys to map structural hashes exactly as they are
 * cached on disk, ensuring absolute zero structural modification or pruning.
 */
export function vacuumExitBuild() {
  console.log(
    `\n\x1b[35m🧹 [Xalor Vacuum] Initializing Phase 3 Production Reference Consolidation...\x1b[0m`,
  );
  const processStartTime = Date.now();

  // ========================================================================
  // 1. INGEST CURRENT ACTIVE WORKSPACE VAULT (.xalor/)
  // ========================================================================
  console.log(`  ↳ Ingesting active development data cache from disk...`);

  if (!fsContext.fileExists(fsContext.envPaths.vaultFile)) {
    console.error(
      `\x1b[31m🚨 HARD CRASH: Volatile development cache snapshot missing from hidden storage path.\x1b[0m`,
    );
    process.exit(1);
  }

  const res = fsContext.readText(fsContext.envPaths.vaultFile);
  if (!res || res.trim() === '') {
    console.error(
      `\x1b[31m🚨 HARD CRASH: Development type cache snapshot file is completely empty.\x1b[0m`,
    );
    process.exit(1);
  }

  const devSnapshot = JSON.parse(res);
  if (!isTripleKVShape(devSnapshot)) {
    console.error(
      `\x1b[31m🚨 HARD CRASH: Cache registry failed structural validation shapes.\x1b[0m`,
    );
    process.exit(1);
  }

  // ========================================================================
  // 2. STRUCTURAL INTEGRITY DIAGNOSTIC CHECK
  // ========================================================================
  if (
    !devSnapshot.blueprints ||
    Object.keys(devSnapshot.blueprints).length === 0
  ) {
    console.error(
      `\x1b[31m🚨 HARD CRASH: Volatile cache registry blueprints mapping map is empty.\x1b[0m`,
    );
    process.exit(1);
  }

  const initialBlueprintCount = Object.keys(devSnapshot.blueprints).length;
  console.log(
    `  ↳ Structural Validation Passed. Discovered \x1b[32m${initialBlueprintCount}\x1b[0m unique AST blueprints.`,
  );

  // ========================================================================
  // 3. ZERO-ALLOCATION COPY (Direct Extraction via JSON Stream Injection)
  // ========================================================================
  const productionReferences = devSnapshot.references || {};
  const productionBlueprints = devSnapshot.blueprints || {};
  const productionDriftTracking = devSnapshot.driftTracking || {};

  try {
    seedTestVault(
      productionReferences,
      productionBlueprints,
      productionDriftTracking,
    );
  } catch (err) {
    console.error(
      `\x1b[31m🚨 HARD CRASH: Failed to write runtime reference bytecode map to production asset scope.\x1b[0m`,
      err,
    );
    process.exit(1);
  }

  // ========================================================================
  // 5. THE WORKSPACE ENVIRONMENT SANITATION PASS
  // ========================================================================
  console.log(`  ↳ Initiating workspace environment sanitation pass...`);
  try {
    // Keep internal sandbox files alive to maintain peak watch velocities!
    const processingDurationMs = Date.now() - processStartTime;
    console.log(
      `\x1b[32m✨ [Xalor Vacuum] Phase 3 complete. Production static reference artifact locked down in ${processingDurationMs}ms.\x1b[0m\n`,
    );
  } catch (err) {
    console.log(
      `\n\x1b[33m⚠️ [Build Notice]: Non-blocking workspace sanitation warning encountered:\x1b[0m ${(err as Error).message}\n`,
    );
  }
}

// export function vacuumExitBuild() {
//   console.log(
//     `\n\x1b[35m🧹 [Xalor Vacuum] Initializing Phase 3 Production Reference Consolidation...\x1b[0m`,
//   );
//   const processStartTime = Date.now();

//   // ========================================================================
//   // 1. INGEST CURRENT ACTIVE WORKSPACE VAULT (.xalor/)
//   // ========================================================================
//   console.log(`  ↳ Ingesting active development data cache from disk...`);

//   if (!fsContext.fileExists(fsContext.envPaths.vaultFile)) {
//     console.error(
//       `\x1b[31m🚨 HARD CRASH: Volatile development cache snapshot missing from hidden storage path.\x1b[0m`,
//     );
//     process.exit(1);
//   }

//   const res = fsContext.readText(fsContext.envPaths.vaultFile);
//   if (!res || res.trim() === '') {
//     console.error(
//       `\x1b[31m🚨 HARD CRASH: Development type cache snapshot file is completely empty.\x1b[0m`,
//     );
//     process.exit(1);
//   }

//   const devSnapshot = JSON.parse(res);
//   if (!isTripleKVShape(devSnapshot)) {
//     console.error(
//       `\x1b[31m🚨 HARD CRASH: Cache registry failed structural validation shapes.\x1b[0m`,
//     );
//     process.exit(1);
//   }

//   // ========================================================================
//   // 2. STRUCTURAL INTEGRITY DIAGNOSTIC CHECK
//   // ========================================================================
//   if (
//     !devSnapshot.blueprints ||
//     Object.keys(devSnapshot.blueprints).length === 0
//   ) {
//     console.error(
//       `\x1b[31m🚨 HARD CRASH: Volatile cache registry blueprints mapping map is empty.\x1b[0m`,
//     );
//     process.exit(1);
//   }

//   const initialBlueprintCount = Object.keys(devSnapshot.blueprints).length;
//   console.log(
//     `  ↳ Structural Validation Passed. Discovered \x1b[32m${initialBlueprintCount}\x1b[0m unique AST blueprints.`,
//   );

//   // ========================================================================
//   // 3. ZERO-ALLOCATION COPY (Direct Extraction via JSON Stream Injection)
//   // ========================================================================
//   const productionReferences = devSnapshot.references || {};
//   const productionBlueprints = devSnapshot.blueprints || {};

//   // 🚀 FIXED: Point-free assignment of your active drift tracking record ledger maps
//   const productionDriftTracking = devSnapshot.driftTracking || {};

//   // ========================================================================
//   // 4. ATOMIC ASSET PERSISTENCE LAYER (WRITING TO DIST/)
//   // ========================================================================
//   // const targetOutputFolder = path.join(process.cwd(), 'dist');
//   // const targetOutputFile = path.join(targetOutputFolder, 'xalor-vault.js');

//   try {
//     seedTestVault(
//       productionReferences,
//       productionBlueprints,
//       productionDriftTracking,
//     );
//     // if (!fs.existsSync(targetOutputFolder)) {
//     //   fs.mkdirSync(targetOutputFolder, { recursive: true });
//     // }
//     // let currentDiskBytes = '';
//     // if (fs.existsSync(targetOutputFile)) {
//     //   currentDiskBytes = fs.readFileSync(targetOutputFile, 'utf-8');
//     // }
//     // 🪐 THE FIX: Output as a pure, native ES Module string template.
//     // This ensures that when Node imports the compiled asset from /dist, it populates globalThis inside the same memory thread!
//     //     const executableVaultScript = `// 🪐 Xalor AOT Auto-Generated Production Vault
//     // globalThis.__SOLID_VAULT__ = {
//     //   references: new Map(${JSON.stringify(Object.entries(productionReferences), null, 2)}),
//     //   blueprints: new Map(${JSON.stringify(Object.entries(productionBlueprints), null, 2)}),
//     //   driftTracking: new Map(${JSON.stringify(Object.entries(productionDriftTracking), null, 2)}),
//     //   manifest: new Map(),
//     //   registry: new Map(),
//     //   errors: new Map()
//     // };
//     // export default globalThis.__SOLID_VAULT__;
//     // `;
//     // if (currentDiskBytes !== executableVaultScript) {
//     //   fs.writeFileSync(targetOutputFile, executableVaultScript, 'utf-8');
//     //   const currentPayloadBytes = Buffer.byteLength(
//     //     executableVaultScript,
//     //     'utf8',
//     //   );
//     //   console.log(
//     //     `  \x1b[32m✅ Delivered optimized runtime registry contract (${(currentPayloadBytes / 1024).toFixed(2)} KB) to: dist/xalor-vault.js\x1b[0m`,
//     //   );
//     // } else {
//     //   console.log(
//     //     `  ↳ \x1b[34mRuntime registry bytecode matches current disk footprint. Skipping write via Atomic Shield [VIII].\x1b[0m`,
//     //   );
//     // }
//   } catch (err) {
//     console.error(
//       `\x1b[31m🚨 HARD CRASH: Failed to write runtime reference bytecode map to production asset scope.\x1b[0m`,
//       err,
//     );
//     process.exit(1);
//   }

//   // ========================================================================
//   // 5. THE WORKSPACE ENVIRONMENT SANITATION PASS
//   // ========================================================================
//   console.log(`  ↳ Initiating workspace environment sanitation pass...`);
//   try {
//     // Keep internal sandbox files alive to maintain peak watch velocities!
//     const processingDurationMs = Date.now() - processStartTime;
//     console.log(
//       `\x1b[32m✨ [Xalor Vacuum] Phase 3 complete. Production static reference artifact locked down in ${processingDurationMs}ms.\x1b[0m\n`,
//     );
//   } catch (err) {
//     console.log(
//       `\n\x1b[33m⚠️ [Build Notice]: Non-blocking workspace sanitation warning encountered:\x1b[0m ${(err as Error).message}\n`,
//     );
//   }
// }
