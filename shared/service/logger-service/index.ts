import {
  LOGGER_SIGNAL_EMOJIS,
  LOGGER_LAYOUT_CONFIG,
  LOGGER_DESIGN_SPECTRUM,
} from './constants';

export type TLoggerTheme = 'standard' | 'crimson' | 'contrast' | 'naked';

export type TLoggerBannerVariant = 'boxed' | 'filled' | 'minimal' | 'split';
export type TTextColorToken =
  | 'default'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';
export class XalorLoggerService {
  private static readonly colors = LOGGER_DESIGN_SPECTRUM;
  private static readonly layout = LOGGER_LAYOUT_CONFIG;
  private static readonly emojis = LOGGER_SIGNAL_EMOJIS;

  // private static readonly INNER_WIDTH = LOGGER_LAYOUT_CONFIG.canvasWidth - 2;

  protected static fillCharacters(char: string, count: number): string {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += char;
    }
    return result;
  }
  private static paintLine(
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

    // 1. Determine our solid background block color based on structural theme
    let bg: string = c.bgCanvasBlock;

    // 2. 🟢 THE CRITICAL FIX: Explicitly enforce the 'string' data type here!
    // This tells TypeScript that 'fg' can hold any variable palette string safely.
    let fg: string = theme === 'crimson' ? c.textErrorBlock : c.textCanvasBlock;

    if (theme === 'crimson') {
      bg = c.bgErrorBlock;
    } else if (theme === 'contrast') {
      bg = c.bgFooterContrastBlock;
      fg = c.textFooterContrastBlock;
    }

    // 3. Resolve our semantic foreground typography color accent mappings cleanly
    if (theme === 'standard') {
      if (colorToken === 'error') fg = c.textLightRed;
      if (colorToken === 'success') fg = c.textLightGreen;
      if (colorToken === 'warning') fg = c.textLightYellow;
      if (colorToken === 'info') fg = c.textLightCyan;
    } else {
      // Both 'crimson' and 'contrast' boxes use white text rows by default but allow neon accents
      if (colorToken === 'warning') fg = c.textLightYellow;
      if (colorToken === 'info') fg = c.textLightCyan;
      if (colorToken === 'success') fg = c.textLightGreen; // This now compiles flawlessly!
      if (colorToken === 'error') fg = c.textLightRed;
    }

    const typographyFormat = isBold ? `${c.bold}${fg}` : fg;
    const CLEAR_TO_END_OF_LINE = '\x1b[K';

    // Returns a perfectly straight, completely solid, multi-theme canvas rectangle box row
    return `${bg}${typographyFormat} ${text.trimEnd()}${CLEAR_TO_END_OF_LINE}${c.reset}`;
  }
  // private static paintLine(
  //   text: string,
  //   theme: TLoggerTheme,
  //   isBold: boolean = false,
  //   colorToken: TTextColorToken = 'default',
  // ): string {
  //   const c = this.colors;

  //   // Handle unboxed naked text streams cleanly first
  //   if (theme === 'naked') {
  //     let fg: string = c.reset;
  //     if (colorToken === 'error') fg = c.textLightRed;
  //     if (colorToken === 'success') fg = c.textLightGreen;
  //     if (colorToken === 'warning') fg = c.textLightYellow;
  //     if (colorToken === 'info') fg = c.textLightCyan;
  //     return `${isBold ? c.bold : ''}${fg}${text}${c.reset}`;
  //   }

  //   const bg = theme === 'crimson' ? c.bgErrorBlock : c.bgCanvasBlock;
  //   let fg: string = theme === 'crimson' ? c.textErrorBlock : c.textCanvasBlock;

  //   if (theme === 'standard') {
  //     if (colorToken === 'error') fg = c.textLightRed;
  //     if (colorToken === 'success') fg = c.textLightGreen;
  //     if (colorToken === 'warning') fg = c.textLightYellow;
  //     if (colorToken === 'info') fg = c.textLightCyan;
  //   } else if (theme === 'crimson') {
  //     if (colorToken === 'warning') fg = c.textLightYellow;
  //     if (colorToken === 'info') fg = c.textLightCyan;
  //   }

  //   const typographyFormat = isBold ? `${c.bold}${fg}` : fg;

  //   // ========================================================================
  //   // 🪐 THE ANSI ERASE TO LINE-END STREAM (True 100% Span Fix)
  //   // ========================================================================
  //   // \x1b[K instructs the terminal to fill the rest of the terminal line
  //   // with the active background color block automatically, ignoring emoji math!
  //   const CLEAR_TO_END_OF_LINE = '\x1b[K';

  //   // We right-trim the visible text to prevent trailing spaces from breaking the paint
  //   return `${bg}${typographyFormat} ${text.trimEnd()}${CLEAR_TO_END_OF_LINE}${c.reset}`;
  // }
  public static *chunkMessageText(
    text: string,
    targetWidth: number,
  ): Generator<string, void, unknown> {
    const rawLines = text.split(/\r?\n/);
    const len = rawLines.length;

    for (let i = 0; i < len; i++) {
      let currentLine = rawLines[i].trim();

      // Bounded index chunks division replacing unsafe while loops
      for (let cycle = 0; cycle < 100; cycle++) {
        if (currentLine.length <= targetWidth) {
          yield currentLine;
          break;
        }

        // Isolate a segment that safely fits within your inner text boundaries
        const chunk = currentLine.slice(0, targetWidth);
        yield chunk;

        currentLine = currentLine.slice(targetWidth);
      }
    }
  }

  /**
   * 🪐 REFACTORED MULTI-LINE LOG GENERATOR
   * Consumes chunks on-the-fly, ensuring every single sub-line is padded and colored perfectly.
   */
  public static logParagraph(
    paragraphText: string,
    theme: TLoggerTheme = 'standard',
    isBold: boolean = false,
    color: TTextColorToken = 'default',
  ): void {
    // Determine the true available text width space inside the box bounds
    const maxUsableTextWidth = this.layout.canvasWidth - 6;

    // Stream the chunks lazily through our generator pipeline with zero array thrashing
    for (const textLineChunk of this.chunkMessageText(
      paragraphText,
      maxUsableTextWidth,
    )) {
      // Every single chunk line gets its own unique, fully padded background strip!
      this.logLine(`     ${textLineChunk}`, theme, isBold, color);
    }
  }

  public static banner(
    title: string,
    theme: TLoggerTheme = 'standard',
    variant: TLoggerBannerVariant = 'boxed',
    rightStatusText?: string,
  ): void {
    const l = this.layout;
    const e = this.emojis;

    const totalBoxWidth = l.canvasWidth;
    const borderFillLength = totalBoxWidth - 2; // Exact outer box corner padding width

    // ------------------------------------------------------------------------
    // VARIANT 1: THE FILLED TITLE BAR
    // ------------------------------------------------------------------------
    if (variant === 'filled') {
      const barCharacter = '█';
      const edgeLine = this.fillCharacters(barCharacter, totalBoxWidth);

      console.log(this.paintLine(edgeLine, theme));
      console.log(this.paintLine(` ${title.toUpperCase()}`, theme, true));
      console.log(this.paintLine(edgeLine, theme));
      return;
    }

    // ------------------------------------------------------------------------
    // VARIANT 2: THE MINIMAL NO-BORDER HEADER
    // ------------------------------------------------------------------------
    if (variant === 'minimal') {
      const signalIcon = theme === 'crimson' ? e.fault : e.anchor;

      /* prettier-ignore */ console.log(this.paintLine(` `, theme));
      /* prettier-ignore */ console.log(this.paintLine(` ${signalIcon}  ${title.toUpperCase()}`, theme, true));
      /* prettier-ignore */ console.log(this.paintLine(this.fillCharacters('─', totalBoxWidth), theme));
      return;
    }

    // ------------------------------------------------------------------------
    // VARIANT 3: THE SPLIT UTILITY BOX (Left Title, Right Status)
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // VARIANT 4: THE STANDARD BOXED FRAME (Default Fallback)
    // ------------------------------------------------------------------------
    const horizontalBorder = this.fillCharacters('═', borderFillLength);
    console.log(this.paintLine(`╔${horizontalBorder}╗`, theme));
    console.log(this.paintLine(`║  ${title.toUpperCase()}`, theme));
    console.log(this.paintLine(`╚${horizontalBorder}╝`, theme));
  }

  public static panelRow(
    label: string,
    value: string | number,
    theme: TLoggerTheme = 'standard',
    color: TTextColorToken = 'default',
  ): void {
    // Standard text composition without inline color codes polluting lengths
    const rowText = `  ${this.emojis.bullet} ${label.padEnd(26)}: ${value}`;

    console.log(this.paintLine(rowText, theme, false, color));
  }
  public static logLine(
    text: string,
    theme: TLoggerTheme = 'standard',
    isBold: boolean = false,
    color: TTextColorToken = 'default',
  ): void {
    console.log(this.paintLine(text, theme, isBold, color));
  }

  public static divider(
    character: string = '━',
    theme: TLoggerTheme = 'standard',
    color: TTextColorToken = 'default',
  ): void {
    let dividerLine = '';
    const max = this.layout.canvasWidth;

    // Commandment VIII: Bounded pointer allocation loops only
    for (let i = 0; i < max; i++) {
      dividerLine += character;
    }

    console.log(this.paintLine(dividerLine, theme, false, color));
  }
  public static formatTerminalLink(
    absoluteUrlOrPath: string,
    visibleTextLabel: string,
  ): string {
    const OSC_LINK_START = '\x1b]8;;';
    const OSC_LINK_END = '\x1b\\';
    const OSC_LINK_CLOSE = '\x1b]8;;\x1b\\';

    // Normalize path strings to native file URLs if targeting local disk assets
    const targetUrl =
      absoluteUrlOrPath.startsWith('http') ||
      absoluteUrlOrPath.startsWith('file')
        ? absoluteUrlOrPath
        : `file://${absoluteUrlOrPath}`;

    // Wraps the string cleanly into the terminal emulator's native link interpreter
    return `${OSC_LINK_START}${targetUrl}${OSC_LINK_END}${visibleTextLabel}${OSC_LINK_CLOSE}`;
  }
}
