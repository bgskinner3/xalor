import type { ICLIConfig, TXalorCLIModes } from '../../shared';
import {
  isWatchMode,
  isVacuumMode,
  isReportMode,
  isCompileMode,
  isStudioMode,
} from '../../shared';

export function determineCLIConfig(argv: readonly string[]): ICLIConfig {
  const projectRoot = process.cwd();

  const matchedToken = argv.find((token) => {
    return (
      isCompileMode(token) ||
      isWatchMode(token) ||
      isVacuumMode(token) ||
      isReportMode(token) ||
      isStudioMode(token)
    );
  });

  function resolveMode(token?: string): TXalorCLIModes {
    if (!token) return 'report';
    if (isCompileMode(token)) return 'compile';
    if (isWatchMode(token)) return 'watch';
    if (isVacuumMode(token)) return 'vacuum';
    if (isStudioMode(token)) return 'studio';
    return 'report';
  }

  return {
    mode: resolveMode(matchedToken),
    projectRoot,
  };
}
