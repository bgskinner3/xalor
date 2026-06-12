import type { TSolidShapeKinds } from '../shape-domain';

/**
 * 🛠️ GENERIC UTIL TYPES
 *
 * A collection of fundamental TypeScript patterns used throughout the engine.
 * These provide a consistent contract for type guards, assertions, and
 * primitive handling, ensuring linter-safe execution across both the
 * Transformer and the Runtime.
 */

export type TTypeGuard<T, Args extends readonly unknown[] = readonly []> = (
  value: unknown,
  ...extraConfigParams: Args
) => value is T;
/* prettier-ignore */ export type TTupleGuard<A, B,> = (value: [unknown, unknown]) => value is [A, B];
/* prettier-ignore */ export type TNarrowingPairGuard<A extends T, B extends T, T = unknown> = ( value: [T, T], ) => value is [A, B];
/* prettier-ignore */ export type TPrimitive = string | number | boolean | bigint;
/* prettier-ignore */ export type TAnyFunction = (...args: unknown[]) => unknown;
/* prettier-ignore */ export type TStringFunction = (dynamicValue?: string) => string;
/* prettier-ignore */ export type TAssert<T> = (value: unknown, message?: string) => asserts value is T;
//TODO: RESOLVE UANY
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* prettier-ignore */ export type TAbstractConstructor<T = object> = abstract new (...args: any[]) => T;
/**
 * TGET_CALLER_LOCATION_OPTIONS
 *
 * ROLE:
 * Configuration matrix for the Spatial Identity geometry crawler.
 * Tunes V8 stack trace extraction settings to generate precision source code links.
 *
 * @see getCallerLocation
 * @param fallbackIndex: Fallback index if preferredIndex is not available (default: 2)
 * @param topParent: Whether to get the top-level parent function instead of preferredIndex (default: false)
 * @param stripPathPrefix: Path prefix to strip from the returned line (default: process.cwd())
 */
export type TGetCallerLocationOptions = {
  preferredIndex?: number;
  fallbackIndex?: number;
  topParent?: boolean;
  stripPathPrefix?: string;
};
/**
 * 💎 MESSAGE MANIFEST UTILITY TYPINGS
 *
 * Ensures type safety over all parameter payloads being passed to the message
 * generator templates without allowing raw code logic inside the text ledger.
 */
export type TMessageHandlerParams = {
  path?: string;
  expected?: unknown;
  received?: unknown;
  key?: string;
  kind?: TSolidShapeKinds;
  version?: string;
  msg?: string;
  location?: string;
  error?: unknown;
};
