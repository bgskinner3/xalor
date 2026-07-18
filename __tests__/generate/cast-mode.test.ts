// **tests**/runtime/api/transform-xalor/flatten-mode.test.ts
import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';
import { TInstanceConstructorRegistry } from '../../shared';
import { isRecord, isInstanceOf } from '../../shared';
import { INSTANCE_REGISTRY_MAPPER } from '../../shared';

/**
pnpm run test -- __tests__/generate/cast-mode.test.ts

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
    BRANDED_TYPE_TEST_CAST: {
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
    STRICT_OBJECT_TEST: {
      coreId: string;
      rank: number;
    };
    TUPLE_BOUNDS_TEST: {
      sequence: [string, number, boolean];
    };
  }
}

describe('Runtime Generator API - Coercive Cast Mode', () => {
  beforeAll(() => {
    // Seed all authoritative shape definitions matching your literal blueprint properties
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
    seedTestVault('STRICT_OBJECT_TEST', TEST_SHAPE_REGISTRY.STRICT_OBJECT_TEST);
    seedTestVault('TUPLE_BOUNDS_TEST', TEST_SHAPE_REGISTRY.TUPLE_BOUNDS_TEST);
  });
  describe('PRIMITIVE COERCION & REPAIR GATES', () => {
    it('🎯 should repair stringified digits into native numbers and handle NaN defaults', () => {
      const dirtyInput = { id: '421', username: 'Skinner', active: true };
      const result = xalor.cast<'USER_TEST'>(dirtyInput);

      expect(result.id).toBe(421); // Successfully repaired "421" -> 421
      expect(xalor.guard<'USER_TEST'>(result)).toBe(true);
    });

    it('🎯 should fall back onto static defaults when primitive coercion fails completely', () => {
      const badInput = {
        id: 'not-a-number',
        username: 'Skinner',
        active: 'not-a-boolean',
      };
      const result = xalor.cast<'USER_TEST'>(badInput);

      expect(result.id).toBe(0); // NaN defaults to primitive number fallback
      expect(result.active).toBe(false); // Bad text truthy fallback matches standard Boolean conversion
    });

    it('🎯 should normalize loose casing variations into matching string literal constraints', () => {
      const looseInput = { id: 'TX-1', amount: 500, currency: '  usd  ' };
      const result = xalor.cast<'TRANSACTION'>(looseInput);

      expect(result.currency).toBe('USD'); // Trimmed, uppercased, and successfully aligned!
    });
  });
  describe('🛡️ STRUCTURAL SLICING & DEEP SECURITY IMMUNITY', () => {
    it('🎯 should strictly strip un-declared properties naturally by omission to block param injections', () => {
      const contaminatedInput = {
        id: 99,
        username: 'AdminSkinner',
        active: true,
        isAdmin: true, // Malicious hidden field injection
        nestedHacks: { script: 'alert(1)' },
      };

      const result = xalor.cast<'USER_TEST'>(contaminatedInput);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('active');
      expect(Reflect.has(result, 'isAdmin')).toBe(false); // Safely stripped!
      expect(Reflect.has(result, 'nestedHacks')).toBe(false); // Safely stripped!
    });

    it('🎯 should hydrate missing required complex nodes with clean defaults', () => {
      const truncatedInput = { orderId: 'ORD-100' }; // missing the items array completely
      const result = xalor.cast<'STORE_ORDER'>(truncatedInput);

      expect(result.orderId).toBe('ORD-100');
      expect(Array.isArray(result.items)).toBe(true); // Hydrated an empty array skeleton automatically
      expect(result.items.length).toBe(0);
    });
  });
  // ========================================================================
  // 🔷 SECTION 3: PLATFORM INSTANCE RESOLUTION & WIRE SERIALIZATION PIPELINES
  // ========================================================================
  describe('🪐 WEB PLATFORM & BINARY BUFFER CASTING PIPELINES', () => {
    it('🎯 should seamlessly parse ISO date strings into live Date instances and handle array-to-collection hydration', () => {
      const wireData = {
        dateVal: '2026-07-17T21:17:00.000Z',
        mapVal: [
          ['keyA', 'valueA'],
          ['keyB', 'valueB'],
        ],
        setVal: ['item1', 'item1', 'item2'],
        urlVal: 'https://xalor.dev',
        arrayBufferVal: 16,
      };

      const result = xalor.cast<'ALL_PLATFORM_INSTANCES_SHAPE'>(
        wireData,
        'ALL_PLATFORM_INSTANCES_SHAPE',
      );
      expect(result).toBeDefined();

      // Read values dynamically to avoid constructor vs instance type map clashes
      const rawDate = Reflect.get(result, 'dateVal');
      const rawMap = Reflect.get(result, 'mapVal');
      const rawSet = Reflect.get(result, 'setVal');
      const rawUrl = Reflect.get(result, 'urlVal');
      const rawBuffer = Reflect.get(result, 'arrayBufferVal');

      // 🚀 FIX: Pass each raw extracted variable through your native isInstanceOf guard!
      // This forces the compiler to reify types to active instances point-free with zero "as" casts!
      if (
        isInstanceOf(rawDate, Date) &&
        isInstanceOf(rawMap, Map) &&
        isInstanceOf(rawSet, Set) &&
        isInstanceOf(rawUrl, URL) &&
        isInstanceOf(rawBuffer, ArrayBuffer)
      ) {
        // 1. Verify Date hydration (getUTCFullYear now compiles flawlessly!)
        expect(rawDate).toBeInstanceOf(Date);
        expect(rawDate.getUTCFullYear()).toBe(2026);

        // 2. Verify Collection hydration and entries parsing (.get and .size compile flawlessly!)
        expect(rawMap).toBeInstanceOf(Map);
        expect(rawMap.get('keyA')).toBe('valueA');
        expect(rawSet).toBeInstanceOf(Set);
        expect(rawSet.size).toBe(2);

        // 3. Verify Web Frames and Binary Buffer hydration (.hostname compiles flawlessly!)
        expect(rawUrl).toBeInstanceOf(URL);
        expect(rawUrl.hostname).toBe('xalor.dev');
        expect(rawBuffer).toBeInstanceOf(ArrayBuffer);
      } else {
        // Guard pass constraint check safety valve
        fail(
          'Platform data materialization failed to output valid live object instances.',
        );
      }
    });
    it('🎯 should gracefully fall back to pristine skeleton def() initializers when wire instances are corrupt', () => {
      const corruptWireData = {
        dateVal: 'not-a-valid-date-string',
        urlVal: 'malformed-url-format-no-protocol',
      };

      const result = xalor.cast<'ALL_PLATFORM_INSTANCES_SHAPE'>(
        corruptWireData,
        'ALL_PLATFORM_INSTANCES_SHAPE',
      );
      expect(result).toBeDefined();

      const dateVal = Reflect.get(result, 'dateVal');
      const urlVal = Reflect.get(result, 'urlVal');

      // 🚀 FIX: Narrow variables point-free via your native isInstanceOf guard!
      // This informs the compiler that both targets are active instances, removing the ts(2339) error.
      if (isInstanceOf(dateVal, Date) && isInstanceOf(urlVal, URL)) {
        // Instead of throwing an error or halting gateway loops, it defers straight to truth table default blueprints
        expect(dateVal).toBeInstanceOf(Date);
        expect(dateVal.getTime()).toBe(0); // Falls back safely to new Date(0) baseline

        expect(urlVal).toBeInstanceOf(URL);
        expect(urlVal.toString()).toBe('http://localhost/'); // Falls back safely to localhost def()
      } else {
        fail(
          'Platform fallback materialization failed to yield valid initialized class instances.',
        );
      }
    });
  });

  // ========================================================================
  // 🔷 SECTION 4: COMPLEX STRUCTURAL LAYOUTS & POSITIONAL TUPLE OFFSETS
  // ========================================================================
  describe('🧱 TUPLES, INTERSECTIONS, UNIONS, AND REFERENCE LINK LOOKUPS', () => {
    it('🎯 should cast multi-layered intersections by recursively merging schema subsets together', () => {
      const looseIntersectionInput = {
        conflictField: 'Priority-String-Pass-Wins',
      };
      const result = xalor.cast<'COLLIDING_INTERSECTION_TEST'>(
        looseIntersectionInput,
        'COLLIDING_INTERSECTION_TEST',
      );

      expect(result.conflictField).toBe('Priority-String-Pass-Wins');
    });

    it('🎯 should cast array collections into strict fixed-position tuple offset rules based on elementShapes', () => {
      const mixedWireTuple = { sequence: [1000, '2000', 'true'] }; // completely inverted type sequence on wire
      const result = xalor.cast<'TUPLE_BOUNDS_TEST'>(
        mixedWireTuple,
        'TUPLE_BOUNDS_TEST',
      );

      // Sequence Blueprint contract demands: [string, number, boolean]
      expect(result.sequence[0]).toBe('1000'); // Coerced to string
      expect(result.sequence[1]).toBe(2000); // Coerced to number
      expect(result.sequence[2]).toBe(true); // Coerced to boolean
    });

    it('🎯 should seamlessly crawl the vault keeper to resolve independent cross-referenced types', () => {
      const relationalInput = {
        id: 505,
        profileRef: {
          id: '707',
          username: 'RelationalSkinner',
          active: 'true',
          rogueField: 'strip-me',
        },
      };

      const result = xalor.cast<'REFERENCE_LINK_TEST'>(
        relationalInput,
        'REFERENCE_LINK_TEST',
      );

      expect(result.id).toBe(505);
      expect(result.profileRef.id).toBe(707); // Nested element repaired successfully
      expect(result.profileRef.username).toBe('RelationalSkinner');
      expect(result.profileRef.active).toBe(true); // Nested boolean repaired successfully
      expect(Reflect.has(result.profileRef, 'rogueField')).toBe(false); // Deep nested stripping verified!
    });
  });

  // ========================================================================
  // 🚨 SECTION 5: ADVERSARIAL STRESS TESTING & CIRCUIT BREAKERS
  // ========================================================================
  describe('🚨 ENGINE OUT-OF-BOUNDS & GRAPH INTEGRITY PANICS', () => {
    it('🚨 FAILURE 1: should cleanly throw an ingress exception error when requesting an unregistered key', () => {
      const unknownContractKey = 'GHOST_CAST_CONTRACT';

      const errorResult = (() => {
        try {
          xalor.cast({}, unknownContractKey as never);
          return null;
        } catch (thrownException) {
          return thrownException;
        }
      })();

      expect(errorResult).toBeInstanceOf(Error);
      if (errorResult instanceof Error) {
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
          xalor.cast({ badLink: {} }, 'BROKEN_REF_TEST');
          return null;
        } catch (thrownException) {
          return thrownException;
        }
      })();

      expect(errorResult).toBeInstanceOf(Error);
      if (errorResult instanceof Error) {
        expect(errorResult.message).toContain('[Xalor Graph Integrity Error]');
        expect(errorResult.message).toContain('MISSING_TARGET_KEY');
      }
    });

    it('🚨 FAILURE 3: should halt gracefully and return an empty block layout when recursive traversals cross max depth bounds', () => {
      // Seeds the vault map structure freshly to prevent test cross-contamination lookups
      seedTestVault(
        'CIRCULAR_DEPTH_TEST',
        TEST_SHAPE_REGISTRY.CIRCULAR_DEPTH_TEST,
      );

      const result = xalor.cast({ selfRef: {} }, 'CIRCULAR_DEPTH_TEST');
      expect(result).toBeDefined();

      if (isRecord(result)) {
        let cursor: Record<string, unknown> = result;

        for (let depth = 0; depth < 25; depth++) {
          const nextNode = cursor.selfRef;

          // 🚀 FIX: Check for null or undefined leaf parameters explicitly
          if (nextNode === null || nextNode === undefined) {
            expect(nextNode).toBeNull(); // Conforms perfectly to configured terminal fallbacks
            break;
          }

          if (!isRecord(nextNode)) {
            expect(nextNode).toMatchObject({});
            break;
          }
          cursor = nextNode;
        }
      }
    });
  });
  describe('🪐 ALL 33 AUTHORITATIVE INSTANCE COERCION METRICS (EXHAUSTIVE LOOP PASS)', () => {
    // 1. Establish sample dirty wire inputs that match the native structures
    const sampleWirePayloads: Record<string, unknown> = {
      // === Core JS & Internationalization ===
      Date: '2026-07-17T21:17:00.000Z',
      RegExp: '^[a-z]+$',
      'Intl.DateTimeFormat': 'en-US',
      'Intl.NumberFormat': 'en-GB',
      'Intl.PluralRules': 'fr',

      // === Collections ===
      Map: [['id', 'X-1']],
      Set: ['item1', 'item2', 'item1'], // Deduplicates automatically to size 2
      WeakMap: null, // Defers safely straight to truth table def() blueprint by design
      WeakSet: null, // Defers safely straight to truth table def() blueprint by design

      // === Web Platform Data Frames ===
      URL: 'https://xalor.dev',
      URLSearchParams: 'page=2&sort=desc',
      Headers: [['Content-Type', 'application/json']], // Positionally verified tuple list array
      Request: 'https://xalor.dev',
      Response: 'stream_payload_wire',
      Blob: ['packed_binary_parts'],
      File: ['file_contents_stream'],

      // === Binary Data & Packets ===
      ArrayBuffer: 16, // Coerces numeric scalar length sizes directly
      DataView: new ArrayBuffer(4),

      // === Typed Array Views ===
      Int8Array: [127, -128, 0],
      // Uint8Array:,
      // Uint8ClampedArray:,
      Int16Array: [32767, -32768, 0],
      // Uint16Array:,
      Int32Array: [2147483647, -2147483648, 0],
      // Uint32Array:,
      Float32Array: [1.5, 2.5, -3.5],
      Float64Array: [3.14159, 2.71828, -1.41421],
      BigInt64Array: [9223372036854775807n, -9223372036854775808n, 0n],
      BigUint64Array: [0n, 9223372036854775807n, 18446744073709551615n],

      // === Async & Stream Pipelines ===
      Promise: 'resolved_wire_value',
      ReadableStream: 'chunk_payload',
      WritableStream: null, // Defers safely straight to truth table def() blueprint by design
      TransformStream: null, // Defers safely straight to truth table def() blueprint by design
    };

    // 2. Iterate dynamically over all keys inside your single source of truth mapper table
    const allRegisteredInstanceNames = Object.keys(
      TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE.properties,
    );

    for (let i = 0; i < allRegisteredInstanceNames.length; i++) {
      const instanceName = allRegisteredInstanceNames[i];

      it(`🪐 SHOULD successfully cast, repair, or fall back natively for platform type: "${instanceName}"`, () => {
        // Construct an isolated raw test payload targeting this single property name
        const incomingPayload: Record<string, unknown> = {};
        incomingPayload[instanceName] = sampleWirePayloads[instanceName];

        const result = xalor.cast<'ALL_PLATFORM_INSTANCES_SHAPE'>(
          incomingPayload,
          'ALL_PLATFORM_INSTANCES_SHAPE',
        );
        expect(result).toBeDefined();

        // Extract result point-free via reflection parameters
        const materializedField = Reflect.get(result, instanceName);
        expect(materializedField).toBeDefined();
        expect(materializedField).not.toBeNull();

        // Verify that the output container matches your authoritative constructor type metadata
        const shapeDescriptor =
          TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE.properties[
            instanceName as keyof typeof TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE.properties
          ].shape;
        const targetConfig =
          INSTANCE_REGISTRY_MAPPER[
            shapeDescriptor.name as keyof typeof INSTANCE_REGISTRY_MAPPER
          ];

        if (targetConfig) {
          expect(materializedField).toBeInstanceOf(targetConfig.ctor);
        }
      });

      it(`🪐 SHOULD recover gracefully to def() blueprint for corrupted wire values on platform type: "${instanceName}"`, () => {
        const corruptPayload: Record<string, unknown> = {};
        // Feed absolute garbage text that will break native constructors (forcing try/catch recovery passes)
        corruptPayload[instanceName] =
          '🚨_ILLEGAL_WIRE_CONSTRUCTOR_CRASH_TRIGGER_🚨';

        const result = xalor.cast<'ALL_PLATFORM_INSTANCES_SHAPE'>(
          corruptPayload,
          'ALL_PLATFORM_INSTANCES_SHAPE',
        );
        expect(result).toBeDefined();

        const recoveredField = Reflect.get(result, instanceName);
        expect(recoveredField).toBeDefined();
        expect(recoveredField).not.toBeNull();

        const shapeDescriptor =
          TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE.properties[
            instanceName as keyof typeof TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE.properties
          ].shape;
        const targetConfig =
          INSTANCE_REGISTRY_MAPPER[
            shapeDescriptor.name as keyof typeof INSTANCE_REGISTRY_MAPPER
          ];

        if (targetConfig) {
          expect(recoveredField).toBeInstanceOf(targetConfig.ctor);
        }
      });
    }
  });
});
