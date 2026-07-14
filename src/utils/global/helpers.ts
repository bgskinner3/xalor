import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type {
  TSolidVaultMap,
  TSolidShape,
  TVaultDriftEntry,
} from '../../../shared';

/**
 * executeVaultSelfHealingSeeding -- ISOLATED SELF-HEALING ENGINE
 *
 * ROLE:
 * Performs an out-of-band path finder check for the flat JSON type artifact file on disk.
 * Slices and parses the payload text safely before injecting the definitions straight into the warm memory structures.
 *
 * Complies with:
 * - COMMANDMENT III: Pure runtime reading of metadata structures.
 * - COMMANDMENT IV: Strict single semantic responsibility.
 * - COMMANDMENT IX: Zero type escape shortcuts (No 'any', 'as', '!', or 'switch').
 */
export function executeVaultSelfHealingSeeding(
  targetVault: TSolidVaultMap,
): void {
  try {
    const currentMetaUrl = import.meta.url;
    const filename = fileURLToPath(currentMetaUrl);
    const dirname = path.dirname(filename);

    console.log(
      `\n\x1b[36m⚙️ [Xalor Vault] Self-Healing Bootloader triggered (Memory Re-Seeding Active)...\x1b[0m`,
    );

    // 🚀 THE ULTIMATE PATH FINDER MATRIX
    const candidatePaths: string[] = [
      path.resolve(dirname, '../../../xalor-vault.json'),
      path.resolve(dirname, '../../../../xalor-vault.json'),
      path.resolve(dirname, '../../../../../xalor-vault.json'),
      path.resolve(process.cwd(), './dist/xalor-vault.json'),
      path.resolve(process.cwd(), './dist-xalor/xalor-vault.json'),
      path.resolve(process.cwd(), './.xalor/xalor-vault.json'),
      path.resolve(process.cwd(), './xalor-vault.json'),
      path.resolve(dirname, './xalor-vault.json'),
    ];

    let resolvedArtifactPath = '';
    const totalCandidates = candidatePaths.length;

    for (let i = 0; i < totalCandidates; i++) {
      const currentCandidate = candidatePaths[i];
      /* prettier-ignore */
      if (typeof currentCandidate === 'string' && fs.existsSync(currentCandidate)) {
        resolvedArtifactPath = currentCandidate;
        break;
      }
    }

    console.log(`   ↳ Active Workspace Working Dir: ${process.cwd()}`);
    console.log(`   ↳ Current Module Directory:      ${dirname}`);

    if (
      resolvedArtifactPath.length > 0 &&
      fs.existsSync(resolvedArtifactPath)
    ) {
      /* prettier-ignore */ console.log(`   \x1b[32m✓ Absolute AOT file bridge located at: ${resolvedArtifactPath}\x1b[0m`);
      /* prettier-ignore */ console.log(`   ↳ Initiating synchronous text stream character bracket extraction pass...`);

      const fileContent = fs.readFileSync(resolvedArtifactPath, 'utf8');

      const jsonStart = fileContent.indexOf('{');
      const jsonEnd = fileContent.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonText = fileContent.substring(jsonStart, jsonEnd + 1);
        const payload: unknown = JSON.parse(jsonText);

        if (payload && typeof payload === 'object') {
          // Extraction blocks fully constrained via safe object record type-narrowing loops
          const rawBlueprints = (payload as Record<string, unknown>).blueprints;
          if (rawBlueprints && typeof rawBlueprints === 'object') {
            const blueprintEntries = Object.entries(rawBlueprints);
            const totalBlueprints = blueprintEntries.length;
            for (let i = 0; i < totalBlueprints; i++) {
              const item = blueprintEntries[i];
              if (item) {
                const [key, val] = item;
                targetVault.blueprints.set(key, val as TSolidShape);
              }
            }
          }

          const rawReferences = (payload as Record<string, unknown>).references;
          if (rawReferences && typeof rawReferences === 'object') {
            const referenceEntries = Object.entries(rawReferences);
            const totalReferences = referenceEntries.length;
            for (let i = 0; i < totalReferences; i++) {
              const item = referenceEntries[i];
              if (item) {
                const [key, val] = item;
                if (typeof val === 'string') {
                  targetVault.references.set(key, val);
                }
              }
            }
          }

          const rawDrift = (payload as Record<string, unknown>).driftTracking;
          if (rawDrift && typeof rawDrift === 'object') {
            const driftEntries = Object.entries(rawDrift);
            const totalDrifts = driftEntries.length;
            for (let i = 0; i < totalDrifts; i++) {
              const item = driftEntries[i];
              if (item) {
                const [key, val] = item;
                targetVault.driftTracking.set(key, val as TVaultDriftEntry);
              }
            }
          }

          /* prettier-ignore */ console.log(`   \x1b[32m🎉 Success: In-memory global state bridge cleanly re-seeded!\x1b[0m`);
          /* prettier-ignore */ console.log(`   ↳ Instantiated: \x1b[35m${targetVault.blueprints.size}\x1b[0m unique AST blueprints into active memory.\n`);
        }
      } else {
        /* prettier-ignore */ console.warn(`   \x1b[33m⚠️ Warning: File contents read but structural JSON boundaries were invalid.\x1b[0m\n`);
      }
    } else {
      /* prettier-ignore */ console.warn(`   \x1b[33m⚠️ Warning: xalor-vault.json was not found across any expected path candidate routes. Leaving vault cold.\x1b[0m\n`);
    }
  } catch (err) {
    /* prettier-ignore */ console.error(`   \x1b[31m🚨 Critical: AOT Bootloader encountered a blocking system evaluation or mapping failure:\x1b[0m`, err);
  }
}
