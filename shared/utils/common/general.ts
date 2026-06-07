import { BRAND_SYMBOL } from '../../types';
import type { TBrandDomain, TBrandNS } from '../../types';

/**
 * Generates a rapid, zero-dependency 32-bit structural fingerprint from a raw string.
 * @param input - The raw string to hash.
 * @returns A string prefixed with 'sh_' followed by the base-36 hash.
 */
export const computeStringHash = (
  input: string,
  header: string = 'sh_',
): string => {
  let hash = 0;
  const len = input.length;

  for (let i = 0; i < len; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Force 32-bit integer
  }

  // Use unsigned right shift (>>> 0) to avoid Math.abs()
  // This prevents negative hash collision skewing
  return `${header}${(hash >>> 0).toString(36)}`;
};
/**
 * Creates a valid nominal instance strictly verified by the compiler.
 * Uses object property definitions to preserve primitive string behaviors.
 *
 * @example
 * ```ts
 * // 1. Constructing a branded nominal token safely via the factory gateway
 * const rawPath = "/var/www/xalor-engine";
 * const projectRoot = createBranding(rawPath, 'Path', 'ProjectRoot');
 *
 * // 2. Consuming the token seamlessly with native runtime APIs
 * const configPath = path.join(projectRoot, 'solid.config.json');
 * console.log(`Anchored at: ${projectRoot}`); // Native string casting works perfectly
 *
 * // 3. Compile-time enforcement protection (Commandment IX Rule)
 * function initializeCoreEngine(root: TRootDirBranded) { ... }
 *
 * initializeCoreEngine(projectRoot); // ✅ Pass: Token carries verified brand signature
 * initializeCoreEngine("/var/www/xalor-engine"); // ❌ Fail: 'string' is not assignable to 'TRootDirBranded'
 * ```
 */
export function createBranding<
  T extends string | object,
  N extends TBrandDomain,
  B extends string,
>(value: T, namespace: N, brand: B): TBrandNS<T, N, B> {
  // If it is a primitive string, return it exactly as-is.
  // The type system intersects the nominal token mapping purely at compile-time.
  if (typeof value === 'string') {
    return value as unknown as TBrandNS<T, N, B>;
  }

  // For structured configuration records, copy properties onto a clean prototype clone
  const objectInstance = Object.assign(Object.create(null), value);

  Object.defineProperty(objectInstance, BRAND_SYMBOL, {
    value: [namespace, brand] as const,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  return objectInstance;
}
/**
 * Calculates the approximate in-memory string size of any JavaScript object in Megabytes (MB).
 * Uses a safe fallback if the serialization layer encounters massive cyclical structures.
 *
 * @param payload The JavaScript object or array to measure
 * @returns The size of the stringified payload in Megabytes (MB)
 */
export function measurePayloadSizeMB(payload: unknown): number {
  if (payload === undefined || payload === null) return 0;

  try {
    const stringified = JSON.stringify(payload);
    const totalBytes = stringified.length * 2;
    const totalMegabytes = totalBytes / (1024 * 1024);

    return Number(totalMegabytes.toFixed(2));
  } catch {
    return -1;
  }
}
