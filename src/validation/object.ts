// src/validation/validators.ts
import type { TValidationContext, TSolidObjectShape } from '../../shared';
import { isSafeRecord } from '../../shared';
import { PROTO_EXPLOIT_KEYS } from '../models/constants';
import type {
  TRuntimeShapeValidationErrorKey,
  TFastPathMetadata,
} from '../models/types';
import {
  PRIMITIVE_VALIDATION_CHECKERS,
  PRIMITIVE_ERROR_KEY_MAP,
} from '../mappers';
import { xalethorVaultValidation } from '../xalor-service/vault-validation';
import { isPrimitiveShape } from '../../shared';
function getTrueCodePointLength(val: string): number {
  const totalCodeUnits = val.length;
  let visualCharacterCount = 0;

  for (let i = 0; i < totalCodeUnits; i++) {
    const codeUnit = val.charCodeAt(i);
    visualCharacterCount++;
    // If we encounter a high-surrogate code unit (0xD800 - 0xDBFF),
    // skip the trailing low-surrogate unit since they form a single character!
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      i++;
    }
  }

  return visualCharacterCount;
}
/**
 * ============================================================================
 * 🏎️ HOT PATH PROCESS FLOW DIAGRAM & MECHANICAL PIPELINE
 * ============================================================================
 *
 * [ STEP 1: INITIAL RECORD VERIFICATION GUARD ]
 *   └── Enforces baseline record structural compliance. Lowers memory type leaks early.
 *
 * [ LAYER 0: PURE REFERENCE REUSE CHECK ]
 *   └── Short-circuits instantly if object identity has already passed this lifecycle run.
 *
 * [ LAYER 1: AOT COMPILER JIT STRATEGY PERIMETER ]
 *   ├── IF Cache Hit  ──> Runs compiled optimized inline checkers + skips deep loops entirely.
 *   └── IF Cache Miss ──> Determines topology footprint via Zero-Allocation Scan.
 *          ├── PATH A (Pure Flat Primitives): Compiles static boolean closure matching arrays.
 *          └── PATH B (Mixed Complex Nodes): Pre-slices primitives into firewall targets
 *                                            and structural entries into deep track lists.
 *
 * [ STEP 2: HIGH-SPEED PRIMITIVE FIREWALL TRACK ]
 *   └── Filters flat types/presence rules synchronously over static key arrays under 250ns.
 *
 * [ STEP 3: STRICT EXTRA-PROPERTY CHECK ]
 *   └── Intercepts illegal parameter injection drops strictly if configured.
 *
 * [ STEP 4: PRE-COMPILED STRUCTURAL GRAPH NAVIGATION ]
 *   └── Walks ONLY non-primitive branches (nested schemas/unions/arrays) to isolate breaks.
 *
 * ============================================================================
 */

/**
 * Validates complex record topologies and nested object trees.
 */
