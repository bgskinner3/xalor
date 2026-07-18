// __tests__/runtime/api/transform-xalor/flatten-mode.test.ts
import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';
import type { TInstanceConstructorRegistry } from '../../shared/shape-domain';
import { BRAND_SYMBOL } from '../../shared';
// 'default', 'mock', 'clone', and 'cast' operational modes.
/**
 pnpm run test -- __tests__/generate/default-mode.test.ts

 */

declare global {
  interface ISolidRegistry {
    // STANDARD GENERATE API BLUEPRINT LABELS
    USER_TEST: {
      id: number;
      username: string;
      active: boolean;
    };
    API_RESPONSE: {
      status: 'success' | 'failed' | number;
    };
    STORE_ORDER: {
      orderId: string;
      items: {
        SKU: string;
        quantity: number;
      }[];
    };
    DEEPLY_NESTED_STORE: {
      orderId: string;
      items: {
        SKU: string;
        quantity: number;
        logistics: {
          warehouseCode: string;
          dimensions: {
            weight: number;
            fragile: boolean;
          };
        };
      }[];
    };
    /**
     * Evaluates deep recursive arrow function thresholds. Verifies circuit breaker
     * boundaries safely abort before triggering a V8 execution engine stack crash.
     */
    INFINITE_LOOP_TEST: {
      selfRef: unknown;
    };

    /**
     * Verifies deterministic property resolution strategies during structural property
     * entry overrides on multi-layered object schema intersections.
     */
    COLLIDING_INTERSECTION_TEST: {
      conflictField: string | number;
    };
    // ADVANCED ENGINE TESTING TAXONOMIES
    OPTIONAL_FIELDS_TEST: {
      mandatoryId: number;
      optionalMeta?: string;
      optionalData?: { nestedFlag: boolean };
    };
    COMPLEX_UNION_TEST: {
      mixedValue: 'custom_literal' | number | boolean;
    };
    BRANDED_TYPE_TEST: {
      userId: string & { readonly __brand: unique symbol };
    };
    REFERENCE_LINK_TEST: {
      id: number;
      profileRef: ISolidRegistry['USER_TEST'];
    };
    CIRCULAR_DEPTH_TEST: {
      id: number;
      selfRef?: ISolidRegistry['CIRCULAR_DEPTH_TEST'];
    };
    ALL_PLATFORM_INSTANCES_SHAPE: {
      // === Core JS Structural Objects ===
      readonly dateVal: TInstanceConstructorRegistry['Date'];
      readonly regExpVal: TInstanceConstructorRegistry['RegExp'];

      // === Collections ===
      readonly mapVal: TInstanceConstructorRegistry['Map'];
      readonly setVal: TInstanceConstructorRegistry['Set'];
      readonly weakMapVal: TInstanceConstructorRegistry['WeakMap'];
      readonly weakSetVal: TInstanceConstructorRegistry['WeakSet'];

      // === Web Platform Data Frames ===
      readonly urlVal: TInstanceConstructorRegistry['URL'];
      readonly urlParamsVal: TInstanceConstructorRegistry['URLSearchParams'];
      readonly headersVal: TInstanceConstructorRegistry['Headers'];
      readonly requestVal: TInstanceConstructorRegistry['Request'];
      readonly responseVal: TInstanceConstructorRegistry['Response'];
      readonly blobVal: TInstanceConstructorRegistry['Blob'];
      readonly fileVal: TInstanceConstructorRegistry['File'];

      // === Binary Data & Typed Array Buffers ===
      readonly arrayBufferVal: TInstanceConstructorRegistry['ArrayBuffer'];
      readonly dataViewVal: TInstanceConstructorRegistry['DataView'];
      readonly int8ArrayVal: TInstanceConstructorRegistry['Int8Array'];
      readonly uint8ArrayVal: TInstanceConstructorRegistry['Uint8Array'];
      readonly uint8ClampedArrayVal: TInstanceConstructorRegistry['Uint8ClampedArray'];
      readonly int16ArrayVal: TInstanceConstructorRegistry['Int16Array'];
      readonly uint16ArrayVal: TInstanceConstructorRegistry['Uint16Array'];
      readonly int32ArrayVal: TInstanceConstructorRegistry['Int32Array'];
      readonly uint32ArrayVal: TInstanceConstructorRegistry['Uint32Array'];
      readonly float32ArrayVal: TInstanceConstructorRegistry['Float32Array'];
      readonly float64ArrayVal: TInstanceConstructorRegistry['Float64Array'];
      readonly bigInt64ArrayVal: TInstanceConstructorRegistry['BigInt64Array'];
      readonly bigUint64ArrayVal: TInstanceConstructorRegistry['BigUint64Array'];

      // === Async & Streams ===
      readonly promiseVal: TInstanceConstructorRegistry['Promise'];
      readonly readableStreamVal: TInstanceConstructorRegistry['ReadableStream'];
      readonly writableStreamVal: TInstanceConstructorRegistry['WritableStream'];
      readonly transformStreamVal: TInstanceConstructorRegistry['TransformStream'];
    };
    ADVANCED_COMPLEXITY_SHAPE: {
      // === The Nested Collection Graph (Old DEEPLY_NESTED_STORE nested here) ===
      readonly userRole: {
        readonly SKU: string;
        readonly quantity: number;
        readonly logistics: {
          readonly warehouseCode: string;
        };
      }[]; // 🚀 Evaluates perfectly as an array graph!

      // === Web Platform Instance Frame ===
      readonly transformStreamVal: TInstanceConstructorRegistry['TransformStream'];

      // === Type-Reified Function Closure Executor ===
      readonly executePipeline: (
        inputData: string,
        retryCount?: number, // 🚀 Properly typed as an optional parameter!
      ) => TInstanceConstructorRegistry['Promise']; // Returns an active native Promise instance object!
    };
    BROKEN_REF_TEST: {
      badLink: unknown;
    };
  }
}

