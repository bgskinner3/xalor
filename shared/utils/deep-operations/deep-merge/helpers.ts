import type { TTupleToIntersection } from '../../../types';
import { isObject, isInstanceOf } from '../../guards';
import { INSTANCE_REGISTRY_MAPPER } from '../../../shape-domain';

export function assertValidMergeResult<T>(_val: unknown): _val is T {
  return true;
}
export function assertIntersectionSafety<T extends Record<string, unknown>[]>(
  _val: unknown,
): _val is TTupleToIntersection<T> {
  return true;
}

export function isPlatformInstance(val: unknown): boolean {
  if (val == null || !isObject(val)) return false;

  const objectConstructor = Object.getPrototypeOf(val)?.constructor;
  if (!objectConstructor) {
    return false;
  }

  const constructorName = objectConstructor.name;

  if (Reflect.has(INSTANCE_REGISTRY_MAPPER, constructorName)) return true;

  return isInstanceOf(val, Promise) || ArrayBuffer.isView(val);
}

export const hasOwn = (obj: object, key: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

export const EMPTY_RECORD: Record<string, unknown> = Object.freeze({});
