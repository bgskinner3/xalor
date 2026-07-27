import { isFunction } from '../../../shared';
import type {
  IArchetypeStrategy,
  TXalorSimGeneratorArchTypes,
} from '../../models/types';

export function isUserMutationCallback<Structure, Key extends keyof Structure>(
  rule: unknown,
): rule is (baseValue: Structure[Key]) => Structure[Key] {
  return isFunction(rule);
}

const pureStrategy: IArchetypeStrategy = Object.freeze({
  executePure: (generatorFn, config) => {
    return (generatorFn as (...args: readonly unknown[]) => string | number)(
      ...config,
    );
  },
  executeContextual: () => '',
  executeTransformer: () => '',
});

// Strategy B: Only handles context injection natively
const contextualStrategy: IArchetypeStrategy = Object.freeze({
  executePure: () => '',
  executeContextual: (generatorFn, propertyName) => {
    return generatorFn(propertyName);
  },
  executeTransformer: () => '',
});

const transformerStrategy: IArchetypeStrategy = Object.freeze({
  executePure: () => '',
  executeContextual: () => '',
  executeTransformer: (generatorFn, baselineValue, config) => {
    const transformerArgs =
      config !== undefined
        ? Object.freeze([baselineValue, config])
        : Object.freeze([baselineValue]);

    return (generatorFn as (...args: readonly unknown[]) => string)(
      ...transformerArgs,
    );
  },
});

/* prettier-ignore */
export const ARCHETYPE_STRATEGY_ROUTER: Record<TXalorSimGeneratorArchTypes, IArchetypeStrategy> = Object.freeze({
  pure: pureStrategy,
  contextual: contextualStrategy,
  transformer: transformerStrategy,
}) satisfies  Record<TXalorSimGeneratorArchTypes, IArchetypeStrategy>
