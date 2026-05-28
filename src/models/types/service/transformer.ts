import type { TSolidShape } from '../../../../shared';
import type {
  TTransformDependency,
  TPickOmitDependency,
  TMergeDependency,
  TRenameDependency,
} from '../mappers';

// ========================================================================
// 🎛️ I. PUBLIC DEVELOPER API BOUNDARY CONTRACTS
// ========================================================================

/** 🎛️ UNIVERSAL TRANSFORM PREDICATE CLOSURE ENGINE CONTRACT */
export type TTransformPredicate = (
  key: string,
  propertiesSet: Set<string> | Record<string, string>,
  depth: number,
) => boolean;

/** 📥 Params for public service method XalethorVaultTransformer.transformPickAndOmit */
export type TTransformPickAndOmit = {
  readonly data: unknown;
  readonly shape: TSolidShape;
  readonly filterSet: Set<string>;
  readonly predicate: TTransformPredicate;
};

/** 🚀 Params for public service method XalethorVaultTransformer.transformRename */
export type TTransformRename = {
  readonly data: unknown;
  readonly shape: TSolidShape;
  readonly mappings: Record<string, string>;
};

/** 🧬 Params for public service method XalethorVaultTransformer.transformMerge */
export type TTransformMerge = {
  readonly dataOne: unknown;
  readonly dataTwo: unknown;
  readonly shape: TSolidShape;
};

// ========================================================================
// 🎛️ III. SHARED RECURSIVE ENGINE INTERNAL CONTEXT CONTRACTS
// ========================================================================

/**
 * 🎛️ TSanitizeTransformBase
 *
 * ROLE:
 * Base shared parameter context driving internal transformation loops.
 */
export type TSanitizeTransformBase = {
  readonly val: unknown;
  readonly currentShape: TSolidShape;
  readonly dependency: TTransformDependency; // 🚀 Unified tracking container union
  readonly depth: number;
};

/** 📥 Internal parameter context wrapper for your object slicing worker */
export type TSanitizeSlicedObject = {
  readonly currentShape: Extract<TSolidShape, { kind: 'object' }>;
  readonly seenObjectsMap: Map<unknown, unknown>;
  readonly predicate?: TTransformPredicate;
} & TSanitizeTransformBase;

/** 📥 Internal parameter context wrapper for your core sanitizer gate */
export type TTransformSanitize = {
  readonly seenObjectsMap: Map<unknown, unknown>;
  readonly predicate?: TTransformPredicate;
} & TSanitizeTransformBase;

// ==============================================================================================================
// OBJECT PROPERTY FORKS
// @see XalethorVaultTransformer.sliceObjectProperties
// ==============================================================================================================
/**
 * @name TTransformWorkerBase
 * @description Context envelope governing cross-module structural data migration tracking.
 */

export type TTransformWorkerBase = TSanitizeSlicedObject & {
  /** The clean target object instance container currently receiving sliced property weights */
  readonly cleanObj: Record<string, unknown>;
  /** Authoritative un-casted source reference data pointer context entering mutation lanes */
  readonly dataRef: unknown;
  /** Complete schema properties dictionary node map retrieved directly from the Vault blueprint graph */
  readonly props: Record<
    string,
    {
      readonly name: string;
      readonly optional: boolean;
      readonly shape: TSolidShape;
    }
  >;
  /** Closed system recursion handler function tunnel routing context allocations deeper down call stacks */
  readonly sanitizeHandler: (params: TTransformSanitize) => unknown;
};
/**
 * @name TExecutePickOmitFork
 * @description Parameter context targeting property filtering execution pipelines.
 */
export type TExecutePickOmitFork = TTransformWorkerBase & {
  readonly dependency: TPickOmitDependency;
};

/**
 * @name TExecuteRenameFork
 * @description Parameter context targeting nominal key translation lookups.
 */
export type TExecuteRenameFork = TTransformWorkerBase & {
  readonly dependency: TRenameDependency;
};

/**
 * @name TExecuteMergeFork
 * @description Parameter context targeting twin-object entity aggregations.
 */
export type TExecuteMergeFork = TTransformWorkerBase & {
  readonly dependency: TMergeDependency;
};
