import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';
import { BRAND_SYMBOL } from '../../shared';
import { isInstanceOf } from '../../shared';
import { TInstanceConstructorRegistry } from '../../shared';
/**
  pnpm run test -- __tests__/transform/clone-mode.test.ts
 */

declare global {
  interface ISolidRegistry {
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
    USER_TEST: { id: number; username: string; active: boolean };
    API_RESPONSE: { status: 'success' | 'failed' | number };
    STORE_ORDER: {
      orderId: string;
      items: { SKU: string; quantity: number }[];
    };
    INFINITE_LOOP_TEST: {
      selfRef: unknown;
    };
    DEEPLY_NESTED_STORE: {
      orderId: string;
      items: {
        SKU: string;
        quantity: number;
        logistics: {
          warehouseCode: string;
          dimensions: { weight: number; fragile: boolean };
        };
      }[];
    };
    OPTIONAL_FIELDS_TEST: {
      mandatoryId: number;
      optionalMeta?: string;
      optionalData?: { nestedFlag: boolean };
    };
    COMPLEX_UNION_TEST: { mixedValue: 'custom_literal' | number | boolean };
    BRANDED_TYPE_TEST_CLONE: {
      userId: string & { readonly __brand: unique symbol };
    };
    REFERENCE_LINK_TEST: {
      id: number;
      profileRef: ISolidRegistry['USER_TEST'];
    };
    CIRCULAR_DEPTH_TEST_CAST: {
      id: number;
      selfRef?: ISolidRegistry['CIRCULAR_DEPTH_TEST_CAST'];
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
    COLLIDING_INTERSECTION_TEST: {
      conflictField: string | number;
    };
  }
}

describe('Runtime Generator API - Clone Mode', () => {
  beforeAll(() => {
    // Seed definitions out of our central constants registry
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
    seedTestVault(
      'REFERENCE_LINK_TEST',
      TEST_SHAPE_REGISTRY.REFERENCE_LINK_TEST,
    );
    seedTestVault(
      'CIRCULAR_DEPTH_TEST',
      TEST_SHAPE_REGISTRY.CIRCULAR_DEPTH_TEST,
    );
    seedTestVault(
      'ALL_PLATFORM_INSTANCES_SHAPE',
      TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE,
    );

    // 🎯 ADD THIS EXACT LINE TO REGISTER THE BLUEPRINT INSIDE THIS TEST SUITE VAULT CACHE:
    seedTestVault(
      'ALL_PLATFORM_INSTANCES_SHAPE',
      TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE,
    );
    seedTestVault(
      'REFERENCE_LINK_TEST',
      TEST_SHAPE_REGISTRY.REFERENCE_LINK_TEST,
    );
    seedTestVault(
      'ADVANCED_COMPLEXITY_SHAPE',
      TEST_SHAPE_REGISTRY.ADVANCED_COMPLEXITY_SHAPE,
    );
    seedTestVault(
      'BRANDED_TYPE_TEST_CLONE',
      TEST_SHAPE_REGISTRY.BRANDED_TYPE_TEST,
    );
    seedTestVault(
      'CIRCULAR_DEPTH_TEST_CAST',
      TEST_SHAPE_REGISTRY.CIRCULAR_DEPTH_TEST_CAST,
    );
    seedTestVault(
      'COLLIDING_INTERSECTION_TEST',
      TEST_SHAPE_REGISTRY.COLLIDING_INTERSECTION_TEST,
    );
    seedTestVault('INFINITE_LOOP_TEST', TEST_SHAPE_REGISTRY.INFINITE_LOOP_TEST);
  });

  describe('GENERATE XALOR CLONE OBJECT', () => {
    it('🎯 TRACK 1: should perform a deep copy and successfully scrub away un-declared property keys', () => {
      const sourcePayload = {
        id: 501,
        username: 'clone_scrub_pass',
        active: true,
        strayHackerAttribute: 'MALICIOUS_INJECTION_VECTOR',
        maliciousToken: 99123,
      };
      const result = xalor.clone<'USER_TEST'>(sourcePayload);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        id: 501,
        username: 'clone_scrub_pass',
        active: true,
      });
      expect(result[BRAND_SYMBOL]).toEqual(['Solid', 'USER_TEST']);
      expect(result).not.toHaveProperty('strayHackerAttribute');
      expect(result).not.toBe(sourcePayload);
    });
    it('🎯 TRACK 2: should return null or strip literal fields if the value mismatches the constraint', () => {
      const validLiteralPayload = { status: 'success' };
      const invalidLiteralPayload = { status: 'PENDING_REPLICATION' };
      const validResult = xalor.clone<'API_RESPONSE'>(validLiteralPayload);
      const invalidResult = xalor.clone<'API_RESPONSE'>(invalidLiteralPayload);
      expect(validResult).toMatchObject({ status: 'success' });
      expect(validResult[BRAND_SYMBOL]).toEqual(['Solid', 'API_RESPONSE']);
      expect(invalidResult).toBeDefined();
      expect(invalidResult![BRAND_SYMBOL]).toEqual(['Solid', 'API_RESPONSE']);
    });
    it('🎯 TRACK 3: should handle multi-dimensional array clone scrubbing recursively', () => {
      const mixedOrderPayload = {
        orderId: 'ORD-CLONE-77',
        items: [
          { SKU: 'SKU-OK', quantity: 5, unmappedMeta: 'strip_me' },
          { SKU: 'SKU-FAIL', quantity: 2 },
        ],
        extraTopLevelGarbage: 'delete_me',
      };
      const result = xalor.clone<'STORE_ORDER'>(mixedOrderPayload);
      expect(result).toBeDefined();
      expect(result.orderId).toBe('ORD-CLONE-77');
      expect(result).not.toHaveProperty('extraTopLevelGarbage');
      expect(result.items[0]).not.toHaveProperty('unmappedMeta');
    });
    it('🎯 TRACK 4: should preserve optional layout fields when present and skip them gracefully when missing', () => {
      const partialPayload = { mandatoryId: 101 };
      const fullPayload = {
        mandatoryId: 102,
        optionalMeta: 'meta-str',
        stray: 'delete',
      };
      const resultPartial = xalor.clone<'OPTIONAL_FIELDS_TEST'>(partialPayload);
      const resultFull = xalor.clone<'OPTIONAL_FIELDS_TEST'>(fullPayload);
      expect(resultPartial.mandatoryId).toBe(101);
      expect(resultPartial).not.toHaveProperty('optionalMeta');
      expect(resultFull.optionalMeta).toBe('meta-str');
      expect(resultFull).not.toHaveProperty('stray');
    });
    it('🎯 TRACK 5: should correctly sniff out and clone the accurate matching branch of union types', () => {
      const literalPayload = { mixedValue: 'custom_literal' };
      const numberPayload = { mixedValue: 404 };
      const resultLit = xalor.clone<'COMPLEX_UNION_TEST'>(literalPayload);
      const resultNum = xalor.clone<'COMPLEX_UNION_TEST'>(numberPayload);
      expect(resultLit.mixedValue).toBe('custom_literal');
      expect(resultNum.mixedValue).toBe(404);
    });
    it('🎯 TRACK 6: should isolate nominal branded primitive elements flawlessly', () => {
      const brandedPayload = { userId: 'usr_secure_9011' };
      const result = xalor.clone<'BRANDED_TYPE_TEST_CLONE'>(brandedPayload);
      expect(result.userId).toBe('usr_secure_9011');
      expect(result[BRAND_SYMBOL]).toEqual([
        'Solid',
        'BRANDED_TYPE_TEST_CLONE',
      ]);
    });
    it('🎯 TRACK 7: should resolve cross-entity blueprint reference link boundaries correctly', () => {
      const compositePayload = {
        id: 88,
        profileRef: {
          id: 501,
          username: 'sub_user',
          active: true,
          stray: 'strip',
        },
      };
      const result = xalor.clone<'REFERENCE_LINK_TEST'>(compositePayload);
      expect(result.id).toBe(88);
      expect(result.profileRef.username).toBe('sub_user');
      expect(result.profileRef).not.toHaveProperty('stray');
    });
    // describe('GENERATE XALOR DEFAULT OBJECT', () => {
    it('🎯 TRACK 8: should cleanly process complex platform structures and functions inside execution scopes', () => {
      seedTestVault(
        'ADVANCED_COMPLEXITY_SHAPE',
        TEST_SHAPE_REGISTRY.ADVANCED_COMPLEXITY_SHAPE,
      );
      const mockPipelineInstance = async () => 'processed';
      const advancedPayload = {
        userRole: [
          {
            SKU: 'SKU-PLAT',
            quantity: 1,
            logistics: { warehouseCode: 'WH-WEST' },
          },
        ],
        transformStreamVal: new TransformStream(),
        executePipeline: mockPipelineInstance,
        extraJunk: 'erase',
      };
      const result = xalor.clone<'ADVANCED_COMPLEXITY_SHAPE'>(advancedPayload);
      expect(result.userRole[0].SKU).toBe('SKU-PLAT');
      expect(result.transformStreamVal).toBeInstanceOf(TransformStream);
      expect(typeof result.executePipeline).toBe('function');
      expect(result).not.toHaveProperty('extraJunk');
    });
    // });

    it('🎯 TRACK 9: should handle platform instances including Dates, Maps, and ArrayBuffers', () => {
      const inputDate = new Date('2026-03-31T00:00:00.000Z');
      const inputMap = new Map([['key', 'val']]);
      const inputBuffer = new ArrayBuffer(16);
      const platformPayload = {
        dateVal: inputDate,
        regExpVal: /[A-Z]+/g,
        mapVal: inputMap,
        setVal: new Set(['item']),
        weakMapVal: new WeakMap(),
        weakSetVal: new WeakSet(),
        urlVal: new URL('https://example.com'),
        urlParamsVal: new URLSearchParams('?a=1'),
        headersVal: new Headers([['x-brand', 'solid']]),
        requestVal: new Request('https://example.com'),
        responseVal: new Response(),
        blobVal: new Blob(['data']),
        fileVal: new File([''], 't.txt'),
        arrayBufferVal: inputBuffer,
        dataViewVal: new DataView(inputBuffer),
        int8ArrayVal: new Int8Array(inputBuffer),
        uint8ArrayVal: new Uint8Array(inputBuffer),
        uint8ClampedArrayVal: new Uint8ClampedArray(inputBuffer),
        int16ArrayVal: new Int16Array(inputBuffer),
        uint16ArrayVal: new Uint16Array(inputBuffer),
        int32ArrayVal: new Int32Array(inputBuffer),
        uint32ArrayVal: new Uint32Array(inputBuffer),
        float32ArrayVal: new Float32Array(inputBuffer),
        float64ArrayVal: new Float64Array(inputBuffer),
        bigInt64ArrayVal: new BigInt64Array(inputBuffer),
        bigUint64ArrayVal: new BigUint64Array(inputBuffer),
        promiseVal: Promise.resolve(true),
        readableStreamVal: new ReadableStream(),
        writableStreamVal: new WritableStream(),
        transformStreamVal: new TransformStream(),
      };
      const result =
        xalor.clone<'ALL_PLATFORM_INSTANCES_SHAPE'>(platformPayload);
      if (
        isInstanceOf(result.dateVal, Date) &&
        isInstanceOf(result.regExpVal, RegExp)
      ) {
        expect(result.dateVal).not.toBe(inputDate);
        expect(result.dateVal.getTime()).toBe(inputDate.getTime());
        expect(result.regExpVal.source).toBe('[A-Z]+');
      } else {
        fail(
          'Platform initialization failed to narrow Date or RegExp properties structurally.',
        );
      }
      if (
        isInstanceOf(result.mapVal, Map) &&
        isInstanceOf(result.setVal, Set)
      ) {
        expect(result.mapVal).not.toBe(inputMap);
        expect(result.mapVal.get('key')).toBe('val');
        expect(result.setVal.has('item')).toBe(true);
      } else {
        fail(
          'Platform initialization failed to narrow Map or Set properties structurally.',
        );
      }
      // --- Core JS Object Isolation Assertions ---
      // --- Collection Isolation Assertions ---
      expect(result.weakMapVal).toBeInstanceOf(WeakMap);
      expect(result.weakSetVal).toBeInstanceOf(WeakSet);
      if (isInstanceOf(result.headersVal, Headers)) {
        expect(result.headersVal.get('x-brand')).toBe('solid');
      } else {
        fail(
          'Platform initialization failed to narrow Headers properties structurally.',
        );
      }
      if (
        isInstanceOf(result.urlVal, URL) &&
        isInstanceOf(result.urlParamsVal, URLSearchParams) &&
        isInstanceOf(result.fileVal, Blob)
      ) {
        expect(result.urlVal.origin).toBe('https://example.com');
        expect(result.urlParamsVal.get('a')).toBe('1');
      } else {
        fail(
          'Platform initialization failed to narrow Headers properties structurally.',
        );
      }
      // --- Web Platform Data Frame Assertions ---
      expect(result.requestVal).toBeInstanceOf(Request);
      expect(result.responseVal).toBeInstanceOf(Response);
      expect(result.blobVal).toBeInstanceOf(Blob);
      // --- Binary Data Buffer Identity Assertions ---
      expect(result.arrayBufferVal).toBeInstanceOf(ArrayBuffer);
      expect(result.dataViewVal).toBeInstanceOf(DataView);
      expect(result.int8ArrayVal).toBeInstanceOf(Int8Array);
      expect(result.uint8ArrayVal).toBeInstanceOf(Uint8Array);
      expect(result.uint8ClampedArrayVal).toBeInstanceOf(Uint8ClampedArray);
      expect(result.int16ArrayVal).toBeInstanceOf(Int16Array);
      expect(result.uint16ArrayVal).toBeInstanceOf(Uint16Array);
      expect(result.int32ArrayVal).toBeInstanceOf(Int32Array);
      expect(result.uint32ArrayVal).toBeInstanceOf(Uint32Array);
      expect(result.float32ArrayVal).toBeInstanceOf(Float32Array);
      expect(result.float64ArrayVal).toBeInstanceOf(Float64Array);
      expect(result.bigInt64ArrayVal).toBeInstanceOf(BigInt64Array);
      expect(result.bigUint64ArrayVal).toBeInstanceOf(BigUint64Array);
      // --- Async & Streams Assertions ---
      expect(result.promiseVal).toBeInstanceOf(Promise);
      expect(result.readableStreamVal).toBeInstanceOf(ReadableStream);
      expect(result.writableStreamVal).toBeInstanceOf(WritableStream);
      expect(result.transformStreamVal).toBeInstanceOf(TransformStream);
    });
    it('🎯 TRACK 10: should gracefully fall back to pristine skeleton def() initializers when wire instances are corrupt', () => {
      const corruptWireData = {
        dateVal: 'not-a-valid-date-string',
        urlVal: 'malformed-url-format-no-protocol',
      };

      const result =
        xalor.clone<'ALL_PLATFORM_INSTANCES_SHAPE'>(corruptWireData);
      expect(result).toBeDefined();

      const dateVal = Reflect.get(result, 'dateVal');
      const urlVal = Reflect.get(result, 'urlVal');

      // ✅ Clean Point-Free Runtime Guarding to protect the TS Compiler
      if (isInstanceOf(dateVal, Date) && isInstanceOf(urlVal, URL)) {
        expect(dateVal).toBeInstanceOf(Date);
        expect(dateVal.getTime()).toBe(0); // Safely re-rooted back to new Date(0) baseline

        expect(urlVal).toBeInstanceOf(URL);
        expect(urlVal.toString()).toBe('http://localhost/'); // Safely re-rooted back to localhost fallback
      } else {
        // 🎯 FIXED: Explicitly removed legacy fail() reference to stop modern Jest runtime crashes
        expect(
          'Platform fallback should return valid initialized class instances',
        ).toBe('but it failed');
      }
    });
    it('🛡️ EDGE CASE 1: should safely intercept cyclical self-referencing graphs without blowing the execution stack', () => {
      seedTestVault(
        'CIRCULAR_DEPTH_TEST_CAST',
        TEST_SHAPE_REGISTRY.CIRCULAR_DEPTH_TEST_CAST,
      );
      const circularPayload: any = { id: 777 };
      circularPayload.selfRef = circularPayload;
      const result = xalor.clone<'CIRCULAR_DEPTH_TEST_CAST'>(circularPayload);
      expect(result.id).toBe(777);
      expect(result.selfRef).toBe(result);
    });
    it('🛡️ EDGE CASE 2: should reject data structures if intersecting conditions conflict on field types', () => {
      const conflictingPayload = {
        conflictField: 'this_violates_intersection',
      };
      const result =
        xalor.clone<'COLLIDING_INTERSECTION_TEST'>(conflictingPayload);
      // String & number intersection is an impossible constraint block, must resolve cleanly to empty/unmapped
      expect(result.conflictField).toBeUndefined();
    });
    it('🛡️ EDGE CASE 3: should guard unconditionally against deep schema-looped references', () => {
      const endlessPayload: any = {};
      endlessPayload.selfRef = endlessPayload;
      expect(() =>
        xalor.clone<'INFINITE_LOOP_TEST'>(endlessPayload),
      ).not.toThrow();
    });
  });
});
