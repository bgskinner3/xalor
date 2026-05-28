//transformer/reifiers/registry/index.ts
/**
 * REIFIER REGISTRY BOOTSTRAP
 *
 * THE IMPORT ORDER HERE IS PARAMOUNT.
 * Reifiers are executed in the order they are registered.
 * Specific patterns (like Branded Types) must be imported before
 * generic patterns (like Intersections or Objects).
 */

import './branded'; // Check for __brand first
import './intersections'; // Check for & (Generic)
import './unions'; // Check for |
import './array'; // Check for []
import './objects'; // Check for {} / interfaces
import './primitives'; // Check for string/number/boolean

export { REIFIERS } from './core';
