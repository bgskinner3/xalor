// transformer/cache-hydration/deployer.ts
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import { XalorRoutesService } from '../service';
import type { TXalorResolvedPaths } from '../../shared';
// 🪐 Safe ESM file coordinate parsing calculated ONCE at module level
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * deployBaselineInfrastructure
 * 🛡️ COLD-START FILESYSTEM SHIELD
 *
 * ROLE:
 * Guarantees all local workspace folders and baseline configuration templates
 * physically exist on disk before the compiler engine tries to execute file reads.
 */
export function deployBaseline(paths: TXalorResolvedPaths) {
  const { fileNames } = IS_SOLID_CONFIG_ITEMS;

  const packageDistDir = XalorRoutesService.getPackageRootDir(__dirname);

  /* prettier-ignore */
  const templateSourceDir = path.join(packageDistDir, 'static-templates');
  /* prettier-ignore */
  const templateSnapshotPath = path.join(templateSourceDir, fileNames.vaultFileName);

  if (!fs.existsSync(paths.cacheDir)) {
    try {
      fs.mkdirSync(paths.cacheDir, { recursive: true });
    } catch (error) {
      console.warn(
        '[xalor:boot]: Cold-Start Shield deployment exception:, ',
        error,
      );
      return;
    }
  }
  // COLD-START SEED PASS: Fall back to templates if the cache file is absent
  if (!fs.existsSync(paths.vaultFile)) {
    try {
      if (fs.existsSync(templateSnapshotPath)) {
        // Copy the pristine snapshot file into place natively
        fs.copyFileSync(templateSnapshotPath, paths.vaultFile);

        const srcDts = path.join(templateSourceDir, fileNames.bridgeTemplate);

        if (!fs.existsSync(paths.bridgeDir)) {
          fs.mkdirSync(paths.bridgeDir, { recursive: true });
        }

        if (fs.existsSync(srcDts)) {
          fs.copyFileSync(srcDts, paths.bridgeFile);
        }
      }
    } catch (error) {
      console.warn(
        '[xalor:boot]: Baseline templates initialization deferred:, ',
        error,
      );
    }
  }
}
