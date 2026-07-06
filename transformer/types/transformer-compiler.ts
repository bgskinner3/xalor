import type {
  TXalorResolvedPaths,
  TTransformerExecuteMode,
  TTripleKV,
  TDeepWriteable,
} from '../../shared';
import type { Program, TransformationContext, SourceFile } from 'typescript';
import type { TMineFilePass } from './the-miners';
export type TBootStrategyParams = {
  /** The isolated sample file path coordinates used to boot your builders */
  readonly sampleFile: string;
  /** Pre-calculated absolute paths drawer containing target workspace anchors */
  readonly runtimePaths: TXalorResolvedPaths;
};

export type TBootLoaderMapper = Record<
  TTransformerExecuteMode,
  (params: TBootStrategyParams) => void
>;

/**
 * TProgramContext
 *
 * ROLE:
 * An extended transformation context intersection contract mapping programmatic extensions.
 *
 * SPECIFICATIONS:
 * Accounts for environmental hosts (e.g., custom bundlers, loaders, language services)
 * that inject the `.getProgram()` API directly into TypeScript's runtime transformation pipeline.
 */
export type TProgramContext = {
  readonly getProgram: () => Program;
} & TransformationContext;

// ==============================================================================
// ==============================================================================
// PassStrategyPayloadMap
// ==============================================================================
// ==============================================================================
/**
 * TPassStrategyPayloadMap
 *
 * ROLE:
 * The single source of truth defining the explicit property requirements per execution mode.
 *
 * STRATEGY:
 * If a future mode requires brand-new variables, you append them to that specific
 * key slot right here, and TypeScript will automatically update autocomplete fields repository-wide.
 */
export type TPassStrategyPayloadMap = {
  /** Watch mode requires live compiler instances and your full coupled root memory tracking contexts */
  watch: TMineFilePass;
  /** Compile mode demands identical parameters but handles a single-pass execution pipeline path */
  compile: TMineFilePass;
  /** Vacuum mode tracks final production passes and can omit local IDE directory structures completely */
  vacuum: TMineFilePass;

  studio: TMineFilePass;
};
/**
 * TPassStrategyMapper
 *
 * ROLE:
 * Master Type-Safe File-Pass Strategy Interface Contract.
 *
 * STRATEGY:
 * Automatically infers and enforces the precise property block structure required
 * for the given key mode string, providing sub-nanosecond autocomplete refinement in your IDE.
 */
export type TPassStrategyModes = Exclude<TTransformerExecuteMode, 'clear'>;

/**
 * TPASS STRATEGY MAPPER
 * Iterates through each allowed mode to map its specific payload parameters.
 */
export type TPassStrategyMapper = {
  readonly [Mode in TPassStrategyModes]: (
    params: TPassStrategyPayloadMap[Mode],
  ) => SourceFile;
};

// ==============================================================================
// ==============================================================================
// TRANSFORMER ROOT
// ==============================================================================
// ==============================================================================

/**
 * TXalorTransformerOptions
 * 🪐 THE STATELESS COMPILER CONFIGURATION CONDUIT
 *
 * PURPOSE:
 * An authoritative data contract governing the options payload injected directly
 * into the master transformer plugin factory from the parent CLI command layers.
 *
 * DESIGN INVARIANT:
 * Enforces strict compile-time type-safety for out-of-band multi-pass configurations,
 * completely eliminating long-lived global process variables to safeguard
 * cross-repository thread isolation under Commandment IV.
 *
 * @param compilationPhase The current active compilation pass state directing traffic routing decisions inside the AST miner
 * @param targetedFilesCollector A local memory reference envelope tracking the exact file paths requiring code materialization
 */
export type TXalorTransformerOptions = {
  readonly compilationPhase?:
    'INGEST_REGISTRY' | 'REIFY_RUNTIME' | 'STANDARD_INLINE';
  readonly targetedFilesCollector?: Set<string>;
  outboundDataMemoryPass?: TDeepWriteable<TTripleKV> | null;
};
