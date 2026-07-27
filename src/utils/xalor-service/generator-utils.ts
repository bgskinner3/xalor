import type {
  IArchetypeStrategy,
  TXalorSimGeneratorArchTypes,
} from '../../models/types';

export function isUserMutationCallback<Structure, Key extends keyof Structure>(
  rule: unknown,
): rule is (baseValue: Structure[Key]) => Structure[Key] {
  return typeof rule === 'function';
}

// Strategy A: Unpacks known object wrapper properties to match positional parameters cleanly
const pureStrategy: IArchetypeStrategy = Object.freeze({
  execute: (generatorFn, _, __, config) => {
    // 🎯 FIX: Check if the config is an object wrapper container (like { length: 12 })
    if (config && typeof config === 'object' && 'length' in config) {
      const positionalLength = (config as Record<string, unknown>).length;
      return generatorFn(positionalLength);
    }

    // Default fallback for pure object config shapes (currency, percentage, etc.)
    const packedArgs =
      config !== undefined ? Object.freeze([config]) : Object.freeze([]);
    return generatorFn(...packedArgs);
  },
});

// Strategy B: Injects the dynamic field key context parameter natively
const contextualStrategy: IArchetypeStrategy = Object.freeze({
  execute: (generatorFn, propertyName) => {
    return generatorFn(propertyName);
  },
});

// Strategy C: Passes the baseline mock primitive first, followed by custom configurations
const transformerStrategy: IArchetypeStrategy = Object.freeze({
  execute: (generatorFn, _, baselineValue, config) => {
    const transformerArgs =
      config !== undefined
        ? Object.freeze([baselineValue, config])
        : Object.freeze([baselineValue]);

    return generatorFn(...transformerArgs);
  },
});

/* prettier-ignore */
export const ARCHETYPE_STRATEGY_ROUTER: Record<TXalorSimGeneratorArchTypes, IArchetypeStrategy> = Object.freeze({
  pure: pureStrategy,
  contextual: contextualStrategy,
  transformer: transformerStrategy,
}) satisfies  Record<TXalorSimGeneratorArchTypes, IArchetypeStrategy>
