import * as fs from 'fs';
import * as path from 'path';
import { fsContext } from '../../shared/service';
import { IS_SOLID_CONFIG_ITEMS, isTripleKVShape } from '../../shared';
import { createDefaultTemplate } from './audit-service';
// import type { TTripleKV } from '../../shared';
/**
 * VacuumExitBuild
 * THE FINAL GATEKEEPER VACUUM DISPATCHER
 *
 * ROLE: Executes out-of-band telemetry pruning and workspace cleanup before process exit.
 */
export function vacuumExitBuild(projectRootPath: string) {
  const { fileNames } = IS_SOLID_CONFIG_ITEMS;
  // const paths = resolveXalorPaths();
  // paths.vaultFile;
  console.log(
    `\n\x1b[35m🧹 [Xalor Vacuum] Initializing Phase 2 Final Build Payload Consolidation...\x1b[0m`,
  );
  const processStartTime = Date.now();

  // 1. Ingest volatile development telemetry maps from disk
  console.log(` ↳ Ingesting active development data cache from disk...`);
  /* prettier-ignore */
  // const devSnapshot = await fsContext.asyncReadText(fsContext.envPaths.vaultFile);
  const res = fsContext.readText(fsContext.envPaths.vaultFile);
  const devSnapshot = JSON.parse(res);
  console.log(devSnapshot, 'HERREREEE');
  console.dir(devSnapshot, {
    depth: null,
    colors: true,
  });
  if (!isTripleKVShape(devSnapshot)) return;
  // Debug Log: Dump raw data stream for immediate Alpha testing inspection [VIII]
  // if (process.env.XALOR_DEBUG === 'true') {
  //   console.log(
  //     `\n\x1b[33m🐛 [Xalor Debug Dump] Raw Dev Snapshot Payload Map:\x1b[0m`,
  //   );
  //   console.log(devSnapshot);
  //   console.log(
  //     `\x1b[33m--------------------------------------------------\x1b[0m\n`,
  //   );
  // }

  // 2. Validate structural integrity of the collected type graph
  /* prettier-ignore */
  if (!devSnapshot || !devSnapshot.blueprints || Object.keys(devSnapshot.blueprints).length === 0) {
    console.error(`\x1b[31m🚨 HARD CRASH: Volatile cache registry is missing, empty, or failed structural validation.\x1b[0m`);
    console.error(` 👉 Context: Verify that your single-pass 'INGEST_REGISTRY' compilation pass discovered valid types.\n`);
    process.exit(1);
  }

  const initialBlueprintCount = Object.keys(devSnapshot.blueprints).length;
  console.log(
    ` ↳ Structural Validation Passed. Discovered \x1b[32m${initialBlueprintCount}\x1b[0m active type contracts.`,
  );
  // paths.vaultFile
  // 3. Instantiate the production template and map across variables point-free [IX]
  /* prettier-ignore */
  const productionVault = createDefaultTemplate<'vacuumFinalBuildDist'>('vacuumFinalBuildDist');

  console.log(
    ` ↳ Executing Client Shedding: Stripping development telemetry tokens...`,
  );
  productionVault.blueprints = devSnapshot.blueprints;
  productionVault.references = devSnapshot.references;
  productionVault.driftTracking = devSnapshot.driftTracking;
  productionVault.version = devSnapshot.version;

  const vacuumedPayloadString = JSON.stringify(productionVault);
  const currentPayloadBytes = Buffer.byteLength(vacuumedPayloadString, 'utf8');

  /* prettier-ignore */
  const targetOutputFolder = path.resolve(projectRootPath, './src');
  /* prettier-ignore */
  const targetOutputFile = path.resolve(targetOutputFolder, fileNames.generatedFinalBuild);

  // 4. Atomic Asset Materialization Loop
  try {
    if (!fs.existsSync(targetOutputFolder)) {
      console.log(
        ` ↳ Output directory missing. Creating target folder: \x1b[2msrc/\x1b[0m`,
      );
      fs.mkdirSync(targetOutputFolder, { recursive: true });
    }

    // Inspect current bytes to suppress unnecessary loop churn and bundler HMR triggers [Commandment VIII]
    let currentDiskBytes = '';
    if (fs.existsSync(targetOutputFile)) {
      currentDiskBytes = fs.readFileSync(targetOutputFile, 'utf-8');
    }
    console.log(currentDiskBytes, 'currentDiskBytes');
    if (currentDiskBytes !== vacuumedPayloadString) {
      fs.writeFileSync(targetOutputFile, vacuumedPayloadString, 'utf-8');
      /* prettier-ignore */
      console.log(` \x1b[32m✅ Delivered optimized runtime registry contract (${(currentPayloadBytes / 1024).toFixed(2)} KB) to: src/${fileNames.vaultFileName}\x1b[0m`);
    } else {
      /* prettier-ignore */
      console.log(` ↳ \x1b[34mRuntime registry bytecode matches current disk footprint. Skipping write via Atomic Shield [VIII].\x1b[0m`);
    }
  } catch (err) {
    /* prettier-ignore */
    console.error(`\x1b[31m🚨 HARD CRASH: Failed to write runtime bytecode map to production asset scope.\x1b[0m`, err);
    process.exit(1);
  }

  // 5. THE MULTI-TARGET WORKSPACE PURGE (Eliminate developer-only configuration baggage)
  console.log(` ↳ Initiating workspace environment sanitization pass...`);
  try {
    // A. Wipe the local Intellisense Ghost folder completely from the workspace root
    const ghostBridgeFolder = fsContext.envPaths.bridgeDir;
    if (fsContext.fileExists(ghostBridgeFolder)) {
      fs.rmSync(ghostBridgeFolder, { recursive: true, force: true });
      /* prettier-ignore */
      console.log(`   ↳ Cleanly unlinked local ./${fsContext.fileNames.intelFolderName} Intellisense Ghost Bridge folder.`);
    }

    // B. Wipe the optional baseline tracking JSON log file from the cache directory
    const baselineTrackingLog = fsContext.envPaths.baselineFile;
    if (fsContext.fileExists(baselineTrackingLog)) {
      fs.unlinkSync(baselineTrackingLog);
      /* prettier-ignore */
      console.log(`   ↳ Purged temporary historical tracking baseline asset from development cache.`);
    }

    const processingDurationMs = Date.now() - processStartTime;
    console.log(
      `\x1b[32m✨ [Xalor Vacuum] Stage 2 cleanup complete. Production static artifact locked down in ${processingDurationMs}ms.\x1b[0m\n`,
    );
  } catch (err) {
    // We treat file cleanups as warnings rather than hard crashes to prevent blocking CI/CD
    // deployments on unexpected container system user-permission lock scenarios.
    /* prettier-ignore */
    console.log(`\n\x1b[33m⚠️  [Build Notice]: Non-blocking workspace sanitation warning encountered:\x1b[0m ${(err as Error).message}\n`);
  }
}
