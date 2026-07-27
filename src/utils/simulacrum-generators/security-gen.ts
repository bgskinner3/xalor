import { SIMULACRUM_ASCII_TABLES } from '../../models/constants';
import type { TXalorSimTypeMap } from '../../models/types';

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * @see {@link simulacrumGeneratorDocs.generateMockJwt}
 */
export const generateMockJwt = (_payloadShape?: unknown): string => {
  const { JWT_HEADER_BYTES, DEFAULT_PAYLOAD_BYTES, MOCK_SIGNATURE_BYTES } =
    SIMULACRUM_ASCII_TABLES;
  const PERIOD_BYTE = 46; // '.'
  const headerLen = JWT_HEADER_BYTES.length;
  const payloadLen = DEFAULT_PAYLOAD_BYTES.length;
  const sigLen = MOCK_SIGNATURE_BYTES.length;

  const totalBytes = headerLen + 1 + payloadLen + 1 + sigLen;
  const buffer = new Uint8Array(totalBytes);
  let cursor = 0;

  // 1. Stream the static pre-compiled structural Header bytes
  for (let i = 0; i < headerLen; i++) {
    buffer[cursor++] = JWT_HEADER_BYTES[i];
  }

  buffer[cursor++] = PERIOD_BYTE;

  for (let i = 0; i < payloadLen; i++) {
    buffer[cursor++] = DEFAULT_PAYLOAD_BYTES[i];
  }

  buffer[cursor++] = PERIOD_BYTE;

  for (let i = 0; i < sigLen; i++) {
    buffer[cursor++] = MOCK_SIGNATURE_BYTES[i];
  }

  return String.fromCharCode.apply(null, buffer as unknown as number[]);
};

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================

/**
 * @see {@link simulacrumGeneratorDocs.generateAnonymizedMask}
 */
export const generateAnonymizedMask = (
  sourceValue: string,
  { strategy = 'full', maskChar = '*' }: TXalorSimTypeMap<'TMaskConfig'> = {},
): string => {
  // Resolve target ASCII replacement codes natively: '*'=42, 'X'=88
  const maskByte = maskChar === '*' ? 42 : 88;
  const AT_BYTE = 64; // '@'
  const PERIOD_BYTE = 46; // '.'

  const valueLength = sourceValue.length;
  const safeLength = Math.max(0, Math.min(valueLength, 256));

  const buffer = new Uint8Array(safeLength);
  for (let i = 0; i < safeLength; i++) {
    buffer[i] = sourceValue.charCodeAt(i);
  }

  if (strategy === 'full') {
    for (let i = 0; i < safeLength; i++) {
      buffer[i] = maskByte;
    }
  }

  if (strategy === 'creditCard') {
    const endMaskIndex = safeLength - 4;
    for (let i = 4; i < endMaskIndex; i++) {
      buffer[i] = maskByte;
    }
  }

  if (strategy === 'email') {
    let atIdx = -1;
    let periodIdx = -1;

    for (let i = 0; i < safeLength; i++) {
      if (buffer[i] === AT_BYTE) atIdx = i;
      if (atIdx !== -1 && buffer[i] === PERIOD_BYTE) periodIdx = i;
    }

    for (let i = 1; i < atIdx; i++) {
      buffer[i] = maskByte;
    }

    const domainMaskStart = atIdx + 2;
    if (periodIdx > domainMaskStart) {
      for (let i = domainMaskStart; i < periodIdx; i++) {
        buffer[i] = maskByte;
      }
    }
  }

  return String.fromCharCode.apply(null, buffer as unknown as number[]);
};

// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================
/**
 * Low-level, stateless bitwise diffusion F-box function.
 * Pulled to module scope to guarantee absolute zero runtime allocation overhead.
 * Complies strictly with Commandment VIII and IX.
 */
