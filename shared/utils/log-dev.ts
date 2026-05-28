import { ANSI_COLOR_CODES, DEFAULT_TYPE_COLORS } from '../constants';
/**
 * LOG DEV CONFIG
 *
 *
 * Register services here.
 * If set to false, all logDev calls for that service will be silenced.
 */
const LOG_CONFIG = {
  'transformer/index.ts': false,
  'vault-archive.ts-persist': true,
  'vault-archive.ts-hydrateFromGenesis': false,
  'vault-archive.ts-syncLiveCacheIfDrifted': true,
  'vault-keeper.ts/Updating': false,
  'vault-keeper.ts/solidifyMeta': false,
  'miner/index.ts': true,
  'transformer/index.ts/Main': false,
  'transformer/boot': false,
  off: false,
} as const;
// hydrateFromGenesis
interface ILogOptions {
  service?: keyof typeof LOG_CONFIG;
  color?: keyof typeof ANSI_COLOR_CODES;
  type?: 'log' | 'info' | 'error' | 'debug' | 'warn';
  override?: boolean;
}

/**
 * A smoothed, environment-aware logger for development and testing.
 *
 * This logger only executes when `NODE_ENV` is set to 'test'. It allows for
 * service-based filtering via the `LOG_CONFIG` and supports custom ANSI coloring.
 *
 * @param message - The primary text or data to be logged.
 * @param options - Configuration object to refine the log output.
 * @param options.service - The key in `LOG_CONFIG` to check if logging is enabled for this module.
 * @param options.color - Override the default color (e.g., 'red', 'green', 'magenta').
 * @param options.type - The console method to use (defaults to 'log').
 *
 * @example
 * ```ts
 * // Basic usage (defaults to yellow 'log')
 * logDev("Server started");
 *
 * // Using a registered service (only logs if LOG_CONFIG.auditorService is true)
 * logDev("User login attempt", { service: "auditorService", type: "info" });
 *
 * // Overriding colors for visibility
 * logDev("Critical Failure!", { color: "red", type: "error" });
 * ```
 */
export function logDev(message: string, options: ILogOptions = {}) {
  const { service, color, type = 'log', override = false } = options;
  if (!override && process.env.NODE_ENV !== 'test') {
    return;
  }

  // 1. Logic Check: Only log if service is unregistered OR set to true
  if (service !== undefined && LOG_CONFIG[service] === false) {
    return;
  }

  // 2. Select Color: Option override > Default type color > Fallback yellow
  const selectedColor = color || DEFAULT_TYPE_COLORS[type] || 'yellow';

  const formattedMessage = `${ANSI_COLOR_CODES[selectedColor]}${message}${ANSI_COLOR_CODES.reset}`;

  // 3. Dynamic Console Call
  (console[type] || console.log)(formattedMessage);
}
