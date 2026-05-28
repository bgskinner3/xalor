import { IS_SOLID_CONFIG_ITEMS } from '../../constants';

/**
 * Brand
 * 🏷️ TYPE UTILITY: NOMINAL COMPLIANCE COMPILER BRAND
 *
 * ROLE:
 * Converts structural TypeScript classifications into strict nominal tokens.
 * This creates a compile-time boundary that forces raw data payloads to pass
 * through verified runtime predicate filters before reaching your core engines.
 *
 * STRATEGY:
 * Intersects a base type `K` with an invisible validation flag container `{ __valid: T }`.
 * While the virtual property is completely stripped during compilation and introduces
 * zero runtime execution cost, it prevents un-narrowed data from slipping through type checks.
 */
type TBrand<K, T> = K & { [IS_SOLID_CONFIG_ITEMS.validBrandKey]: T };
export type TSerializedShape<T = unknown> = TBrand<T, 'Shape'>;
export type TMirrorBrand<UniqueName extends string = 'ShapeSync'> = TBrand<
  string,
  UniqueName
>;

/**
 * TSolidBranded
 * 🔐 ARCHITECTURAL TOKEN: PERSISTED CONFIGURATION KV BRAND
 *
 * ROLE:
 * Nominal classification layer for registered Key-Value configuration blocks.
 * Prevents key collision and cross-type contamination by overriding structural matching,
 * ensuring developers cannot pass un-validated identifier keys into secure internal APIs.
 *
 * STRATEGY:
 * Appends a strict, compile-time metadata payload onto a generic target type `T`.
 * By referencing an immutable global system signature property defined via
 * `IS_SOLID_CONFIG_ITEMS.solidBrandKey`, it guarantees that the identifier field cannot
 * be falsified or rewritten during the live background transformer loops.
 *
 * @template K - The precise alphanumeric string identifier assigned to this brand collection
 * @template T - The base structural type signature being protected (typically a string or record)
 */
export type TSolidBranded<K extends string, T> = T & {
  readonly [IS_SOLID_CONFIG_ITEMS.solidBrandKey]: K;
};
