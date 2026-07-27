import { XALOR_SIM_GENERATOR_UTIL_KEYS } from '../../constants';
import type { TKeys, TValues } from '../../../../shared';

// ================================================================================
// ================================================================================
// simulacrum-generators
// ================================================================================
// ================================================================================
export type TPercentageBias = 'flat' | 'high' | 'low' | 'centered';
/* prettier-ignore */
export type TXalorSimGeneratorKeys = TKeys<typeof XALOR_SIM_GENERATOR_UTIL_KEYS>
/* prettier-ignore */
export type TXalorSimGeneratorArchTypes = TValues<typeof XALOR_SIM_GENERATOR_UTIL_KEYS>

// ================================================================================
// ================================================================================
// xalorSimGenerator BASE KEY TYPES
// ================================================================================
// ================================================================================

type TXalorSimGenUtilTypes = {
  /* prettier-ignore */ TCompactIdConfig:   { readonly length?: number };
  /* prettier-ignore */ TPercentageConfig:  { readonly bias?: 'flat' | 'high' | 'low' | 'centered'; readonly decimals?: number };
  /* prettier-ignore */ TCurrencyConfig:    { readonly min?: number; readonly max?: number; readonly locale?: string; readonly currency?: string };
  /* prettier-ignore */ TMarkdownConfig:    { readonly paragraphs?: number; readonly sentencesPerParagraph?: number; readonly wordsPerSentence?: number; readonly includeHeader?: boolean };
  /* prettier-ignore */ TTimestampConfig:   { readonly pattern?: string; readonly allowDrift?: boolean };
  /* prettier-ignore */ TMaskConfig:        { readonly strategy?: 'full' | 'creditCard' | 'email'; readonly maskChar?: '*' | 'X' };
  /* prettier-ignore */ TJwtConfig:         { readonly payloadShape?: unknown };
  /* prettier-ignore */ TFeistelConfig:     { readonly key?: number; readonly rounds?: number; readonly mode?: 'encrypt' | 'decrypt' };
};

/* prettier-ignore */ export type TXalorSimTypeMap<K extends keyof TXalorSimGenUtilTypes> = TXalorSimGenUtilTypes[K];
/* prettier-ignore */ export type TGetGeneratorReturnType<K extends TXalorSimGeneratorKeys> = ReturnType<TXalorGeneratorSignatureRegistry[K]>;
/**
 * TXALOR SIM GENERATOR PARAMETERS CONFIGURATION
 * Direct structural binding linking each utility string key cleanly to its
 * corresponding explicit configuration layout block from TXalorSimGenUtilTypes.
 *
 * Satisfies COMMANDMENT I: Single Source of Truth rule.
 * Satisfies COMMANDMENT IX: Statically derived without any type-checking gaps.
 */
export type TXalorSimGenParamsMap = {
  readonly uuid: undefined; // Requires zero configuration parameters
  readonly email: undefined; // Contextual: runtime handles this automatically
  readonly userHandle: undefined; // Contextual: runtime handles this automatically

  readonly compactId: { readonly length?: number };
  readonly percentage: TXalorSimGenUtilTypes['TPercentageConfig'];
  readonly currency: TXalorSimGenUtilTypes['TCurrencyConfig'];
  readonly loremIpsum: TXalorSimGenUtilTypes['TMarkdownConfig'];
  readonly timestamp: TXalorSimGenUtilTypes['TTimestampConfig'];
  readonly mockJwt: TXalorSimGenUtilTypes['TJwtConfig'];
  readonly maskedString: TXalorSimGenUtilTypes['TMaskConfig'];
  readonly miniBlockCipher: TXalorSimGenUtilTypes['TFeistelConfig'];
};

/**
 * Enforces the rigid structural contract for the global simulation utility suite.
 * Maps every functional signature cleanly to its exact configuration parameters.
 *
 * Satisfies COMMANDMENT I & IX: Statically forces explicit types for every key
 * without allowing loose runtime additions or structural drift.
 */
