import type { TErrorHandlerParams, TTypeGuardErrorFailure } from '../types';
import { getCallerLocation } from '../../utils';
import type { TTransformerExecuteMode } from '../../cli-domain';
import { errorReportService } from '../error-report-service';

export class XalorError extends Error {
  public readonly code: string;
  public readonly nodeLocation: string;

  // Strongly typed private slots to pass Commandment IX with 0 casting assertions
  private readonly _failure: TTypeGuardErrorFailure | undefined;
  private readonly _keyName: string | undefined;
  private readonly _area: string | undefined;

  constructor(
    code: string,
    params: TErrorHandlerParams = {},
    nodeLocation?: string,
    area?: string,
    failure?: TTypeGuardErrorFailure,
    customDisplayString?: string,
  ) {
    const codeAsString = String(code);
    const finalDisplayString =
      customDisplayString ??
      params.msg ??
      failure?.message ??
      `Architectural invariant violation: ${codeAsString}`;
    super(`[xalor] ${finalDisplayString}`);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'XalorError';
    this.code = codeAsString;

    // DYNAMIC GPS TELEMETRY FALLBACK
    // Prioritizes build-time metadata coordinates passed explicitly by your loops.
    // Automatically triggers your sector scanner to trace runtime frames on the fly.
    this.nodeLocation = nodeLocation ?? getCallerLocation({}) ?? 'unknown';

    this._area = area;
    this._failure = failure;
    this._keyName =
      area === 'TRANSFORMER_TYPE_RESOLVER' ? codeAsString : undefined;

    if (Error.captureStackTrace) {
      // Commandment VI: Track execution paths natively by locking frames to new.target
      Error.captureStackTrace(this, new.target);
    }

    // Format the definitive error message trace cleanly
    if (this.nodeLocation !== 'unknown') {
      this.message = `${this.message}\n ➔ Location: ${this.nodeLocation}`;
    }
  }

  /** Returns the precise structural failure payload contract without type casting. */
  public get failure(): TTypeGuardErrorFailure | undefined {
    return this._failure;
  }

  /** Returns the tracking key name cleanly with total type-checking validation. */
  public get keyName(): string | undefined {
    return this._keyName;
  }

  /** Returns the explicit error domain area string if mapped during build cycles. */
  public get area(): string | undefined {
    return this._area;
  }

  public static InvalidType(
    keyName: string,
    fileLocation: string,
    failure: TTypeGuardErrorFailure,
    mode: TTransformerExecuteMode,
    format: 'original' | 'formatted' = 'formatted',
  ): XalorError {
    let terminalPanelText = failure.message;

    if (format === 'formatted') {
      terminalPanelText = errorReportService.generateTerminalPanel({
        keyName,
        fileLocation,
        message: failure.message,
        rule: failure.rule,
        mode,
      });
    }
    // Return the instance directly. The type resolves instantly as XalorError.
    return new XalorError(
      keyName,
      { msg: terminalPanelText },
      fileLocation,
      'TRANSFORMER_TYPE_RESOLVER',
      failure,
      terminalPanelText,
    );
  }
}
