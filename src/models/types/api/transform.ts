import type { TSolidShape } from '../../../../shared';
import type { TCamelCase, TSnakeCase, TKebabCase } from '../../../../shared';
// ====================================================================
// ====================================================================
// MERGE TYPES
// ====================================================================
// ====================================================================

// ============================================================================
// I. COSMETIC KEY CASING BRIDGE
// ============================================================================
/* prettier-ignore */
export type TApplyKeyCasing<
  K extends string, 
  Style extends 'camel' | 'snake' | 'kebab' | undefined
> = 
  Style extends 'camel' ? TCamelCase<K> :
  Style extends 'snake' ? TSnakeCase<K> :
  Style extends 'kebab' ? TKebabCase<K> : K;
// ============================================================================
// II. STRUCTURAL PIPELINE LAYOUT CALCULATORS
// ============================================================================

export type TApplyFinalCasing<Mapped, CasingStyle> = {
  [
    K in keyof Mapped as K extends string
      ? TApplyKeyCasing<
          K,
          CasingStyle & ('camel' | 'snake' | 'kebab' | undefined)
        >
      : K
  ]: Mapped[K];
};
// ============================================================================
// III. THE RUNTIME CONFIGURATION CONTEXT ARCHITECTURE
// ============================================================================

export interface TPruneAndFillOptions {
  readonly values: readonly unknown[];
  readonly strategy: 'defaults' | 'mocks' | 'nulls' | 'drop';
}

export type TXalorMergeContexts<
  TargetType,
  PickKeys extends readonly (keyof TargetType)[] =
    readonly (keyof TargetType)[],
  OmitKeys extends readonly (keyof TargetType)[] =
    readonly (keyof TargetType)[],
> = {
  readonly dataOne: unknown;
  readonly dataTwo: unknown;

  readonly pick?: readonly [...PickKeys];
  readonly omit?: readonly [...OmitKeys];

  readonly pruneAndFill?: TPruneAndFillOptions;
  readonly casing?: 'camel' | 'snake' | 'kebab';

  readonly map?: Partial<{
    [K in keyof TargetType]: (
      value: TargetType[K],
      parentGraph: Readonly<TargetType>,
    ) => unknown;
  }>;
};

export type TRecurseMaterializer = (s: TSolidShape, d: number) => unknown;

// !!! ====================================================================
// !!!====================================================================
// !!! CLONE TYPES
// !!!====================================================================
// !!! ====================================================================
/**
 * TSHAPE_CLONE_MAPPER_MAP
 *
 * ROLE:
 * The static type-system contract for the "Sanitizer" map. It governs deep,
 * data-scrubbing operations to physically wash un-declared properties away.
 *
 * @see CLONE_SHAPE_SANITIZER
 * @see produceClone
 */
export type TShapeCloneMapperMap = {
  [K in TSolidShape['kind']]: (
    /* prettier-ignore */ shape: Extract<TSolidShape, { kind: K }>,
    /* prettier-ignore */ data: unknown,
    /* prettier-ignore */ seen: Map<unknown, unknown>,
    /* prettier-ignore */ depth: number,
    /* prettier-ignore */ recurse: (d: unknown, s: TSolidShape, seen: Map<unknown, unknown>, depth: number) => unknown,
  ) => unknown;
};
/**
 * 🔄 T_CLONE_RECURSE_CALLBACK
 *
 * ROLE:
 * The strict static contract for the structural recurrence function passed
 * down to standalone sanitizer mapper nodes.
 *
 * DESIGN INVARIANTS:
 * - Enforces Commandment IX: Statically bounded signatures with zero loose omissions or implicit 'any' traps.
 * - Enforces Commandment IV: Isolates pure sequential traversal tracks point-free.
 */
export type TCloneRecurseCallback = (
  nextData: unknown,
  nextShape: TSolidShape,
  nextSeen?: Map<unknown, unknown>,
  nextDepth?: number,
) => unknown;
