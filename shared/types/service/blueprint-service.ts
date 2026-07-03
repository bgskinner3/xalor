import type { TSolidShape } from '../../shape-domain';

type TPool = Record<string, TSolidShape> | Map<string, TSolidShape>;
export type TRebuildParams<P extends TPool = TPool> = {
  readonly shape: TSolidShape;
  readonly pool: P;
  readonly depth: number;
  readonly spacing: string;
  readonly visited: Set<string>;
  readonly generate: (
    shape: TSolidShape,
    pool: P,
    depth: number,
    visited: Set<string>,
  ) => string;
  readonly resolve: (name: string, pool: P) => TSolidShape | undefined;
};

export type TRebuildStrategyMap = {
  [K in TSolidShape['kind']]: (params: TRebuildParams<TPool>) => string;
};

export type TRebuildShapeMapper = {
  [K in TSolidShape['kind']]: (params: {
    readonly shape: Extract<TSolidShape, { kind: K }>;
    readonly pool: Record<string, TSolidShape> | Map<string, TSolidShape>;
    readonly depth: number;
    readonly spacing: string;
    readonly visited: Set<string>;
  }) => string;
};
