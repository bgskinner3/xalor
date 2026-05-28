import type {
  TXalorMinerRouterMap,
  TRegisterRawPayload,
  TGenerateRawPayload,
  TValidateRawPayload,
  TTransformerRawPayload,
} from '../types';
import {
  isKeyOfArray,
  GENERATOR_MODE_TRIGGERS,
  VALIDATION_MODE_TRIGGERS,
  TRANSFORM_MODE_TRIGGERS,
} from '../../shared';
import type {
  TGenerateXalorModes,
  TValidateXalorModes,
  TTransformXalorModes,
} from '../../shared';

export const XALOR_MINING_ROUTER_MAPPER: TXalorMinerRouterMap = {
  registerXalor: (node, checker): TRegisterRawPayload => {
    const typeArgs = node.typeArguments;
    const args = node.arguments;

    // --- PATH A: Declarative Interface Registration -> <'KEY', Type>() ---
    if (typeArgs && typeArgs.length >= 2) {
      const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
      const shapeType = checker.getTypeFromTypeNode(typeArgs[1]);

      if (!keyType.isStringLiteral()) return null;
      return {
        keyName: keyType.value,
        keyType,
        shapeType,
        apiName: 'registerXalor',
      };
    }

    // --- PATH B: Live Variable Inference -> <'KEY'>(runtimeDataObject) ---
    if (typeArgs && typeArgs.length === 1 && args.length >= 1) {
      const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
      const shapeType = checker.getTypeAtLocation(args[0]);

      if (!keyType.isStringLiteral()) return null;
      return {
        keyName: keyType.value,
        keyType,
        shapeType,
        apiName: 'registerXalor',
      };
    }

    return null;
  },
  generateXalor: (node, checker): TGenerateRawPayload => {
    const typeArgs = node.typeArguments ?? [];

    let keyName: string | undefined;
    let mode: TGenerateXalorModes | undefined;

    if (typeArgs.length >= 2) {
      const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
      const modeType = checker.getTypeFromTypeNode(typeArgs[1]);

      if (keyType.isStringLiteral()) {
        keyName = keyType.value;
      }

      if (
        modeType.isStringLiteral() &&
        isKeyOfArray(GENERATOR_MODE_TRIGGERS)(modeType.value)
      ) {
        mode = modeType.value;
      }
    }

    return { keyName, mode, apiName: 'generateXalor' };
  },
  validateXalor: (node, checker): TValidateRawPayload => {
    const typeArgs = node.typeArguments ?? [];

    let keyName: string | undefined;
    let mode: TValidateXalorModes | undefined;

    // Pattern targeted: validateXalor<'KEY', 'guard' | 'parse'>()
    if (typeArgs.length >= 2) {
      const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
      const modeType = checker.getTypeFromTypeNode(typeArgs[1]);

      if (keyType.isStringLiteral()) {
        keyName = keyType.value;
      }

      if (
        modeType.isStringLiteral() &&
        isKeyOfArray(VALIDATION_MODE_TRIGGERS)(modeType.value)
      ) {
        mode = modeType.value;
      }
    }

    return {
      keyName,
      mode,
      apiName: 'validateXalor',
    };
  },
  transformXalor: (node, checker): TTransformerRawPayload => {
    const typeArgs = node.typeArguments ?? [];

    let keyName: string | undefined;
    let mode: TTransformXalorModes | undefined;

    // Pattern targeted: validateXalor<'KEY', 'guard' | 'parse'>()
    if (typeArgs.length >= 2) {
      const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
      const modeType = checker.getTypeFromTypeNode(typeArgs[1]);

      if (keyType.isStringLiteral()) {
        keyName = keyType.value;
      }

      if (
        modeType.isStringLiteral() &&
        isKeyOfArray(TRANSFORM_MODE_TRIGGERS)(modeType.value)
      ) {
        mode = modeType.value;
      }
    }

    return {
      keyName,
      mode,
      apiName: 'transformXalor',
    };
  },
} satisfies TXalorMinerRouterMap;
