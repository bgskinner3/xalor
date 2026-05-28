export class ObjectUtils {
  /**
   * @utilType util
   * @name keys
   * @category ObjectUtils
   * @description Returns the keys of an object as a typed array of its own keys.
   * @link #keys
   */
  static keys<Obj extends object>(obj: Obj) {
    return Object.keys(obj) as (keyof Obj)[];
  }
  /**
   * @utilType util
   * @name entries
   * @category ObjectUtils
   * @description Returns an array of an object's own enumerable string-keyed [key, value] pairs with preserved inference.
   * @link #entries
   */
  static entries<T extends Record<string, unknown>>(
    obj: T | null | undefined,
  ): [keyof T, T[keyof T]][] {
    if (!obj) return [];
    // We use one "internal" cast to the specific return type
    // to override the default lib.dom string-only return.
    return Object.entries(obj) as [keyof T, T[keyof T]][];
  }
  /**
   * @utilType util
   * @name fromEntries
   * @category ObjectUtils
   * @description Constructs an object from an array of key-value entries with explicit type safety.
   * @link #fromentries
   */
  static fromEntries<
    K extends string | number | symbol = string, // default key type
    V = unknown,
  >(entries: [K, V][]): Record<K, V> {
    return Object.fromEntries(entries) as Record<K, V>;
  }

  /**
   * @utilType util
   * @name values
   * @category ObjectUtils
   * @description Returns an array of an object's own enumerable string-keyed property values.
   * @link #values
   */
  static values<Obj extends object>(obj: Obj) {
    return Object.values(obj) as Obj[keyof Obj][];
  }

  /**
   * @utilType util
   * @name has
   * @category ObjectUtils
   * @description Checks if a nested property exists in an object using dot-notation (e.g., 'user.profile.id').
   * @link #has
   */
  static has<Obj extends object>(obj: Obj, path: string): boolean {
    if (!path) return false;

    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      // Only check 'in' if current is an object
      if (current == null || typeof current !== 'object' || !(key in current)) {
        return false;
      }
      // TypeScript knows current is object here, so we can index with key
      current = (current as Record<string, unknown>)[key];
    }

    return true;
  }

  /**
   * @utilType util
   * @name get
   * @category ObjectUtils
   * @description Safely retrieves a nested property from an object using dot-notation pathing.
   * @link #get
   */
  /* prettier-ignore */ static get<Obj extends object>(obj: Obj, path: string): unknown;
  /* prettier-ignore */ static get<Obj extends object, K extends PropertyKey>(obj: Obj, key: K): unknown;
  /* prettier-ignore */ static get(obj: object, path: PropertyKey): unknown {
        if (typeof path !== 'string') {
            return (obj as Record<PropertyKey, unknown>)[path];
        }

        if (!path) return undefined;

        const keys = path.split('.');
        let current: unknown = obj;

        for (const key of keys) {
            if (current == null || typeof current !== 'object') {
                return undefined;
            }

            if (!(key in current)) {
                return undefined;
            }

            current = (current as Record<PropertyKey, unknown>)[key];
        }

        return current;
    }

  /**
   * @utilType util
   * @name set
   * @category ObjectUtils
   * @description Safely sets a nested property on an object using dot-notation, creating intermediate objects as needed.
   * @link #set
   */
  static set<Obj extends object>(obj: Obj, path: string, value: unknown): void {
    if (!path) return;

    const keys = path.split('.');
    let current: unknown = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      // 🛑 MOVING THE SAFEGUARD HERE
      // If the previous step landed on a primitive, we cannot go deeper.
      if (current === null || typeof current !== 'object') {
        return;
      }

      const key = keys[i];
      const record = current as Record<string, unknown>;

      // If the key doesn't exist, create the nested object
      if (!(key in record)) {
        record[key] = {};
      }
      // 🛑 ADDING A CHECK: If the key exists but is NOT an object, STOP.
      // This prevents overwriting existing data mid-path.
      else if (record[key] === null || typeof record[key] !== 'object') {
        return;
      }

      current = record[key];
    }

    (current as Record<string, unknown>)[keys[keys.length - 1]] = value;
  }
  /**
   * @utilType util
   * @name is
   * @category ObjectUtils
   * @description Determines whether two values are the same value. Corrects behavior for NaN and signed zeros.
   * @link #is
   */
  static is<T>(value: T, other: unknown): other is T {
    return Object.is(value, other);
  }
  /**
   * @utilType util
   * @name getPrototypeOf
   * @category ObjectUtils
   * @description Returns the prototype of the given object.
   * @link #getprototypeof
   */
  static getPrototypeOf(obj: object): object {
    return Object.getPrototypeOf(obj);
  }

  /**
   * @utilType util
   * @name create
   * @category ObjectUtils
   * @description Creates a new object with the specified prototype.
   * @link #create
   */
  static create<T extends object | null>(
    proto: T,
  ): T extends null ? Record<PropertyKey, unknown> : T {
    return Object.create(proto);
  }
}
