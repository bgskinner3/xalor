import type { TSolidShape } from '../../shape-domain';

export type TRebuildParams = {
  readonly shape: TSolidShape;
  readonly pool: Record<string, TSolidShape> | Map<string, TSolidShape>;
  readonly depth: number;
  readonly spacing: string;
  readonly visited: Set<string>;
};

export type TRebuildStrategy = (params: TRebuildParams) => string;

/**
 * 🧱 TRebuildShapeMapper — Exhaustive Polymorphic Contract Dictionary
 * Enforces that every single shape kind is explicitly represented point-free.
 */
export type TRebuildShapeMapper = {
  [K in TSolidShape['kind']]: (params: {
    readonly shape: Extract<TSolidShape, { kind: K }>;
    readonly pool: Record<string, TSolidShape> | Map<string, TSolidShape>;
    readonly depth: number;
    readonly spacing: string;
    readonly visited: Set<string>;
  }) => string;
};
