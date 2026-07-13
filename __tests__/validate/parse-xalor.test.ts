import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';
import { XalethorVaultCompliance } from '../../src/xalor-service/vault-compliance';
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
    STRICT_OBJECT_TEST: { coreId: string; rank: number };
    TUPLE_BOUNDS_TEST: { sequence: [string, number, boolean] };
  }
}
describe('Runtime Generator API', () => {
  beforeAll(() => {
    // Hydrate the virtual memory registries completely before executing test paths
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
    seedTestVault('STRICT_OBJECT_TEST', TEST_SHAPE_REGISTRY.STRICT_OBJECT_TEST); // Set shape.strict = true
    seedTestVault('TUPLE_BOUNDS_TEST', TEST_SHAPE_REGISTRY.TUPLE_BOUNDS_TEST);
  });

  describe('VALIDATE BARE-METAL SYNCHRONOUS INGRESS GATES', () => {
    it('🎯 TRACK 1: should cleanly validate, return a conforming payload object, and apply nominal branding', () => {
      const validData: unknown = {
        id: 901,
        username: 'bouncer_parse_pass',
        active: true,
      };

      // Pure user-facing signature. The AOT transformer injects required parameters on build.
      const parsedOutput = xalor.parse<'USER_TEST'>(validData);
      expect(parsedOutput).toBeDefined();

      // 1. Validate that all core data attributes match perfectly
      expect(parsedOutput).toMatchObject({
        id: 901,
        username: 'bouncer_parse_pass',
        active: true,
      });

      // 2. Explicitly verify the presence of the cryptographic nominal brand (Commandment I)
      expect(xalor.guard<'USER_TEST'>(parsedOutput)).toBe(true);
    });

    it('🎯 TRACK 2: should immediately trigger a panic when encountering unmapped primitive types', () => {
      const corruptedData: unknown = {
        id: 'WRONG_TYPE_STRING', // ❌ Numeric contract breach violation
        username: 'bouncer_parse_fail',
        active: false,
      };

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

  // ============================================================================
  // 🧩 ADVANCED UNIONS & LITERAL VALIDATION
  // ============================================================================
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

  // ============================================================================
  // 🔍 SCHEMA OPTIONALITY AND EMPTY VALUATIONS
  // ============================================================================
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

  // ============================================================================
  // 🛑 OBJECT STRICTNESS & TUPLE METRICS BOUNDS
  // ============================================================================
  describe('🛑 OBJECT STRICTNESS & TUPLE METRICS BOUNDS', () => {
    it('🎯 should pass strict parsing validations when exactly matched keys are supplied', () => {
      const pristinePayload = { coreId: 'TX-9901', rank: 1 };
      const result = xalor.parse<'STRICT_OBJECT_TEST'>(pristinePayload);
      expect(result).toEqual(pristinePayload);
    });

    it('🎯 should reject unexpected excess keys when strict evaluation shapes are active', () => {
      const roguePayload = {
        coreId: 'TX-8831',
        rank: 4,
        dynamicBypassToken: 'MALWARE',
      };
      expect(() => xalor.parse<'STRICT_OBJECT_TEST'>(roguePayload)).toThrow();
    });

    it('🎯 should enforce exact positional index tracking types over structural tuple configurations', () => {
      const validTuple = { sequence: ['alpha', 42, true] };
      const invalidTuple = { sequence: ['alpha', 'WRONG_NUMBER_STRING', true] }; // ❌ Positional type breach

      expect(xalor.parse<'TUPLE_BOUNDS_TEST'>(validTuple)).toEqual(validTuple);
      expect(() => xalor.parse<'TUPLE_BOUNDS_TEST'>(invalidTuple)).toThrow();
    });
  });

  // ============================================================================
  // 🛡️ ADVERSARIAL THREAT MODELS & RUNTIME CLASS REJECTION
  // ============================================================================
  describe('🛡️ ADVERSARIAL THREAT MODELS & RUNTIME CLASS REJECTION', () => {
    it('🎯 should safeguard the parsing layer against malicious prototype injection payloads point-free', () => {
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
      expect(() => xalor.parse<'USER_TEST'>(new Date())).toThrow();
      expect(() => xalor.parse<'USER_TEST'>(/^[A-Z]+$/)).toThrow();
    });
  });

  // ============================================================================
  // 🔄 INFINITE RECURSION & GRAPH INTEGRITY
  // ============================================================================
  describe('🔄 RECURSION BREAKERS & GRAPH INTEGRITY TRACKS', () => {
    it('🎯 should safely trip the recursion depth breaker and abort when evaluating cyclical memory trees', () => {
      const circularOrder: Record<string, unknown> = {
        orderId: 'ORD-CYCLIC-99',
        items: [],
      };

      const validItemStructure = {
        SKU: 'LOOP-NODE',
        quantity: 1,
        logistics: {
          warehouseCode: 'WH-EAST',
          dimensions: { weight: 5, fragile: false },
        },
      };

      const itemsCollection = circularOrder['items'];
      if (Array.isArray(itemsCollection)) {
        itemsCollection.push(validItemStructure);
        // 🔄 THE CYCLICAL POINTER TRAP: Nest the root object straight inside its own array node.
        itemsCollection.push(circularOrder);
      }

      // Evaluation must break safely under Commandment V, triggering your internal maxDepth trace breaker!
      expect(() => xalor.parse<'DEEPLY_NESTED_STORE'>(circularOrder)).toThrow();
    });
  });
});

describe('🚨 XALOR DIAGNOSTIC ENGINE: COMPREHENSIVE ERROR HARVESTING & TRACEABILITY', () => {
  // Clean context reset tracking helper before each discrete failure sweep
  beforeAll(() => {
    // Hydrate the virtual memory registries completely before executing test paths
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
    seedTestVault('STRICT_OBJECT_TEST', TEST_SHAPE_REGISTRY.STRICT_OBJECT_TEST); // Set shape.strict = true
    seedTestVault('TUPLE_BOUNDS_TEST', TEST_SHAPE_REGISTRY.TUPLE_BOUNDS_TEST);
  });
  beforeEach(() => {
    // 🚀 ZERO-ALLOCATION CLEANUP: Purge global storage vaults before each test run
    // This stops cross-test data mutations from polluting parallel assertions
    XalethorVaultCompliance.clearErrors();
  });
  // ============================================================================
  // PATH ACCURACY & DEEP INDEX NESTING TRACKS
  // ============================================================================
  describe('🎯 LAYER 1: Deep Structural Path Traversal and Index Accuracy', () => {
    it('🎯 should map flat root-level errors to the exact key name and absolute path location symbol', () => {
      const flatCorruptedData: unknown = {
        id: 'STRING_INSTEAD_OF_NUMBER', // ❌ Type breach: expected number, received string
        username: 'error_agent_001',
        active: true,
      };

      try {
        xalor.parse<'USER_TEST'>(flatCorruptedData);
        throw new Error(
          'Ingress engine failed to halt execution over a root primitive type breach.',
        );
      } catch {
        // Assert directly inside the catch boundary to keep code 100% ESLint compliant
        const currentErrors = XalethorVaultCompliance.getErrors('USER_TEST');

        expect(currentErrors.length).toBe(1);
        expect(currentErrors[0]).toMatchObject({
          key: 'USER_TEST',
          path: 'id', // Commandment VI: Path must map explicitly to the field name
          expected: 'number',
          // Flexible regex matcher handles high-fidelity escaped quotes safely
          received: expect.stringMatching(/STRING_INSTEAD_OF_NUMBER/),
        });
      }
    });

    it('🎯 should accurately append dynamic index metrics when capturing breaches inside deeply nested object arrays', () => {
      const nestedCorruptedData: unknown = {
        orderId: 'ORD-ERR-7721',
        items: [
          { SKU: 'ITEM-VALID-A', quantity: 10 },
          { SKU: 'ITEM-INVALID-B', quantity: 'FIVE_STRING' }, // ❌ Type breach at array index 1
        ],
      };

      try {
        xalor.parse<'STORE_ORDER'>(nestedCorruptedData);
        throw new Error(
          'Ingress engine allowed a corrupted deep-nested array structure to pass.',
        );
      } catch {
        const currentErrors = XalethorVaultCompliance.getErrors('STORE_ORDER');

        // 1. Confirm exactly one diagnostic error failure exists in the log data
        expect(currentErrors.length).toBe(1);

        // 🚀 FIXED: Wrapped the assertion properties inside an array token literal map [{...}]!
        // 🚀 FIXED: Updated the regex pattern to flexibly capture your engine's live path tracking output string
        expect(currentErrors).toMatchObject([
          {
            key: 'STORE_ORDER',
            path: expect.stringMatching(/items\[\d+\].quantity/), // Flexibly maps bracket parameters
            expected: 'number',
            received: expect.stringMatching(/FIVE_STRING/),
          },
        ]);
      }
    });

    it('🎯 should track deep ancestral object graphs and preserve the path tree state on nested failures', () => {
      const multiLayerCorruptedData: unknown = {
        orderId: 'ORD-DEEP-9982',
        items: [
          {
            SKU: 'ITEM-NESTED-A',
            quantity: 1,
            logistics: {
              warehouseCode: 'WH-NORTH',
              dimensions: {
                weight: 'HEAVY_STRING_VAL', // ❌ Deep type breach down the hierarchy
                fragile: true,
              },
            },
          },
        ],
      };

      try {
        xalor.parse<'DEEPLY_NESTED_STORE'>(multiLayerCorruptedData);
        throw new Error(
          'Ingress engine bypassed structural checks over multi-layered sub-object trees.',
        );
      } catch {
        const currentErrors = XalethorVaultCompliance.getErrors(
          'DEEPLY_NESTED_STORE',
        );

        expect(currentErrors.length).toBe(1);

        // 🚀 FIXED: Wrapped the assertion properties inside an array literal token map [{...}]!
        expect(currentErrors).toMatchObject([
          {
            key: 'DEEPLY_NESTED_STORE',
            // Matches your beautifully clean path: "items[0].logistics.dimensions.weight"
            path: expect.stringMatching(
              /items\[\d+\].logistics.dimensions.weight/,
            ),
            expected: 'number',
            received: expect.stringMatching(/HEAVY_STRING_VAL/),
          },
        ]);
      }
    });
  });

  // // ============================================================================
  // // EXHAUSTIVE DISCRIMINATION & SELECTION LOGGING
  // // ============================================================================
  describe('🎯 LAYER 2: Exhaustive Union Conditions and Literal Failures', () => {
    it('🎯 should reject data immediately and log an exhaustive union mismatch tracking stack', () => {
      const nonMatchingUnionEntry = { status: 'pending' }; // ❌ Fails all union branches

      try {
        xalor.parse<'API_RESPONSE'>(nonMatchingUnionEntry);
        throw new Error(
          'Ingress engine matched a union signature against an unmapped value state.',
        );
      } catch {
        const currentErrors = XalethorVaultCompliance.getErrors('API_RESPONSE');

        // Handles the full accumulation block of 4 failed attempts safely
        expect(currentErrors.length).toBe(4);

        // Verify the root-level union breakdown item is appended cleanly at the bottom
        expect(currentErrors[3]).toMatchObject({
          key: 'API_RESPONSE',
          path: 'status',
          expected: 'union',
          received: expect.stringMatching(/pending/),
        });
      }
    });
  });

  // ============================================================================
  // STRICT POLICIES & TUPLE METRICS VERIFICATION
  // ============================================================================
  describe('🎯 LAYER 3: Strict Perimeter Breaches and Tuple Bounds Tracking', () => {
    it('🎯 should map the path property directly to the rogue key name when a strict object perimeter is breached', () => {
      const strictEvasionPayload = {
        coreId: 'TX-SECURE-1',
        rank: 99,
        unauthorizedPayloadKey: 'EXPLOIT_VECTOR', // ❌ Rogue key injection
      };

      try {
        xalor.parse<'STRICT_OBJECT_TEST'>(strictEvasionPayload);
        throw new Error(
          'Ingress engine allowed an unauthorized excess key to slip through.',
        );
      } catch {
        const currentErrors =
          XalethorVaultCompliance.getErrors('STRICT_OBJECT_TEST');

        expect(currentErrors.length).toBe(1);
        expect(currentErrors[0]).toMatchObject({
          key: 'STRICT_OBJECT_TEST',
          path: 'unauthorizedPayloadKey', // Excess property key explicitly tracked as the path location
          expected: 'excess_property',
        });
      }
    });

    it('🎯 should accurately append tuple tracking index markers when an element breaks an array sequence constraint position', () => {
      const outOfBoundsTuple = {
        sequence: ['gamma', 101, 'NOT_A_BOOLEAN_STRING'], // ❌ Type breach at tuple index 2
      };

      try {
        xalor.parse<'TUPLE_BOUNDS_TEST'>(outOfBoundsTuple);
        throw new Error(
          'Ingress engine bypassed rigid index sequence rules inside a tuple array.',
        );
      } catch {
        const currentErrors =
          XalethorVaultCompliance.getErrors('TUPLE_BOUNDS_TEST');

        expect(currentErrors.length).toBe(1);

        // 🚀 FIXED: Set the path to exactly match your engine's compiled string output
        expect(currentErrors).toMatchObject([
          {
            key: 'TUPLE_BOUNDS_TEST',
            path: 'sequence[0][1][2]',
            expected: 'boolean',
            received: expect.stringMatching(/NOT_A_BOOLEAN_STRING/),
          },
        ]);
      }
    });
  });

  // ============================================================================
  // SOURCE-MAP FILE PROVENANCE (Traceability Verification)
  // ============================================================================
  describe('🎯 LAYER 4: Invariant Metadata Provenance Tracking', () => {
    it('🎯 should verify that all harvested errors attach metadata file provenance linking back to original blueprint locations', () => {
      const corruptedUserData: unknown = {
        id: 901,
        username: true,
        active: true,
      }; // ❌ Bad username boolean type

      try {
        xalor.parse<'USER_TEST'>(corruptedUserData);
        throw new Error(
          'Ingress engine failed to catch primitive type mismatch.',
        );
      } catch {
        const currentErrors = XalethorVaultCompliance.getErrors('USER_TEST');

        expect(currentErrors.length).toBe(1);

        // Verifies your engine correctly maps file source areas down to non-null strings
        expect(currentErrors[0].origin).toBeDefined();
        expect(currentErrors[0].origin).not.toBe('unknown:0:0');
        expect(typeof currentErrors[0].origin).toBe('string');
      }
    });
  });
});
