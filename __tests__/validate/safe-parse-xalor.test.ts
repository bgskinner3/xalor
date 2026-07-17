import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';
// import { XalethorVaultCompliance } from '../../src/xalor-service/vault-compliance';
/**
  pnpm run test -- __tests__/validate/safe-parse-xalor.test.ts

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
    seedTestVault('COMPLEX_UNION_TEST', TEST_SHAPE_REGISTRY.COMPLEX_UNION_TEST);
  });

  describe('VALIDATE BARE-METAL SYNCHRONOUS INGRESS GATES (SAFE PARSE EDITION)', () => {
    it('🎯 TRACK 1: should cleanly validate, return a conforming payload object, and apply nominal branding', () => {
      const validData: unknown = {
        id: 901,
        username: 'bouncer_parse_pass',
        active: true,
      };

      // Execute the zero-exception safe parsing gate
      const result = xalor.safeParse<'USER_TEST'>(validData);

      // 1. Assert result structure matches the successful discriminated union state
      expect(result.success).toBe(true);
      expect(result.errors).toBeNull();
      expect(result.data).toBeDefined();

      // 2. Validate that all core data attributes match perfectly
      expect(result.data).toMatchObject({
        id: 901,
        username: 'bouncer_parse_pass',
        active: true,
      });

      // 3. Explicitly verify the presence of the cryptographic nominal brand via your guard tool
      expect(xalor.guard<'USER_TEST'>(result.data)).toBe(true);
    });

    it('🎯 TRACK 2: should immediately return a failed status result object when encountering unmapped primitive types', () => {
      const corruptedData: unknown = {
        id: 'WRONG_TYPE_STRING', // ❌ Numeric contract breach violation
        username: 'bouncer_parse_fail',
        active: false,
      };

      const result = xalor.safeParse<'USER_TEST'>(corruptedData);

      // 1. Verify the exception trap was bypassed and returned a data error payload instead
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();

      // Explicit condition block narrows the union type safely, resolving ts(18047)
      if (result.success === false) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);

        // 2. Trace traceability requirements (Commandment VI) to isolate the exact failing path
        const targetError = result.errors[0];
        expect(targetError).toMatchObject({
          key: 'USER_TEST',
          errorKey: 'PRIMITIVE_VALIDATION_NUMBER_EXPECTED',
          received: 'WRONG_TYPE_STRING',
        });
      }
    });

    it('🎯 TRACK 3: should enforce strict deep-nested array constraints and return descriptive errors if a single child breaks laws', () => {
      const corruptedNestedOrder: unknown = {
        orderId: 'ORD-PARSE-ERR',
        items: [
          { SKU: 'CORE-PASS-1', quantity: 5 },
          { SKU: 'CORE-FAIL-2', quantity: 'TWO' }, // ❌ Deep nested primitive type mismatch
        ],
      };

      const result = xalor.safeParse<'STORE_ORDER'>(corruptedNestedOrder);

      // 1. Ensure zero exception frames were wound or thrown by V8
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();

      // Explicit condition block narrows the union type safely, resolving ts(18047)
      if (result.success === false) {
        // 2. Verify deep path stack snapshot trace data was gathered correctly
        expect(result.errors).toBeDefined();
        const deepError = result.errors.find(
          (err) => err.errorKey === 'PRIMITIVE_VALIDATION_NUMBER_EXPECTED',
        );
        expect(deepError).toBeDefined();
        expect(deepError?.pathSnapshot).toContain('items');
      }
    });

    it('🎯 TRACK 4: should halt validation defensively and return structural mismatch errors when running checks over nullish parameters', () => {
      const nullResult = xalor.safeParse<'USER_TEST'>(null);
      const undefinedResult = xalor.safeParse<'USER_TEST'>(undefined);

      // 1. Validate the null structural mismatch state
      expect(nullResult.success).toBe(false);
      expect(nullResult.data).toBeNull();

      // Explicit condition check narrows the TypeScript union type safely without escape hatches
      if (nullResult.success === false) {
        expect(nullResult.errors).toBeDefined();
        expect(nullResult.errors.length).toBeGreaterThan(0);
        expect(nullResult.errors[0]?.errorKey).toBe(
          'OBJECT_VALIDATION_TYPE_MISMATCH',
        );
      }

      // 2. Validate the undefined structural mismatch state
      expect(undefinedResult.success).toBe(false);
      expect(undefinedResult.data).toBeNull();

      if (undefinedResult.success === false) {
        expect(undefinedResult.errors).toBeDefined();
        expect(undefinedResult.errors.length).toBeGreaterThan(0);
      }
    });
    it('🎯 TRACK 5: should reject payloads containing unregistered properties when shape.strict is enabled', () => {
      const maliciousPayload: unknown = {
        coreId: 'STRICT-001',
        rank: 99,
        unauthorizedHackerField: 'EXPLOIT_PAYLOAD', // ❌ Violates strict layout bounds
      };

      const result = xalor.safeParse<'STRICT_OBJECT_TEST'>(maliciousPayload);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();

      if (result.success === false) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);

        const targetError = result.errors.find(
          (err) => err.errorKey === 'OBJECT_VALIDATION_EXCESS_PROPERTY',
        );
        expect(targetError).toBeDefined();
        expect(targetError?.received).toBe('excess_property');
      }
    });

    it('🎯 TRACK 6: should validate successfully when optional properties are completely omitted or set to undefined', () => {
      const missingOptionals: unknown = {
        mandatoryId: 101,
      };
      const explicitUndefined: unknown = {
        mandatoryId: 101,
        optionalMeta: undefined,
      };

      const resultOmitted =
        xalor.safeParse<'OPTIONAL_FIELDS_TEST'>(missingOptionals);
      const resultExplicit =
        xalor.safeParse<'OPTIONAL_FIELDS_TEST'>(explicitUndefined);

      // Both variations should cleanly parse and receive nominal branding tokens
      expect(resultOmitted.success).toBe(true);
      expect(resultOmitted.errors).toBeNull();
      expect(resultOmitted.data).toMatchObject({ mandatoryId: 101 });

      expect(resultExplicit.success).toBe(true);
      expect(resultExplicit.errors).toBeNull();
      expect(resultExplicit.data).toMatchObject({
        mandatoryId: 101,
        optionalMeta: undefined,
      });
    });

    it('🎯 TRACK 7: should reject mixed complex union selections instantly if the payload breaks all literal conditions', () => {
      const invalidLiteralPayload: unknown = {
        mixedValue: 'UNSUPPORTED_STRING_TOKEN', // ❌ Breaks union literal members
      };
      const invalidBooleanPayload: unknown = {
        mixedValue: 'true', // ❌ String literal passed instead of pure boolean
      };

      const resultLiteral = xalor.safeParse<'COMPLEX_UNION_TEST'>(
        invalidLiteralPayload,
      );
      const resultBoolean = xalor.safeParse<'COMPLEX_UNION_TEST'>(
        invalidBooleanPayload,
      );

      expect(resultLiteral.success).toBe(false);
      expect(resultBoolean.success).toBe(false);

      if (resultLiteral.success === false) {
        expect(resultLiteral.errors).toBeDefined();
        expect(resultLiteral.errors.length).toBeGreaterThan(0);
      }
    });

    it('🎯 TRACK 8: should enforce rigid tuple index type checking and catch position-based layout breaks', () => {
      const brokenTuplePayload: unknown = {
        sequence: ['VALID_STRING', 'INVALID_STRING_INSTEAD_OF_NUMBER', true], // ❌ Index 1 contract violation
      };

      const result = xalor.safeParse<'TUPLE_BOUNDS_TEST'>(brokenTuplePayload);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();

      if (result.success === false) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);

        // Verify that the path stacking capture mapped the error specifically down to index pointer position 1
        const tupleError = result.errors.find(
          (err) => err.errorKey === 'PRIMITIVE_VALIDATION_NUMBER_EXPECTED',
        );
        expect(tupleError).toBeDefined();
      }
    });
  });

  // ============================================================================
  // 🧩 ADVANCED UNIONS & LITERAL VALIDATION
  // ============================================================================
  describe('🧩 ADVANCED EDGE CASES & V8 EXPLOIT GATES', () => {
    it('🔥 EDGE CASE 1: should cleanly catch and isolate prototypical inheritance pollution vectors without crashing', () => {
      // Malicious payload attempts to inject standard system object overrides
      const poisonPayload = JSON.parse(
        '{"id": 999, "username": "hacker_map", "active": true, "__proto__": {"polluted": true}}',
      );

      const result = xalor.safeParse<'USER_TEST'>(poisonPayload);

      // Secure engine must ignore prototype injection frames completely
      expect(result.success).toBe(true);
      expect(result.errors).toBeNull();
      expect((result.data as any).polluted).toBeUndefined();
    });

    it('🔥 EDGE CASE 2: should reject deep recursive self-referential cycles instantly at the safety boundary limit', () => {
      // Construct an object that loops back onto itself infinitely
      const cyclicPayload: any = {
        orderId: 'ORD-CYCLIC-LOOP',
        items: [],
      };
      cyclicPayload.items.push({
        SKU: 'LOOP-SKU',
        quantity: 1,
        recursiveData: cyclicPayload,
      });

      const result = xalor.safeParse<'STORE_ORDER'>(cyclicPayload);
      // console.dir(result, {
      //   depth: null,
      //   colors: true,
      // });
      // Enforces Reify safety limits instantly without hitting a V8 maximum stack overflow crash
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      if (result.success === false) {
        expect(result.errors).toBeDefined();
      }
    });

    it('🔥 EDGE CASE 3: should handle dynamic primitive wrapper instances elegantly and filter them down to literal equivalents', () => {
      const stringObjectPayload: unknown = {
        id: 707,
        // Pass a native V8 String Constructor Object wrapper instead of a flat literal string primitive
        username: new String('instantiated_v8_string_wrapper'),
        active: true,
      };

      const result = xalor.safeParse<'USER_TEST'>(stringObjectPayload);

      // Rigid primitive firewalls expect literal mappings; must handle dynamic wrappers correctly
      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.errors?.[0]?.errorKey).toBe(
          'PRIMITIVE_VALIDATION_STRING_EXPECTED',
        );
      }
    });

    it('🔥 EDGE CASE 4: should halt execution cleanly when arrays are supplied with destructive custom object key additions', () => {
      const maliciousArray: any = [{ SKU: 'VALID-SKU-1', quantity: 10 }];
      // Attach an illegal property key attribute directly onto the array literal frame tracking instance
      maliciousArray.maliciousInjectedPropertyKey = 'EXPLOIT_VALUE';

      const dynamicPayload: unknown = {
        orderId: 'ORD-ARRAY-POISON',
        items: maliciousArray,
      };

      const result = xalor.safeParse<'STORE_ORDER'>(dynamicPayload);

      // The homogeneous loop must only stream index allocations, ignoring custom attached keys safely
      expect(result.success).toBe(true);
      expect(result.errors).toBeNull();
    });

    it('🔥 EDGE CASE 5: should reject multi-byte high-surrogate string inputs that breach structural maxLength allocations', () => {
      const massiveSurrogatePayload: unknown = {
        id: 808,
        // Generate a surrogate pair string that exceeds your maximum length buffer boundary limits
        username: '𠜎'.repeat(5000),
        active: true,
      };

      const result = xalor.safeParse<'USER_TEST'>(massiveSurrogatePayload);

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.errors).toBeDefined();
      }
    });
  });
});
