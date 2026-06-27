import type { TCLIFlags } from '../../shared';
import {
  isWatchMode,
  isVacuumMode,
  isAuditMode,
  isCompileMode,
  isStudioMode,
  isClearMode,
  CLI_MODE_FLAGS_MAPPER,
  ALL_CLI_FLAGS,
  isValidCLIFlagGuard,
} from '../../shared/cli-domain';
import { yieldItems, ObjectUtils } from '../../shared/utils';
import type { ICLIConfig, TCLICommandsControl } from '../models';
import { MODE_SYSTEM_EVALUATORS } from '../models/constants';

/**
 * buildInitialFlagsLedger
 *
 * It constructs a flat JavaScript object where every known flag key is
 * assigned a baseline value of false
 *
 * ```json
 *  {
 *    "fix": false,
 *    "json": false,
 *    ....
 *  }
 *
 * ```
 *
 */
function buildInitialFlagsLedger(): Record<TCLIFlags, boolean> {
  const flagsLedger = {} as Record<TCLIFlags, boolean>;
  const len = ALL_CLI_FLAGS.length;

  for (let i = 0; i < len; i++) {
    flagsLedger[ALL_CLI_FLAGS[i]] = false;
  }

  return Object.freeze(flagsLedger);
}

/**
 * SANITIZE FLAGS
 * ROLE: Standalone parameter shielding utility that sanitizes dynamic CLI argument configurations.
 * STRATEGY: Filters unverified input keys using your native isValidCLIFlagGuard to guarantee
 * complete protection against unexpected mutations or undefined reference crashes down the line.
 *
 * @param flags Loose raw incoming feature configuration flag block passed down from the command router
 * @returns Fully verified, immutable record conforming to the strict ICLIConfig['flags'] layout contract
 */
export function sanitizeFlags(
  flags?: Partial<Record<string, boolean>>,
): ICLIConfig['flags'] {
  const activeFlags: Record<TCLIFlags, boolean> = {
    ...buildInitialFlagsLedger(),
  };

  if (!flags) {
    return Object.freeze(activeFlags);
  }
  const inputKeys = ObjectUtils.keys(flags);
  for (const targetKey of yieldItems(inputKeys)) {
    if (isValidCLIFlagGuard(targetKey)) {
      activeFlags[targetKey] = !!flags[targetKey];
    }
  }

  return Object.freeze(activeFlags);
}

function resolveAliasedFlagToken(token: string): TCLIFlags | null {
  if (token === '--fix' || token === '-f') return 'fix';
  if (token === '--json' || token === '-j') return 'json';
  if (token === '--verbose' || token === '-v') return 'verbose';
  return null;
}

/**
 * RESOLVE OPERATIONAL CLI MODE
 * ROLE: Maps validated command string segments to known system lifecycles.
 */
function resolveOperationalCliMode(
  token: string | undefined,
): TCLICommandsControl {
  if (!token) return 'help';
  if (isCompileMode(token)) return 'compile';
  if (isWatchMode(token)) return 'watch';
  if (isVacuumMode(token)) return 'vacuum';
  if (isStudioMode(token)) return 'studio';
  if (isClearMode(token)) return 'clear';
  if (isAuditMode(token)) return 'audit';
  return 'help';
}

/**
 * DETERMINE CLI CONFIG
 * ROLE: High-performance modular argument compiler separating mode resolution from feature flag states.
 * STRATEGY: Scans input parameters in a single sequential sweep to maximize serverless/edge start speeds.
 *
 * @param argv Readonly terminal parameter slice extracted from process.argv
 * @returns Immutable configuration contract restricting workspace lifecycles and active flags
 */
export function determineCLIConfig(argv: readonly string[]): ICLIConfig {
  const projectRoot = process.cwd();
  const baseFlagsLedger = buildInitialFlagsLedger();
  let localModeToken: string | undefined = undefined;

  const activeFlagsMap: Record<TCLIFlags, boolean> = {
    ...baseFlagsLedger,
  };

  const { length: evaluatorsLength } = MODE_SYSTEM_EVALUATORS;
  const argvLength = argv.length;

  for (let i = 0; i < argvLength; i++) {
    const rawToken = argv[i];

    // MODE DETECTION PHASE --->>>>>> short-circuit
    let isModeToken = false;
    for (let j = 0; j < evaluatorsLength; j++) {
      if (MODE_SYSTEM_EVALUATORS[j](rawToken)) {
        localModeToken = rawToken;
        isModeToken = true;
        break;
      }
    }

    if (isModeToken) continue;

    const activeFlagKey = resolveAliasedFlagToken(rawToken);
    if (activeFlagKey !== null) {
      activeFlagsMap[activeFlagKey] = true;
    }
  }

  const finalizedMode = resolveOperationalCliMode(localModeToken);
  const allowedModeFlags =
    finalizedMode === 'help'
      ? ([] as const)
      : CLI_MODE_FLAGS_MAPPER[finalizedMode];

  const secureFlagsLedger: Record<TCLIFlags, boolean> = {
    ...baseFlagsLedger,
  };

  // CLEAN GENERATOR-BASED SANITIZER PASS
  for (const flagKey of yieldItems(allowedModeFlags)) {
    secureFlagsLedger[flagKey] = activeFlagsMap[flagKey];
  }

  return {
    mode: finalizedMode,
    projectRoot,
    flags: Object.freeze(secureFlagsLedger),
  };
}
