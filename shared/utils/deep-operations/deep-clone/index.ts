import { isObject } from '../../guards';
import { ObjectUtils } from '../../object-utils';

type TAnyObject = Record<PropertyKey, unknown>;
function cloneDeepHelper<T>(val: T, seen: Map<unknown, unknown>): T;
function cloneDeepHelper(val: unknown, seen: Map<unknown, unknown>): unknown {
  // 1. Primitive / Null / Function check
  if (val === null || typeof val !== 'object') {
    return val;
  }

  // 2. Circular reference protection
  const cached = seen.get(val);
  if (cached !== undefined) {
    return cached;
  }

  // 3. Array Branch
  if (Array.isArray(val)) {
    const copy: unknown[] = [];
    seen.set(val, copy);

    for (let i = 0; i < val.length; i++) {
      copy[i] = cloneDeepHelper(val[i], seen);
    }
    return copy;
  }

  // 4. Object Branch
  if (isObject(val)) {
    const proto = ObjectUtils.getPrototypeOf(val);
    const copy: TAnyObject = Object.create(proto);

    seen.set(val, copy);

    const keys = Reflect.ownKeys(val);

    for (const key of keys) {
      const child = cloneDeepHelper(
        // safe property access without indexing unknown
        key in val ? (val as never)[key] : undefined,
        seen,
      );
      Reflect.set(copy, key, child);
    }

    return copy;
  }

  return val;
}
/**
 * @utilType util
 * @name cloneDeep
 * @category Deep Operations
 * @description Creates a complete recursive copy of a value, preserving the original's structure and prototypes.
 * Unlike shallow copies, this utility traverses all nested objects and arrays to ensure no shared references.
 * It specifically handles circular references using a tracking Map to prevent infinite recursion and stack overflows.
 * @link #clonedeep
 *
 * @typeParam T - The type of the value being cloned.
 * @param value - The source value (primitive, object, or array) to be cloned.
 * @returns A new instance identical in structure and data to the source value.
 *
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const clone = cloneDeep(original);
 *
 * console.log(clone === original); // false
 * console.log(clone.b === original.b); // false
 * console.log(clone.b.c); // 2
 *
 * @example
 * // Circular Reference Support
 * const obj: any = { name: 'circular' };
 * obj.self = obj;
 * const result = cloneDeep(obj);
 * console.log(result.self === result); // true
 */
export function cloneDeep<T>(value: T): T {
  return cloneDeepHelper(value, new Map<unknown, unknown>());
}
