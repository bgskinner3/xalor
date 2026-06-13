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
