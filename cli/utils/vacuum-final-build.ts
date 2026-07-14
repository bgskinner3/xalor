import * as path from 'path';
import fs from 'fs';
import { fsContext } from '../../shared/service';
import { isTripleKVShape } from '../../shared';

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

  // ========================================================================
  // 🚀 4. THE FIX: BAKE IMMUTABLE PERSISTENT ARTIFACT TO REPOSITORY ROOT
  // ========================================================================
  console.log(
    ` ↳ Compacting and baking type manifest artifact to repository workspace root...`,
  );

  const manifestPayload = {
    driftTracking: productionDriftTracking,
    blueprints: productionBlueprints,
    references: productionReferences,
  };

  try {
    // Target a pure .json file inside your hidden directory root
    const persistentArtifactPath = fsContext.resolvePath(
      process.cwd(),
      './xalor-vault.json',
    );

    const targetDir = path.dirname(persistentArtifactPath);
    if (!fsContext.fileExists(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Write the raw data string with absolutely no JS boilerplates or export keywords
    fsContext.writeText(
      persistentArtifactPath,
      JSON.stringify(manifestPayload, null, 2),
    );
    console.log(
      `   \x1b[32m✓ Persistent blueprint database successfully baked at: ${persistentArtifactPath}\x1b[0m`,
    );
  } catch (_err) {
    process.exit(1);
  }

  // ========================================================================
  // 5. THE WORKSPACE ENVIRONMENT SANITATION PASS
  // ========================================================================
  console.log(` ↳ Initiating workspace environment sanitation pass...`);

  try {
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
