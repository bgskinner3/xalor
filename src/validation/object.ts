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

  if (fastPath !== undefined && fastPath.check(data)) {
    INSTANCE_VALIDATION_REGISTRY.set(data, true);
    return true;
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
      if (
        metadata.optional ||
        innerShape.kind === 'union' ||
        innerShape.kind === 'intersection' ||
        innerShape.kind === 'object' ||
        innerShape.kind === 'literal'
      ) {
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
          // FIXED: Removed runtime array lookup inside the closure loop
          checkersBuffer.push((target: Record<string, unknown>) => {
            return PRIMITIVE_VALIDATION_CHECKERS[type](target[keyToken]);
          });
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
        check: optimizedChecker,
        keys: keysBuffer,
        errorKeys: errorKeysBuffer,
        complexKeys: [],
      };

      if (blueprintId !== undefined)
        STR_FAST_PATH_REGISTRY.set(blueprintId, compiledMetadata);
      else REF_FAST_PATH_REGISTRY.set(shape, compiledMetadata);

      if (optimizedChecker(data)) {
        INSTANCE_VALIDATION_REGISTRY.set(data, true);
        return true;
      }

      activeKeys = keysBuffer;
      activeErrorKeys = errorKeysBuffer;
      activeComplexKeys = [];
    } else {
      // ────────────────────────────────────────────────────────────────────────────
      // [ PATH B ] MIXED/COMPLEX TOPOLOGY ARRAYS EXTRACTION AND SEGREGATION
      // ────────────────────────────────────────────────────────────────────────────
      const primitiveKeysBuffer: string[] = [];
      const primitiveErrorsBuffer: TRuntimeShapeValidationErrorKey[] = [];
      const complexKeysBuffer: string[] = [];

      for (const keyToken in shape.properties) {
        if (PROTO_EXPLOIT_KEYS.has(keyToken)) continue;
        const metadata = shape.properties[keyToken];
        if (metadata === undefined) continue;

        // Required primitives are routed to Loop 2 for flat nanosecond filtering
        if (metadata.shape.kind === 'primitive' && !metadata.optional) {
          const type = metadata.shape.type;
          primitiveKeysBuffer.push(keyToken);
          primitiveErrorsBuffer.push(
            PRIMITIVE_ERROR_KEY_MAP[type] ??
              'PRIMITIVE_VALIDATION_UNKNOWN_TYPE',
          );
        } else {
          // Route complex elements (arrays/unions/optionals) strictly to deep evaluation slices
          complexKeysBuffer.push(keyToken);
        }
      }

      const complexBypassMetadata: TFastPathMetadata = {
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
  // ============================================================================
  // BOUNDARY ASSIGNMENT UNIFICATION
  // ============================================================================
  /* prettier-ignore */ const extractionKeys = fastPath !== undefined ? fastPath.keys : activeKeys;
  /* prettier-ignore */ const extractionErrors =  fastPath !== undefined ? fastPath.errorKeys : activeErrorKeys;
  /* prettier-ignore */ const structuralExecutionKeys = fastPath !== undefined ? fastPath.complexKeys : activeComplexKeys;

  // ============================================================================
  // [ STEP 2 ] HIGH-SPEED FLAT PRIMITIVE FIREWALL VERIFICATION
  // ============================================================================
  if (extractionKeys !== undefined && extractionErrors !== undefined) {
    const totalCheckers = extractionKeys.length;
    for (let i = 0; i < totalCheckers; i++) {
      const fieldKey = extractionKeys[i];
      if (fieldKey !== undefined) {
        const metadata = shape.properties[fieldKey];
        if (metadata !== undefined && isPrimitiveShape(metadata.shape)) {
          const value = data[fieldKey];

          // FIXED: Check required presence or type correctness for optional fields inline
          if (value === undefined) {
            if (!metadata.optional) {
              const errorKey =
                extractionErrors[i] ?? 'PRIMITIVE_VALIDATION_UNKNOWN_TYPE';
              ctx.pathStack[ctx.pathPointer++] = fieldKey;
              xalethorVaultValidation.reportError({
                ctx,
                errorKey,
                received: value,
              });
              ctx.pathPointer--;
              return false;
            }
          } else {
            const type = metadata.shape.type;
            if (!PRIMITIVE_VALIDATION_CHECKERS[type](value)) {
              const errorKey =
                extractionErrors[i] ?? 'PRIMITIVE_VALIDATION_UNKNOWN_TYPE';
              ctx.pathStack[ctx.pathPointer++] = fieldKey;
              xalethorVaultValidation.reportError({
                ctx,
                errorKey,
                received: value,
              });
              ctx.pathPointer--;
              return false;
            }
          }
        }
      }
    }
  }

  // ============================================================================
  // [ STEP 3 ] STRICT EXTRA-PROPERTY REGISTRATION INTERCEPTOR
  // ============================================================================
  if (shape.strict) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (!Object.prototype.hasOwnProperty.call(shape.properties, key)) {
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
  // [[ STEP 4 ] STATIC GRAPH NAVIGATION DEEP STRUCTURAL TREE LOOPS
  // ============================================================================
  if (structuralExecutionKeys !== undefined) {
    const structuralKeysCount = structuralExecutionKeys.length;
    for (let i = 0; i < structuralKeysCount; i++) {
      const key = structuralExecutionKeys[i];
      if (key === undefined) continue;

      const metadata = shape.properties[key];
      if (metadata === undefined) continue;

      const hasProperty = Object.prototype.hasOwnProperty.call(data, key);
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
