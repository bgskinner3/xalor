import { cloneDeep } from './deep-clone';
import type { TDeepWriteable } from '../../types';

export function cloneAsWritable<T>(value: T): TDeepWriteable<T> {
  return cloneDeep(value) as unknown as TDeepWriteable<T>;
}