export function validateObject(
  data: unknown,
  shape: TSolidObjectShape,
  ctx: TValidationContext,
  blueprintId?: string,
): boolean {
  // ============================================================================
  // [ STEP 1 ] BASELINE STRUCTURAL RECORD CHECK
  // ============================================================================
  if (!isSafeRecord(data)) {
    return xalethorVaultValidation.reportError({
      ctx,
      errorKey: 'OBJECT_VALIDATION_TYPE_MISMATCH',
      received: data,
    });
  }
  const currentPathIndex = ctx.pathPointer;
  if (currentPathIndex > 0) {
    for (const key in data) {
      if (key in data) {
        const val = data[key];

        // If the property value is an object reference, cross-reference it against the stack
        if (typeof val === 'object' && val !== null) {
          for (let d = 0; d < currentPathIndex; d++) {
            if (ctx.refStack[d] === val) {
              ctx.isInvalidCircular = true; // Flip the global loop breaker flag
              ctx.pathStack[ctx.pathPointer++] = key; // Push the exact malicious key to the path stack

              xalethorVaultValidation.reportError({
                ctx,
                errorKey: 'UNION_VALIDATION_NO_MATCH',
                received: 'infinite_cyclic_graph_loop',
              });

              ctx.pathPointer--;
              return false;
            }
          }
        }
      }
    }
  }

  // Securely lock this parent object reference address pointer into its current path slot
  ctx.refStack[currentPathIndex] = data;

  /* prettier-ignore */ const STR_FAST_PATH_REGISTRY = xalethorVaultValidation.STR_FAST_PATH_REGISTRY;
  /* prettier-ignore */ const REF_FAST_PATH_REGISTRY = xalethorVaultValidation.REF_FAST_PATH_REGISTRY;
  /* prettier-ignore */ const INSTANCE_VALIDATION_REGISTRY = xalethorVaultValidation.INSTANCE_VALIDATION_REGISTRY;

  // ============================================================================
  // [ LAYER 0 ] MEMORY ADDRESS CEILING REFERENCE CACHE HIT
  // ============================================================================
  if (INSTANCE_VALIDATION_REGISTRY.has(data)) {
    return true;
  }

  const fastPath =
    blueprintId !== undefined
      ? STR_FAST_PATH_REGISTRY.get(blueprintId)
      : REF_FAST_PATH_REGISTRY.get(shape);

  if (fastPath !== undefined && fastPath.kind === 'object') {
    const activeChecker = fastPath.check;

    // 🏎️ True O(1) Bare-Metal Execution: No type casts, no performance hits!
    if (typeof activeChecker === 'function') {
      if (activeChecker(data as Record<string, unknown>)) {
        INSTANCE_VALIDATION_REGISTRY.set(data, true);
        return true;
      }
    }
  }
  let activeKeys: readonly string[] | undefined;
  let activeErrorKeys: readonly TRuntimeShapeValidationErrorKey[] | undefined;
  let activeComplexKeys: readonly string[] | undefined;

  // ============================================================================
  // [ COMPILE Sweeps ] INITIAL STRATEGY COLD COMPILATION MISS RUN
  // ============================================================================
  if (fastPath === undefined) {
    let isPureFlatPrimitiveLayer = true;
    for (const keyToken in shape.properties) {
      if (PROTO_EXPLOIT_KEYS.has(keyToken)) continue;
      const metadata = shape.properties[keyToken];
      if (metadata === undefined) continue;

      const innerShape = metadata.shape;

      // FIXED: If the property is NOT explicitly a primitive, or if it is optional,
      // it CANNOT be processed on the pure flat primitive path.
      /* prettier-ignore */
      if (metadata.optional || metadata.allowsExplicitUndefined || innerShape.kind !== 'primitive') {
        isPureFlatPrimitiveLayer = false;
        break;
      }
    }

    // ============================================================================
    // PATH A: Pure Flat Primitive Layer (Zero-Allocation Execution)
    // ============================================================================
    if (isPureFlatPrimitiveLayer && !shape.strict) {
      const keysBuffer: string[] = [];
      const errorKeysBuffer: TRuntimeShapeValidationErrorKey[] = [];
      const checkersBuffer: ((target: Record<string, unknown>) => boolean)[] =
        [];

      for (const keyToken in shape.properties) {
        if (PROTO_EXPLOIT_KEYS.has(keyToken)) continue;
        const metadata = shape.properties[keyToken];
        if (metadata === undefined) continue;

        const innerShape = metadata.shape;

        if (isPrimitiveShape(innerShape)) {
          const type = innerShape.type;
          keysBuffer.push(keyToken);
          errorKeysBuffer.push(
            PRIMITIVE_ERROR_KEY_MAP[type] ??
              'PRIMITIVE_VALIDATION_UNKNOWN_TYPE',
          );

          // ⚡ FIXED HIGH-SPEED JIT SECURE SHIELD:
          // Compile a precise multi-byte character boundary check directly into the JIT track!
          if (type === 'string' && typeof innerShape.maxLength === 'number') {
            const maxLimit = innerShape.maxLength;
            checkersBuffer.push((target: Record<string, unknown>) => {
              const val = target[keyToken];
              return (
                typeof val === 'string' &&
                getTrueCodePointLength(val) <= maxLimit
              );
            });
          } else {
            checkersBuffer.push((target: Record<string, unknown>) => {
              return PRIMITIVE_VALIDATION_CHECKERS[type](target[keyToken]);
            });
          }
        }
      }

      const optimizedChecker = (payload: Record<string, unknown>): boolean => {
        const totalCheckersCount = checkersBuffer.length;
        for (let k = 0; k < totalCheckersCount; k++) {
          const fn = checkersBuffer[k];
          if (fn !== undefined && !fn(payload)) return false;
        }
        return true;
      };

      const compiledMetadata: TFastPathMetadata = {
        kind: 'object',
        check: optimizedChecker,
        keys: keysBuffer,
        errorKeys: errorKeysBuffer,
        complexKeys: [],
      };

      if (blueprintId !== undefined)
        STR_FAST_PATH_REGISTRY.set(blueprintId, compiledMetadata);
      else REF_FAST_PATH_REGISTRY.set(shape, compiledMetadata);

      const initCheck = optimizedChecker(data);

      if (initCheck) {
        INSTANCE_VALIDATION_REGISTRY.set(data, true);
        return true;
      }

      activeKeys = keysBuffer;
      activeErrorKeys = errorKeysBuffer;
      activeComplexKeys = [];
    }

    // ============================================================================
    // PATH B: Split-Static Key Slices (Zero Reflection On Failures)
    // ============================================================================
    else {
      const primitiveKeysBuffer: string[] = [];
      const primitiveErrorsBuffer: TRuntimeShapeValidationErrorKey[] = [];
      const complexKeysBuffer: string[] = [];

      for (const keyToken in shape.properties) {
        if (PROTO_EXPLOIT_KEYS.has(keyToken)) continue;
        const metadata = shape.properties[keyToken];
        if (metadata === undefined) continue;
        /* prettier-ignore */
        if (metadata.shape.kind === 'primitive' && !metadata.optional && !metadata.allowsExplicitUndefined) {
          const type = metadata.shape.type;
          primitiveKeysBuffer.push(keyToken);
          primitiveErrorsBuffer.push(
            PRIMITIVE_ERROR_KEY_MAP[type] ?? 'PRIMITIVE_VALIDATION_UNKNOWN_TYPE',
          );
        }else {
          complexKeysBuffer.push(keyToken);
        }
      }

      const complexBypassMetadata: TFastPathMetadata = {
        kind: 'object',
        check: () => false,
        keys: primitiveKeysBuffer,
        errorKeys: primitiveErrorsBuffer,
        complexKeys: complexKeysBuffer,
      };

      if (blueprintId !== undefined)
        STR_FAST_PATH_REGISTRY.set(blueprintId, complexBypassMetadata);
      else REF_FAST_PATH_REGISTRY.set(shape, complexBypassMetadata);

      activeKeys = primitiveKeysBuffer;
      activeErrorKeys = primitiveErrorsBuffer;
      activeComplexKeys = complexKeysBuffer;
    }
  }

  /* prettier-ignore */ const extractionKeys = fastPath !== undefined ? fastPath.keys : activeKeys;
  /* prettier-ignore */ const extractionErrors = fastPath !== undefined ? fastPath.errorKeys : activeErrorKeys;
  /* prettier-ignore */ const structuralExecutionKeys = fastPath !== undefined ? fastPath.complexKeys : activeComplexKeys;

  // ============================================================================
  // [ STEP 2 ] PRIMITIVE FIREWALL EXECUTION LOGS
  // ============================================================================

  if (extractionKeys !== undefined && extractionErrors !== undefined) {
    const totalPrimitiveKeysCount = extractionKeys.length;

    for (let i = 0; i < totalPrimitiveKeysCount; i++) {
      const keyToken = extractionKeys[i];
      if (keyToken === undefined) continue;

      const value = data[keyToken];
      const propertyMetadata = shape.properties[keyToken];
      if (propertyMetadata === undefined) continue;

      const innerShape = propertyMetadata.shape;
      if (innerShape.kind !== 'primitive') continue;
      if (!(keyToken in data)) {
        ctx.pathStack[ctx.pathPointer++] = keyToken;
        xalethorVaultValidation.reportError({
          ctx,
          errorKey: 'OBJECT_VALIDATION_MISSING_PROPERTY',
          received: 'missing',
        });
        ctx.pathPointer--;
        return false;
      }
      // 1. Enforce strict data type matching checks
      if (!PRIMITIVE_VALIDATION_CHECKERS[innerShape.type](value)) {
        ctx.pathStack[ctx.pathPointer++] = keyToken;
        xalethorVaultValidation.reportError({
          ctx,
          errorKey: extractionErrors[i] ?? 'PRIMITIVE_VALIDATION_UNKNOWN_TYPE',
          received: value,
          shapeContext: innerShape,
        });
        ctx.pathPointer--;
        return false;
      }

      if (innerShape.type === 'string' && typeof value === 'string') {
        if (
          typeof innerShape.maxLength === 'number' &&
          getTrueCodePointLength(value) > innerShape.maxLength
        ) {
          ctx.pathStack[ctx.pathPointer++] = keyToken;

          xalethorVaultValidation.reportError({
            ctx,
            errorKey: 'ARRAY_VALIDATION_MIN_LENGTH_VIOLATION',
            received: value.length,
            shapeContext: innerShape,
          });

          ctx.pathPointer--;
          return false;
        }
      }
    }
  }

  // ============================================================================
  // [ STEP 3 ] STRICT MODE CHECKING LOGS
  // ============================================================================

  if (shape.strict) {
    for (const key in data) {
      if (key in data) {
        if (!(key in shape.properties)) {
          ctx.pathStack[ctx.pathPointer++] = key;

          xalethorVaultValidation.reportError({
            ctx,
            errorKey: 'OBJECT_VALIDATION_EXCESS_PROPERTY',
            received: 'excess_property',
          });

          ctx.pathPointer--;
          return false;
        }
      }
    }
  }
  // ============================================================================
  // [ STEP 4 ] STRUCTURAL GRAPH NAVIGATION LOOPS LOGS
  // ============================================================================
  if (structuralExecutionKeys !== undefined) {
    const structuralKeysCount = structuralExecutionKeys.length;

    for (let i = 0; i < structuralKeysCount; i++) {
      const key = structuralExecutionKeys[i];
      if (key === undefined) continue;

      const metadata = shape.properties[key];
      if (metadata === undefined) continue;

      // const hasProperty = Object.prototype.hasOwnProperty.call(data, key);
      const hasProperty = key in data;
      const value = data[key];

      if (!hasProperty) {
        if (metadata.requiresKeyPresence) {
          ctx.pathStack[ctx.pathPointer++] = key;
          xalethorVaultValidation.reportError({
            ctx,
            errorKey: 'OBJECT_VALIDATION_MISSING_REQUIRED_KEY',
            received: 'missing_key_presence',
            shapeContext: metadata.shape,
          });
          ctx.pathPointer--;
          return false;
        }
        if (metadata.optional) continue;

        ctx.pathStack[ctx.pathPointer++] = key;
        xalethorVaultValidation.reportError({
          ctx,
          errorKey: 'OBJECT_VALIDATION_MISSING_PROPERTY',
          received: 'missing',
          shapeContext: metadata.shape,
        });
        ctx.pathPointer--;
        return false;
      }

      if (value === undefined) {
        if (metadata.allowsExplicitUndefined) continue;
        if (metadata.optional) continue;

        ctx.pathStack[ctx.pathPointer++] = key;
        xalethorVaultValidation.reportError({
          ctx,
          errorKey: 'OBJECT_VALIDATION_UNDEFINED_PROPERTY',
          received: 'missing',
          shapeContext: metadata.shape,
        });
        ctx.pathPointer--;
        return false;
      }

      ctx.pathStack[ctx.pathPointer++] = key;
      const pass = xalethorVaultValidation.validateShape(
        value,
        metadata.shape,
        ctx,
      );

      ctx.pathPointer--;

      if (!pass) return false;
    }
  }

  INSTANCE_VALIDATION_REGISTRY.set(data, true);
  return true;
}

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
 */
