import {
  LOGGER_SIGNAL_EMOJIS,
  LOGGER_LAYOUT_CONFIG,
  LOGGER_DESIGN_SPECTRUM,
} from '../constants';
import type {
  TLoggerTheme,
  TLoggerBannerVariant,
  TTextColorToken,
} from '../types';

export class XalorLoggerService {
  private readonly colors = LOGGER_DESIGN_SPECTRUM;
  private readonly layout = LOGGER_LAYOUT_CONFIG;
  private readonly emojis = LOGGER_SIGNAL_EMOJIS;

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
    const c = this.colors;

    if (theme === 'naked') {
      let fg: string = c.reset;
      if (colorToken === 'error') fg = c.textLightRed;
      if (colorToken === 'success') fg = c.textLightGreen;
      if (colorToken === 'warning') fg = c.textLightYellow;
      if (colorToken === 'info') fg = c.textLightCyan;
      return `${isBold ? c.bold : ''}${fg}${text}${c.reset}`;
    }

    let bg: string = c.bgCanvasBlock;
    let fg: string = theme === 'crimson' ? c.textErrorBlock : c.textCanvasBlock;

    if (theme === 'crimson') {
      bg = c.bgErrorBlock;
    } else if (theme === 'contrast') {
      bg = c.bgFooterContrastBlock;
      fg = c.textFooterContrastBlock;
    }

    if (theme === 'standard') {
      if (colorToken === 'error') fg = c.textLightRed;
      if (colorToken === 'success') fg = c.textLightGreen;
      if (colorToken === 'warning') fg = c.textLightYellow;
      if (colorToken === 'info') fg = c.textLightCyan;
    } else {
      if (colorToken === 'warning') fg = c.textLightYellow;
      if (colorToken === 'info') fg = c.textLightCyan;
      if (colorToken === 'success') fg = c.textLightGreen;
      if (colorToken === 'error') fg = c.textLightRed;
    }

    const typographyFormat = isBold ? `${c.bold}${fg}` : fg;
    const CLEAR_TO_END_OF_LINE = '\x1b[K';

