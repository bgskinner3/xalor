import type { TVaultSyncPayload, TTransformerExecuteMode } from '../../shared';
import type { SourceFile, Program, TransformationContext } from 'typescript';
import { CUD_EXECUTION_MODES } from '../constants';

export type TXalorLifecycleContext = {
  readonly isWatchMode: boolean;
  readonly isOneShotCompileMode: boolean;
  readonly isProductionVacuumMode: boolean;
  readonly isStudioMode: boolean;
  readonly isClearMode: boolean;
  readonly isTestEnvironment: boolean;
  /** High-level operational flag uniting watch and compile as dev-active cycles */
  readonly isDevelopmentPass: boolean;

  readonly isIngestRegistryMode: boolean;
  readonly isReifyRuntimeMode: boolean;
  readonly isStandardInlineMode: boolean;
};

/**
 * TEvaluateMutationParams
 *
 * ROLE:
 * Strict object parameter contract governing the switchless change-detection scanner.
 *
 * DESIGN SPECIFICATIONS:
 * @property keyName - The unique string literal primitive UUID key identifier currently being processed.
 * @property newTypeName - The freshly stringified property layout signature computed during the active compilation pass.
 * @property newSymbolName - The active token identifier or nominal interface declaration name text mined from the source node.
 * @property newArea - The source definition spatial line and column tracking coordinates string (e.g., "src/index.ts:16:1").
 * @property newFilePath - The absolute hardware or root-normalized target file path location associated with the current save frame.
 * @property newShape - The parsed, recursive intermediate representation JSON intermediate blueprint object.
 * @property globalKeyRegistry - The master long-lived Map holding full type DNA transport payload envelopes.
 */
export type TEvaluateCUDMutationParams = {
  readonly keyName: string;
  // REGISTRY checks
  readonly newTypeName: TVaultSyncPayload['typeName'];
  readonly newSymbolName: TVaultSyncPayload['symbolName'];
  // MANIFEST checks
  readonly newArea: TVaultSyncPayload['area'];
  readonly newFilePath: TVaultSyncPayload['filePath'];
  readonly newAnchor: TVaultSyncPayload['anchor'];
  // BLUEPRINTS CHECK
  readonly newShape: TVaultSyncPayload['shape'];
  // REFERENCE
  // readonly globalKeyRegistry: Map<string, TVaultSyncPayload>;
};

/**
 * TExecuteMutationParams
 *
 * ROLE:
 * Strict object parameter contract governing the centralized umbrella CUD mutator hub.
 * Consolidates memory writes and visual terminal logs into a single execution pass.
 *
 * DESIGN SPECIFICATIONS:
 * @property mode - The validated mutation state token ('create' | 'update' | 'delete') directing the strategy lookup.
 * @property keyName - The targeted string identifier being synchronized or purged out of memory.
 * @property globalKeyRegistry - The master long-lived Map holding full export type DNA transport payload envelopes.
 * @property sessionRegistry - The active watch session Map tracking unique key-to-area location strings for collision checks.
 * @property payloadEnvelope - Optional rich transportation envelope packing full layout schemas and traceability markers (Mandatory for Create/Update).
 * @property identityArea - Optional hardware location coordinate GPS string used to anchor the collision shield registry (Mandatory for Create/Update).
 */
export type TExecuteCUDMutationParams = {
  readonly mode: TCudExecutionMode;
  // readonly globalKeyRegistry: Map<string, TVaultSyncPayload>;
  // readonly sessionRegistry: TSessionRegistry;
  readonly payload?: TVaultSyncPayload;
  readonly identityArea?: string;
  readonly identityAnchor?: string | null;
  readonly keyName?: string;
};

export type TModePriorityRule = {
  readonly guard: boolean;
  readonly mode: TTransformerExecuteMode;
};

export type TPersistenceGateParams = {
  readonly file: SourceFile;
  readonly program: Program;
  readonly rootDir: string;
};
/**
 * TCudExecutionMode
 *
 * ROLE:
 * Strict string union type derived from the frozen CUD_EXECUTION_MODES keys.
 */
export type TCudExecutionMode = keyof typeof CUD_EXECUTION_MODES;

/**
 * TPassRoutineParams
 * 🪐 THE UNIFIED ROUTINE PASS EXECUTION PARAMETERS
 *
 * ROLE:
 * An authoritative data contract governing the strict structural type parameters
 * passed down-wire into your PASS_STRATEGY_MAPPER functional executors.
 *
 * @param program Authoritative single source of truth TypeScript compiler program context
 * @param context Native transformation context controlling node factories and lifetimes
 * @param sourceFile The target syntax tree file node currently being parsed or reified
 * @param bridgeDir Absolute directory target route matching your virtual bridge file paths
 */
export type TPassRoutineParams = {
  readonly program: Program;
  readonly context: TransformationContext;
  readonly sourceFile: SourceFile;
  readonly bridgeDir: string;
};

/**
 * TTraversalSentryConfig
 * 🪐 THE CONTEXT-AWARE SENTRY GATEWAY CONTRACT
 *
 * ROLE:
 * Explicitly structures incoming parameters for the End-Of-Traversal discovery guard,
 * completely eliminating the 'any' keyword to safeguard toolchain type compliance.
 */
export type TTraversalSentryConfig = {
  readonly program: Program;
  readonly context: TransformationContext;
  readonly currentSourceFile: SourceFile;
  readonly activePassRoutine: (props: TPassRoutineParams) => SourceFile;
  readonly bridgeDir: string;
};
