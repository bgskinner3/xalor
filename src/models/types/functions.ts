import type { TTypeGuard, TAssert } from '../../../shared';

/**
 * T_RETURN_VALIDATION_TOOLS
 *
 * ROLE:
 * The public interface payload mapping signature for Category 2 (Validation API).
 * Packages narrowed boolean guards and terminal exception asserters together.
 */
export type TReturnValidationTools<K extends TActiveRegistryKeys> = {
  guard: TTypeGuard<TResolveRegistryStructure<K>>;
  assert: TAssert<TResolveRegistryStructure<K>>;
};

// ================================================================================
// ================================================================================
// simulacrum-generators
// ================================================================================
// ================================================================================
export type TMarkdownControl = {
  readonly paragraphs?: number;
  readonly sentencesPerParagraph?: number;
  readonly wordsPerSentence?: number;
  readonly includeHeader?: boolean;
};
export type TTimestampControl = {
  readonly pattern?: string; // e.g., "-3d", "+1h", "-15m"
  readonly allowDrift?: boolean;
};
export type TCurrencyControl = {
  readonly min?: number;
  readonly max?: number;
  readonly locale?: string;
  readonly currency?: string;
};
export type TPercentageBias = 'flat' | 'high' | 'low' | 'centered';

export type TPercentageControl = {
  readonly bias?: TPercentageBias;
  readonly decimals?: number;
};

export type TMaskControl = {
  readonly strategy?: 'full' | 'creditCard' | 'email';
  readonly maskChar?: '*' | 'X';
};
export type TFeistelControl = {
  readonly key?: number;
  readonly rounds?: number;
  readonly mode?: 'encrypt' | 'decrypt';
};
