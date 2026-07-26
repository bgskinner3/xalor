import { PERCENTAGE_BIAS_STRATEGIES } from '../../models/constants';
import type { TCurrencyControl, TPercentageControl } from '../../models/types';

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

// Local, high-performance module-level memoization cache block
// Eliminates repetitive object instantiation costs inside hot runtime generation tracks
const INTL_FORMATTER_CACHE = new Map<string, Intl.NumberFormat>();

/**
 * @see {@link simulacrumGeneratorDocs.currencyAmount}
 */
export const currencyAmount = ({
  min = 0,
  max = 1000,
  locale = 'en-US',
  currency = 'USD',
}: TCurrencyControl = {}): string => {
  const amount = Math.random() * (max - min) + min;

  const cacheKey = `${locale}:${currency}`;
  let formatter = INTL_FORMATTER_CACHE.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    });
    INTL_FORMATTER_CACHE.set(cacheKey, formatter);
  }

  return formatter.format(amount);
};

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * @see {@link simulacrumGeneratorDocs.generateMockPercentage}
 */
export const generateMockPercentage = ({
  bias = 'flat',
  decimals = 2,
}: TPercentageControl = {}): number => {
  const strategy = PERCENTAGE_BIAS_STRATEGIES[bias];
  const factor = strategy();

  const safeDecimals = Math.max(0, Math.min(decimals, 4));
  const scaleMultiplier = Math.pow(10, safeDecimals);

  return Math.round(factor * 100 * scaleMultiplier) / scaleMultiplier;
};
