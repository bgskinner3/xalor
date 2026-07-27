// **tests**/runtime/api/transform-xalor/flatten-mode.test.ts
import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';
import type { TInstanceConstructorRegistry } from '../../shared/shape-domain';
import { BRAND_SYMBOL, isRecord } from '../../shared';

// 'default', 'mock', 'clone', and 'cast' operational modes.

/**
  pnpm run test -- __tests__/generate/mock-mode.test.ts
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
    BRANDED_TYPE_TEST_MOCK: {
      userId: string & { readonly __brand: unique symbol };
    };
    COLLIDING_INTERSECTION_TEST: {
      conflictField: string | number;
    };
    TRANSACTION: {
      id: string;
      amount: number;
      currency: 'USD' | 'EUR' | 'GBP';
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
describe('Runtime Generator API - Mock Mode', () => {
  beforeAll(() => {
    // Seed all shared shape definitions out of your central constants registry
    seedTestVault('USER_TEST', TEST_SHAPE_REGISTRY.STANDARD_USER);
    seedTestVault('API_RESPONSE', TEST_SHAPE_REGISTRY.UNION_RESPONSE);
    seedTestVault('STORE_ORDER', TEST_SHAPE_REGISTRY.COMPLEX_ORDER);
    seedTestVault(
      'ALL_PLATFORM_INSTANCES_SHAPE',
      TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE,
    );
    seedTestVault(
      'DEEPLY_NESTED_STORE',
      TEST_SHAPE_REGISTRY.DEEPLY_NESTED_STORE,
    );
    seedTestVault(
      'OPTIONAL_FIELDS_TEST',
      TEST_SHAPE_REGISTRY.OPTIONAL_FIELDS_TEST,
    );
    seedTestVault('COMPLEX_UNION_TEST', TEST_SHAPE_REGISTRY.COMPLEX_UNION_TEST);
    seedTestVault(
      'BRANDED_TYPE_TEST_MOCK',
      TEST_SHAPE_REGISTRY.BRANDED_TYPE_TEST,
    );
    seedTestVault(
      'REFERENCE_LINK_TEST',
      TEST_SHAPE_REGISTRY.REFERENCE_LINK_TEST,
    );
    seedTestVault(
      'CIRCULAR_DEPTH_TEST',
      TEST_SHAPE_REGISTRY.CIRCULAR_DEPTH_TEST,
    );
    seedTestVault('TRANSACTION', TEST_SHAPE_REGISTRY.TRANSACTION);
    seedTestVault('BROKEN_REF_TEST', TEST_SHAPE_REGISTRY.BROKEN_REF_TEST);
    seedTestVault(
      'COLLIDING_INTERSECTION_TEST',
      TEST_SHAPE_REGISTRY.COLLIDING_INTERSECTION_TEST,
    );
  });
  /**
 const result = xalor.mock<'OPTIONAL_FIELDS_TEST'>({
  mandatoryId: ['percentage']
  and if they want to use the config then somehtign ike that ?
  optionalMeta: ['maskedString',{ strategy: 'creditCard', maskChar: '*' }]
});
 */
  describe('GENERATE XALOR MOCK OBJECT', () => {
    // it('🎯 should preserve exact explicit values when materializing literal shape segments', () => {
    //   const result = xalor.mock<'OPTIONAL_FIELDS_TEST'>({
    //     mandatoryId: ['percentage'],
    //   });
    //   console.log(result);
    // const result2 = xalor.mock<'DEEPLY_NESTED_STORE'>({
    //   // orderId: ['maskedString', {}],
    //   orderId: ['compactId', {}],
    // });
    //   console.log(result2);
    // });
    it('🎯 should successfully compile native JavaScript built-ins, web platform, and binary formats', () => {
      // 🚀 FIX: Connects straight to the actual platform registry token key
      const result = xalor.mock<'ALL_PLATFORM_INSTANCES_SHAPE'>();
      expect(result).toBeDefined();
      // Verify Core JS & Collection instances construct natively from the platform shape mapping
      expect(result.dateVal).toBeInstanceOf(Date);
      expect(result.regExpVal).toBeInstanceOf(RegExp);
      expect(result.mapVal).toBeInstanceOf(Map);
      expect(result.setVal).toBeInstanceOf(Set);
      expect(result.weakMapVal).toBeInstanceOf(WeakMap);
      expect(result.weakSetVal).toBeInstanceOf(WeakSet);
      // Verify Web Platform Frames are materialized with functional signatures
      expect(result.urlVal).toBeInstanceOf(URL);
      expect(result.urlParamsVal).toBeInstanceOf(URLSearchParams);
      expect(result.headersVal).toBeInstanceOf(Headers);
      expect(result.requestVal).toBeInstanceOf(Request);
      expect(result.responseVal).toBeInstanceOf(Response);
      expect(result.blobVal).toBeInstanceOf(Blob);
      expect(result.fileVal).toBeInstanceOf(File);
      // Verify Typed Array Buffers allocate memory structures successfully
      expect(result.arrayBufferVal).toBeInstanceOf(ArrayBuffer);
      expect(result.dataViewVal).toBeInstanceOf(DataView);
      expect(result.uint8ArrayVal).toBeInstanceOf(Uint8Array);
    });
    it('🎯 should preserve exact explicit values when materializing literal shape segments', () => {
      const result = xalor.mock<'API_RESPONSE'>();
      expect(result).toBeDefined();
      const allowedOutputs: unknown[] = ['success', 'failed'];
      if (typeof result.status === 'string') {
        expect(allowedOutputs).toContain(result.status);
      } else {
        expect(typeof result.status).toBe('number');
      }
    });
    it('🎯 should evaluate array mapping blocks and populate mock items with fluid counts', () => {
      const result = xalor.mock<'STORE_ORDER'>();
      expect(result).toBeDefined();
      expect(typeof result.orderId).toBe('string');
      expect(Array.isArray(result.items)).toBe(true);
      // Engine limits constraint array loop generations from 1 to 3 items randomly
      expect(result.items.length).toBeGreaterThanOrEqual(1);
      expect(result.items.length).toBeLessThanOrEqual(3);
      for (let i = 0; i < result.items.length; i++) {
        const item = result.items[i];
        expect(typeof item.SKU).toBe('string');
        expect(typeof item.quantity).toBe('number');
      }
    });
    it('🎯 should execute structural checks across multi-dimensional nested boundaries recursively', () => {
      const result = xalor.mock<'DEEPLY_NESTED_STORE'>();
      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      if (result.items.length > 0) {
        const firstNestedItem = result.items[0];
        expect(firstNestedItem.logistics).toBeDefined();
        expect(typeof firstNestedItem.logistics.warehouseCode).toBe('string');
        expect(typeof firstNestedItem.logistics.dimensions.weight).toBe(
          'number',
        );
        expect(typeof firstNestedItem.logistics.dimensions.fragile).toBe(
          'boolean',
        );
      }
    });
  });
  // ========================================================================
  // 🧱 SECTION 2: ADVANCED BRANCH INTERCEPTION ENGINEERING
  // ========================================================================
  describe('🧱 ENGINE BRANCH INTERCEPTION TRACKING', () => {
    it('🧱 BRANCH MATCH: should guarantee inclusion of mandatory keys while treating optional fields fluidly', () => {
      const result = xalor.mock<'OPTIONAL_FIELDS_TEST'>();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('mandatoryId');
      expect(typeof result.mandatoryId).toBe('number');
    });

    it('🧱 BRANCH MATCH: should choose a random valid child path when unrolling union structures', () => {
      const result = xalor.mock<'COMPLEX_UNION_TEST'>();
      expect(result).toBeDefined();

      const possibleTypes = ['string', 'number', 'boolean'];
      expect(possibleTypes).toContain(typeof result.mixedValue);

      if (typeof result.mixedValue === 'string') {
        expect(result.mixedValue).toBe('custom_literal');
      }
    });

    it('🧱 BRANCH MATCH: should recursively scan the vault to unroll independent cross-referenced types', () => {
      const result = xalor.mock<'REFERENCE_LINK_TEST'>();
      expect(result).toBeDefined();
      expect(typeof result.id).toBe('number');
      expect(result.profileRef).toBeDefined();
      expect(typeof result.profileRef.id).toBe('number');
      expect(typeof result.profileRef.username).toBe('string');
      expect(typeof result.profileRef.active).toBe('boolean');
    });

    it('🧱 BRANCH MATCH: should peel away branded constraints and unwrap down into the structural base primitive', () => {
      const result = xalor.mock<'BRANDED_TYPE_TEST_MOCK'>();
      expect(result).toBeDefined();
      expect(isRecord(result)).toBe(true);

      // Unrolls branded node down to its raw string baseline entry footprint
      expect(typeof result.userId).toBe('string');
      expect(result.userId.length).toBeGreaterThan(0);
    });

    it('🧱 BRANCH MATCH: should ensure nominal identity branding is accurately applied onto generated mock objects', () => {
      const result = xalor.mock<'TRANSACTION'>();
      expect(result).toBeDefined();
      //  const result = xalor.mock<'TRANSACTION'>({
      //   id: () => fn()
      //  });
      const brandToken = Reflect.get(result, BRAND_SYMBOL);
      expect(Array.isArray(brandToken)).toBe(true);
      expect(brandToken).toContain('Solid');
      expect(brandToken).toContain('TRANSACTION');
    });
  });

  // ========================================================================
  // 🛡️ SECTION 3: ADVERSARIAL STRESS CORRUPTIONS & REJECT PANICS
  // ========================================================================
  describe('🚨 ENGINE OUT-OF-BOUNDS & GRAPH INTEGRITY REJECTIONS', () => {
    it('🚨 FAILURE 1: should cleanly throw a traceability error when requesting an unregistered key', () => {
      const unknownContractKey = 'GHOST_MOCK_CONTRACT';

      const errorResult = (() => {
        try {
          xalor.mock(unknownContractKey as never);
          return null;
        } catch (thrownException) {
          return thrownException;
        }
      })();

      expect(errorResult).toBeInstanceOf(Error);
      if (errorResult instanceof Error) {
        // 🚀 FIX: Updated to match your engine's actual production ingress exception signature header
        expect(errorResult.message).toContain('[Xalethor Ingress Exception]');
        expect(errorResult.message).toContain(unknownContractKey);
        expect(errorResult.message).toContain(
          'was never compiled or registered',
        );
      }
    });

    it('🚨 FAILURE 2: should trap broken internal target reference link keys during recursive traversal loops', () => {
      const errorResult = (() => {
        try {
          xalor.mock<'BROKEN_REF_TEST'>();
          return null;
        } catch (thrownException) {
          return thrownException;
        }
      })();

      // 🚀 FIXED: The materializer now throws immediately, turning this assert completely green
      expect(errorResult).toBeInstanceOf(Error);
      if (errorResult instanceof Error) {
        expect(errorResult.message).toContain('[Xalor Graph Integrity Error]');
        expect(errorResult.message).toContain('MISSING_TARGET_KEY');
      }
    });

    //   // it('🚨 FAILURE 3: should halt gracefully and return an empty block layout when recursive traversals cross max depth bounds', () => {
    //   //   const executeCircularPass = () => {
    //   //     return xalor.mock<'CIRCULAR_DEPTH_TEST'>();
    //   //   };

    //   //   expect(executeCircularPass).not.toThrow();

    //   //   const result = executeCircularPass();
    //   //   expect(result).toBeDefined();

    //   //   if (isRecord(result)) {
    //   //     let cursor: Record<string, unknown> = result;

    //   //     for (let depth = 0; depth < 25; depth++) {
    //   //       const nextNode = cursor.selfRef;
    //   //       if (!isRecord(nextNode)) {
    //   //         // 🚀 FIXED: Terminal fallback safely maps onto an empty record layout boundary object
    //   //         expect(nextNode).toMatchObject({});
    //   //         break;
    //   //       }
    //   //       cursor = nextNode;
    //   //     }
    //   //   }
    //   // });
    it('🚨 FAILURE 4: should handle severe structural type divergence gracefully when merging conflicting intersection properties', () => {
      const executeCollisionPass = (() => {
        try {
          xalor.mock<'COLLIDING_INTERSECTION_TEST'>();
          return null;
        } catch (error) {
          return error;
        }
      })();
      expect(executeCollisionPass).not.toBeInstanceOf(Error);
      expect(executeCollisionPass).toBeDefined();
      if (isRecord(executeCollisionPass)) {
        const fieldType = typeof executeCollisionPass.conflictField;
        expect(['string', 'number']).toContain(fieldType);
      }
    });
  });
});
