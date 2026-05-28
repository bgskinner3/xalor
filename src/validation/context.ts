// src/validation/context.ts
import type { TValidationContext } from '../../shared';

export function createInitialContext(key?: string): TValidationContext {
  return {
    seen: new Map(),
    path: '$',
    errors: [],
    currentKey: key,
    depth: 0,
  };
}
