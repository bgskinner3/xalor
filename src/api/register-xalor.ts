import { XalethorService } from '../xalor-service';
import { isMetaData } from '../../shared';
/**
 * RUNTIME API: REGISTER XALOR
 *
 * Ingests data structures or explicit generic definitions straight into the global type register.
 * Operates as an inert compiler target during build-time sweeps, solidifying metadata singletons on save.
 *
 * @example
 * ```ts
 * type TUser = {
 *   id: number;
 *   name: string;
 *   address: {
 *     street: string;
 *     city: string;
 *   };
 * };
 *
 * // Register your defined type globally
 * // Simply pass the KEY name and the type
 * registerXalor<'USER_KEY', TUser>();
 *
 * const userData = {
 *   id: 1,
 *   name: 'Alex Carter',
 *   address: {
 *     street: '42 West Market St',
 *     city: 'New York',
 *   },
 * };
 *
 * // Or generically pass the key name
 * // and provide the object in the params
 * registerXalor<'USER_TEST_4'>(userData);
 * ```
 *
 * @see {@link RuntimeApiDocs.registerXalor}
 */
export function registerXalor<
  _K extends keyof ISolidRegistry | (string & {}),
  _T,
>(): void;
/** II. REGISTRATION: Via Data Inference (Argument) */
export function registerXalor<_K extends keyof ISolidRegistry | (string & {})>(
  data: unknown,
): void;
export function registerXalor<_K extends keyof ISolidRegistry | (string & {})>(
  params?: unknown,
): void {
  /**
   * THE GHOST CHECK
   *
   * If the Transformer ran correctly, 'params' is no longer the 'data' object.
   * It has been rewritten into a TSolidMetadata object.
   */
  if (isMetaData(params)) {
    return XalethorService.solidify(params);
  }

  /**
   * 💨 BAILOUT
   * If this code is reached in Production and 'isMetaData' is false:
   * 1. The Transformer was not configured.
   * 2. This file was skipped by the Scout.
   * 3. We are in a 'Volatile' environment.
   */
  return;
}
// registerXalor({});
