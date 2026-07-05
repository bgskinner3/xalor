import type { TGetCallerLocationOptions } from '../../types';

/**
 * @utilType util
 * @name getCallerLocation
 * @category Debug
 * @description Parses the stack trace to identify the file, line, and column of the calling function.
 * @link #getcallerlocation
 *
 * ## 📍 getCallerLocation — Stack Trace Tracer
 *
 * Retrieves the caller's location (file, line, and column).
 * Useful for automated logging, debugging, and identifying the origin of specific operations.
 *
 * @example
 * ```ts
 * import { DebugUtils } from '@/utils/core/debug';
 *
 * function exampleFunction() {
 *   console.log(DebugUtils.getCallerLocation());
 * }
 *
 * exampleFunction();
 * // Example output:
 * // "src/utils/core/debug.ts:12:5"
 * ```
 *
 * @example
 * ```ts
 * // Get the top-most relevant frame (ignoring node_modules)
 * console.log(DebugUtils.getCallerLocation(3, 2, true));
 * // Example output:
 * // "src/server/api/user.ts:88:17"
 * ```
 *
 * @example
 * ```ts
 * // Strip out the absolute path prefix for cleaner logs
 * console.log(DebugUtils.getCallerLocation(3, 2, false, process.cwd()));
 * // Example output:
 * // "/src/services/logger.ts:54:9"
 * ```
 */
export const getCallerLocation = (
  options: TGetCallerLocationOptions = {},
): string => {
  const { topParent = false } = options;

  const err = { stack: '' };
  Error.captureStackTrace?.(err, getCallerLocation);
  const stack = err.stack || new Error().stack;
  if (!stack) return 'unknown';

  const lines = stack.split('\n');
  let targetLine: string | undefined;

  if (topParent) {
    // Top-most parent crawler path remains exactly as it is...
    for (let i = lines.length - 1; i >= 1; i--) {
      const line = lines[i];
      const isInternal = /node_modules|node:internal|jest-/.test(line);
      if (!isInternal && (line.includes('.ts') || line.includes('.js'))) {
        targetLine = line;
        break;
      }
    }
  } else {
    // 🧠 THE SECTOR SCANNER: Loop forward from the top of the active stack array frame
    const len = lines.length;
    for (let i = 1; i < len; i++) {
      const line = lines[i];

      // Filter out all noise, including internal compiler code from your package name tracks!
      const isInternal =
        /node_modules|node:internal|jest-|v8-compile|xalor\/dist|xalor\/src/.test(
          line,
        );

      if (!isInternal && (line.includes('.ts') || line.includes('.js'))) {
        targetLine = line;
        break; // Stop immediately the exact microsecond we cross your library border!
      }
    }
  }

  if (!targetLine) return 'unknown';

  const match = targetLine.match(/((?:\/|[A-Z]:\\)[^:]+:\d+:\d+)/);
  if (!match) return targetLine.replace(/^\s*at\s+/, '').trim();
  return match[1];
};