// const DEBUG_TRIGGER = false;

// /**
//  * Validates complex record topologies and nested object trees.
//  */
// export function validateObject(
//   data: unknown,
//   shape: TSolidObjectShape,
//   ctx: TValidationContext,
//   blueprintId?: string,
// ): boolean {
//   // Scoped path description string for logging context
//   const currentPathString =
//     ctx.pathStack.slice(0, ctx.pathPointer).join('.') || '$ROOT';
//   if (DEBUG_TRIGGER)
//     console.log(
//       `\n🔍 [validateObject ENTRY] Path: "${currentPathString}" | blueprintId: "${blueprintId ?? 'None'}"`,
//     );

//   // ============================================================================
//   // [ STEP 1 ] BASELINE STRUCTURAL RECORD CHECK
//   // ============================================================================
//   if (!isSafeRecord(data)) {
//     if (DEBUG_TRIGGER)
//       console.log(
//         `❌ [validateObject FAIL] Path: "${currentPathString}" | Reason: Data is not a safe record`,
//       );
//     return xalethorVaultValidation.reportError({
//       ctx,
//       errorKey: 'OBJECT_VALIDATION_TYPE_MISMATCH',
//       received: data,
//     });
//   }
//   const currentPathIndex = ctx.pathPointer;
//   if (currentPathIndex > 0) {
//     for (const key in data) {
//       if (key in data) {
//         const val = data[key];