    return `${bg}${typographyFormat} ${text.trimEnd()}${CLEAR_TO_END_OF_LINE}${c.reset}`;
  }

  public *chunkMessageText(
    text: string,
    targetWidth: number,
  ): Generator<string, void, unknown> {
    const rawLines = text.split(/\r?\n/);
    const len = rawLines.length;

    for (let i = 0; i < len; i++) {
      let currentLine = rawLines[i].trim();

      for (let cycle = 0; cycle < 100; cycle++) {
        if (currentLine.length <= targetWidth) {
          yield currentLine;
          break;
        }
        const chunk = currentLine.slice(0, targetWidth);
        yield chunk;

        currentLine = currentLine.slice(targetWidth);
      }
    }
  }

  public logParagraph(
    paragraphText: string,
    theme: TLoggerTheme = 'standard',
    isBold: boolean = false,
    color: TTextColorToken = 'default',
  ): void {
    // Determine the true available text width space inside the box bounds
    const maxUsableTextWidth = this.layout.canvasWidth - 6;

    for (const textLineChunk of this.chunkMessageText(
      paragraphText,
      maxUsableTextWidth,
    )) {
      this.logLine(`     ${textLineChunk}`, theme, isBold, color);
    }
  }

  public banner(
    title: string,
    theme: TLoggerTheme = 'standard',
    variant: TLoggerBannerVariant = 'boxed',
    rightStatusText?: string,
  ): void {
    const l = this.layout;
    const e = this.emojis;

    const totalBoxWidth = l.canvasWidth;
    const borderFillLength = totalBoxWidth - 2;

    // VARIANT 1: THE FILLED TITLE BAR
    if (variant === 'filled') {
      const barCharacter = '█';
      const edgeLine = this.fillCharacters(barCharacter, totalBoxWidth);

      console.log(this.paintLine(edgeLine, theme));
      console.log(this.paintLine(` ${title.toUpperCase()}`, theme, true));
      console.log(this.paintLine(edgeLine, theme));
      return;
    }

    // VARIANT 2: THE MINIMAL NO-BORDER HEADER
    if (variant === 'minimal') {
      const signalIcon = theme === 'crimson' ? e.fault : e.anchor;

      /* prettier-ignore */ console.log(this.paintLine(` `, theme));
      /* prettier-ignore */ console.log(this.paintLine(` ${signalIcon}  ${title.toUpperCase()}`, theme, true));
      /* prettier-ignore */ console.log(this.paintLine(this.fillCharacters('─', totalBoxWidth), theme));
      return;
    }

    // VARIANT 3: THE SPLIT UTILITY BOX (Left Title, Right Status)
    if (variant === 'split') {
      const borderLine = this.fillCharacters('─', borderFillLength);
      const statusText = rightStatusText ?? 'ACTIVE';

      const leftPart = `│  ${title.toUpperCase()}`;
      const rightPart = `${statusText}  │`;
      const spacesNeeded = totalBoxWidth - (leftPart.length + rightPart.length);

      const compositeRow = `${leftPart}${this.fillCharacters(' ', spacesNeeded)}${rightPart}`;

      console.log(this.paintLine(`┌${borderLine}┐`, theme));
      console.log(this.paintLine(compositeRow, theme));
      console.log(this.paintLine(`└${borderLine}┘`, theme));
      return;
    }

    // VARIANT 4: THE STANDARD BOXED FRAME (Default Fallback)
    const horizontalBorder = this.fillCharacters('═', borderFillLength);
    console.log(this.paintLine(`╔${horizontalBorder}╗`, theme));
    console.log(this.paintLine(`║  ${title.toUpperCase()}`, theme));
    console.log(this.paintLine(`╚${horizontalBorder}╝`, theme));
  }

  public panelRow(
    label: string,
    value: string | number,
    theme: TLoggerTheme = 'standard',
    color: TTextColorToken = 'default',
  ): void {
    const rowText = `  ${this.emojis.bullet} ${label.padEnd(26)}: ${value}`;

    console.log(this.paintLine(rowText, theme, false, color));
  }
  public logLine(
    text: string,
    theme: TLoggerTheme = 'standard',
    isBold: boolean = false,
    color: TTextColorToken = 'default',
  ): void {
    console.log(this.paintLine(text, theme, isBold, color));
  }

  public divider(
    character: string = '━',
    theme: TLoggerTheme = 'standard',
    color: TTextColorToken = 'default',
  ): void {
    let dividerLine = '';
    const max = this.layout.canvasWidth;

    for (let i = 0; i < max; i++) {
      dividerLine += character;
    }

    console.log(this.paintLine(dividerLine, theme, false, color));
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

  public getLogLine(
    text: string,
    theme: TLoggerTheme,
    isBold = false,
    color: TTextColorToken = 'default',
  ): string {
    return this.paintLine(text, theme, isBold, color);
  }

  public getBanner(title: string, theme: TLoggerTheme = 'standard'): string {
    const totalBoxWidth = this.layout.canvasWidth;
    const borderFillLength = totalBoxWidth - 2;
    const horizontalBorder = this.fillCharacters('═', borderFillLength);

    // Returns the exact three-tier header sequence string block
    return [
      this.paintLine(`╔${horizontalBorder}╗`, theme),
      this.paintLine(`║  ${title.toUpperCase()}`, theme),
      this.paintLine(`╚${horizontalBorder}╝`, theme),
    ].join('\n');
  }

  public getPanelRow(
    label: string,
    value: string | number,
    theme: TLoggerTheme = 'standard',
    color: TTextColorToken = 'default',
  ): string {
    return this.paintLine(
      `  ${this.emojis.bullet} ${label.padEnd(26)}: ${value}`,
      theme,
      false,
      color,
    );
  }

  public getDivider(character = '━', theme: TLoggerTheme = 'standard'): string {
    let dividerLine = '';
    for (let i = 0; i < this.layout.canvasWidth; i++) dividerLine += character;
    return this.paintLine(dividerLine, theme);
  }
}

export const xalorLog = new XalorLoggerService();