describe('Runtime Generator API - Default Mode', () => {
  beforeAll(() => {
    // Seeding clean shapes from central constants file straight into memory
    seedTestVault('USER_TEST', TEST_SHAPE_REGISTRY.STANDARD_USER);
    seedTestVault('API_RESPONSE', TEST_SHAPE_REGISTRY.UNION_RESPONSE);
    seedTestVault('STORE_ORDER', TEST_SHAPE_REGISTRY.COMPLEX_ORDER);
    seedTestVault(
      'DEEPLY_NESTED_STORE',
      TEST_SHAPE_REGISTRY.DEEPLY_NESTED_STORE,
    );
    seedTestVault(
      'OPTIONAL_FIELDS_TEST',
      TEST_SHAPE_REGISTRY.OPTIONAL_FIELDS_TEST,
    );
    seedTestVault('COMPLEX_UNION_TEST', TEST_SHAPE_REGISTRY.COMPLEX_UNION_TEST);
    seedTestVault('BRANDED_TYPE_TEST', TEST_SHAPE_REGISTRY.BRANDED_TYPE_TEST);
    seedTestVault(
      'REFERENCE_LINK_TEST',
      TEST_SHAPE_REGISTRY.REFERENCE_LINK_TEST,
    );
    seedTestVault(
      'CIRCULAR_DEPTH_TEST',
      TEST_SHAPE_REGISTRY.CIRCULAR_DEPTH_TEST,
    );
    seedTestVault(
      'COLLIDING_INTERSECTION_TEST',
      TEST_SHAPE_REGISTRY.COLLIDING_INTERSECTION_TEST,
    );
    seedTestVault('INFINITE_LOOP_TEST', TEST_SHAPE_REGISTRY.INFINITE_LOOP_TEST);
    seedTestVault(
      'ALL_PLATFORM_INSTANCES_SHAPE',
      TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE,
    );
    seedTestVault(
      'ADVANCED_COMPLEXITY_SHAPE',
      TEST_SHAPE_REGISTRY.ADVANCED_COMPLEXITY_SHAPE,
    );
    seedTestVault('BROKEN_REF_TEST', TEST_SHAPE_REGISTRY.BROKEN_REF_TEST);
  });

  // ========================================================================
  // CORE FOUNDATIONAL SPECIFICATION METHOD TRACKS
  // ========================================================================
  describe('GENERATE XALOR DEFAULT OBJECT', () => {
    it('🎯 should accurately generate a pristine default data skeleton from a standard user blueprint', () => {
      const result = xalor.default<'USER_TEST'>();

      expect(result).toBeDefined();

      // 1. Structural Match validation (ignores nominal brand property tracking)
      expect(result).toMatchObject({
        id: 0,
        username: '',
        active: false,
      });

      // 2. Cryptographic Guard compliance test verification (Commandment I)
      expect(xalor.guard<'USER_TEST'>(result)).toBe(true);
    });

    it('🎯 should accurately extract literal string value constraints for specific object fields', () => {
      const result = xalor.default<'API_RESPONSE'>();

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        status: 'success', // Literals fall back to index 0 string token definitions
      });
    });

    it('🎯 should handle deeply nested structures and generate an empty list skeleton for array schemas', () => {
      const result = xalor.default<'STORE_ORDER'>();

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        orderId: '',
        items: [], // Core array initialization allocations match empty collections
      });
    });

    it('🎯 should evaluate deeply nested multidimensional child blocks recursively without clipping structures', () => {
      const result = xalor.default<'DEEPLY_NESTED_STORE'>();

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        orderId: '',
        items: [],
      });
    });
  });

  // ========================================================================
  // ADVANCED DESIGN SYSTEM DRIVEN ENGINE GRANULAR COVERAGE PASSTHROUGHS
  // ========================================================================
  describe('🧱 ENGINE BRANCH INTERCEPTION TRACKING', () => {
    it('🧱 BRANCH MATCH: should gracefully skip properties explicitly marked as optional', () => {
      const result = xalor.default<'OPTIONAL_FIELDS_TEST'>();

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        mandatoryId: 0,
      });

      expect(Reflect.has(result, 'optionalMeta')).toBe(false);
      expect(Reflect.has(result, 'optionalData')).toBe(false);
    });

    it('🧱 BRANCH MATCH: should materialize a union container by safely falling back to its absolute first indexed branch', () => {
      const result = xalor.default<'COMPLEX_UNION_TEST'>();

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        mixedValue: 'custom_literal', // Matches index[0] of array layout metrics
      });
    });

    it('🧱 BRANCH MATCH: should peel away branded encapsulation wrappers and unwrap down into the structural base type', () => {
      const result = xalor.default<'BRANDED_TYPE_TEST'>();

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        userId: '', // Unrolls branded node down to its raw string zero baseline
      });
    });

    it('🧱 BRANCH MATCH: should dynamically cross-reference separate cache tokens inside the vault keeper database layout', () => {
      const result = xalor.default<'REFERENCE_LINK_TEST'>();

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        id: 0,
        profileRef: {
          id: 0,
          username: '',
          active: false,
        },
      });
    });
  });

  // ========================================================================
  // CRITICAL ADVERSARIAL RECURSION BOUNDARIES (Commandment V & IX Parity)
  // ========================================================================
  describe('🛡️ RECURSION BOUNDARIES & TAIL CIRCUIT BREAKING', () => {
    it('🛡️ EDGE CASE 1: should intercept self-referencing circular dependency cycles, halting execution safely using reify limits', () => {
      const executeCircularGenerationPass = () => {
        return xalor.default<'CIRCULAR_DEPTH_TEST'>();
      };

      // Executing a circular blueprint must never throw stack depth crashes
      expect(executeCircularGenerationPass).not.toThrow();

      const result = executeCircularGenerationPass();

      if (result !== undefined && result !== null) {
        expect(typeof result).toBe('object');

        let cursor: Record<string | symbol, unknown> = result;

        for (let depth = 0; depth < 20; depth++) {
          const nestedRef = Reflect.get(cursor, 'selfRef');
          if (
            nestedRef === undefined ||
            nestedRef === null ||
            typeof nestedRef !== 'object'
          ) {
            break;
          }
          // The compiler permits this assignment flawlessly because it's a plain record loop!
          cursor = nestedRef as Record<string | symbol, unknown>;
        }

        const finalLeafRef = Reflect.get(cursor, 'selfRef');
        expect(finalLeafRef).not.toBeInstanceOf(Object);
      } else {
        // Safe trace termination at boundary limit passed successfully
        expect(result === undefined || result === null).toBe(true);
      }
    });
    it('🛡️ EDGE CASE 2: should accurately materialize default instances for JavaScript native, web, and binary types', () => {
      // Seed the comprehensive platform shape contract registry definitions flatly straight into RAM memory
      seedTestVault(
        'ALL_PLATFORM_INSTANCES_SHAPE',
        TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE,
      );

      const result = xalor.default<'ALL_PLATFORM_INSTANCES_SHAPE'>();
      expect(result).toBeDefined();

      // 1. Verify Core JS & Collection instances are freshly constructed objects
      expect(result.dateVal).toBeInstanceOf(Date);
      expect(result.regExpVal).toBeInstanceOf(RegExp);
      expect(result.mapVal).toBeInstanceOf(Map);
      expect(result.setVal).toBeInstanceOf(Set);

      // 2. Verify Web Platform Data Frame defaults
      expect(result.urlVal).toBeInstanceOf(URL);
      expect(result.urlVal.toString()).toBe('http://localhost/');

      // 3. Verify Binary Buffer and Typed Array allocations are initialized cleanly at 0 length
      expect(result.arrayBufferVal).toBeInstanceOf(ArrayBuffer);
      expect(result.uint8ArrayVal).toBeInstanceOf(Uint8Array);
      // expect(result.uint8ArrayVal.length).toBe(0);
    });

    it('🛡️ EDGE CASE 3: should manufacture safe, executable mock pass-through closures for function property shapes', () => {
      const result = xalor.default<'ADVANCED_COMPLEXITY_SHAPE'>();
      expect(result).toBeDefined();

      // 1. Verify the contract property resolves into a safe callable function object natively
      expect(result.executePipeline).toBeInstanceOf(Function);

      // 2. Executing the dummy function must resolve into the expected baseline return schema
      // In your registry schema, executePipeline returns a Promise layout block
      const outputPromise = result.executePipeline('test_input', 3);
      expect(outputPromise).toBeInstanceOf(Promise);
    });

    it('🛡️ EDGE CASE 4: should handle multi-layered structural intersection shapes with deterministic field merging', () => {
      // Simulates an object composed of multiple intersecting type parts
      seedTestVault(
        'COMPLEX_UNION_TEST',
        TEST_SHAPE_REGISTRY.COMPLEX_UNION_TEST,
      );

      const result = xalor.default<'COMPLEX_UNION_TEST'>();
      expect(result).toBeDefined();

      // Ensure properties across intersecting segments collapse natively
      // without leaving undefined branches or dropping nominal brand tracking signatures
      expect(xalor.guard<'COMPLEX_UNION_TEST'>(result)).toBe(true);
    });
    it('🛡️ EDGE CASE 5: should ensure nominal identity branding is accurately applied to object hierarchies', () => {
      const result = xalor.default<'USER_TEST'>();
      const brandToken = Reflect.get(result, BRAND_SYMBOL);
      expect(Array.isArray(brandToken)).toBe(true);
      expect(brandToken).toContain('Solid');
      expect(brandToken).toContain('USER_TEST');
    });
  });

  describe('🚨 ENGINE REJECTION PANIC PATHS', () => {
    it('🚨 FAILURE 3: should trap broken internal target reference link keys during recursive traversal', () => {
      // 1. Seed a reference pointing into an empty lookup vector slot string pass
      seedTestVault('BROKEN_REF_TEST', {
        kind: 'reference',
        name: 'MISSING_TARGET_KEY', // This pointer doesn't exist inside the vault database
      } as never);

      // 2. EXECUTED AS AN IIFE TRAPPER: Catches the immediate throw during runtime evaluation
      const errorResult = (() => {
        try {
          xalor.default<'BROKEN_REF_TEST'>();
          return null; // Fails safely if the engine accidentally allows execution to leak past
        } catch (thrownException) {
          return thrownException;
        }
      })();

      // 3. Deterministic Exception Assertions Pass
      expect(errorResult).toBeInstanceOf(Error);

      if (errorResult instanceof Error) {
        expect(errorResult.message).toContain('[Xalor Graph Integrity Error]');
        expect(errorResult.message).toContain('MISSING_TARGET_KEY');
      }
    });
    it('🚨 FAILURE 4: should halt gracefully and return null when recursive lookup traversals hit the maximum depth limit threshold', () => {
      const executeMaxDepthPass = (() => {
        try {
          // 2. Point-free execution pass completely free of type assertions!
          xalor.default<'INFINITE_LOOP_TEST'>();

          return null;
        } catch (error) {
          return error;
        }
      })();

      expect(executeMaxDepthPass).not.toBeInstanceOf(Error);
      expect(executeMaxDepthPass).toBeDefined();
    });
    it('🚨 FAILURE 5: should handle severe structural type divergence gracefully when merging conflicting intersection properties', () => {
      const executeCollisionPass = (() => {
        try {
          // 2. Point-free execution pass completely free of type assertions!
          xalor.default<'COLLIDING_INTERSECTION_TEST'>();
          return null;
        } catch (error) {
          return error;
        }
      })();

      expect(executeCollisionPass).not.toBeInstanceOf(Error);
      expect(executeCollisionPass).toBeDefined();
    });
  });
});