//         // If the property value is an object reference, cross-reference it against the stack
//         if (typeof val === 'object' && val !== null) {
//           for (let d = 0; d < currentPathIndex; d++) {
//             if (ctx.refStack[d] === val) {
//               ctx.isInvalidCircular = true; // Flip the global loop breaker flag
//               ctx.pathStack[ctx.pathPointer++] = key; // Push the exact malicious key to the path stack

//               xalethorVaultValidation.reportError({
//                 ctx,
//                 errorKey: 'UNION_VALIDATION_NO_MATCH',
//                 received: 'infinite_cyclic_graph_loop',
//               });

//               ctx.pathPointer--;
//               return false;
//             }
//           }
//         }
//       }
//     }
//   }

//   // Securely lock this parent object reference address pointer into its current path slot
//   ctx.refStack[currentPathIndex] = data;

//   /* prettier-ignore */ const STR_FAST_PATH_REGISTRY = xalethorVaultValidation.STR_FAST_PATH_REGISTRY;
//   /* prettier-ignore */ const REF_FAST_PATH_REGISTRY = xalethorVaultValidation.REF_FAST_PATH_REGISTRY;
//   /* prettier-ignore */ const INSTANCE_VALIDATION_REGISTRY = xalethorVaultValidation.INSTANCE_VALIDATION_REGISTRY;

//   // ============================================================================
//   // [ LAYER 0 ] MEMORY ADDRESS CEILING REFERENCE CACHE HIT
//   // ============================================================================
//   if (INSTANCE_VALIDATION_REGISTRY.has(data)) {
//     return true;
//   }

//   const fastPath =
//     blueprintId !== undefined
//       ? STR_FAST_PATH_REGISTRY.get(blueprintId)
//       : REF_FAST_PATH_REGISTRY.get(shape);

//   if (fastPath !== undefined && fastPath.kind === 'object') {
//     const activeChecker = fastPath.check;

//     // 🏎️ True O(1) Bare-Metal Execution: No type casts, no performance hits!
//     if (typeof activeChecker === 'function') {
//       if (activeChecker(data as Record<string, unknown>)) {
//         INSTANCE_VALIDATION_REGISTRY.set(data, true);
//         return true;
//       }
//     }
//   }
//   let activeKeys: readonly string[] | undefined;
//   let activeErrorKeys: readonly TRuntimeShapeValidationErrorKey[] | undefined;
//   let activeComplexKeys: readonly string[] | undefined;

