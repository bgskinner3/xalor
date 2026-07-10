import { PACKAGE_FILE_KEY_NAMES } from '../../constants';

/**
 * TCoreFileNamesList
 *
 * List of all file names used for the life cycle flow
 */
export type TPackageFileKey = (typeof PACKAGE_FILE_KEY_NAMES)[number];
export type TCoreFileNameMapper = {
  readonly [Key in TPackageFileKey]: string;
};

/**
 * TPackageManifestContract
 * @see {@link SharedTypesDocs.TPackageManifestContract}
 *
 * ROLE:
 * An explicit compile-time typing shape ensuring strict structural layout
 * characteristics for parsed package.json manifest structures.
 */
export type TPackageManifestContract = {
  readonly files?: readonly unknown[];
  readonly dependencies?: Readonly<Record<string, unknown>>;
};
