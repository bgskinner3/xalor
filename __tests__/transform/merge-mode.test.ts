// // __tests__/runtime/api/transform-xalor/merge-mode.test.ts
import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';
import type { TInstanceConstructorRegistry } from '../../shared/shape-domain';
import type { TDetermineInstance } from '../../shared';
/**
 * TEST CONTROL
 *
  * TO RUN
 pnpm run test -- __tests__/transform/merge-mode.test.ts
 */

declare global {
  interface ISolidRegistry {
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

// pick, omit, rename, merge, flatten
describe('Runtime Generator API', () => {
  beforeAll(() => {
    // Seed your mock blueprint registry definitions flatly straight into RAM memory
    /* prettier-ignore */ seedTestVault('USER_TEST', TEST_SHAPE_REGISTRY.STANDARD_USER);
    /* prettier-ignore */ seedTestVault('API_RESPONSE', TEST_SHAPE_REGISTRY.UNION_RESPONSE);
    /* prettier-ignore */ seedTestVault('STORE_ORDER', TEST_SHAPE_REGISTRY.COMPLEX_ORDER);
    /* prettier-ignore */ seedTestVault('DEEPLY_NESTED_STORE', TEST_SHAPE_REGISTRY.DEEPLY_NESTED_STORE);
    /* prettier-ignore */ seedTestVault('OPTIONAL_FIELDS_TEST', TEST_SHAPE_REGISTRY.OPTIONAL_FIELDS_TEST);
    /* prettier-ignore */ seedTestVault('COMPLEX_UNION_TEST', TEST_SHAPE_REGISTRY.COMPLEX_UNION_TEST);
    /* prettier-ignore */ seedTestVault('REFERENCE_LINK_TEST', TEST_SHAPE_REGISTRY.REFERENCE_LINK_TEST);
    /* prettier-ignore */ seedTestVault('CIRCULAR_DEPTH_TEST', TEST_SHAPE_REGISTRY.CIRCULAR_DEPTH_TEST);
    /* prettier-ignore */ seedTestVault('ALL_PLATFORM_INSTANCES_SHAPE', TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE);
    /* prettier-ignore */ seedTestVault('ADVANCED_COMPLEXITY_SHAPE', TEST_SHAPE_REGISTRY.ADVANCED_COMPLEXITY_SHAPE);
  });
  describe('TRANSFORM XALOR MERGE CORE LAYOUTS', () => {
    it('🛡️ TRACK 1: should successfully deep-merge flat object profiles using dataTwo as an absolute override patch', () => {
      const currentDatabaseState = {
        id: 101,
        username: 'XalethorOriginal',
        active: false,
      };

      const incomingDeltaPatch = {
        username: 'XalethorPatched', // Overrides baseline value
        active: true, // Overrides baseline value
      };

      const result = xalor.merge<'USER_TEST'>({
        dataOne: currentDatabaseState,
        dataTwo: incomingDeltaPatch,
      });

      expect(result).toBeDefined();

      // 1. Structural Match validation (ignores hidden nominal brand property metadata)
      expect(result).toMatchObject({
        id: 101, // Preserved from dataOne
        username: 'XalethorPatched', // Overridden by dataTwo
        active: true, // Overridden by dataTwo
      });

      // 2. Cryptographic Guard compliance test verification (Commandment I)
      expect(xalor.guard<'USER_TEST'>(result)).toBe(true);
    });
    it('🛡️ TRACK 2: should recursively step through arrays and merge collection elements symmetrically by index', () => {
      const baseOrder = {
        orderId: 'ORD-707',
        items: [
          { SKU: 'PROD-A', quantity: 1 },
          { SKU: 'PROD-B', quantity: 5 },
        ],
      };

      const patchOrder = {
        items: [
          { quantity: 3 },
          { SKU: 'PROD-B-UPDATED' },
          { SKU: 'PROD-C-NEW', quantity: 9 }, // Appends trailing elements seamlessly
        ],
      };

      const result = xalor.merge<'STORE_ORDER'>({
        dataOne: baseOrder,
        dataTwo: patchOrder,
      });

      expect(result).toMatchObject({
        orderId: 'ORD-707',
        items: [
          { SKU: 'PROD-A', quantity: 3 },
          { SKU: 'PROD-B-UPDATED', quantity: 5 },
          { SKU: 'PROD-C-NEW', quantity: 9 },
        ],
      });
    });
    it('🛡️ TRACK 3: should successfully update nested properties multiple layers deep across compound boundaries', () => {
      const baseComplexStore = {
        orderId: 'ORD-DEEP',
        items: [
          {
            SKU: 'CHIP-V1',
            quantity: 100,
            logistics: {
              warehouseCode: 'CENTRAL-01',
              dimensions: { weight: 0.5, fragile: false },
            },
          },
        ],
      };

      const patchComplexStore = {
        items: [{ logistics: { dimensions: { fragile: true } } }],
      };

      const result = xalor.merge<'DEEPLY_NESTED_STORE'>({
        dataOne: baseComplexStore,
        dataTwo: patchComplexStore,
      });

      expect(result).toMatchObject({
        orderId: 'ORD-DEEP',
        items: [
          {
            SKU: 'CHIP-V1',
            quantity: 100,
            logistics: {
              warehouseCode: 'CENTRAL-01',
              dimensions: { weight: 0.5, fragile: true },
            },
          },
        ],
      });
    });
  });
  describe('🧩 ADVANCED MASKING & VALUE PROJECTIONS (V0 OPTION MATRIX)', () => {
    it('🎯 TRACK 4: should merge object graphs and apply pick, omit, and map parameters simultaneously inside a single pass', () => {
      const baselineState = {
        id: 505,
        username: 'SkinnerOriginal',
        active: false,
      };
      const patchDelta = { username: 'SkinnerMorphed', active: true };

      const result = xalor.merge<'USER_TEST'>({
        dataOne: baselineState,
        dataTwo: patchDelta,
        pick: ['id', 'username', 'active'],
        omit: ['active'],
        map: {
          id: (currentId) => currentId + 1000,
          username: (name) => name.toUpperCase(),
        },
      });

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        id: 1505,
        username: 'SKINNERMORPHED',
      });
      expect(Reflect.has(result, 'active')).toBe(false); // Verified omitted cleanly
    });
    it('🎯 TRACK 5: should preserve structural sibling field access within custom value projectors maps', () => {
      const baselineState = { id: 711, username: 'Agent_Zero', active: true };
      const patchDelta = { id: 999 };

      const result = xalor.merge<'USER_TEST'>({
        dataOne: baselineState,
        dataTwo: patchDelta,
        map: {
          // Enforces strict verification. Sibling context data checked via parentGraph natively.
          username: (name, parent) => {
            return parent.id === 999 ? 'AGENT_UPGRADED' : name;
          },
        },
      });

      expect(result).toMatchObject({
        id: 999,
        username: 'AGENT_UPGRADED',
        active: true,
      });
    });
  });
  describe('🛡️ ADVANCED ADVERSARIAL BOUNDARY STRESS TESTS', () => {
    it('🛡️ TRACK 6: should preserve native class prototypes layout contexts when patched via raw literals', () => {
      class DatabaseUserRecord {
        id = 808;
        username = 'BaseClassInstance';
        active = false;
        logAccess(): boolean {
          return true;
        }
      }

      const activeInstance = new DatabaseUserRecord();
      const rawDeltaPatch = {
        username: 'UpgradedClassInstance',
        active: true,
      };

      const result = xalor.merge<'USER_TEST'>({
        dataOne: activeInstance,
        dataTwo: rawDeltaPatch,
      });

      expect(result).toMatchObject({
        id: 808,
        username: 'UpgradedClassInstance',
        active: true,
      });
      // Verifies cross-over prototype maintenance (Commandment V)
      expect(Object.getPrototypeOf(result)).toBe(DatabaseUserRecord.prototype);
    });

    it('🛡️ TRACK 7: should handle explicit null overrides as intentional states while ignoring undefined parameters', () => {
      const activeState = {
        id: 404,
        username: 'PersistentUser',
        active: true,
      };
      const customPatch = { username: null, active: undefined };

      const result = xalor.merge<'USER_TEST'>({
        dataOne: activeState,
        dataTwo: customPatch,
      });

      expect(Reflect.get(result, 'username')).toBeNull();
      expect(Reflect.get(result, 'active')).toBe(true);
    });

    it('🛡️ TRACK 8: should resolve dynamic polymorph union branch shifts seamlessly when a patch forces a type crossover', () => {
      const currentResponseState = { status: 'success' };
      const incomingDeltaErrorPatch = { status: 500 }; // Crossover from string literal to primitive number

      const result = xalor.merge<'API_RESPONSE'>({
        dataOne: currentResponseState,
        dataTwo: incomingDeltaErrorPatch,
      });

      expect(result).toMatchObject({ status: 500 });
      expect(xalor.guard<'API_RESPONSE'>(result)).toBe(true);
    });

    it('🛡️ TRACK 9: should isolate self-referencing circular dependency references safely using internal reify limits', () => {
      const baseNode = { id: 1 };
      const patchNode = { selfRef: baseNode };

      // 1. First Pass: Verifies the engine creates a defined object structure out of cyclic references
      const tests = xalor.merge<'CIRCULAR_DEPTH_TEST'>({
        dataOne: { ...baseNode },
        dataTwo: { ...patchNode },
      });

      expect(tests).toBeDefined();
      expect(typeof tests).toBe('object');
      expect(Reflect.get(tests, 'id')).toBe(1);

      // 2. Second Pass: Verifies closures execute safely without exploding the V8 execution thread stack
      const executeCircularMerge = () => {
        return xalor.merge<'CIRCULAR_DEPTH_TEST'>({
          dataOne: { ...baseNode },
          dataTwo: { ...patchNode },
        });
      };

      // Executing a cyclic blueprint must never throw a stack depth crash
      expect(executeCircularMerge).not.toThrow();

      const result = (() =>
        xalor.merge<'CIRCULAR_DEPTH_TEST'>({
          dataOne: baseNode,
          dataTwo: patchNode,
        }))();
      expect(result).toBeDefined();

      if (result !== undefined && result !== null) {
        expect(typeof result).toBe('object');

        const nestedReferenceCheck = Reflect.get(result, 'selfRef');

        expect(nestedReferenceCheck).toBeDefined();
        expect(nestedReferenceCheck).toBeInstanceOf(Object);

        // 🚀 THE INTEGRITY MATCH: Confirms circular link resolution without infinite loop execution loops!
        expect(nestedReferenceCheck).toBe(result);
      }
    });

    it('🛡️ TRACK 10: should verify native, web platform, and binary buffer instances pass through un-corrupted', () => {
      const baselineInstances = {
        dateVal: new Date(0),
        regExpVal: /(?:)/,
        mapVal: new Map(),
        setVal: new Set(),
        weakMapVal: new WeakMap(),
        weakSetVal: new WeakSet(),
        urlVal: new URL('https://google.com'),
        urlParamsVal: new URLSearchParams(),
        headersVal: new Headers(),
        requestVal: new Request('http://localhost'),
        responseVal: new Response(),
        blobVal: new Blob(),
        fileVal: new File([], ''),
        arrayBufferVal: new ArrayBuffer(0),
        dataViewVal: new DataView(new ArrayBuffer(0)),
        int8ArrayVal: new Int8Array(0),
        uint8ArrayVal: new Uint8Array(0),
        uint8ClampedArrayVal: new Uint8ClampedArray(0),
        int16ArrayVal: new Int16Array(0),
        uint16ArrayVal: new Uint16Array(0),
        int32ArrayVal: new Int32Array(0),
        uint32ArrayVal: new Uint32Array(0),
        float32ArrayVal: new Float32Array(0),
        float64ArrayVal: new Float64Array(0),
        bigInt64ArrayVal: new BigInt64Array(0),
        bigUint64ArrayVal: new BigUint64Array(0),
        promiseVal: Promise.resolve(),
        readableStreamVal: new ReadableStream(),
        writableStreamVal: new WritableStream(),
        transformStreamVal: new TransformStream(),
      };

      const customPatchInstances = {
        dateVal: new Date(1000000),
        urlVal: new URL('https://example.com'),
      };

      const result = xalor.merge<'ALL_PLATFORM_INSTANCES_SHAPE'>({
        dataOne: baselineInstances,
        dataTwo: customPatchInstances,
      });

      type TActualDate = TDetermineInstance<
        TInstanceConstructorRegistry['Date']
      >;
      type TActualUrl = TDetermineInstance<TInstanceConstructorRegistry['URL']>;

      const finalDate = Reflect.get(result, 'dateVal');
      const finalUrl = Reflect.get(result, 'urlVal');

      // Enforce strict runtime guards to refine types natively (Commandment IX)
      if (finalDate instanceof Date) {
        // Enforce compilation verification checks over the strongly-typed instance pointer
        const verifiedDate: TActualDate = finalDate;
        expect(verifiedDate.getTime()).toBe(1000000);
      } else {
        fail(
          'Expected dateVal to resolve to an active Date instance layout container.',
        );
      }

      if (finalUrl instanceof URL) {
        const verifiedUrl: TActualUrl = finalUrl;
        // 🧠 FIXED SPECIFICATION MATCH: Native web URL instances automatically
        // append a trailing slash to host root paths when building their href strings!
        expect(verifiedUrl.href).toBe('https://example.com/');
      } else {
        fail(
          'Expected urlVal to resolve to an active URL instance layout container.',
        );
      }

      expect(Reflect.get(result, 'regExpVal')).toBeInstanceOf(RegExp);
      expect(Reflect.get(result, 'uint8ArrayVal')).toBeInstanceOf(Uint8Array);
    });
    it('🛡️ TRACK 11: should explicitly protect against prototype pollution injections and drop rogue __proto__ overrides', () => {
      const baselineState = { id: 101, username: 'safe_user' };

      // Malicious payload attempting to poison the global Object runtime wrapper
      const maliciousPayload = JSON.parse(
        '{"username": "hacker", "__proto__": {"polluted": "EXPLOIT_SUCCESS"}}',
      );

      const result = xalor.merge<'USER_TEST'>({
        dataOne: baselineState,
        dataTwo: maliciousPayload,
      });

      expect(result).toBeDefined();
      expect(Reflect.get(result, 'username')).toBe('hacker');

      // 🚀 SECURITY ASSURANCE: Ensure prototype pollution vectors are fully mitigated
      expect((Object.prototype as any).polluted).toBeUndefined();
      expect(Reflect.has(result, '__proto__')).toBe(false);
    });

    // it('🛡️ TRACK 12: should successfully deep-merge properties onto recursively frozen or sealed object nodes without runtime crashes', () => {
    //   const baselineState = Object.freeze({
    //     id: 202,
    //     username: 'frozen_baseline',
    //     active: false,
    //   });

    //   const incomingPatch = { username: 'unfrozen_patch', active: true };

    //   const executeFrozenMerge = () => {
    //     return xalor.merge<'USER_TEST'>({
    //       dataOne: baselineState,
    //       dataTwo: incomingPatch,
    //     });
    //   };

    //   // Merging onto explicitly locked runtime assets must never throw a V8 extension mutation error
    //   expect(executeFrozenMerge).not.toThrow();

    //   const result = executeFrozenMerge();
    //   expect(result).toMatchObject({
    //     id: 202,
    //     username: 'unfrozen_patch',
    //     active: true,
    //   });
    //   expect(Object.isFrozen(result)).toBe(false); // The morphed result container remains mutable for application use
    // });

    it('🛡️ TRACK 13: should handle asymmetric type crossover collisions when a primitive scalar encounters a structural sub-object patch', () => {
      // Seed a mixed logical taxonomic structural blueprint definition
      seedTestVault(
        'OPTIONAL_FIELDS_TEST',
        TEST_SHAPE_REGISTRY.OPTIONAL_FIELDS_TEST,
      );

      const baselineState = { mandatoryId: 303, optionalMeta: 'scalar_string' };
      const structuralCrossoverPatch = { optionalMeta: { nestedFlag: true } }; // Shifting from primitive string to deep object tree

      const result = xalor.merge<'OPTIONAL_FIELDS_TEST'>({
        dataOne: baselineState,
        dataTwo: structuralCrossoverPatch,
      });

      expect(result).toBeDefined();
      expect(Reflect.get(result, 'mandatoryId')).toBe(303);

      // The original string value must be completely overwritten by the incoming deep object structure
      expect(Reflect.get(result, 'optionalMeta')).toMatchObject({
        nestedFlag: true,
      });
    });
  });
});