//   // ============================================================================
//   // [ COMPILE Sweeps ] INITIAL STRATEGY COLD COMPILATION MISS RUN
//   // ============================================================================
//   if (fastPath === undefined) {
//     let isPureFlatPrimitiveLayer = true;
//     for (const keyToken in shape.properties) {
//       if (PROTO_EXPLOIT_KEYS.has(keyToken)) continue;
//       const metadata = shape.properties[keyToken];
//       if (metadata === undefined) continue;

//       const innerShape = metadata.shape;

//       // FIXED: If the property is NOT explicitly a primitive, or if it is optional,
//       // it CANNOT be processed on the pure flat primitive path.
//       if (metadata.optional || innerShape.kind !== 'primitive') {
//         isPureFlatPrimitiveLayer = false;
//         break;
//       }
//     }
//     if (DEBUG_TRIGGER)
//       console.log(
//         `🛠️ [Compilation Pass] Path: "${currentPathString}" | isPureFlatPrimitiveLayer: ${isPureFlatPrimitiveLayer}`,
//       );

//     // ============================================================================
//     // PATH A: Pure Flat Primitive Layer (Zero-Allocation Execution)
//     // ============================================================================
//     if (isPureFlatPrimitiveLayer && !shape.strict) {
//       const keysBuffer: string[] = [];
//       const errorKeysBuffer: TRuntimeShapeValidationErrorKey[] = [];
//       const checkersBuffer: ((target: Record<string, unknown>) => boolean)[] =
//         [];

//       for (const keyToken in shape.properties) {
//         if (PROTO_EXPLOIT_KEYS.has(keyToken)) continue;
//         const metadata = shape.properties[keyToken];
//         if (metadata === undefined) continue;

//         const innerShape = metadata.shape;

//         // if (isPrimitiveShape(innerShape)) {
//         //   const type = innerShape.type;
//         //   keysBuffer.push(keyToken);
//         //   errorKeysBuffer.push(
//         //     PRIMITIVE_ERROR_KEY_MAP[type] ??
//         //       'PRIMITIVE_VALIDATION_UNKNOWN_TYPE',
//         //   );
//         //   // FIXED: Removed runtime array lookup inside the closure loop
//         //   checkersBuffer.push((target: Record<string, unknown>) => {
//         //     return PRIMITIVE_VALIDATION_CHECKERS[type](target[keyToken]);
//         //   });
//         // }
//         if (isPrimitiveShape(innerShape)) {
//           const type = innerShape.type;
//           keysBuffer.push(keyToken);
//           errorKeysBuffer.push(
//             PRIMITIVE_ERROR_KEY_MAP[type] ??
//               'PRIMITIVE_VALIDATION_UNKNOWN_TYPE',
//           );

//           // ⚡ FIXED HIGH-SPEED JIT SECURE SHIELD:
//           // Compile a precise multi-byte character boundary check directly into the JIT track!
//           if (type === 'string' && typeof innerShape.maxLength === 'number') {
//             const maxLimit = innerShape.maxLength;
//             checkersBuffer.push((target: Record<string, unknown>) => {
//               const val = target[keyToken];
//               return (
//                 typeof val === 'string' &&
//                 getTrueCodePointLength(val) <= maxLimit
//               );
//             });
//           } else {
//             checkersBuffer.push((target: Record<string, unknown>) => {
//               return PRIMITIVE_VALIDATION_CHECKERS[type](target[keyToken]);
//             });
//           }
//         }
//       }

//       const optimizedChecker = (payload: Record<string, unknown>): boolean => {
//         const totalCheckersCount = checkersBuffer.length;
//         for (let k = 0; k < totalCheckersCount; k++) {
//           const fn = checkersBuffer[k];
//           if (fn !== undefined && !fn(payload)) return false;
//         }
//         return true;
//       };

//       const compiledMetadata: TFastPathMetadata = {
//         kind: 'object',
//         check: optimizedChecker,
//         keys: keysBuffer,
//         errorKeys: errorKeysBuffer,
//         complexKeys: [],
//       };

//       if (blueprintId !== undefined)
//         STR_FAST_PATH_REGISTRY.set(blueprintId, compiledMetadata);
//       else REF_FAST_PATH_REGISTRY.set(shape, compiledMetadata);

//       const initCheck = optimizedChecker(data);
//       if (DEBUG_TRIGGER)
//         console.log(
//           `💾 [Path A Cached] Path: "${currentPathString}" | Initial optimized check: ${initCheck}`,
//         );
//       if (initCheck) {
//         INSTANCE_VALIDATION_REGISTRY.set(data, true);
//         return true;
//       }

