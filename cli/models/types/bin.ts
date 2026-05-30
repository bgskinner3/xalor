import type { TXalorCLIModes } from '../../../shared/types/const-types';

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
  readonly mode: TXalorCLIModes;
  readonly projectRoot: string;
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
  TXalorCLIModes,
  (projectRoot: string) => void
>;
