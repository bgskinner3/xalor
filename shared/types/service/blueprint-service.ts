import type { TSolidShape } from '../../shape-domain';

export type TRebuildParams = {
  readonly shape: TSolidShape;
  readonly pool: Record<string, TSolidShape> | Map<string, TSolidShape>;
  readonly depth: number;
  readonly spacing: string;
};

export type TRebuildStrategy = (params: TRebuildParams) => string;

export type TRebuildShapeMapper = Record<TSolidShape['kind'], TRebuildStrategy>;
