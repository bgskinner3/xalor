// transformer/cache-hydration/deployer.ts
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
import type { TXalorResolvedPaths } from '../../shared';
import { TransformerReportService } from '../error';
import { XalorRoutesService } from '../service';
// 🪐 Safe ESM file coordinate parsing calculated ONCE at module level
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * deployBaselineInfrastructure
 * COLD-START FILESYSTEM SHIELD
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
  const mode = XalorRoutesService.xalorCLIMode();
  if (!fs.existsSync(paths.cacheDir)) {
    try {
      fs.mkdirSync(paths.cacheDir, { recursive: true });
    } catch (error: unknown) {
      TransformerReportService.logAnomaly({
        keyName: 'COLD_START_INFRASTRUCTURE_FAULT',
        fileLocation: paths.cacheDir,
        error,
        mode: mode,
      });
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
    } catch (error: unknown) {
      TransformerReportService.logAnomaly({
        keyName: 'TEMPLATE_SEED_FAULT',
        fileLocation: paths.vaultFile,
        error,
        mode: mode,
      });
    }
  }
}
