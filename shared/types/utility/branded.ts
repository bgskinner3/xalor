import { IS_SOLID_CONFIG_ITEMS } from '../../constants';

/**
 * 🔑 THE SINGLE NOMINAL ANCHOR (Commandment I)
 * Changed from 'declare const' to an actual runtime symbol instance.
 * This acts as the cryptographic barrier preventing structural type bleeding.
 */
export const BRAND_SYMBOL = Symbol('__xalorBrand');

/** @see {@link SharedTypesDocs.TBrandDomain} */
export type TBrandDomain =
  (typeof IS_SOLID_CONFIG_ITEMS.brandDomainNames)[number];

/** @see {@link SharedTypesDocs.TBrand} */
export type TBrand<T, B> = T & { readonly [BRAND_SYMBOL]: B };

/** @see {@link SharedTypesDocs.TBrandNS} */
export type TBrandNS<T, N extends TBrandDomain, B extends string> = TBrand<
  T,
  [N, B]
>;

// ================================================================================
// BRAND DOMAINS
// ================================================================================

/** @see {@link SharedTypesDocs.TSerializedShape} */
export type TSerializedShape<T = unknown> = TBrandNS<T, 'Shape', 'Serialized'>;

/** @see {@link SharedTypesDocs.TMirrorBrand} */
export type TMirrorBrand<Name extends string = 'ShapeSync'> = TBrandNS<
  string,
  'Mirror',
  Name
>;
/** @see {@link SharedTypesDocs.TSolidBranded} */
export type TSolidBranded<K extends string, T> = TBrandNS<T, 'Solid', K>;

/**
 * ### TRootDirBranded
 *  @see {@link SharedTypesDocs.TRootDirBranded}
 */
export type TRootDirBranded = TBrandNS<string, 'Path', 'ProjectRoot'>;

// We mirror the exact shape structurally to pass type verification purely
// const brandedContainer = {
//   value,
//   [Symbol('brand_token')]: [namespace, brand] as const,
// };

// import { IS_SOLID_CONFIG_ITEMS } from '../../constants';

// declare const __brand: unique symbol;

// export type TBrand<T, B> = T & { readonly [__brand]: B };

// /**
//  * Brand
//  * 🏷️ TYPE UTILITY: NOMINAL COMPLIANCE COMPILER BRAND
//  *
//  * ROLE:
//  * Converts structural TypeScript classifications into strict nominal tokens.
//  * This creates a compile-time boundary that forces raw data payloads to pass
//  * through verified runtime predicate filters before reaching your core engines.
//  *
//  * STRATEGY:
//  * Intersects a base type `K` with an invisible validation flag container `{ __valid: T }`.
//  * While the virtual property is completely stripped during compilation and introduces
//  * zero runtime execution cost, it prevents un-narrowed data from slipping through type checks.
//  */
// export type TSerializedShape<T = unknown> = TBrand<T, 'Shape'>;
// export type TMirrorBrand<UniqueName extends string = 'ShapeSync'> = TBrand<
//   string,
//   UniqueName
// >;

// /**
//  * TSolidBranded
//  * 🔐 ARCHITECTURAL TOKEN: PERSISTED CONFIGURATION KV BRAND
//  *
//  * ROLE:
//  * Nominal classification layer for registered Key-Value configuration blocks.
//  * Prevents key collision and cross-type contamination by overriding structural matching,
//  * ensuring developers cannot pass un-validated identifier keys into secure internal APIs.
//  *
//  * STRATEGY:
//  * Appends a strict, compile-time metadata payload onto a generic target type `T`.
//  * By referencing an immutable global system signature property defined via
//  * `IS_SOLID_CONFIG_ITEMS.solidBrandKey`, it guarantees that the identifier field cannot
//  * be falsified or rewritten during the live background transformer loops.
//  *
//  * @template K - The precise alphanumeric string identifier assigned to this brand collection
//  * @template T - The base structural type signature being protected (typically a string or record)
//  */
// export type TSolidBranded<K extends string, T> = T & {
//   readonly [IS_SOLID_CONFIG_ITEMS.solidBrandKey]: K;
// };

// /**
//  * PROJECT ROOT BRAND
//  */
// const __rootDir: unique symbol = Symbol(IS_SOLID_CONFIG_ITEMS.rootDirBrandKey);

// type TBranded<T, B> = T & { [__rootDir]: B };
