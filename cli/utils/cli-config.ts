import type { TXalorCLIModes } from '../../shared';
import {
  isWatchMode,
  isVacuumMode,
  isAuditMode,
  isCompileMode,
  isStudioMode,
  isClearMode,
} from '../../shared';
import type { ICLIConfig } from '../models';

export function determineCLIConfig(argv: readonly string[]): ICLIConfig {
  const projectRoot = process.cwd();

  const matchedToken = argv.find((token) => {
    return (
      isCompileMode(token) ||
      isWatchMode(token) ||
      isVacuumMode(token) ||
      isAuditMode(token) ||
      isStudioMode(token) ||
      isClearMode(token)
    );
  });

  function resolveMode(token?: string): TXalorCLIModes {
    if (!token) return 'audit';
    if (isCompileMode(token)) return 'compile';
    if (isWatchMode(token)) return 'watch';
    if (isVacuumMode(token)) return 'vacuum';
    if (isStudioMode(token)) return 'studio';
    if (isClearMode(token)) return 'clear';
    return 'audit';
  }

  return {
    mode: resolveMode(matchedToken),
    projectRoot,
  };
}
