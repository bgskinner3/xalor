import type {
  TypeChecker,
  SourceFile,
  Type,
  Node,
  Program,
  TransformationContext,
} from 'typescript';
import type {
  TSolidShape,
  TVaultSyncPayload,
  TTransformerExecuteMode,
} from '../../shared';
import type { TXalorComplianceRuleKeys } from './error';
/**
 * Encapsulates the context needed for the recursive structural expansion
 * of TypeScript types. By bundling the Type, Checker, and the current
 * AST Node, the printer can safely resolve symbols and types within
 * their original lexical scope without 'any' casting.
 */
export type TUpdateRegistry = {
  registry: Map<string, string>;
  key: string;
  filePath?: string;
  symbolName: string;
  typeName: string;
};

/**
 * Encapsulates the context needed for the recursive structural expansion
 * of TypeScript types. By bundling the Type, Checker, and the current
 * AST Node, the printer can safely resolve symbols and types within
 * their original lexical scope without 'any' casting.
 */
export type TPrintGhostStructure = {
  type: Type;
  checker: TypeChecker;
  node: Node;
};

export type TSpatialIdentity = {
  readonly area: string; // GPS: "src/user.ts:42:10" (Auditor)
  readonly typeName: string; // Ghost: "import('...').User" (Bridge)
  readonly symbolName: string; // Identity: "User" (Registry)
  readonly filePath: string; // Absolute: "/project/src/user.ts" (File System)
  readonly anchor: string; // This anchor stays stable (e.g., "#call:1") as long as it remains the first call in the file
};

export type TInterfaceOrType = {
  sourceFile: SourceFile;
  shapeType: Type;
  checker: TypeChecker;
  node: Node;
};

/**
 * TMinerCorParams
 *
 * ROLE:
 * The Master Root Execution Payload contract governing the AST visitor loops.
 *
 * STRATEGY:
 * Combines the live compiler instance pointers, the long-lived process registries,
 * and the short-lived file pass metrics into a single unified container object.
 * This gives your downstream processing functions high-speed, zero-allocation
 * access to all variables.
 *
 * DESIGN SPECIFICATIONS:
 * @property program - Active Microsoft TypeScript compiler program instance slice.
 * @property context - Running transformation lexical context handler frame loop canvas.
 * @property sourceFile - Parent file node text buffer container actively compiling right now.
 * @property currentActiveAbsoluteFile - Absolute fully normalized hardware path of the file compiling on save.
 * @property freshKeysHarvestedInThisPass - Ephemeral tracker Set dedicated strictly to logging keys read *just now*.
 * @property globalKeyRegistry - The master long-lived Map holding full type DNA transport payload objec
 * @property sessionRegistry - The active watch session Map tracking unique key-to-area location strings.
 */
export type TMinerCorParams = {
  readonly program: Program;
  readonly context: TransformationContext;
  readonly sourceFile: SourceFile;
};

export type TFlushToRegistryParams = {
  readonly key: string;
  readonly fragments: Map<string, TSolidShape>;
  readonly payload: TVaultSyncPayload;
};

export type TCreateVaultSyncPayLoad = {
  readonly keyName: string;
  readonly sourceFile: SourceFile;
  readonly identity: TSpatialIdentity;
  readonly shape: TSolidShape;
};
export type TTypeResolutionParams = {
  readonly keyName: string;
  readonly shapeType: Type;
  readonly node: Node;
  readonly sourceFile: SourceFile;
  readonly checker: TypeChecker;
};
/**
 * 🪐 TVERIFYANDVALIDATETYPE PARAMETER MATRIX
 * Strict, read-only object contract bundling everything needed by the validation radar.
 */
export type TVerifyAndValidateType = {
  readonly shapeType: Type;
  readonly checker: TypeChecker;
  readonly keyName: string;
  readonly sourceFile: SourceFile;
};
export type TMineFilePass = {
  readonly program: Program;
  readonly context: TransformationContext;
  readonly sourceFile: SourceFile;
  readonly bridgeDir: string;
};

// ================================================================================
// ================================================================================
// COLLISION BORDER
// ================================================================================
// ================================================================================

export type TFilePathParams = {
  relativeProjectKey: string;
  keyName: string;
  isWatch: boolean;
  currentActiveAbsoluteFile: string;
  executeMode: TTransformerExecuteMode;
  activeAreaString: string;
  activeAnchorString: string;
};

/**
 * TSameFileCollisionCtx
 * SAME-FILE ERROR DATA BLUEPRINT
 */
export type TSameFileCollisionCtx = {
  readonly keyName: string;
  readonly historicalArea: string;
  readonly historicalAnchor: string;
  readonly activeArea: string;
  readonly activeAnchor: string;
};

/**
 * TCrossFileCollisionCtx
 * CROSS-FILE ERROR DATA BLUEPRINT
 */
export type TCrossFileCollisionCtx = {
  readonly keyName: string;
  readonly initialFilePath: string;
  readonly initialArea: string;
  readonly hijackFilePath: string;
  readonly hijackArea: string;
};

/**
 * TCollisionBorderFailureConfig
 * CENTRAL MAPPER PROPERTY SPECIFICATION
 */
export type TCollisionBorderFailureConfig<T> = {
  readonly rule: TXalorComplianceRuleKeys;
  readonly message: (ctx: T) => string;
};

/**
 * TCollisionBorderFailureMapper
 * THE EXPLICIT MAPPER TYPE SYSTEM INTERFACE
 */
export type TCollisionBorderFailureMapper = {
  readonly SAME_FILE: TCollisionBorderFailureConfig<TSameFileCollisionCtx>;
  readonly CROSS_FILE: TCollisionBorderFailureConfig<TCrossFileCollisionCtx>;
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
