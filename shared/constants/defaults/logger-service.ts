import type { TTextColorToken, TThemeBlocks } from '../../types';

export const LOGGER_DESIGN_SPECTRUM = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  underline: '\x1b[4m',

  bgCanvasBlock: '\x1b[48;5;250m', // Premium Light Gray backdrop matrix
  textCanvasBlock: '\x1b[38;5;234m', // Deep charcoal black text for standard rows

  bgErrorBlock: '\x1b[48;5;88m', // Premium Dark Crimson Red backdrop
  textErrorBlock: '\x1b[38;5;255m', // Crisp Pure White text for raw error text rows
  bgFooterContrastBlock: '\x1b[48;5;235m', // Dark Slate Backdrop (ANSI 235)
  textFooterContrastBlock: '\x1b[38;5;255m', // Crisp White Text for high-contrast visibility

  textLightRed: '\x1b[38;5;196m\x1b[1m',
  textLightGreen: '\x1b[38;5;82m\x1b[1m',
  textLightYellow: '\x1b[38;5;226m\x1b[1m',
  textLightCyan: '\x1b[38;5;51m\x1b[1m',

  gray: '\x1b[90m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
} as const;

export const LOGGER_LAYOUT_CONFIG = {
  canvasWidth: 76,
  maxSafeFileLimit: 50000,
} as const;

export const LOGGER_SIGNAL_EMOJIS = {
  fault: '✖',
  warn: '⚠️',
  info: 'ℹ️',
  success: '✅',
  anchor: '🪐',
  package: '📦',
  link: '➔',
  bullet: '•',
  lightning: '⚡',
  diamond: '💎',
  fire: '💥',
  stop: '🛑',
  lock: '🔐',
} as const;

export const LOGGER_TOKEN_COLORS: Record<TTextColorToken, string> = {
  default: LOGGER_DESIGN_SPECTRUM.reset,
  error: LOGGER_DESIGN_SPECTRUM.textLightRed,
  success: LOGGER_DESIGN_SPECTRUM.textLightGreen,
  warning: LOGGER_DESIGN_SPECTRUM.textLightYellow,
  info: LOGGER_DESIGN_SPECTRUM.textLightCyan,
} satisfies Record<TTextColorToken, string>;
//* prettier-ignore */

export const LOGGER_THEME_BLOCKS: TThemeBlocks = {
  standard: {
    bg: LOGGER_DESIGN_SPECTRUM.bgCanvasBlock,
    fg: LOGGER_DESIGN_SPECTRUM.textCanvasBlock,
  },
  crimson: {
    bg: LOGGER_DESIGN_SPECTRUM.bgErrorBlock,
    fg: LOGGER_DESIGN_SPECTRUM.textErrorBlock,
  },
  contrast: {
    bg: LOGGER_DESIGN_SPECTRUM.bgFooterContrastBlock,
    fg: LOGGER_DESIGN_SPECTRUM.textFooterContrastBlock,
  },
} satisfies TThemeBlocks;
