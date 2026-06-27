import {
  LOGGER_SIGNAL_EMOJIS,
  LOGGER_LAYOUT_CONFIG,
  LOGGER_DESIGN_SPECTRUM,
  LOGGER_TOKEN_COLORS,
  LOGGER_THEME_BLOCKS,
} from '../constants';
import type {
  TLoggerTheme,
  TLoggerBannerVariant,
  TTextColorToken,
  TLoggerOutputMode,
} from '../types';
import { isLiteralMatch, yieldItems, isKeyInObject } from '../utils';

export class LoggerServiceCore {
  private readonly colors = LOGGER_DESIGN_SPECTRUM;
  private readonly layout = LOGGER_LAYOUT_CONFIG;
  private readonly emojis = LOGGER_SIGNAL_EMOJIS;
  private readonly themBlocks = LOGGER_THEME_BLOCKS;
  private tokenColors = LOGGER_TOKEN_COLORS;
  protected fillCharacters(char: string, count: number): string {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += char;
    }
    return result;
  }

  private paintLine(
    text: string,
    theme: TLoggerTheme,
    isBold: boolean = false,
    colorToken: TTextColorToken = 'default',
  ): string {
    const CLEAR_TO_END_OF_LINE = '\x1b[K';
    const boldPrefix = isBold ? this.colors.bold : '';

    if (theme === 'naked') {
      /* prettier-ignore */ const fg = colorToken === 'default' ? this.colors.reset : this.tokenColors[colorToken];
      return `${boldPrefix}${fg}${text}${this.colors.reset}`;
    }
    /* prettier-ignore */ const block = this.themBlocks[theme] || this.themBlocks.standard;
    /* prettier-ignore */ const fg = colorToken === 'default' ? block.fg : this.tokenColors[colorToken];

    // 3. Clear and extend backgrounds to the absolute line end flawlessly
    return `${block.bg}${boldPrefix}${fg} ${text.trimEnd()}${CLEAR_TO_END_OF_LINE}${this.colors.reset}`;
  }
  public formatTerminalLink(
    absoluteUrlOrPath: string,
    visibleTextLabel: string,
  ): string {
    const OSC_LINK_START = '\x1b]8;;';
    const OSC_LINK_END = '\x1b\\';
    const OSC_LINK_CLOSE = '\x1b]8;;\x1b\\';

    const targetUrl =
      absoluteUrlOrPath.startsWith('http') ||
      absoluteUrlOrPath.startsWith('file')
        ? absoluteUrlOrPath
        : `file://${absoluteUrlOrPath}`;
    return `${OSC_LINK_START}${targetUrl}${OSC_LINK_END}${visibleTextLabel}${OSC_LINK_CLOSE}`;
  }
  /* prettier-ignore */
  public  banner(title: string, theme?: TLoggerTheme, variant?: TLoggerBannerVariant, rightStatusText?: string, mode?: 'log'): void;
  /* prettier-ignore */
  public  banner(title: string, theme: TLoggerTheme, variant: TLoggerBannerVariant, rightStatusText: string | undefined, mode: 'str'): string;
  /* prettier-ignore */
  public  banner(title: string, theme: TLoggerTheme = 'standard', variant: TLoggerBannerVariant = 'boxed', rightStatusText?: string, mode: TLoggerOutputMode = 'log'): string | void {

    const l = this.layout;
    const e = this.emojis;

    const totalBoxWidth = l.canvasWidth;
    const borderFillLength = totalBoxWidth - 2;
    const buffer: string[] = [];

    // ------------------------------------------------------------------------
    // VARIANT 1: THE FILLED TITLE BAR
    // ------------------------------------------------------------------------
    if (isLiteralMatch<TLoggerBannerVariant>(variant, 'filled')) {
      const barCharacter = '█';
      const edgeLine = this.fillCharacters(barCharacter, totalBoxWidth);

      /* prettier-ignore */ buffer.push(this.paintLine(edgeLine, theme));
      /* prettier-ignore */ buffer.push(this.paintLine(` ${title.toUpperCase()}`, theme, true));
      /* prettier-ignore */ buffer.push(this.paintLine(edgeLine, theme));
      return buffer.join('\n');
    }

    // ------------------------------------------------------------------------
    // VARIANT 2: THE MINIMAL NO-BORDER HEADER
    // ------------------------------------------------------------------------

    if (isLiteralMatch<TLoggerBannerVariant>(variant, 'minimal')) {
      const signalIcon = theme === 'crimson' ? e.fault : e.anchor;

      /* prettier-ignore */ buffer.push(this.paintLine(` `, theme));
      /* prettier-ignore */ buffer.push(this.paintLine(` ${signalIcon}  ${title.toUpperCase()}`, theme, true));
      /* prettier-ignore */ buffer.push(this.paintLine(this.fillCharacters('─', totalBoxWidth), theme));
      return buffer.join('\n');
    }

    // ------------------------------------------------------------------------
    // VARIANT 3: THE SPLIT UTILITY BOX
    // ------------------------------------------------------------------------

    if (isLiteralMatch<TLoggerBannerVariant>(variant, 'split')) {
      const borderLine = this.fillCharacters('─', borderFillLength);
      const statusText = rightStatusText ?? 'ACTIVE';

      const leftPart = `│  ${title.toUpperCase()}`;
      const rightPart = `${statusText}  │`;
      const spacesNeeded = totalBoxWidth - (leftPart.length + rightPart.length);

      const compositeRow = `${leftPart}${this.fillCharacters(' ', spacesNeeded)}${rightPart}`;

      /* prettier-ignore */ buffer.push(this.paintLine(`┌${borderLine}┐`, theme));
      /* prettier-ignore */ buffer.push(this.paintLine(compositeRow, theme));
      /* prettier-ignore */ buffer.push(this.paintLine(`└${borderLine}┘`, theme));
      return buffer.join('\n');
    }

    // ------------------------------------------------------------------------
    // VARIANT 4: THE STANDARD BOXED FRAME (Default Fallback)
    // ------------------------------------------------------------------------
    const horizontalBorder = this.fillCharacters('═', borderFillLength);
    buffer.push(this.paintLine(`╔${horizontalBorder}╗`, theme));
    buffer.push(this.paintLine(`║  ${title.toUpperCase()}`, theme));
    buffer.push(this.paintLine(`╚${horizontalBorder}╝`, theme));

    const finalBlockString = buffer.join('\n');
      if(mode === 'log') {
       console.log(finalBlockString);
       return
    }
       return finalBlockString;
  }

  /* prettier-ignore */
  public  panelRow(label: string, value: string | number, theme?: TLoggerTheme, color?: TTextColorToken, mode?: 'log'): void;
  /* prettier-ignore */
  public  panelRow(label: string, value: string | number, theme: TLoggerTheme, color: TTextColorToken, mode: 'str'): string;
  /* prettier-ignore */
  public  panelRow(label: string, value: string | number, theme: TLoggerTheme = 'standard', color: TTextColorToken = 'default', mode: TLoggerOutputMode = 'log'): string | void {
    // Structural layout row composition without immediate console printing blocks
    const rowText = `  ${this.emojis.bullet} ${label.padEnd(26)}: ${value}`;
    const outputString = this.paintLine(rowText, theme, false, color);
      if(mode === 'log') {
       console.log(outputString);
       return
    }
       return outputString;
  }

  /* prettier-ignore */
  public divider(character?: string, theme?: TLoggerTheme, color?: TTextColorToken, mode?: 'log'): void;
  /* prettier-ignore */
  public divider(character: string, theme: TLoggerTheme, color: TTextColorToken, mode: 'str'): string;
  /* prettier-ignore */
  public divider(character: string = '━', theme: TLoggerTheme = 'standard', color: TTextColorToken = 'default', mode: TLoggerOutputMode = 'log'): string | void {
    let dividerLine = '';
    const max = this.layout.canvasWidth;

    // Commandment VIII: Fast, zero-allocation sequential index traversal loops only
    for (let i = 0; i < max; i++) {
      dividerLine += character;
    }
    const outputString = this.paintLine(dividerLine, theme, false, color);


      if(mode === 'log') {
       console.log(outputString);
       return
    }
       return outputString;
  }

  /* prettier-ignore */
  public  logLine(text: string, theme?: TLoggerTheme, isBold?: boolean, color?: TTextColorToken, mode?: 'log'): void;
  /* prettier-ignore */
  public  logLine(text: string, theme: TLoggerTheme, isBold: boolean, color: TTextColorToken, mode: 'str'): string;
  /* prettier-ignore */
  public  logLine(text: string, theme: TLoggerTheme = 'standard', isBold: boolean = false, color: TTextColorToken = 'default', mode: TLoggerOutputMode = 'log'): string | void {
    const outputString = this.paintLine(text, theme, isBold, color);
    if(mode === 'log') {
       console.log(outputString);
       return
    }
  return outputString;
  }
  // ========================================================================
  // !!! TEMPLATES
  // ========================================================================
  /**
   * compileAnomalyPanel
   * 🪐 THE UNIFIED COMPOSABLE ANOMALY PANEL ASSEMBLER (Commandment I & IV Compliant)
   *
   * ROLE:
   * Encapsulates the exact literal visual layout structure for system breaches in memory.
   * Eliminates duplicate code mappings across thrown exceptions and active warn logs.
   */
  public ATSErrorTemplate(ctx: {
    readonly keyName: string;
    readonly ruleLabel: string;
    readonly fileLink: string;
    readonly callSiteLink: string;
    readonly messagePayload: string;
    readonly theme: TLoggerTheme;
  }): string {
    /* prettier-ignore */
    const { keyName, ruleLabel, fileLink, callSiteLink, messagePayload, theme } = ctx;
    const buffer: string[] = [];

    /* prettier-ignore */ buffer.push(this.logLine('', 'naked', false, 'default', 'str'));
    /* prettier-ignore */ buffer.push(this.banner(`[Xalor Alert] ${ruleLabel.toUpperCase()}`, theme, 'boxed', undefined, 'str'));
    /* prettier-ignore */ buffer.push(this.panelRow('Target Key Name', keyName, theme, 'warning', 'str'));
    /* prettier-ignore */ buffer.push(this.panelRow('Rule Category Track', ruleLabel, theme, 'error', 'str'));
    /* prettier-ignore */ buffer.push(this.divider('-', theme, 'default', 'str'));

    /* prettier-ignore */ buffer.push(this.logLine(`  💎 Type Definition (Source Link):`, theme, true, 'default', 'str'));
    /* prettier-ignore */ buffer.push(this.logLine(`  ↳ ${fileLink}`, theme, false, 'info', 'str'));
    /* prettier-ignore */ buffer.push(this.logLine(`  ⚡ Runtime Call Site (Invocation Link):`, theme, true, 'default', 'str'));
    /* prettier-ignore */ buffer.push(this.logLine(`  ↳ ${callSiteLink}`, theme, false, 'info', 'str'));
    /* prettier-ignore */ buffer.push(this.divider('-', theme, 'default', 'str'));
    /* prettier-ignore */ buffer.push(this.logLine(`  💥 Error Details:`, theme, true, 'default', 'str'));

    // Split and chunk long multi-line message texts smoothly to prevent layout fracturing
    const messageLines = messagePayload.split(/\r?\n/);
    for (const rawLine of yieldItems(messageLines)) {
      /* prettier-ignore */ buffer.push(this.logLine(`     ${rawLine.trim()}`, theme, false, 'default', 'str'));
    }

    /* prettier-ignore */ buffer.push(this.divider('═', theme, 'default', 'str'));
    /* prettier-ignore */ buffer.push(this.logLine('', 'naked', false, 'default', 'str'));

    return buffer.join('\n');
  }

  /* prettier-ignore */
  public standardErrorTemplate(subSystemLabel: string, error: unknown, mode?: 'log'): void;
  /* prettier-ignore */
  public standardErrorTemplate(subSystemLabel: string, error: unknown, mode: 'str'): string;
  /* prettier-ignore */
  public standardErrorTemplate( subSystemLabel: string, error: unknown, mode: TLoggerOutputMode = 'log'): string | void {
    const buffer: string[] = [];

    const rawErrorText = isKeyInObject('message')(error)
      ? error.message 
      : String(error ?? 'An unclassified runtime thread interruption occurred.');

    // 2. Build the semantic prefix tracking strings matching your design language
    const labelRowText = `❌ [Xalor:${subSystemLabel.toUpperCase()}] Operational Thread Interrupted`;
    const reasonRowText = `   ↳ Reason: ${rawErrorText}`;

    // 3. Process structural rows through your zero-allocation hoisted color painter engine
    buffer.push(this.paintLine(labelRowText, 'naked', true, 'error'));
    buffer.push(this.paintLine(reasonRowText, 'naked', false, 'error'));

    const finalBlockString = buffer.join('\n');

    if (mode === 'log') {
      console.error(finalBlockString);
      return;
    }

    return finalBlockString;
  }
}
export const xalorLog = new LoggerServiceCore();
