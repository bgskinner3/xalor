/**
 * WATCH CliDebouncer
 *
 * ROLE:
 *
 *
 *
 */
export class CliDebouncer<Args extends unknown[]> {
  private timeoutId: NodeJS.Timeout | null = null;
  private wait: number;
  private latestFunc: (...args: Args) => void;

  constructor(func: (...args: Args) => void, wait: number) {
    this.wait = wait;
    this.latestFunc = func;
  }

  public updateFunction(func: (...args: Args) => void): void {
    this.latestFunc = func;
  }

  public setDelay(delayMs: number): void {
    this.wait = delayMs;
  }

  public trigger(...args: Args): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      this.latestFunc(...args);
    }, this.wait);
  }

  public dispose(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
