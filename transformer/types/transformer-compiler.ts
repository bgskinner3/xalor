import type {
  TXalorResolvedPaths,
  TTransformerExecuteMode,
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

export type TVacuumFilePass = {
  /* prettier-ignore */ readonly program: Program;
  /* prettier-ignore */ readonly context: TransformationContext;
  /* prettier-ignore */ readonly sourceFile: SourceFile;
  // /* prettier-ignore */ readonly rootContext: TXalorEngineContext
};

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
  vacuum: TVacuumFilePass;
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
export type TPassStrategyMapper = {
  readonly [Mode in TTransformerExecuteMode]: (
    params: TPassStrategyPayloadMap[Mode],
  ) => SourceFile;
};

// ==============================================================================
// ==============================================================================
// TGateStrategyPayloadMap
// ==============================================================================
// ==============================================================================

// type TGateStrategyPayload = {
//   readonly file: SourceFile;
//   readonly rootDir: string;
//   readonly globalKeyRegistry: Map<string, TVaultSyncPayload>;
//   readonly sessionRegistry: Map<string, string>;
//   readonly freshKeysHarvestedInThisPass: Set<string>;
// };
// export type TGateStrategyPayloadMap = {
//   watch: TGateStrategyPayload;
//   compile: TGateStrategyPayload;
//   vacuum: TGateStrategyPayload;
// };

// /**
//  * TGateStrategyMapper
//  *
//  * ROLE:
//  * Master Type-Safe Gate Strategy Interface Contract.
//  */
// export type TGateStrategyMapper = {
//   readonly [Mode in TTransformerExecuteMode]: (
//     params: TGateStrategyPayloadMap[Mode],
//   ) => void;
// };
