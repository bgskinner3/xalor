import * as identity from './identity';
import * as primitives from './primitives';
import * as contextual from './contextual';
import * as securityGen from './security-gen';
import { TXalorGeneratorValidatorMap } from '../../models/types';

export const xalorSimGenerator: TXalorGeneratorValidatorMap = Object.freeze({
  uuid: identity.generateFastUuidV4,
  compactId: identity.generateCompactId,
  percentage: primitives.generateMockPercentage,
  currency: primitives.currencyAmount,
  email: contextual.generateSemanticEmail,
  userHandle: contextual.generateMockUserHandle,
  loremIpsum: contextual.generateLoremMarkdown,
  timestamp: contextual.generateRelativeTimestamp,
  mockJwt: securityGen.generateMockJwt,
  maskedString: securityGen.generateAnonymizedMask,
  miniBlockCipher: securityGen.generateFeistelBlockCipher,
}) satisfies TXalorGeneratorValidatorMap;

export * from './identity';
export * from './contextual';
export * from './primitives';
export * from './security-gen';

/**
 identity = generateFastUuidV4  generateCompactId  generateUlid or generateSequentialId.
 contextual = // generateSemanticEmail  generateMockUserHandle  generateRelativeTimestamp  generateLoremMarkdown
 primitives = // generateMockPercentage  currencyAmount  generateClampedInt, generateGaussianFloat, or generateBoundedString.
 security-gen = // generateAnonymizedMask generateMockJwt generateFeistelBlockCipher dummy imitation or compliance tools like generateTaxIdentifier.
 safeCastNumeric(value, fallback = 0)
  - The Idea: Intelligently handles messy incoming data. It natively strips out currencies, spaces, and commas (e.g., converting strings like "$1,250.50" or " 42 px ") and cleanly casts them into true floats or integers.

coerceBoolean(value, truthyArray)
  - The Idea: Expands native boolean casting. Instead of just relying on truthy/falsy values, it checks against custom string structures (e.g., treating "yes", "true", "1", "active", or "on" as true, and everything else as false).

 */
