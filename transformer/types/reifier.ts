import type { Type, TypeChecker } from 'typescript';
import type { TSolidShape } from '../../shared';
/**
 * REIFIER CONTEXT
 * Encapsulates the necessary tools and state required during the
 * "Mining" phase of the transformation process.
 */
export type TReifierContext = {
  checker: import('typescript').TypeChecker;
  seen: Set<Type>;
};
/**
 * THE REIFIER SIGNATURE (TReifier)
 *
 * A pluggable middleware function used by the Transformer to analyze TS types.
 * The modular registry architecture allows new Reifiers to be added for custom
 * logic (e.g., specific branding, class handling, or intersections).
 *
 * @param type - The raw TypeScript Type to be solidified.
 * @param checker - The current Program's TypeChecker for deep symbol analysis.
 * @param next - A recursive callback to trigger the next reification in the chain.
 * @param seen - A recursion-tracking Set to prevent infinite loops on circular types.
 */
export type TReifier = (
  type: Type,
  checker: TypeChecker,
  // 🛡️ FIX: next must accept the Type AND the Context
  next: (type: Type, ctx: TReifyCTX) => TSolidShape,
  ctx: TReifyCTX,
) => TSolidShape | undefined;

/**
 * 📏 TREIFYCTX (The Guardrail Context)
 *
 * PURPOSE:
 * Manages the "Laws of Physics" for the Miner during recursive analysis.
 * It tracks depth to trigger Atomic Cuts and manages the Fragment Bucket.
 *
 * @field depth - The current nesting level (0-indexed).
 * @field maxDepth - The hard limit before a "Chop & Reference" occurs.
 * @field fragments - A transient Map used to store "Chipped Off" blueprints.
 * @field parentKey - The breadcrumb path used to name virtual fragments.
 * @field seen - Prevents infinite recursion on circular TypeScript types.
 */
export type TReifyCTX = {
  depth: number;
  maxDepth: number; // 🛡️ From our Limits constant
  fragments: Map<string, TSolidShape>; // 🪣 The "Chop" Bucket
  parentKey: string; // 🔑 For naming fragments
  seen: Set<Type>;
};

export type TReifyDispatcherBuild = {
  type: Type;
  checker: TypeChecker;
  ctx: TReifyCTX;
};
