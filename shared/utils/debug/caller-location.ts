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
// export const getCallerLocation = (
//   options: TGetCallerLocationOptions = {},
// ): string => {
//   const { topParent = false } = options;
//   const err = { stack: '' };
//   Error.captureStackTrace?.(err, getCallerLocation);
//   const stack = err.stack || new Error().stack;

//   if (!stack) {
//     console.log('\x1b[31m[xalor:stack-debug] ❌ Crash Blocked: Raw stack trace is empty or undefined.\x1b[0m');
//     return 'unknown';
//   }

//   const lines = stack.split('\n');
//   let targetLine: string | undefined;

//   console.log('\x1b[33m[xalor:stack-debug] 🔍 Initiating Call Stack Frame Ingestion Pipeline...\x1b[0m');

//   if (topParent) {
//     for (let i = lines.length - 1; i >= 1; i--) {
//       const line = lines[i];
//       if (!line) continue;
//       const isInternal = /node_modules|node:internal|jest-/.test(line);
//       if (!isInternal && (line.includes('.ts') || line.includes('.js'))) {
//         targetLine = line;
//         break;
//       }
//     }
//   } else {
//     // 🧠 THE SECTOR SCANNER
//     const len = lines.length;
//     for (let i = 1; i < len; i++) {
//       const line = lines[i];
//       if (!line) continue;

//       // 🟢 FIX OVER-AGGRESSIVE MATCHING:
//       // Changed 'xalor/src' to look for boundaries inside node_modules layouts ('@bgskinner2/xalor')
//       // or explicit build files instead of matching any folder containing 'xalor' letters.
//       const isInternal = /node_modules|node:internal|jest-|v8-compile|@bgskinner2\/xalor\/dist|@bgskinner2\/xalor\/src/.test(line);

//       // Print individual row trace status indicators to see exactly what is filtered out
//       console.log(
//         `\x1b[90m[xalor:stack-debug]   Frame [${i}] -> Internal: ${isInternal ? '🚨 SKIP' : '✅ KEEP'} | Text: ${line.trim()}\x1b[0m`
//       );

//       if (!isInternal && (line.includes('.ts') || line.includes('.js'))) {
//         targetLine = line;
//         console.log(`\x1b[32m[xalor:stack-debug] 🎉 Target boundary matched at stack index [${i}]!\x1b[0m`);
//         break;
//       }
//     }
//   }

//   if (!targetLine) {
//     console.log('\x1b[31m[xalor:stack-debug] ❌ Search Completed: No valid external application line matched rules.\x1b[0m');
//     return 'unknown';
//   }

//   // Captures both absolute standard paths and Windows drive maps (C:\...) cleanly
//   const match = targetLine.match(/((?:\/|[A-Z]:\\)[^:]+:\d+:\d+)/);

//   if (!match) {
//     const fallbackCleaned = targetLine.replace(/^\s*at\s+/, '').trim();
//     console.log(`\x1b[33m[xalor:stack-debug] ℹ️ Sub-regex fell back to row string: ${fallbackCleaned}\x1b[0m`);
//     return fallbackCleaned;
//   }

//   console.log(`\x1b[32m[xalor:stack-debug] ✅ Extracted Clickable Coordinates: ${match[1]}\x1b[0m\n`);
//   return match[1];
// };
