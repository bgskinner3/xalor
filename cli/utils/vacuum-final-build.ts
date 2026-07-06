import * as fs from 'fs';
import * as path from 'path';
import { fsContext } from '../../shared/service';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import { createDefaultTemplate } from './audit-service';

/**
 * VacuumExitBuild
 * THE FINAL GATEKEEPER VACUUM DISPATCHER
 *
 * ROLE: Executes out-of-band telemetry pruning and workspace cleanup before process exit.
 */
export function VacuumExitBuild(projectRootPath: string) {
  const { fileNames } = IS_SOLID_CONFIG_ITEMS;
  /* prettier-ignore */ const devSnapshot = fsContext.ingestVaultSnapshotFromDiskSync();
  /* prettier-ignore */ const productionVault = createDefaultTemplate<'vacuumFinalBuildDist'>('vacuumFinalBuildDist');

  /* prettier-ignore */
  if (!devSnapshot || !devSnapshot.blueprints || Object.keys(devSnapshot.blueprints).length === 0) {
    console.error('🚨 HARD CRASH: Volatile cache registry is missing, empty, or failed structural validation.');
    process.exit(1);
  }
  /// add data
  productionVault.blueprints = devSnapshot.blueprints;
  productionVault.references = devSnapshot.references;
  productionVault.driftTracking = devSnapshot.driftTracking;
  productionVault.version = devSnapshot.version;

  const vacuumedPayloadString = JSON.stringify(productionVault);

  /* prettier-ignore */ const targetOutputFolder = path.resolve(projectRootPath, './src');
  /* prettier-ignore */ const targetOutputFile = path.resolve(targetOutputFolder, fileNames.generatedFinalBuild);

  try {
    if (!fs.existsSync(targetOutputFolder)) {
      fs.mkdirSync(targetOutputFolder, { recursive: true });
    }

    // Inspect current bytes to suppress unnecessary loop churn and bundler HMR triggers [Commandment VIII]
    let currentDiskBytes = '';
    if (fs.existsSync(targetOutputFile)) {
      currentDiskBytes = fs.readFileSync(targetOutputFile, 'utf-8');
    }

    if (currentDiskBytes !== vacuumedPayloadString) {
      fs.writeFileSync(targetOutputFile, vacuumedPayloadString, 'utf-8');
      /* prettier-ignore */ console.log('   ↳ Delivered optimized runtime registry contract to: src/xalor-vault.generated.json');
    } else {
      /* prettier-ignore */ console.log('   ↳ Runtime registry bytes identical. Skipping disk rewrite via Atomic Shield.');
    }
  } catch (err) {
    /* prettier-ignore */ console.error('🚨 HARD CRASH: Failed to write runtime bytecode map to production asset scope.', err);
    process.exit(1);
  }

  // 4. THE MULTI-TARGET WORKSPACE PURGE (Eliminate developer-only configuration baggage)
  try {
    // A. Wipe the local Intellisense Ghost folder completely from the workspace root using your service parameters
    const ghostBridgeFolder = fsContext.envPaths.bridgeDir;
    if (fsContext.fileExists(ghostBridgeFolder)) {
      fs.rmSync(ghostBridgeFolder, { recursive: true, force: true });
      /* prettier-ignore */ console.log(`   ↳ Cleanly unlinked ./${fsContext.fileNames.intelFolderName} Intellisense Ghost Bridge folder.`);
    }

    // B. Wipe the optional baseline tracking JSON log file from the cache directory using service paths
    const baselineTrackingLog = fsContext.envPaths.baselineFile;
    if (fsContext.fileExists(baselineTrackingLog)) {
      fs.unlinkSync(baselineTrackingLog);
      /* prettier-ignore */ console.log('   ↳ Purged temporary historical tracking baseline asset from cache.');
    }
  } catch (err) {
    // We treat file cleanups as warnings rather than hard crashes to prevent blocking CI/CD
    // deployments on unexpected container system user-permission lock scenarios.
    /* prettier-ignore */ console.log(`⚠️  [Build Notice]: Non-blocking file cleanup warning encountered: ${(err as Error).message}`);
  }
}