//       activeKeys = keysBuffer;
//       activeErrorKeys = errorKeysBuffer;
//       activeComplexKeys = [];
//     }
//     // if (isPureFlatPrimitiveLayer && !shape.strict) {
//     //   const keysBuffer: string[] = [];
//     //   const errorKeysBuffer: TRuntimeShapeValidationErrorKey[] = [];
//     //   const checkersBuffer: ((target: Record<string, unknown>) => boolean)[] =
//     //     [];
//     //   for (const keyToken in shape.properties) {
//     //     if (PROTO_EXPLOIT_KEYS.has(keyToken)) continue;
//     //     const metadata = shape.properties[keyToken];
//     //     if (metadata === undefined) continue;
//     //     const innerShape = metadata.shape;
//     //     if (isPrimitiveShape(innerShape)) {
//     //       const type = innerShape.type;
//     //       keysBuffer.push(keyToken);
//     //       errorKeysBuffer.push(
//     //         PRIMITIVE_ERROR_KEY_MAP[type] ??
//     //           'PRIMITIVE_VALIDATION_UNKNOWN_TYPE',
//     //       );
//     //       checkersBuffer.push((target: Record<string, unknown>) => {
//     //         return PRIMITIVE_VALIDATION_CHECKERS[type](target[keyToken]);
//     //       });
//     //     }
//     //   }
//     //   // 🏎️ RESTORED TO O(1) MAXIMUM VELOCITY (No for...in sweeps!)
//     //   const optimizedChecker = (payload: Record<string, unknown>): boolean => {
//     //     const totalCheckersCount = checkersBuffer.length;
//     //     for (let k = 0; k < totalCheckersCount; k++) {
//     //       const fn = checkersBuffer[k];
//     //       if (fn !== undefined && !fn(payload)) return false;
//     //     }
//     //     return true;
//     //   };
//     //   const compiledMetadata: TFastPathMetadata = {
//     //     check: optimizedChecker,
//     //     keys: keysBuffer,
//     //     errorKeys: errorKeysBuffer,
//     //     complexKeys: [],
//     //   };
//     //   if (blueprintId !== undefined)
//     //     STR_FAST_PATH_REGISTRY.set(blueprintId, compiledMetadata);
//     //   else REF_FAST_PATH_REGISTRY.set(shape, compiledMetadata);
//     //   if (optimizedChecker(data)) {
//     //     INSTANCE_VALIDATION_REGISTRY.set(data, true);
//     //     return true;
//     //   }
//     //   activeKeys = keysBuffer;
//     //   activeErrorKeys = errorKeysBuffer;
//     //   activeComplexKeys = [];
//     // }
//     // ============================================================================
//     // PATH B: Split-Static Key Slices (Zero Reflection On Failures)
//     // ============================================================================
//     else {
//       const primitiveKeysBuffer: string[] = [];
//       const primitiveErrorsBuffer: TRuntimeShapeValidationErrorKey[] = [];
//       const complexKeysBuffer: string[] = [];

//       for (const keyToken in shape.properties) {
//         if (PROTO_EXPLOIT_KEYS.has(keyToken)) continue;
//         const metadata = shape.properties[keyToken];
//         if (metadata === undefined) continue;

//         if (metadata.shape.kind === 'primitive' && !metadata.optional) {
//           const type = metadata.shape.type;
//           primitiveKeysBuffer.push(keyToken);
//           primitiveErrorsBuffer.push(
//             PRIMITIVE_ERROR_KEY_MAP[type] ??
//               'PRIMITIVE_VALIDATION_UNKNOWN_TYPE',
//           );
//         } else {
//           complexKeysBuffer.push(keyToken);
//         }
//       }

//       if (DEBUG_TRIGGER)
//         console.log(
//           `💾 [Path B Cached] Path: "${currentPathString}" | primitiveKeys: [${primitiveKeysBuffer.join(', ')}] | complexKeys: [${complexKeysBuffer.join(', ')}]`,
//         );

//       const complexBypassMetadata: TFastPathMetadata = {
//         kind: 'object',
//         check: () => false,
//         keys: primitiveKeysBuffer,
//         errorKeys: primitiveErrorsBuffer,
//         complexKeys: complexKeysBuffer,
//       };

//       if (blueprintId !== undefined)
//         STR_FAST_PATH_REGISTRY.set(blueprintId, complexBypassMetadata);
//       else REF_FAST_PATH_REGISTRY.set(shape, complexBypassMetadata);

//       activeKeys = primitiveKeysBuffer;
//       activeErrorKeys = primitiveErrorsBuffer;
//       activeComplexKeys = complexKeysBuffer;
//     }
//   }

//   /* prettier-ignore */ const extractionKeys = fastPath !== undefined ? fastPath.keys : activeKeys;
//   /* prettier-ignore */ const extractionErrors = fastPath !== undefined ? fastPath.errorKeys : activeErrorKeys;
//   /* prettier-ignore */ const structuralExecutionKeys = fastPath !== undefined ? fastPath.complexKeys : activeComplexKeys;

//   // ============================================================================
//   // [ STEP 2 ] PRIMITIVE FIREWALL EXECUTION LOGS
//   // ============================================================================

