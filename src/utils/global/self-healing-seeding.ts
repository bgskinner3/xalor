import type { TSolidVaultMap } from '../../../shared';
import { ObjectUtils } from '../../../shared';
import { fsContext } from '../../../shared';
import { isBakedTripleKVShape } from '../../../shared';

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
    console.log(
      `\n\x1b[36m⚙️ [Xalor Vault] Self-Healing Bootloader triggered (Memory Re-Seeding Active)...\x1b[0m`,
    );
    //     // Dynamic, environment-immune path resolution anchored to executing module context
    // const currentModuleLoc = fsContext.getFileLoc(import.meta.url);

    const resolvedArtifactPath: string = fsContext.locateRuntimeArtifactPath(
      'xalor-vault.json',
      {
        targetSubDirs: ['dist', 'dist-xalor'],
      },
    );

    console.log(`   ↳ Active Workspace Working Dir: ${process.cwd()}`);
    console.log(`   ↳ Current Module Directory:      ${'dirname'}`);
    /* prettier-ignore */
    if (resolvedArtifactPath.length === 0 || !fsContext.fileExists(resolvedArtifactPath)) {
      console.warn(` ↳ \x1b[33m⚠️ Warning: xalor-vault.json target was not accessible. Leaving vault cold.\x1b[0m\n`);
      return;
    }

    /* prettier-ignore */ console.log(`   \x1b[32m✓ Absolute AOT file bridge located at: ${resolvedArtifactPath}\x1b[0m`);
    /* prettier-ignore */ console.log(`   ↳ Initiating synchronous text stream character bracket extraction pass...`);

    const fileContent = fsContext.readText(resolvedArtifactPath);
    const parsedVault: unknown = JSON.parse(fileContent);
    if (!parsedVault || !isBakedTripleKVShape(parsedVault)) {
      /* prettier-ignore */ console.warn(`   \x1b[33m⚠️ Warning: File contents read but structural JSON boundaries were invalid.\x1b[0m\n`);
      return;
    }

    const candidate = parsedVault;

    for (const [key, val] of ObjectUtils.entries(candidate.blueprints)) {
      targetVault.blueprints.set(key, val);
    }

    for (const [key, val] of ObjectUtils.entries(candidate.references)) {
      targetVault.references.set(key, val);
    }

    for (const [key, val] of ObjectUtils.entries(candidate.driftTracking)) {
      targetVault.driftTracking.set(key, val);
    }

    /* prettier-ignore */ console.log(`   \x1b[32m🎉 Success: In-memory global state bridge cleanly re-seeded!\x1b[0m`);
    /* prettier-ignore */ console.log(`   ↳ Instantiated: \x1b[35m${targetVault.blueprints.size}\x1b[0m unique AST blueprints into active memory.\n`);
  } catch (err) {
    /* prettier-ignore */ console.error(`   \x1b[31m🚨 Critical: AOT Bootloader encountered a blocking system evaluation or mapping failure:\x1b[0m`, err);
  }
}
