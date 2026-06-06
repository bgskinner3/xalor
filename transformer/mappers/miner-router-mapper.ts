// /transformer/mappers/miner-router-mapper.ts
import type { TXalorMinerRouterMap, TRegisterRawPayload } from '../types';
import { extractSingleKeyPayload } from '../utils';

/**
 * MINING ROUTER MAPPER
 *
 * ROLE:
 * Explicit AST static extractors mapped precisely to each executable API signature.
 *
 * STRATEGY:
 * Extracts the primary database key out of the first generic type parameter slot [0],
 * eliminating old recursive sub-argument extraction routines.
 */
export const XALOR_MINING_ROUTER_MAPPER: TXalorMinerRouterMap = {
  // ========================================================================
  // REGISTRATION
  // ========================================================================
  'xalor.register': (node, checker): TRegisterRawPayload | null => {
    const typeArgs = node.typeArguments;
    const args = node.arguments;

    if (typeArgs && typeArgs.length >= 2) {
      const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
      const shapeType = checker.getTypeFromTypeNode(typeArgs[1]);
      if (!keyType.isStringLiteral()) return null;
      return {
        keyName: keyType.value,
        keyType,
        shapeType,
        apiName: 'xalor.register',
      };
    }

    if (typeArgs && typeArgs.length === 1 && args.length >= 1) {
      const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
      const shapeType = checker.getTypeAtLocation(args[0]);
      if (!keyType.isStringLiteral()) return null;
      return {
        keyName: keyType.value,
        keyType,
        shapeType,
        apiName: 'xalor.register',
      };
    }

    return null;
  },

  // ========================================================================
  // GENERATION METHODS
  // ========================================================================
  /* prettier-ignore */ 'xalor.default':    (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.default'),
  /* prettier-ignore */ 'xalor.mock':       (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.mock'),
  /* prettier-ignore */ 'xalor.clone':      (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.clone'),
  /* prettier-ignore */ 'xalor.cast':       (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.cast'),

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================
  /* prettier-ignore */ 'xalor.guard':      (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.guard'),
  /* prettier-ignore */ 'xalor.assert':     (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.assert'),
  /* prettier-ignore */ 'xalor.parse':      (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.parse'),
  /* prettier-ignore */ 'xalor.parseAsync': (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.parseAsync'),
  /* prettier-ignore */ 'xalor.audit':      (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.audit'),

  // ========================================================================
  // TRANSFORMATION METHODS
  // ========================================================================
  /* prettier-ignore */ 'xalor.pick':       (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.pick'),
  /* prettier-ignore */ 'xalor.omit':       (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.omit'),
  /* prettier-ignore */ 'xalor.rename':     (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.rename'),
  /* prettier-ignore */ 'xalor.merge':      (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.merge'),
  /* prettier-ignore */ 'xalor.flatten':    (node, checker) => extractSingleKeyPayload(node, checker, 'xalor.flatten'),
} satisfies TXalorMinerRouterMap;
/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * TODO REMOVE
 */
// // /transformer/mappers/miner-router-mapper.ts
// import type {
//   TXalorMinerRouterMap,
//   TRegisterRawPayload,
//   TGenerateRawPayload,
//   TValidateRawPayload,
//   TTransformerRawPayload,
// } from '../types';
// import {
//   isKeyOfArray,
//   GENERATOR_MODE_TRIGGERS,
//   VALIDATION_MODE_TRIGGERS,
//   TRANSFORM_MODE_TRIGGERS,
// } from '../../shared';
// import type {
//   TGenerateXalorModes,
//   TValidateXalorModes,
//   TTransformXalorModes,
// } from '../../shared';

// export const XALOR_MINING_ROUTER_MAPPER: TXalorMinerRouterMap = {
//   registerXalor: (node, checker): TRegisterRawPayload => {
//     const typeArgs = node.typeArguments;
//     const args = node.arguments;

//     // --- PATH A: Declarative Interface Registration -> <'KEY', Type>() ---
//     if (typeArgs && typeArgs.length >= 2) {
//       const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
//       const shapeType = checker.getTypeFromTypeNode(typeArgs[1]);

//       if (!keyType.isStringLiteral()) return null;
//       return {
//         keyName: keyType.value,
//         keyType,
//         shapeType,
//         apiName: 'registerXalor',
//       };
//     }

//     // --- PATH B: Live Variable Inference -> <'KEY'>(runtimeDataObject) ---
//     if (typeArgs && typeArgs.length === 1 && args.length >= 1) {
//       const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
//       const shapeType = checker.getTypeAtLocation(args[0]);

//       if (!keyType.isStringLiteral()) return null;
//       return {
//         keyName: keyType.value,
//         keyType,
//         shapeType,
//         apiName: 'registerXalor',
//       };
//     }

//     return null;
//   },
//   generateXalor: (node, checker): TGenerateRawPayload => {
//     const typeArgs = node.typeArguments ?? [];

//     let keyName: string | undefined;
//     let mode: TGenerateXalorModes | undefined;

//     if (typeArgs.length >= 2) {
//       const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
//       const modeType = checker.getTypeFromTypeNode(typeArgs[1]);

//       if (keyType.isStringLiteral()) {
//         keyName = keyType.value;
//       }

//       if (
//         modeType.isStringLiteral() &&
//         isKeyOfArray(GENERATOR_MODE_TRIGGERS)(modeType.value)
//       ) {
//         mode = modeType.value;
//       }
//     }

//     return { keyName, mode, apiName: 'generateXalor' };
//   },
// validateXalor: (node, checker): TValidateRawPayload => {
//   const typeArgs = node.typeArguments ?? [];

//   let keyName: string | undefined;
//   let mode: TValidateXalorModes | undefined;

//   // Pattern targeted: validateXalor<'KEY', 'guard' | 'parse'>()
//   if (typeArgs.length >= 2) {
//     const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
//     const modeType = checker.getTypeFromTypeNode(typeArgs[1]);

//     if (keyType.isStringLiteral()) {
//       keyName = keyType.value;
//     }

//     if (
//       modeType.isStringLiteral() &&
//       isKeyOfArray(VALIDATION_MODE_TRIGGERS)(modeType.value)
//     ) {
//       mode = modeType.value;
//     }
//   }

//   return {
//     keyName,
//     mode,
//     apiName: 'validateXalor',
//   };
// },
//   transformXalor: (node, checker): TTransformerRawPayload => {
//     const typeArgs = node.typeArguments ?? [];

//     let keyName: string | undefined;
//     let mode: TTransformXalorModes | undefined;

//     // Pattern targeted: validateXalor<'KEY', 'guard' | 'parse'>()
//     if (typeArgs.length >= 2) {
//       const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
//       const modeType = checker.getTypeFromTypeNode(typeArgs[1]);

//       if (keyType.isStringLiteral()) {
//         keyName = keyType.value;
//       }

//       if (
//         modeType.isStringLiteral() &&
//         isKeyOfArray(TRANSFORM_MODE_TRIGGERS)(modeType.value)
//       ) {
//         mode = modeType.value;
//       }
//     }

//     return {
//       keyName,
//       mode,
//       apiName: 'transformXalor',
//     };
//   },
// } satisfies TXalorMinerRouterMap;
