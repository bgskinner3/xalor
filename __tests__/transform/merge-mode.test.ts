// // __tests__/runtime/api/transform-xalor/merge-mode.test.ts
import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';
import type { TInstanceConstructorRegistry } from '../../shared/shape-domain';
import { BRAND_SYMBOL } from '../../shared';
// import type { TDetermineInstance } from '../../shared';
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
    USER_TEST_CAMEL: {
      readonly userId: number;
      readonly userName: string;
      readonly isActive: boolean;
      readonly userRoles: readonly string[];
      readonly accountTier: 'free' | 'premium' | 'enterprise';
      readonly userMetadata: {
        readonly loginCount: number;
        readonly ipAddress?: string;
      };
      readonly createdAt: Date;
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
describe('Runtime Generator API', () => {
  beforeAll(() => {
    // Seed your mock blueprint registry definitions flatly straight into RAM memory
    /* prettier-ignore */ seedTestVault('USER_TEST_CAMEL', TEST_SHAPE_REGISTRY.STANDARD_USER_CAMEL);
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
  describe('BASE TRANSFORM XALOR MERGE CORE LAYOUTS', () => {
    it('🛡️ TRACK 1: should successfully evaluate partial contract survival by dropping case-mismatched raw data keys', () => {
      const currentDatabaseState = {
        userId: 101, // Direct match against USER_TEST_CAMEL interface layout
        username: 'xalethor_original', // Case mismatch ('username' vs 'userName')
        isActive: false, // Direct match against USER_TEST_CAMEL interface layout
      };

      const incomingDeltaPatch = {
        username: 'XALETHOR_PATCHED', // Overwrites baseline but still carries case mismatch
        isActive: true, // Direct match against USER_TEST_CAMEL interface layout
      };

      // Execute the unified pipeline pass without any additional context configuration options
      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: incomingDeltaPatch,
      });

      // === RUNTIME DATA ASSERTIONS ===
      // 1. Verify case-aligned fields cleared your contract safety gates and were written to memory
      expect(cleanSession).toHaveProperty('userId');
      expect(cleanSession).toHaveProperty('isActive');
      expect(cleanSession.userId).toBe(101);
      expect(cleanSession.isActive).toBe(true); // Absolute override precedence of dataTwo verified!

      // 2. Check that the mismatched 'username' key was strictly blocked and omitted from allocation passes
      expect(cleanSession).not.toHaveProperty('username');
      expect(cleanSession).not.toHaveProperty('userName');

      // === NOMINAL BRAND SECURITY CHECKS ===
      expect(Reflect.has(cleanSession, BRAND_SYMBOL)).toBe(true);
      expect(cleanSession[BRAND_SYMBOL]).toEqual(['Solid', 'USER_TEST_CAMEL']);
    });

    it('🛡️ TRACK 2: should perfectly preserve and merge the entire object graph when input records completely match the blueprint contract', () => {
      const currentDatabaseState = {
        userId: 202,
        userName: 'xalethor_original_camel',
        isActive: false,
      };

      const incomingDeltaPatch = {
        userName: 'XALETHOR_STABLE_CAMEL', // Overrides original string field signature
        isActive: true, // Overrides original boolean field signature
      };

      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: incomingDeltaPatch,
      });

      // === RUNTIME DATA ASSERTIONS ===
      // All keys match the pre-compiled AOT specification precisely; entire payload passes safely
      expect(cleanSession).toHaveProperty('userId');
      expect(cleanSession).toHaveProperty('userName');
      expect(cleanSession).toHaveProperty('isActive');

      expect(cleanSession.userId).toBe(202);
      expect(cleanSession.userName).toBe('XALETHOR_STABLE_CAMEL');
      expect(cleanSession.isActive).toBe(true);
    });

    it('🛡️ TRACK 3: should handle empty or broken input data blocks gracefully without throwing execution errors', () => {
      // Passing empty structures represents un-hydrated framework states or fallback network streams
      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: {},
        dataTwo: null as any, // Coreguards inside the setup will parse this safely down to an empty record {}
      });

      // === RUNTIME DATA ASSERTIONS ===
      // Object properties index lookup remains completely flat and empty
      expect(Object.keys(cleanSession).length).toBe(0);

      // Nominals are still stamped cleanly to maintain structural continuous tracing metrics
      expect(Reflect.has(cleanSession, BRAND_SYMBOL)).toBe(true);
      expect(cleanSession[BRAND_SYMBOL]).toEqual(['Solid', 'USER_TEST_CAMEL']);
    });
  });
  describe('XALOR MERGE PICK AND OMIT', () => {
    it('🪓 PICK TRACK: should restrict output allocation strictly to fields defined inside the pick whitelist', () => {
      const currentDatabaseState = {
        userId: 505,
        userName: 'xalethor_pick_base',
        isActive: true,
      };

      const incomingDeltaPatch = {
        userName: 'XALETHOR_PICK_PATCHED',
      };

      // Execute the merge payload while explicitly requesting ONLY the userName property
      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: incomingDeltaPatch,

        // Auto-fill works natively here! Whitelists userName exclusively
        pick: ['userName'],
      });

      // === RUNTIME DATA ASSERTIONS ===
      // 1. Check that your cased contract key whitelisted survived the permit gate
      expect(cleanSession).toHaveProperty('userName');
      expect(cleanSession.userName).toBe('XALETHOR_PICK_PATCHED'); // Absolute priority patch verified

      // 2. Ensure non-whitelisted keys (even though they match the contract) are discarded cleanly
      expect(cleanSession).not.toHaveProperty('userId');
      expect(cleanSession).not.toHaveProperty('isActive');

      // === NOMINAL BRAND SECURITY CHECKS ===
      expect(Reflect.has(cleanSession, BRAND_SYMBOL)).toBe(true);
      expect(cleanSession[BRAND_SYMBOL]).toEqual(['Solid', 'USER_TEST_CAMEL']);
    });

    it('🚫 OMIT TRACK: should successfully strip away blacklisted fields from the final allocated object payload', () => {
      const currentDatabaseState = {
        userId: 606,
        userName: 'xalethor_omit_base',
        isActive: false,
      };

      const incomingDeltaPatch = {
        isActive: true,
      };

      // Execute the merge payload while explicitly blacklisting the isActive status property
      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: incomingDeltaPatch,

        // Auto-fill works natively here! Excludes isActive completely
        omit: ['isActive'],
      });

      // === RUNTIME DATA ASSERTIONS ===
      // 1. Ensure the non-blacklisted keys pass through the conveyor line seamlessly
      expect(cleanSession).toHaveProperty('userId');
      expect(cleanSession).toHaveProperty('userName');
      expect(cleanSession.userId).toBe(606);
      expect(cleanSession.userName).toBe('xalethor_omit_base');

      // 2. Verify that the blacklisted key was caught and omitted from allocation passes
      expect(cleanSession).not.toHaveProperty('isActive');
    });

    it('⚔️ CONFLICTING OVERLAP TRACK: should prioritize omit parameters over pick parameters if a structural key is supplied to both blocks', () => {
      const currentDatabaseState = {
        userId: 707,
        userName: 'xalethor_clash_base',
        isActive: true,
      };

      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: {},

        // Intentional edge case: supplying 'userName' to BOTH whitelists and blacklists
        pick: ['userId', 'userName'],
        omit: ['userName'],
      });

      // === RUNTIME DATA ASSERTIONS ===
      // 1. userId satisfies pick and passes omit evaluation safely
      expect(cleanSession).toHaveProperty('userId');
      expect(cleanSession.userId).toBe(707);

      // 2. userName satisfies pick but fails omit blacklist evaluation; it must be dropped
      expect(cleanSession).not.toHaveProperty('userName');
      expect(cleanSession).not.toHaveProperty('isActive'); // Not in pick whitelist, dropped automatically
    });
  });
  describe('XALOR MERGE PRUNE AND FILL', () => {
    it('🧼 DEFAULTS STRATEGY TRACK: should prune out invalid placeholder items and dynamically heal values using true blueprint default layout primitives', () => {
      const currentDatabaseState = {
        userId: 808,
        userName: 'xalethor_healed_base',
        isActive: true,
        userRoles: ['admin'],
      };

      const incomingDeltaPatch = {
        // Intentionally passing corrupt runtime marker flags to trigger pruning
        userName: 'N/A',
        isActive: null,
        userRoles: undefined,
      };

      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: incomingDeltaPatch,

        // Target corrupt network and database strings/nulls for removal
        pruneAndFill: {
          values: [undefined, null, 'N/A'] as const,
          strategy: 'defaults', // Delegates directly to your DEFAULT_SHAPE_MATERIALIZER!
        },
      });

      // === RUNTIME DATA ASSERTIONS ===
      expect(cleanSession.userId).toBe(808); // Untouched field survives normally

      // Check that your advanced materializers accurately restored true primitive defaults
      expect(cleanSession.userName).toBe(''); // 'N/A' pruned -> Healed to string primitive default
      expect(cleanSession.isActive).toBe(false); // null pruned -> Healed to boolean primitive default
      expect(cleanSession.userRoles).toEqual([]); // undefined pruned -> Healed to array layout default []

      // === NOMINAL BRAND SECURITY CHECKS ===
      expect(Reflect.has(cleanSession, BRAND_SYMBOL)).toBe(true);
      expect(cleanSession[BRAND_SYMBOL]).toEqual(['Solid', 'USER_TEST_CAMEL']);
    });

    it('🎲 MOCKS STRATEGY TRACK: should generate typesafe synthetic mock properties when matching a pruned placeholder', () => {
      const currentDatabaseState = {
        userId: 909,
        userName: 'xalethor_mock_base',
        isActive: false,
      };

      const incomingDeltaPatch = {
        userName: 'PRUNE_ME', // Explicit token to trigger mock data generation
      };

      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: incomingDeltaPatch,

        pruneAndFill: {
          values: ['PRUNE_ME'] as const,
          strategy: 'mocks', // Delegates directly to your MOCK_SHAPE_MATERIALIZER random value generator!
        },
      });

      // === RUNTIME DATA ASSERTIONS ===
      expect(cleanSession.userId).toBe(909);
      expect(cleanSession.isActive).toBe(false);

      // Verify that the string field was completely swapped with a random mock generation
      expect(cleanSession.userName).not.toBe('PRUNE_ME');
      expect(cleanSession.userName).not.toBe('xalethor_mock_base');
      expect(typeof cleanSession.userName).toBe('string');
      expect(cleanSession.userName.length).toBeGreaterThan(0); // Proves raw generator successfully synthesized string data
    });

    it('🕳️ COERCE NULLS STRATEGY TRACK: should smoothly enforce clean, unified null states when strategy is set to nulls', () => {
      const currentDatabaseState = {
        userId: 111,
        userName: 'xalethor_null_base',
        isActive: true,
      };

      const incomingDeltaPatch = {
        userName: 'EMPTY_VAL',
        isActive: undefined,
      };

      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: incomingDeltaPatch,

        pruneAndFill: {
          values: ['EMPTY_VAL', undefined] as const,
          strategy: 'nulls', // Coerces all targeted data points straight to explicit null states
        },
      });

      // === RUNTIME DATA ASSERTIONS ===
      expect(cleanSession.userId).toBe(111);

      // Confirm fields are forced to null cleanly without crashing your typesafe architecture
      expect(cleanSession.userName).toBeNull();
      expect(cleanSession.isActive).toBeNull();
    });

    it('🗑️ EXPLICIT DROP STRATEGY TRACK: should drop the key from allocation entirely when prune parameters match and strategy is drop', () => {
      const currentDatabaseState = {
        userId: 222,
        userName: 'xalethor_drop_base',
        isActive: true,
      };

      const incomingDeltaPatch = {
        userName: 'DROP_ME_NOW',
      };

      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: incomingDeltaPatch,

        pruneAndFill: {
          values: ['DROP_ME_NOW'] as const,
          strategy: 'drop', // Drops keys from existence rather than healing or coercing
        },
      });

      // === RUNTIME DATA ASSERTIONS ===
      expect(cleanSession).toHaveProperty('userId');
      expect(cleanSession).toHaveProperty('isActive');

      // Verify the matched pruned key is completely missing from property lookups
      expect(cleanSession).not.toHaveProperty('userName');
    });
  });
  describe('XALOR MERGE MAPPING', () => {
    it('🎨 VALUE MAP TRACK: should successfully intercept surviving contract fields and transform values using custom callbacks', () => {
      const currentDatabaseState = {
        userId: 404,
        userName: 'xalethor_mapping_base',
        isActive: true,
        userRoles: ['admin', 'manager'],
      };

      const incomingDeltaPatch = {
        userName: 'XALETHOR_CONVEYOR_PASS', // absolute overwrite preference
      };

      // Execute the unified pipeline pass with an explicit map dictionary configuration
      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: incomingDeltaPatch,

        // 🪐 VALUE TRANSFORMATION PASS: Auto-fill triggers perfect key and value types here
        map: {
          // Track A: Simple, ultra-clean single parameter modification
          userName: (value) => value.toLowerCase(),

          // Track B: Context-aware lookup reading sideways into the graph!
          userRoles: (value, graph) => {
            // Autocomplete works for both parameters!
            if (graph.isActive === false) {
              return []; // Strip roles if user account is flagged inactive
            }
            return value;
          },
        },
      });

      // === RUNTIME DATA ASSERTIONS ===
      // 1. Ensure contract keys pass safely through your schema gates into the output container
      expect(cleanSession).toHaveProperty('userId');
      expect(cleanSession).toHaveProperty('userName');
      expect(cleanSession).toHaveProperty('isActive');
      expect(cleanSession).toHaveProperty('userRoles');

      // 2. Verify that the custom mapper callback ran and updated the data fields precisely
      expect(cleanSession.userId).toBe(404);
      expect(cleanSession.userName).toBe('xalethor_conveyor_pass'); // Lowercased via map callback!
      expect(cleanSession.isActive).toBe(true);
      expect(cleanSession.userRoles).toEqual(['admin', 'manager']); // Active is true, so roles are preserved intact

      // === NOMINAL BRAND SECURITY CHECKS ===
      expect(Reflect.has(cleanSession, BRAND_SYMBOL)).toBe(true);
      expect(cleanSession[BRAND_SYMBOL]).toEqual(['Solid', 'USER_TEST_CAMEL']);
    });

    it('🔍 SIDEWAYS GRAPH READING TRACK: should accurately read neighboring object values during a sideways evaluation pass', () => {
      const currentDatabaseState = {
        userId: 405,
        userName: 'ACTIVE_USER',
        isActive: false, // ⚠️ Account flagged as INACTIVE in baseline state
        userRoles: ['engineer', 'tester'],
      };

      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: {}, // No updates, baseline properties win deep merging

        map: {
          userRoles: (value, graph) => {
            // Sideways verification reading: intercepts graph.isActive directly from rawMergedResult
            if (graph.isActive === false) {
              return []; // Force wipe roles if account is disabled
            }
            return value;
          },
        },
      });

      // === RUNTIME DATA ASSERTIONS ===
      expect(cleanSession.isActive).toBe(false);

      // Confirm the sideways lookahead successfully evaluated the sibling property condition
      expect(cleanSession.userRoles).toEqual([]); // Roles stripped entirely because isActive was false!
    });

    it('🛡️ DOUBLE-PRUNE SAFEGUARD TRACK: should safely trigger data healing if a custom mapping callback returns a corrupt placeholder', () => {
      const currentDatabaseState = {
        userId: 406,
        userName: 'PRISTINE_DATA_USER',
        isActive: true,
        userRoles: ['guest'],
      };

      const cleanSession = xalor.merge<'USER_TEST_CAMEL'>({
        dataOne: currentDatabaseState,
        dataTwo: {},

        pruneAndFill: {
          values: ['CORRUPT_NULL_MOCK', undefined, null] as const,
          strategy: 'defaults', // Employs DEFAULT_SHAPE_MATERIALIZER
        },

        map: {
          userRoles: (_value) => {
            // ⚠️ BUG SIMULATION: A developer introduces custom logic that accidentally returns
            // a forbidden corrupt value targeted by your prune and fill criteria
            return null as any;
          },
        },
      });

      // === RUNTIME DATA ASSERTIONS ===
      expect(cleanSession.userId).toBe(406);
      expect(cleanSession.userName).toBe('PRISTINE_DATA_USER');

      // Verify that your double-prune safeguard caught the corrupt return value from the callback
      // and successfully forced it down into your native fallback defaults materializer!
      expect(cleanSession.userRoles).toEqual([]); // null caught, healed back safely to default array []!
    });
  });
});
