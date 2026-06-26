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
    seedTestVault(
      'ALL_PLATFORM_INSTANCES_SHAPE',
      TEST_SHAPE_REGISTRY.ALL_PLATFORM_INSTANCES_SHAPE,
    );
  });
  describe('VALIDATE BARE-METAL SYNCHRONOUS INGRESS GATES', () => {
    it('🎯 TRACK 1: should cleanly validate, return a conforming payload object, and apply nominal branding', () => {
      const validData: unknown = {
        id: 901,
        username: 'bouncer_parse_pass',
        active: true,
      };

      // Executes your strict compilation-ready signature
      const parsedOutput = xalor.parse<'USER_TEST'>(validData);

      expect(parsedOutput).toBeDefined();

      // 1. Validate that all core data attributes match perfectly
      expect(parsedOutput).toMatchObject({
        id: 901,
        username: 'bouncer_parse_pass',
        active: true,
      });

      // 2. Explicitly verify the presence of the cryptographic nominal brand (Commandment I)
      // This proves your runtime security layer is physically stamping the object!
      expect(xalor.guard<'USER_TEST'>(parsedOutput)).toBe(true);
    });

    it('🎯 TRACK 2: should immediately trigger a panic when encountering unmapped primitive types', () => {
      const corruptedData: unknown = {
        id: 'WRONG_TYPE_STRING', // ❌ Numeric contract breach violation
        username: 'bouncer_parse_fail',
        active: false,
      };

      // Wrap execution to inspect the fail-fast circuit-breaker safely
      const executeParsePanicBlock = () => {
        xalor.parse<'USER_TEST'>(corruptedData);
      };

      expect(executeParsePanicBlock).toThrow();
    });

    it('🎯 TRACK 3: should enforce strict deep-nested array constraints and fail parsing if a single child breaks laws', () => {
      const corruptedNestedOrder: unknown = {
        orderId: 'ORD-PARSE-ERR',
        items: [
          { SKU: 'CORE-PASS-1', quantity: 5 },
          { SKU: 'CORE-FAIL-2', quantity: 'TWO' }, // ❌ Deep nested primitive type mismatch
        ],
      };

      const executeNestedParsePanicBlock = () => {
        xalor.parse<'STORE_ORDER'>(corruptedNestedOrder);
      };

      expect(executeNestedParsePanicBlock).toThrow();
    });

    it('🎯 TRACK 4: should halt execution defensively when running checks over nullish or empty parameters', () => {
      expect(() => xalor.parse<'USER_TEST'>(null)).toThrow();
      expect(() => xalor.parse<'USER_TEST'>(undefined)).toThrow();
    });
  });

  // ========================================================================
  // ADVANCED UNIONS & LITERAL VALIDATION
  // ========================================================================
  describe('🧩 UNIONS & LITERAL SELECTION TRACKING', () => {
    it('🎯 should pass validation matching exact string literals within a union', () => {
      const successPayload = { status: 'success' };
      const failedPayload = { status: 'failed' };

      expect(xalor.parse<'API_RESPONSE'>(successPayload)).toEqual(
        successPayload,
      );
      expect(xalor.parse<'API_RESPONSE'>(failedPayload)).toEqual(failedPayload);
    });

    it('🎯 should pass validation matching the primitive type fallback inside a union', () => {
      const fallbackPayload = { status: 500 };
      expect(xalor.parse<'API_RESPONSE'>(fallbackPayload)).toEqual(
        fallbackPayload,
      );
    });

    it('🎯 should reject data immediately when a value breaks all union condition options', () => {
      const invalidPayload = { status: 'pending' };
      const invalidBooleanPayload = { status: true };

      expect(() => xalor.parse<'API_RESPONSE'>(invalidPayload)).toThrow();
      expect(() =>
        xalor.parse<'API_RESPONSE'>(invalidBooleanPayload),
      ).toThrow();
    });
  });

  // ========================================================================
  // OPTIONAL vs. MISSING vs. UNDEFINED FIELDS
  // ========================================================================
  describe('🔍 SCHEMA OPTIONALITY AND EMPTY VALUATIONS', () => {
    it('🎯 should validate successfully when optional properties are completely omitted', () => {
      const missingOptionals = { mandatoryId: 101 };
      const result = xalor.parse<'OPTIONAL_FIELDS_TEST'>(missingOptionals);
      expect(result).toEqual(missingOptionals);
    });

    it('🎯 should validate successfully when optional properties are explicitly passed as undefined', () => {
      const explicitUndefined = { mandatoryId: 101, optionalMeta: undefined };
      const result = xalor.parse<'OPTIONAL_FIELDS_TEST'>(explicitUndefined);
      expect(result).toEqual(explicitUndefined);
    });

    it('🎯 should fail parsing when an optional structural parent object exists but its internal mandatory fields are missing', () => {
      const corruptOptionalTree = {
        mandatoryId: 102,
        optionalData: {}, // ❌ Container is present, but missing nested mandatory 'nestedFlag'
      };

      expect(() =>
        xalor.parse<'OPTIONAL_FIELDS_TEST'>(corruptOptionalTree),
      ).toThrow();
    });
  });

  // ========================================================================
  // ADVANCED ADVERSARIAL EDGE CASES (Prototype & Class Rejection)
  // ========================================================================
  describe('🛡️ ADVERSARIAL THREAT MODELS & RUNTIME CLASS REJECTION', () => {
    it('🎯 should safeguard the parsing layer against malicious prototype injection payloads point-free', () => {
      // Constructs a payload attempting prototype poisoning
      const maliciousPayload = JSON.parse(
        `{ "id": 999, "username": "hacker", "active": true, "__proto__": { "pollutedKey": "malicious_exploit" } }`,
      );

      const result = xalor.parse<'USER_TEST'>(maliciousPayload);
      expect(result).toBeDefined();

      // Satisfies COMMANDMENT IX: Zero type escape hatch assertions ('as any') used to check global states
      expect(Reflect.get(Object.prototype, 'pollutedKey')).toBeUndefined();
      expect(Reflect.get({}, 'pollutedKey')).toBeUndefined();
    });

    it('🎯 should reject raw platform instances when an object literal contract layout is expected', () => {
      // Date and RegExp pass basic standard 'typeof payload === "object"' checks, but violate structural criteria
      expect(() => xalor.parse<'USER_TEST'>(new Date())).toThrow();
      expect(() => xalor.parse<'USER_TEST'>(/^[A-Z]+$/)).toThrow();
    });
  });

  // ========================================================================
  // INFINITE RECURSION & GRAPH INTEGRITY
  // ========================================================================
  describe('🔄 RECURSION BREAKERS & GRAPH INTEGRITY TRACKS', () => {
    it('🎯 should safely trip the recursion depth breaker and abort when evaluating cyclical memory trees', () => {
      // 1. Initialize our cyclic object layer to challenge the deep validation traversal
      const circularOrder: Record<string, unknown> = {
        orderId: 'ORD-CYCLIC-99',
        items: [],
      };

      const validItemStructure = {
        SKU: 'LOOP-NODE',
        quantity: 1,
        logistics: {
          warehouseCode: 'WH-EAST',
          dimensions: {
            weight: 5,
            fragile: false,
          },
        },
      };

      // 2. Safely populate our items reference layout matrix
      const itemsCollection = circularOrder['items'];
      if (Array.isArray(itemsCollection)) {
        itemsCollection.push(validItemStructure);

        // 🔄 THE CYCLICAL POINTER TRAP: Nest the root object straight inside its own array node.
        // This simulates a deep recursive payload structure designed to force heap stack overflows.
        itemsCollection.push(circularOrder);
      }

      // 3. Evaluation must break safely under Commandment V, triggering your internal maxDepth trace breaker!
      expect(() => xalor.parse<'DEEPLY_NESTED_STORE'>(circularOrder)).toThrow();
    });
  });
});
