// transformer/reifiers/registry/core.ts
import type { TReifier } from '../../types';
import { IS_SOLID_CONFIG_ITEMS } from '../../../shared';

const { maxUnionVariants, maxStringLength, maxObjectProperties } =
  IS_SOLID_CONFIG_ITEMS.reifyLimit;

export const REIFIERS: TReifier[] = [];

export function registerReifier(reifier: TReifier) {
  REIFIERS.push(reifier);
}
export { maxUnionVariants, maxStringLength, maxObjectProperties };
