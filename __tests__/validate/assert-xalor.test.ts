import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';

/**
 pnpm run test -- __tests__/validate/assert-xalor.test.ts

 */
declare global {
  interface ISolidRegistry {
    // VALIDATE TEST DEFINITIONS
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
  }
}
describe('Runtime Generator API', () => {
  beforeAll(() => {
    // Seed your mock blueprint registry definitions flatly straight into RAM memory
    seedTestVault('USER_TEST', TEST_SHAPE_REGISTRY.STANDARD_USER);
    seedTestVault('API_RESPONSE', TEST_SHAPE_REGISTRY.UNION_RESPONSE);
    seedTestVault('STORE_ORDER', TEST_SHAPE_REGISTRY.COMPLEX_ORDER);
  });

  // ========================================================================
  // SINGLETON FUNCTIONAL METHOD TRACKS
  // ========================================================================
  describe('VALIDATE SINGLETON XALOR ASSERT', () => {
    it('🎯 TRACK 1: should allow execution to proceed silently when passing a flawless payload skeleton', () => {
      const validPayload: unknown = {
        id: 701,
        username: 'assert_conformance_pass',
        active: true,
      };

      const testExecutionBlock = () => {
        xalor.assert<'USER_TEST'>(validPayload);
      };

      expect(testExecutionBlock).not.toThrow();
    });

    it('🎯 TRACK 2: should throw a highly readable structural panic when encountering type mismatches', () => {
      const invalidPayload: unknown = {
        id: 702,
        username: 'assert_conformance_fail',
        active: 'NOT_A_BOOLEAN', // ❌ String type mismatch violation
      };

      const testExecutionBlock = () => {
        xalor.assert<'USER_TEST'>(invalidPayload);
      };

      expect(testExecutionBlock).toThrow();
    });

    it('🎯 TRACK 3: should throw a diagnostic exception if mandatory nested array matrix items break laws', () => {
      const invalidOrderPayload: unknown = {
        orderId: 'ORD-ERR-404',
        items: [
          { SKU: 'VALID-SKU-1', quantity: 10 },
          { SKU: 99123, quantity: 2 }, // ❌ Deep nested primitive type mismatch (SKU must be string)
        ],
      };

      const testExecutionBlock = () => {
        xalor.assert<'STORE_ORDER'>(invalidOrderPayload);
      };

      expect(testExecutionBlock).toThrow();
    });

    it('🎯 TRACK 4: should halt execution defensively when running checks over nullish or empty parameters', () => {
      expect(() => xalor.assert<'USER_TEST'>(null)).toThrow();
      expect(() => xalor.assert<'USER_TEST'>(undefined)).toThrow();
      expect(() =>
        xalor.assert<'USER_TEST'>('SCALAR_RAW_STRING_BLOCKED'),
      ).toThrow();
    });

    it('🎯 TRACK 5: should leverage native IDE control-flow narrowing downstream after a successful pass', () => {
      const mysteriousPayload: unknown = {
        id: 881,
        username: 'ide_narrow_verification',
        active: true,
      };

      xalor.assert<'USER_TEST'>(mysteriousPayload);

      // Conforming properties map directly onto type attributes point-free
      const verifiedData = mysteriousPayload as {
        id: number;
        username: string;
      };
      expect(typeof verifiedData.id).toBe('number');
      expect(verifiedData.username).toBe('ide_narrow_verification');
    });

    // ========================================================================
    // ADVANCED ADVERSARIAL EDGE CASES (Commandment V & IX Alignment)
    // ========================================================================
    it('🛡️ EDGE CASE 1: should defensively intercept prototype poisoning threat models point-free', () => {
      // Poison the global Object prototype with conflicting keys
      const globalProto = Object.prototype as any;
      globalProto.id = 'MALICIOUS_GLOBAL_TYPE_INJECTION';
      globalProto.strayHackerAttribute = 'Exploit_Vector';

      const literalPayload: unknown = {
        id: 701,
        username: 'assert_conformance_pass',
        active: true,
      };

      try {
        // Assertion must pass silently by validating own enumerable properties exclusively
        expect(() => xalor.assert<'USER_TEST'>(literalPayload)).not.toThrow();
      } finally {
        // Deep reset global state immediately
        delete globalProto.id;
        delete globalProto.strayHackerAttribute;
      }
    });

    it('🛡️ EDGE CASE 2: should handle mathematical falsy limits and empty strings accurately without panicking', () => {
      const borderlineFalsyPayload: unknown = {
        id: 0,
        username: '',
        active: false,
      };

      expect(() =>
        xalor.assert<'USER_TEST'>(borderlineFalsyPayload),
      ).not.toThrow();
    });

    it('🛡️ EDGE CASE 3: should flag missing array child matrix nested mutations as immediate failures', () => {
      const fracturedPayload: unknown = {
        orderId: 'ORD-OMIT-99',
        items: [
          { SKU: 'VALID-SKU-12' }, // ❌ Missing mandatory property: 'quantity'
        ],
      };

      expect(() => xalor.assert<'STORE_ORDER'>(fracturedPayload)).toThrow();
    });

    it('🛡️ EDGE CASE 4: should reject structural non-literal native objects like Date or RegExp', () => {
      expect(() => xalor.assert<'USER_TEST'>(new Date())).toThrow();
      expect(() => xalor.assert<'USER_TEST'>(/^[A-Z]+$/)).toThrow();
    });
  });

  // ========================================================================
  // CLASS-BASED INSTANCE VALIDATION TRACKS
  // ========================================================================
  describe('VALIDATE CLASS BASED ASSERT', () => {
    it('🎯 should successfully execute overloaded class instance methods with identical parity', () => {
      const instancePayload: unknown = {
        id: 905,
        username: 'class_instance_assert',
        active: true,
      };

      // Executes the overloaded, parameter-hidden class mapping layer
      expect(() => xalor.assert<'USER_TEST'>(instancePayload)).not.toThrow();
    });

    it('🎯 should successfully trigger structural panic errors out of class-wrapped lanes', () => {
      const brokenInstancePayload: unknown = {
        id: 'NOT_A_NUMBER',
        username: 'class_instance_fail',
        active: true,
      };

      expect(() => xalor.assert<'USER_TEST'>(brokenInstancePayload)).toThrow();
    });
  });
});
