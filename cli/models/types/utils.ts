export type TCLIBootStrapModes = 'clear' | 'compile' | 'watch';

export type TBootStrapEnvContext = {
  readonly projectRootPath: string;
  readonly cliMode: TCLIBootStrapModes;
};
