// __tests__/runtime/api/transform-xalor/flatten-mode.test.ts
import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';
import type { TInstanceConstructorRegistry } from '../../shared/shape-domain';
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
      TEST_SHAPE_REGISTRY.ADVANCED_COMPLEXITY_SHAPE,
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
    seedTestVault('BRANDED_TYPE_TEST', TEST_SHAPE_REGISTRY.BRANDED_TYPE_TEST);
    seedTestVault(
      'REFERENCE_LINK_TEST',
      TEST_SHAPE_REGISTRY.REFERENCE_LINK_TEST,
    );
    seedTestVault(
      'CIRCULAR_DEPTH_TEST',
      TEST_SHAPE_REGISTRY.CIRCULAR_DEPTH_TEST,
    );
    seedTestVault('TRANSACTION', TEST_SHAPE_REGISTRY.TRANSACTION);
  });

  describe('GENERATE XALOR MOCK OBJECT', () => {
    it('🎯 should successfully compile high-entropy primitives from a standard user blueprint', () => {
      const result = xalor.mock<'ALL_PLATFORM_INSTANCES_SHAPE'>();
      console.log(result, '\n\n\n\n\n', 'RESULLLLLTTTT');
      expect(result).toBeDefined();
    });
    it('🎯 should successfully compile high-entropy primitives from a standard user blueprint', () => {
      const result = xalor.mock<'USER_TEST'>();

      expect(result).toBeDefined();
      expect(typeof result.id).toBe('number');
      expect(typeof result.username).toBe('string');
      expect(typeof result.active).toBe('boolean');

      // Verify random entropy string allocation footprint works
      expect(result.username.length).toBeGreaterThan(0);
    });

    it('🎯 should preserve exact explicit values when materializing literal shape segments', () => {
      const result = xalor.mock<'API_RESPONSE'>();

      expect(result).toBeDefined();
      // Union literals allow 'success', 'failed', or number primitives
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

      // Your array mapper dictates constraint loops generating 1 to 3 items randomly
      expect(result.items.length).toBeGreaterThanOrEqual(1);
      expect(result.items.length).toBeLessThanOrEqual(3);

      // Verify individual structural item contents recursively
      result.items.forEach((item) => {
        expect(typeof item.SKU).toBe('string');
        expect(typeof item.quantity).toBe('number');
      });
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

    // ========================================================================
    // ADVANCED STRATEGY DRIVEN EVALUATION TRACKS
    // ========================================================================
    it('🧱 BRANCH MATCH: should guarantee inclusion of mandatory keys while treating optional fields fluidly', () => {
      // Because inclusion uses an entropy rule (Math.random()), mandatory keys must ALWAYS exist
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

    // it('🧱 BRANCH MATCH: should unwrap branded constraints and mock out the clean underlying base primitive', () => {
    //   const result = xalor.mock<'BRANDED_TYPE_TEST'>();

    //   expect(result).toBeDefined();
    //   expect(typeof result.userId).toBe('string');
    //   expect(result.userId.length).toBeGreaterThan(0);
    // });

    it('🧱 BRANCH MATCH: should recursively scan the vault to unroll independent cross-referenced types', () => {
      const result = xalor.mock<'REFERENCE_LINK_TEST'>();

      expect(result).toBeDefined();
      expect(typeof result.id).toBe('number');
      expect(result.profileRef).toBeDefined();
      expect(typeof result.profileRef.id).toBe('number');
      expect(typeof result.profileRef.username).toBe('string');
      expect(typeof result.profileRef.active).toBe('boolean');
    });

    // ========================================================================
    // CRITICAL ADVERSARIAL RECURSION BOUNDARIES (Commandment V & IX Parity)
    // ========================================================================
    it('🛡️ EDGE CASE 1: should safely intercept circular data dependencies using reify limits without stack panics', () => {
      const executeCircularPass = () => {
        return xalor.mock<'CIRCULAR_DEPTH_TEST'>();
      };

      expect(executeCircularPass).not.toThrow();

      const result = executeCircularPass();

      if (result !== undefined && result !== null) {
        expect(typeof result).toBe('object');

        let cursor: any = result;
        for (let depth = 0; depth < 20; depth++) {
          if (!cursor.selfRef || typeof cursor.selfRef !== 'object') break;
          cursor = cursor.selfRef;
        }

        expect(cursor.selfRef).not.toBeInstanceOf(Object);
      }
    });
  });
});
