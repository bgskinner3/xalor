import type {
  TVaultSyncPayload,
  TCudExecutionMode,
  TTransformerExecuteMode,
} from '../../shared';
import type { SourceFile, Program } from 'typescript';

export type TXalorLifecycleContext = {
  readonly isWatchMode: boolean;
  readonly isOneShotCompileMode: boolean;
  readonly isProductionVacuumMode: boolean;
  readonly isStudioMode: boolean;
  readonly isTestEnvironment: boolean;
  /** High-level operational flag uniting watch and compile as dev-active cycles */
  readonly isDevelopmentPass: boolean;
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
/**
 * TCollisionGuardParams
 */
export type TCollisionGuardParams = {
  readonly keyName: string;
  readonly activeAreaString: string;
  readonly activeAnchorString: string;
  readonly currentActiveAbsoluteFile: string;
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