//   // if (extractionKeys !== undefined && extractionErrors !== undefined) {
//   //   const totalPrimitiveKeysCount = extractionKeys.length;
//   //   if (DEBUG_TRIGGER) {
//   //     console.log(
//   //       `🛡️ [Firewall Run] Path: "${currentPathString}" | Checking ${totalPrimitiveKeysCount} primitive keys`,
//   //     );
//   //   }

//   //   for (let i = 0; i < totalPrimitiveKeysCount; i++) {
//   //     const keyToken = extractionKeys[i];
//   //     if (keyToken === undefined) continue;

//   //     const value = data[keyToken];
//   //     const propertyMetadata = shape.properties[keyToken];
//   //     if (propertyMetadata === undefined) continue;

//   //     const innerShape = propertyMetadata.shape;
//   //     if (innerShape.kind !== 'primitive') continue;

//   //     // 1. Enforce strict data type matching checks
//   //     if (!PRIMITIVE_VALIDATION_CHECKERS[innerShape.type](value)) {
//   //       ctx.pathStack[ctx.pathPointer++] = keyToken;
//   //       xalethorVaultValidation.reportError({
//   //         ctx,
//   //         errorKey: extractionErrors[i] ?? 'PRIMITIVE_VALIDATION_UNKNOWN_TYPE',
//   //         received: value,
//   //         shapeContext: innerShape,
//   //       });
//   //       ctx.pathPointer--;
//   //       return false;
//   //     }

//   //     // 2. ⚡ THE INGRESS LENGTH GATEWAY (THE FIX)
//   //     // If the field is a string and declares a maxLength limit, verify the true code point count!
//   //     if (innerShape.type === 'string' && typeof value === 'string') {
//   //       if (
//   //         typeof innerShape.maxLength === 'number' &&
//   //         getTrueCodePointLength(value) > innerShape.maxLength
//   //       ) {
//   //         ctx.pathStack[ctx.pathPointer++] = keyToken;

//   //         xalethorVaultValidation.reportError({
//   //           ctx,
//   //           // Maps cleanly to your system's target constraint break identifier token
//   //           errorKey: 'ARRAY_VALIDATION_MIN_LENGTH_VIOLATION',
//   //           received: value.length, // Report code unit length for trace telemetry
//   //           shapeContext: innerShape,
//   //         });

//   //         ctx.pathPointer--;
//   //         return false;
//   //       }
//   //     }
//   //   }
//   // }
//   if (extractionKeys !== undefined && extractionErrors !== undefined) {
//     const totalCheckers = extractionKeys.length;
//     for (let i = 0; i < totalCheckers; i++) {
//       const fieldKey = extractionKeys[i];
//       if (fieldKey !== undefined) {
//         const metadata = shape.properties[fieldKey];
//         if (metadata !== undefined && isPrimitiveShape(metadata.shape)) {
//           const value = data[fieldKey];

//           // FIXED: Check required presence or type correctness for optional fields inline
//           if (value === undefined) {
//             if (!metadata.optional) {
//               const errorKey =
//                 extractionErrors[i] ?? 'PRIMITIVE_VALIDATION_UNKNOWN_TYPE';
//               ctx.pathStack[ctx.pathPointer++] = fieldKey;
//               xalethorVaultValidation.reportError({
//                 ctx,
//                 errorKey,
//                 received: value,
//               });
//               ctx.pathPointer--;
//               return false;
//             }
//           } else {
//             const type = metadata.shape.type;
//             if (!PRIMITIVE_VALIDATION_CHECKERS[type](value)) {
//               const errorKey =
//                 extractionErrors[i] ?? 'PRIMITIVE_VALIDATION_UNKNOWN_TYPE';
//               ctx.pathStack[ctx.pathPointer++] = fieldKey;
//               xalethorVaultValidation.reportError({
//                 ctx,
//                 errorKey,
//                 received: value,
//               });
//               ctx.pathPointer--;
//               return false;
//             }
//           }
//         }
//       }
//     }
//   }
//   // ============================================================================
//   // [ STEP 3 ] STRICT MODE CHECKING LOGS
//   // ============================================================================
//   // if (shape.strict) {
//   //   if (DEBUG_TRIGGER)
//   //     console.log(
//   //       `⚖️ [Strict Sweep] Path: "${currentPathString}" | Sweeping input object properties`,
//   //     );
//   //   for (const key in data) {
//   //     if (Object.prototype.hasOwnProperty.call(data, key)) {
//   //       if (!Object.prototype.hasOwnProperty.call(shape.properties, key)) {
//   //         if (DEBUG_TRIGGER)
//   //           console.log(
//   //             `❌ [Strict FAIL] Path: "${currentPathString}" | Reason: Excess property "${key}"`,
//   //           );
//   //         ctx.pathStack[ctx.pathPointer++] = key;
//   //         xalethorVaultValidation.reportError({
//   //           ctx,
//   //           errorKey: 'OBJECT_VALIDATION_EXCESS_PROPERTY',
//   //           received: 'excess_property',
//   //         });
//   //         ctx.pathPointer--;
//   //         return false;
//   //       }
//   //     }
//   //   }
//   // }
//   if (shape.strict) {
//     if (DEBUG_TRIGGER) {
//       console.log(
//         `⚖️ [Strict Sweep] Path: "${currentPathString}" | Sweeping input object properties`,
//       );
//     }

