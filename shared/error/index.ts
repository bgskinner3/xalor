import { getCallerLocation, serialize } from '../utils';
import { XALOR_MESSAGE_HANDLER, XALOR_ERROR_MESSAGE_KEYS } from './messages';
import type { TMessageHandlerParams, TXalorErrorKey } from '../types';
import { isObject, isInArray, isInstanceOf } from '../utils';

/**
 * @example
 * ```ts
 *  //// Handle Error sin try{} catch 
 *   } catch (error: unknown) {
    // 🚀 THE CATCH BOUNDARY:
    // Safely swallows raw system errors and outputs your precise 
    // dictionary template string combined with an absolute clickable GPS link!
    throw XalorError.Unknown(error);
  }

 * 
 * ```
 */
export class XalorError extends Error {
  public readonly code: TXalorErrorKey;
  public readonly nodeLocation: string;

  constructor(
    code: string,
    params: TMessageHandlerParams = {},
    nodeLocation?: string,
  ) {
    if (params.expected && isObject(params.expected)) {
      params.expected = serialize(params.expected);
    }
    if (params.received && isObject(params.expected)) {
      params.received = serialize(params.received);
    }

    const codeName: TXalorErrorKey = isInArray(XALOR_ERROR_MESSAGE_KEYS)(code)
      ? code
      : 'INTERNAL_FRAMEWORK_ERROR';

    // THE DETERMINISTIC TEMPLATE HANDSHAKE
    // Resolves lambda text blocks from your central dictionary with no hardcoded switches.
    const handler = XALOR_MESSAGE_HANDLER.ERROR[codeName];
    const msg = handler
      ? handler(params)
      : `[xalor] Unknown framework error: ${codeName}`;

    super(msg);

    this.code = codeName;
    this.name = 'XalorError';

    // DYNAMIC GPS TELEMETRY FALLBACK
    // If the build-time transformer explicitly passed a node coordinate, prioritize it.
    // Otherwise, capture the live runtime execution frame location automatically on the fly!
    this.nodeLocation = nodeLocation ?? getCallerLocation({}) ?? 'unknown';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, XalorError);
    }

    // Format the definitive error message trace cleanly
    if (this.nodeLocation && this.nodeLocation !== 'unknown') {
      this.message = `${this.message}\n  ➔ Location: ${this.nodeLocation}`;
    }
  }
  /**
   *  Version Drift Exception
   */
  public static VersionMismatch(key: string, version: string): XalorError {
    return new XalorError('DATABASE_VERSION_MISMATCH', { key, version });
  }

  /**
   *  Unknown Key Cache Exception
   */
  public static UnknownKey(key: string): XalorError {
    return new XalorError('MISSING_VAULT_KEY', { key });
  }

  /**
   *  Runtime Type Ingress Mismatch Exception
   */
  public static TypeMismatch(
    path: string,
    expected: unknown,
    received: unknown,
  ): XalorError {
    return new XalorError('TYPE_MISMATCH', { path, expected, received });
  }
  /**
   *  INDEPENDENT INTERCEPTOR
   * Swallows generic unhandled system exceptions (like file system locks)
   * and wraps them cleanly as a XalorError with a dynamic caller location!
   */
  public static Unknown(err: unknown): XalorError {
    const location = getCallerLocation({}) ?? 'unknown';
    const message =
      err instanceof Error
        ? err.message
        : 'An unhandled framework exception occurred.';
    return new XalorError(
      'INTERNAL_FRAMEWORK_ERROR',
      { error: message, msg: message },
      location,
    );
  }

  /**
   * 🛰️ SAFE PIPELINE EXECUTION GUARD
   * Parallels your Supabase safeExecute pattern. Wraps synchronous framework file operations
   * or cache reads, isolates errors, and converts them to clean framework exceptions.
   */
  public static safeExecuteSync<T>(fn: () => T): T {
    try {
      return fn();
    } catch (error) {
      // If it's already an active XalorError, pass it straight through the pipeline
      if (isInstanceOf(error, XalorError)) {
        throw error;
      }
      // Otherwise, intercept and wrap the native crash safely
      throw XalorError.Unknown(error);
    }
  }
  public static GeneralXalorError(message: string): XalorError {
    // 🧠 AUTOMATIC LOCATION SNAPSHOT:
    // Captures the physical file name and line number of the calling file!
    const location = getCallerLocation({}) ?? 'unknown';

    return new XalorError(
      'INTERNAL_FRAMEWORK_ERROR',
      { error: message, msg: message },
      location,
    );
  }
}
