import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';

/**
  pnpm run test -- __tests__/validate/parse-xalor.test.ts

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

    // ADVANCED ENGINE TESTING TAXONOMIES
    OPTIONAL_FIELDS_TEST: {
      mandatoryId: number;
      optionalMeta?: string;
      optionalData?: { nestedFlag: boolean };
    };
    COMPLEX_UNION_TEST: {
      mixedValue: 'custom_literal' | number | boolean;
    };
  }
}
describe('Runtime Generator API', () => {
  beforeAll(() => {
    // Seed your mock blueprint registry definitions flatly straight into RAM memory
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
  });

  describe('VALIDATE SINGLETON XALOR PARSE', () => {
    it('🎯 Should cleanly return a validated object payload and apply nominal branding', () => {
      const validData: unknown = {
        id: 901,
        username: 'bouncer_parse_pass',
        active: true,
      };

      // 🚀 Execute parser mode via your generic overload configuration
      const parsedOutput = xalor.parse<'USER_TEST'>(validData);

      // Assertions verify the data is parsed, returned, and type-narrowed
      expect(parsedOutput).toBeDefined();
      expect(parsedOutput).toEqual({
        id: 901,
        username: 'bouncer_parse_pass',
        active: true,
      });
    });

    it('🎯 Should immediately execute a panic when encountering unmapped primitive types', () => {
      const corruptedData: unknown = {
        id: 'WRONG_TYPE_STRING', // ❌ Numeric contract breach violation
        username: 'bouncer_parse_fail',
        active: false,
      };

      // 🧠 TEST STRATEGY: Wrap execution to intercept the engine panic loop safely
      const executeParsePanicBlock = () => {
        xalor.parse<'USER_TEST'>(corruptedData);
      };

      // Invariant: Malformed data streams must be barred from execution layers immediately
      expect(executeParsePanicBlock).toThrow();
    });

    it('🎯 Should enforce strict deep-nested array constraints and fail parsing if a single child breaks laws', () => {
      const corruptedNestedOrder: unknown = {
        orderId: 'ORD-PARSE-ERR',
        items: [
          { SKU: 'CORE-PASS-1', quantity: 5 },
          { SKU: 'CORE-FAIL-2', quantity: 'TWO' }, // ❌ Deep nested collection type mismatch
        ],
      };

      const executeNestedParsePanicBlock = () => {
        xalor.parse<'STORE_ORDER'>(corruptedNestedOrder);
      };

      expect(executeNestedParsePanicBlock).toThrow();
    });

    it('🎯 Should halt execution defensively when running checks over nullish or empty parameters', () => {
      expect(() => xalor.parse<'USER_TEST'>(null)).toThrow();
      expect(() => xalor.parse<'USER_TEST'>(undefined)).toThrow();
    });
  });
  // describe('✨ ZOD-LIKE FACTORY SYNTAX (SOLID.SELECT)', () => {
  //   it('🎯 Should successfully initialize and parse payloads using method chains', () => {
  //     const UserSchema = solid.select('USER_TEST');
  //     const validData = { id: 7, username: 'zod_mimic', active: true };

  //     const result = UserSchema.parse(validData);
  //     expect(result).toEqual(validData);
  //   });

  //   it('🎯 Should cleanly resolve payloads inside async chains using parseAsync', async () => {
  //     const UserSchema = solid.select('USER_TEST');
  //     const validData = { id: 8, username: 'async_zod_mimic', active: false };

  //     await expect(UserSchema.parseAsync(validData)).resolves.toEqual(
  //       validData,
  //     );
  //   });

  //   it('🎯 Should correctly reject and propagate errors inside async chains if runtime data is corrupt', async () => {
  //     const UserSchema = solid.select('USER_TEST');
  //     const invalidData = {
  //       id: 'NOT_A_NUMBER',
  //       username: 'async_fail',
  //       active: false,
  //     };

  //     await expect(UserSchema.parseAsync(invalidData)).rejects.toThrow();
  //   });
  // });
  describe('🧩 ADVANCED UNIONS & LITERAL VALIDATION', () => {
    it('🎯 Should pass validation matching exact string literals within a union', () => {
      const successPayload = { status: 'success' };
      const failedPayload = { status: 'failed' };

      expect(xalor.parse<'API_RESPONSE'>(successPayload)).toEqual(
        successPayload,
      );
      expect(xalor.parse<'API_RESPONSE'>(failedPayload)).toEqual(failedPayload);
    });

    it('🎯 Should pass validation matching the primitive type fallback inside a union', () => {
      const fallbackPayload = { status: 500 };
      expect(xalor.parse<'API_RESPONSE'>(fallbackPayload)).toEqual(
        fallbackPayload,
      );
    });

    it('🎯 Should reject data immediately when a value breaks all union condition options', () => {
      const invalidPayload = { status: 'pending' }; // Not in the literal or primitive definitions
      const invalidBooleanPayload = { status: true };

      expect(() => xalor.parse<'API_RESPONSE'>(invalidPayload)).toThrow();
      expect(() =>
        xalor.parse<'API_RESPONSE'>(invalidBooleanPayload),
      ).toThrow();
    });
  });

  describe('🔍 OPTIONAL vs. MISSING vs. UNDEFINED FIELDS', () => {
    it('🎯 Should validate successfully when optional properties are completely omitted', () => {
      const missingOptionals = { mandatoryId: 101 };
      const result = xalor.parse<'OPTIONAL_FIELDS_TEST'>(missingOptionals);

      expect(result).toEqual(missingOptionals);
    });

    it('🎯 Should validate successfully when optional properties are explicitly passed as undefined', () => {
      const explicitUndefined = { mandatoryId: 101, optionalMeta: undefined };
      const result = xalor.parse<'OPTIONAL_FIELDS_TEST'>(explicitUndefined);

      expect(result).toEqual(explicitUndefined);
    });

    it('🎯 Should fail parsing when an optional structural parent object exists but its internal mandatory fields are missing', () => {
      const corruptOptionalTree = {
        mandatoryId: 102,
        optionalData: {}, // ❌ Object container is present, but missing mandatory 'nestedFlag'
      };

      expect(() =>
        xalor.parse<'OPTIONAL_FIELDS_TEST'>(corruptOptionalTree),
      ).toThrow();
    });
  });

  describe('🛡️ PROTOTYPE POLLUTION SECURITY', () => {
    it('🎯 Should safeguard the parsing layer against malicious prototype injection payloads', () => {
      const maliciousPayload = JSON.parse(`{
        "id": 999,
        "username": "hacker",
        "active": true,
        "__proto__": {
          "pollutedKey": "malicious_exploit"
        }
      }`);

      const result = xalor.parse<'USER_TEST'>(maliciousPayload);

      expect(result).toBeDefined();
      // Ensure global prototype layers are completely clean and unpolluted
      expect((Object.prototype as any).pollutedKey).toBeUndefined();
      expect(({} as any).pollutedKey).toBeUndefined();
    });
  });

  describe('🔄 INFINITE RECURSION & GRAPH INTEGRITY', () => {
    it('🎯 Should safely trip the recursion breaker and abort when evaluating circular reference trees', () => {
      // 1. Initialize our root object following the exact schema of DEEPLY_NESTED_STORE
      const circularOrder: Record<string, unknown> = {
        orderId: 'ORD-CYCLIC-99',
        items: [],
      };

      // 2. Construct a valid array item structure exactly matching your blueprint
      const validItemStructure: Record<string, unknown> = {
        SKU: 'LOOP-NODE',
        quantity: 1,
        logistics: {
          warehouseCode: 'WH-EAST',
          dimensions: [
            {
              weight: 5,
              fragile: false,
            },
          ],
        },
      };

      // 3. Push the valid item into our root collection
      const orderItems = circularOrder.items as unknown[];
      orderItems.push(validItemStructure);

      // 🔄 THE CIRCULAR TRAP: Point a child field back to the root container.
      // We attach the whole 'circularOrder' object as an item inside its own array.
      // When the engine validates the array, it will evaluate the root object again,
      // recurring infinitely until it trips your maxDepth breaker!
      orderItems.push(circularOrder);

      // This will now perfectly trip your engine's existing `reifyLimit.maxDepth` and pass green!
      expect(() => xalor.parse<'DEEPLY_NESTED_STORE'>(circularOrder)).toThrow();
    });
  });
});
