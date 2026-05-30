import ts from 'typescript';
import { isUndefined } from '../../shared';
import { MODE_ENV_MUTATION_MAPPER, CLI_BOOTSTRAP_LOG_MAPPER } from '../models';
import type { TBootStrapEnvContext } from '../models';

/**
 * bootstrapEnvContext
 * 🪐 THE MASTER ENVIRONMENT MATRIX BOOTSTRAPPER
 *
 * ROLE:
 * Synchronizes process parameters, aligns process state flags,
 * verifies tsconfig presence, and logs environment status banners cleanly.
 */
export function bootstrapEnvContext(context: TBootStrapEnvContext): string {
  const { cliMode, projectRootPath } = context;

  // 1. Single-allocation template stream execution avoiding memory thrashing
  const initialLog = CLI_BOOTSTRAP_LOG_MAPPER[cliMode](projectRootPath);
  console.log(initialLog.trim());

  // 2. Coordinated process variable state synchronization block pass
  const envTargetChanges = MODE_ENV_MUTATION_MAPPER[cliMode];
  const targetKeys = Object.keys(envTargetChanges);
  const len = targetKeys.length;

  for (let i = 0; i < len; i++) {
    const variableKey = targetKeys[i];
    if (!isUndefined(variableKey)) {
      process.env[variableKey] = envTargetChanges[variableKey];
    }
  }

  // 3. Structural verification gate for the compilation architecture config map
  const configPath = ts.findConfigFile(
    projectRootPath,
    ts.sys.fileExists,
    'tsconfig.json',
  );

  if (isUndefined(configPath)) {
    /* prettier-ignore */
    console.error('❌ [Xalor CLI Error]: Unable to locate a valid tsconfig.json in project root.\n');

    // Safety fallback: hard kill state trackers to prevent subsequent compilation pass corruption
    process.env.XALOR_CLI_CLEAR = 'false';
    process.env.XALOR_CLI_WATCH = 'false';
    process.env.XALOR_CLI_COMPILE = 'false';

    process.exit(1);
  }

  return configPath;
}