//     for (const key in data) {
//       if (key in data) {
//         if (!(key in shape.properties)) {
//           if (DEBUG_TRIGGER) {
//             console.log(
//               `❌ [Strict FAIL] Path: "${currentPathString}" | Reason: Excess property "${key}"`,
//             );
//           }

//           ctx.pathStack[ctx.pathPointer++] = key;

//           xalethorVaultValidation.reportError({
//             ctx,
//             errorKey: 'OBJECT_VALIDATION_EXCESS_PROPERTY',
//             received: 'excess_property',
//           });

//           ctx.pathPointer--;
//           return false;
//         }
//       }
//     }
//   }
//   // ============================================================================
//   // [ STEP 4 ] STRUCTURAL GRAPH NAVIGATION LOOPS LOGS
//   // ============================================================================
//   if (structuralExecutionKeys !== undefined) {
//     const structuralKeysCount = structuralExecutionKeys.length;
//     if (DEBUG_TRIGGER)
//       console.log(
//         `🌲 [Structural Loop] Path: "${currentPathString}" | Processing ${structuralKeysCount} deep/complex keys`,
//       );

//     for (let i = 0; i < structuralKeysCount; i++) {
//       const key = structuralExecutionKeys[i];
//       if (key === undefined) continue;

//       const metadata = shape.properties[key];
//       if (metadata === undefined) continue;

//       // const hasProperty = Object.prototype.hasOwnProperty.call(data, key);
//       const hasProperty = key in data;
//       const value = data[key];

//       if (DEBUG_TRIGGER)
//         console.log(
//           `👉 [Checking Field] Path: "${currentPathString}.${key}" | Present: ${hasProperty} | Value Type: ${typeof value}`,
//         );

//       if (!hasProperty) {
//         if (metadata.requiresKeyPresence) {
//           if (DEBUG_TRIGGER)
//             console.log(
//               `❌ [Structural FAIL] Path: "${currentPathString}.${key}" | Reason: Key Presence Required`,
//             );
//           ctx.pathStack[ctx.pathPointer++] = key;
//           xalethorVaultValidation.reportError({
//             ctx,
//             errorKey: 'OBJECT_VALIDATION_MISSING_REQUIRED_KEY',
//             received: 'missing_key_presence',
//             shapeContext: metadata.shape,
//           });
//           ctx.pathPointer--;
//           return false;
//         }
//         if (metadata.optional) continue;
//         if (DEBUG_TRIGGER)
//           console.log(
//             `❌ [Structural FAIL] Path: "${currentPathString}.${key}" | Reason: Missing Required Non-Optional`,
//           );
//         ctx.pathStack[ctx.pathPointer++] = key;
//         xalethorVaultValidation.reportError({
//           ctx,
//           errorKey: 'OBJECT_VALIDATION_MISSING_PROPERTY',
//           received: 'missing',
//           shapeContext: metadata.shape,
//         });
//         ctx.pathPointer--;
//         return false;
//       }

//       if (value === undefined) {
//         if (metadata.optional) continue;
//         if (DEBUG_TRIGGER)
//           console.log(
//             `❌ [Structural FAIL] Path: "${currentPathString}.${key}" | Reason: Explicit Undefined Passed on Non-Optional`,
//           );
//         ctx.pathStack[ctx.pathPointer++] = key;
//         xalethorVaultValidation.reportError({
//           ctx,
//           errorKey: 'OBJECT_VALIDATION_UNDEFINED_PROPERTY',
//           received: 'missing',
//           shapeContext: metadata.shape,
//         });
//         ctx.pathPointer--;
//         return false;
//       }

//       ctx.pathStack[ctx.pathPointer++] = key;
//       const pass = xalethorVaultValidation.validateShape(
//         value,
//         metadata.shape,
//         ctx,
//       );
//       if (DEBUG_TRIGGER)
//         console.log(
//           `↩️ [Sub-Tree Return] Path: "${currentPathString}.${key}" | validShape() Result: ${pass} | Context Error Count: ${ctx.errors.length}`,
//         );
//       ctx.pathPointer--;

//       if (!pass) {
//         if (DEBUG_TRIGGER)
//           console.log(
//             `❌ [Early Exit] Path: "${currentPathString}" | Aborting object verification due to failed field: "${key}"`,
//           );
//         return false;
//       }
//     }
//   }

//   if (DEBUG_TRIGGER)
//     console.log(
//       `🟩 [validateObject SUCCESS] Path: "${currentPathString}" | Object is completely valid. Accumulated Errors: ${ctx.errors.length}`,
//     );
//   INSTANCE_VALIDATION_REGISTRY.set(data, true);
//   return true;
// }