export interface IXalorSimGeneratorSuite {
  /* prettier-ignore */ readonly currency: (config?: TXalorSimTypeMap<'TCurrencyConfig'>) => string;
  /* prettier-ignore */ readonly uuid: () => string;
  /* prettier-ignore */ readonly compactId: (length?: number) => string;
  /* prettier-ignore */ readonly percentage: (config?: TXalorSimTypeMap<'TPercentageConfig'>) => number;
  /* prettier-ignore */ readonly email: (propertyKey: string) => string;
  /* prettier-ignore */ readonly userHandle: (propertyKey: string) => string;
  /* prettier-ignore */ readonly loremIpsum: (config?: TXalorSimTypeMap<'TMarkdownConfig'>) => string;
  /* prettier-ignore */ readonly timestamp: (config?: TXalorSimTypeMap<'TTimestampConfig'>) => string;
  /* prettier-ignore */ readonly mockJwt: (config?: TXalorSimTypeMap<'TJwtConfig'>) => string;
  /* prettier-ignore */ readonly maskedString: (sourceValue: string, config?: TXalorSimTypeMap<'TMaskConfig'>) => string;
  /* prettier-ignore */ readonly miniBlockCipher: (plaintext: string, config?:  TXalorSimTypeMap<'TFeistelConfig'>) => string;
}
/**
 * TXALOR TUPLE PATTERN CONFIGURATION
 * Decouples public developer DX from internal runner layouts natively.
 * Enforces that if a utility has no config parameters, it can only be a single-item tuple.
 */
export type TXalorTupleMapping<K extends TXalorSimGeneratorKeys> =
  TXalorSimGenParamsMap[K] extends undefined
    ? readonly [generatorKey: K] // No config allowed (uuid, email, userHandle)
    : | readonly [generatorKey: K] // Config is completely voluntary, defaults used
      | readonly [generatorKey: K, config: TXalorSimGenParamsMap[K]]; // Config is explicitly provided

/**
 * THE ULTIMATE MOCK OVERRIDES MAP
 *
 * Instead of pooling keys together into a wide matrix index lookup, we distribute the union
 * directly over the permitted utility keys. This forces each array choice to act as a
 * true discriminated union where index 0 perfectly locks down index 1.
 *
 * Satisfies COMMANDMENT I: Built completely on top of your existing parameters map.
 * Satisfies COMMANDMENT IX: 100% free of unchecked type escape holes or erasures.
 */
type TCompute<T> = { [K in keyof T]: T[K] } & {};

/**
 * PRE-COMPUTED TUPLE MATRIX DEFINITION
 *
 * Spells out each utility option as a strict literal tuple block ahead of time.
 * This completely strips away the type engine's ability to lazy-cache the layout.
 *
 * Satisfies COMMANDMENT I: Built completely on top of your existing parameters map.
 * Satisfies COMMANDMENT IX: 100% free of unchecked type escape holes or erasures.
 */
type TPreComputedTupleMatrix = {
  readonly [
    K in TXalorSimGeneratorKeys
  ]: TXalorSimGenParamsMap[K] extends undefined
    ? TCompute<readonly [generatorKey: K]>
    : | TCompute<readonly [generatorKey: K]>
      | TCompute<
          readonly [generatorKey: K, config: TCompute<TXalorSimGenParamsMap[K]>]
        >;
};

/**
 * THE ULTIMATE MOCK OVERRIDES MAP
 *
 * Maps every property 'P' of your contract structure to either a closure or an indexed lookup.
 * By using a flat key intersection lookup across our pre-computed matrix,
 * the compiler is forced to rip open and print the full documentation menu instantly on hover.
 */
export type TMockOverrides<K extends TActiveRegistryKeys> = {
  readonly [P in keyof TResolveRegistryStructure<K>]?:
    | ((
        baseValue: TResolveRegistryStructure<K>[P],
      ) => TResolveRegistryStructure<K>[P])
    | TPreComputedTupleMatrix[{
        [
          U in TXalorSimGeneratorKeys
        ]: TGetGeneratorReturnType<U> extends TResolveRegistryStructure<K>[P]
          ? U
          : never;
      }[TXalorSimGeneratorKeys]];
};

export type TXalorGeneratorSignatureRegistry = {
  readonly [K in TXalorSimGeneratorKeys]: IXalorSimGeneratorSuite[K];
};
export type TXalorGeneratorValidatorMap = {
  readonly [K in TXalorSimGeneratorKeys]: IXalorSimGeneratorSuite[K];
};

export interface IArchetypeStrategy {
  readonly execute: (
    generatorFn: (...args: readonly unknown[]) => unknown,
    propertyName: string,
    baselineValue: unknown,
    config: unknown,
  ) => unknown;
}