const executeFeistelRoundFunction = (num: number, roundKey: number): number => {
  // Use bitwise XOR and unsigned 32-bit integer normalization masks (| 0)
  const structuralHash = (num ^ roundKey) | 0;
  // Linear congenital multiplier parameter mimicking Blowfish internal transformations
  return Math.abs((structuralHash * 214013 + 2531011) & 0xffffffff) | 0;
};
/**
 *
 * @example
 * ```ts
 * import { generateFeistelBlockCipher } from './security';
 *
 * const customSeed = 8888;
 *
 * // 🔒 1. ENCRYPT MODE: Scramble tracking strings into high-entropy tokens instantly
 * const secureHash = generateFeistelBlockCipher("user_042", {
 *   key: customSeed,
 *   mode: 'encrypt'
 * });
 * // Returns a uniform hex token: "4a7e2b1d9c8f03ae"
 *
 * // 🔓 2. DECRYPT MODE: Reverse the key schedule pass to verify routing integrity
 * const originalSource = generateFeistelBlockCipher(secureHash, {
 *   key: customSeed,
 *   mode: 'decrypt'
 * });
 * // Returns the exact native integer mapping bounds: "reified_block:4a7e2b1d9c8f03ae"
 * ```
 *
 * @see {@link simulacrumGeneratorDocs.generateFeistelBlockCipher}
 *
 * For more info and the full TypeScript build:
 *
 * @see {@link https://github.com/bgskinner3/ByteBits}
 *
 */
export const generateFeistelBlockCipher = (
  plaintext: string,
  {
    key = 1337,
    rounds = 4,
    mode = 'encrypt',
  }: TXalorSimTypeMap<'TFeistelConfig'> = {},
): string => {
  const { FEISTEL_HEX_BYTES } = SIMULACRUM_ASCII_TABLES;

  const safeRounds = Math.max(2, Math.min(rounds, 16));

  const roundKeys = new Int32Array(safeRounds);
  let workingKey = key | 0;
  for (let r = 0; r < safeRounds; r++) {
    workingKey = (workingKey * 31 + r) | 0;
    roundKeys[r] = workingKey;
  }

  let left = 0;
  let right = 0;

  const isEncrypt = mode === 'encrypt';

  if (isEncrypt) {
    const textLength = plaintext.length;
    const safeLength = Math.max(0, Math.min(textLength, 256));

    for (let i = 0; i < safeLength; i++) {
      const isEven = (i & 1) === 0;
      const charCode = plaintext.charCodeAt(i);
      if (isEven) {
        left = ((left << 5) - left + charCode) | 0;
      } else {
        right = ((right << 5) - right + charCode) | 0;
      }
    }
  } else {
    if (plaintext.length !== 16) return '';

    for (let i = 0; i < 8; i++) {
      const charCode = plaintext.charCodeAt(i);
      const val = charCode >= 97 ? charCode - 87 : charCode - 48; // Fast hex decoding step
      left = (left << 4) | (val & 0xf);
    }
    for (let i = 8; i < 16; i++) {
      const charCode = plaintext.charCodeAt(i);
      const val = charCode >= 97 ? charCode - 87 : charCode - 48;
      right = (right << 4) | (val & 0xf);
    }
  }

  for (let r = 0; r < safeRounds; r++) {
    const keyIndex = isEncrypt ? r : safeRounds - 1 - r;
    const currentKey = roundKeys[keyIndex];

    const temp = right;
    right = (left ^ executeFeistelRoundFunction(right, currentKey)) | 0;
    left = temp;
  }

  if (isEncrypt) {
    const outBuffer = new Uint8Array(16);
    let leftBlock = left >>> 0;
    let rightBlock = right >>> 0;

    for (let i = 7; i >= 0; i--) {
      outBuffer[i] = FEISTEL_HEX_BYTES[leftBlock & 0xf];
      leftBlock >>>= 4;
    }
    for (let i = 15; i >= 8; i--) {
      outBuffer[i] = FEISTEL_HEX_BYTES[rightBlock & 0xf];
      rightBlock >>>= 4;
    }
    return String.fromCharCode.apply(null, outBuffer as unknown as number[]);
  } else {
    return `reified_block:${(left >>> 0).toString(16)}${(right >>> 0).toString(16)}`;
  }
};
