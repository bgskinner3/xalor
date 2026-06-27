import type { TXalorCLIModes, TCLIFlags } from '../../../shared/cli-domain';

/**
 * TCLICommandsControl
 *
 * CLI layer commands including help to avoid unncessary commands
 */
export type TCLICommandsControl = TXalorCLIModes | 'help';

/**
 * ICLIConfig
 *
 * PURPOSE:
 * Readonly execution data contract governing active CLI sessions.
 *
 * ROLE:
 * 1. PERSISTENCE BOUNDARY: Captures the targeted project directory anchor path.
 * 2. LIFECYCLE DIRECTION: Restricts operational states to verified runtime modes.
 */
export interface ICLIConfig {
  readonly mode: TCLICommandsControl;
  readonly projectRoot: string;
  readonly flags: Readonly<Record<TCLIFlags, boolean>>;
}

/**
 * TCommanderMapper
 *
 * PURPOSE:
 * Switchless functional routing contract for command execution layers.
 *
 * ROLE:
 * 1. DECOUPLING: Isolates independent command logic into structured key-value pathways.
 * 2. COMPLIANCE INDUCTION: Enforces full compilation-time coverage of all known CLI modes.
 */
export type TCommandRouterMapper = Record<
  TCLICommandsControl,
  (projectRoot: string, flags?: ICLIConfig['flags']) => void | Promise<void>
>;
