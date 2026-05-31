export type TCLIBootStrapModes = 'clear' | 'compile' | 'watch';

export type TBootStrapEnvContext = {
  readonly projectRootPath: string;
  readonly cliMode: TCLIBootStrapModes;
};
/**
 * TXalorEnvTokens
 * ROLE: Authoritative union registry tracking all valid system environment process keys.
 * STRATEGY: Statically restricts variable injection flags to freeze the environment matrix footprint.
 */
export type TXalorEnvTokens =
  | 'XALOR_CLI_CLEAR'
  | 'XALOR_CLI_WATCH'
  | 'XALOR_CLI_COMPILE';

/**
 * TEnvStateMatrix
 * ROLE: Strict, immutable configuration dictionary mapping environment variables to literal boolean strings.
 * STRATEGY: Replaces loose primitive strings with literal 'true' | 'false' bounds to catch formatting typos on boot.
 */
export type TEnvStateMatrix = Readonly<
  Record<TXalorEnvTokens, 'true' | 'false'>
>;
