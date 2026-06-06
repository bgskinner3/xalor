// ================================================================
// LOGGER SERVICE
// ================================================================

export type TLoggerTheme = 'standard' | 'crimson' | 'contrast' | 'naked';
export type TLoggerOutputMode = 'log' | 'str';
export type TLoggerBannerVariant = 'boxed' | 'filled' | 'minimal' | 'split';
export type TTextColorToken =
  | 'default'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';
/* prettier-ignore */
export type TThemeBlocks = Record<Exclude<TLoggerTheme, 'naked'>, { bg: string; fg: string }>;
