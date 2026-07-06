import type { TXalorCLIModes, TCLIFlags } from '../../../shared/cli-domain';
import { TTripleKV } from '../../../shared';
/**
 * TCLICommandsControl
 *
 * CLI layer commands including help to avoid unncessary commands
 */
export type TCLICommandsControl = Exclude<TXalorCLIModes, 'watch'>;

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

/**
 * ============================================================================
 * 🪐 VACUUM FINAL BUILD SHAPE (THE SHEDDED PRODUCTION BLUEPRINT)
 * ============================================================================
 * ROLE:
 * Represents the strict structural schema of the highly optimized, static JSON
 * type database snapshot generated during the Stage 2 automated prebuild pass.
 *
 * CORE RESPONSIBILITIES:
 * - Serves as the immutable runtime contract ingested natively by 'xalor.parse()'
 *   across Node.js, V8 Edge Isolates, and standard Browser threads.
 * - Guarantees absolute Client Shedding by ensuring all heavy development telemetry,
 *   source file lines, comments, and debug strings are completely stripped out.
 * - Exposes a razor-thin, content-addressed bitwise map to power O(1) ingress
 *   validation gates under high production traffic volumes.
 *
 * COMPLIANCE STATUS:
 * - COMMANDMENT IV: Separates the runtime validation state from volatile in-memory dev maps.
 * - COMMANDMENT VIII: Enforces an ultra-lightweight, flat database footprint for near-zero network latency.
 */
export type TVacuumFInalBuildShape = {
  blueprints: TTripleKV['blueprints'];
  references: TTripleKV['references'];
  driftTracking: TTripleKV['driftTracking'];
  version: TTripleKV['version'];
};
