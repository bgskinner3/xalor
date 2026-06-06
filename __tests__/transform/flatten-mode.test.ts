// __tests__/runtime/api/transform-xalor/flatten-mode.test.ts
import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault, logEngineTrace } from '../utils';

/**
 * TEST CONTROL
 *
 * TO RUN
 pnpm run test -- __tests__/transform/flatten-mode.test.ts
 */
const TEST_CONFIG_FLATTEN_MODE = {
  FLATTEN_MODE_TEST_ONE: {
    run: true,
    log: false,
  },
  FLATTEN_MODE_TEST_TWO: {
    run: true,
    log: false,
  },
  FLATTEN_MODE_TEST_THREE: {
    run: true,
    log: false,
  },
  FLATTEN_MODE_TEST_FOUR: {
    run: true,
    log: false,
  },
  FLATTEN_MODE_TEST_FIVE: {
    run: true,
    log: false,
  },
  FLATTEN_MODE_TEST_SIX: {
    run: true,
    log: false,
  },
} as const;

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
  });

  //============================================================================================
  //============================================================================================
  // TRANSFORM XALOR API FLATTEN MODE
  //============================================================================================
  //============================================================================================
  describe('Transform XALOR FLATTEN MODE', () => {
    if (TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_ONE.run) {
      it('🛡️ should successfully decompress a flat primitive object payload into standard root keys', () => {
        const mockUser = {
          id: 777,
          username: 'XalethorFlat',
          active: true,
          unlistedNoise: 'should_be_ignored',
        };

        const result = xalor.flatten<'USER_TEST'>({
          data: mockUser,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_ONE.log,
          mode: 'flatten',
          operation: 'Flat Primitive Object Decompression',
          target: 'USER_TEST',
          behavior:
            'Mapping base primitive property field links onto root-level canvas dictionary strings.',
          output: result,
        });

        expect(result).toEqual({
          id: 777,
          username: 'XalethorFlat',
          active: true,
        });
      });
    }
    if (TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_TWO.run) {
      it('🛡️ should successfully resolve variant branches across unions structures before flattening paths', () => {
        const mockPayload = { status: 'success', extraNoise: 'discard_me' };

        const result = xalor.flatten<'API_RESPONSE'>({
          data: mockPayload,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_TWO.log,
          mode: 'flatten',
          operation: 'Polymorphic Union Branch Resolution Flattening',
          target: 'API_RESPONSE',
          behavior:
            'Evaluating the data to pinpoint the correct union branch, then flattening that specific variant.',
          output: result,
        });

        expect(result).toEqual({
          status: 'success',
        });
      });
    }
    if (TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_THREE.run) {
      it('🛡️ [HEAVY STRESS TEST] should recursively decompress multi-layer structures, appending dot-notation paths and array index markers uniformly', () => {
        const complexPayload = {
          orderId: 'ORD-FLAT-009',
          items: [
            {
              SKU: 'CORE-A',
              quantity: 5,
              logistics: {
                warehouseCode: 'EAST-01',
                dimensions: { weight: 1.2, fragile: false },
              },
            },
            {
              SKU: 'EDGE-B',
              quantity: 1,
              logistics: {
                warehouseCode: 'WEST-02',
                dimensions: { weight: 45.9, fragile: true },
              },
            },
          ],
        };

        const result = xalor.flatten<'DEEPLY_NESTED_STORE'>({
          data: complexPayload,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_THREE.log,
          mode: 'flatten',
          operation: 'Multi-Tier Tree Structural Decompression',
          target: 'DEEPLY_NESTED_STORE',
          behavior:
            'Recursively parsing multi-layer trees to format standard bracket list indexes and dot path paths strings.',
          output: result,
        });

        expect(result).toEqual({
          orderId: 'ORD-FLAT-009',
          'items[0].SKU': 'CORE-A',
          'items[0].quantity': 5,
          'items[0].logistics.warehouseCode': 'EAST-01',
          'items[0].logistics.dimensions.weight': 1.2,
          'items[0].logistics.dimensions.fragile': false,
          'items[1].SKU': 'EDGE-B',
          'items[1].quantity': 1,
          'items[1].logistics.warehouseCode': 'WEST-02',
          'items[1].logistics.dimensions.weight': 45.9,
          'items[1].logistics.dimensions.fragile': true,
        });
      });
    }
    if (TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_FOUR.run) {
      it('🛡️ [HEAVY STRESS TEST] should immediately intercept cyclic references loops inside decompression passes to prevent memory heap allocation blowout crashes', () => {
        interface IBackRefUser {
          id: number;
          username: string;
          active: boolean;
          self_link?: any;
        }

        const maliciousPayload: IBackRefUser = {
          id: 99,
          username: 'CrashTestDummy',
          active: true,
        };
        // Forge a recursive back-reference memory loop path
        maliciousPayload.self_link = maliciousPayload;

        const result = xalor.flatten<'USER_TEST'>({
          data: maliciousPayload,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_FOUR.log,
          mode: 'flatten',
          operation: 'Cyclic Reference Interception Pass',
          target: 'USER_TEST',
          behavior:
            'Ensuring your seenObjectsMap instantly tracks and safely exits cyclic loops mid-flight without throwing stack overflow errors.',
          output: result,
        });

        // Verify it safely formats the non-cyclic elements while short-circuiting on the circular back-reference link pointer field
        expect(result).toEqual({
          id: 99,
          username: 'CrashTestDummy',
          active: true,
        });
      });
    }
    if (TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_FIVE.run) {
      it('🛡️ [STRESS TEST] should handle asymmetrical matrix type mismatches gracefully without throwing runtime TypeErrors', () => {
        // Poisoned payload: data type structures contradict what the blueprint schema expects
        const poisonedPayload = {
          orderId: { malicious_object: 'should_be_a_string_primitive' }, // Object provided instead of string primitive
          items: 'corrupted_string_literal_instead_of_array', // String primitive provided instead of collection array
        };

        const result = xalor.flatten<'STORE_ORDER'>({
          data: poisonedPayload,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_FIVE.log,
          mode: 'flatten',
          operation: 'Data Type Mismatch Defensive Guard',
          target: 'STORE_ORDER',
          behavior:
            'Safely short-circuiting layout mappers when runtime typings contradict the schema blueprint.',
          output: result,
        });

        // The engine must reject the mismatched structural branches entirely, leaving an empty or safe fallback map
        expect(result).toEqual({});
      });
    }
    if (TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_SIX.run) {
      it('🛡️ [STRESS TEST] should successfully decompress deeply nested null or empty property values into terminal path keys', () => {
        const emptyGraphPayload = {
          orderId: 'ORD-EMPTY-0',
          items: [
            {
              SKU: '', // Empty string value primitive
              quantity: 0,
              logistics: {
                warehouseCode: null, // Explicit null value primitive
                dimensions: null, // Object branch landing as null
              },
            },
          ],
        };

        const result = xalor.flatten<'DEEPLY_NESTED_STORE'>({
          data: emptyGraphPayload,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_FLATTEN_MODE.FLATTEN_MODE_TEST_SIX.log,
          mode: 'flatten',
          operation: 'Falsy and Null Value Primitive Decompression',
          target: 'DEEPLY_NESTED_STORE',
          behavior:
            'Ensuring falsy primitives (0, "") write to keys, while validating null object branches exit safely.',
          output: result,
        });

        expect(result).toEqual({
          orderId: 'ORD-EMPTY-0',
          'items[0].SKU': '',
          'items[0].quantity': 0,
          'items[0].logistics.warehouseCode': null,
          // items.logistics.dimensions is completely absent since its object node evaluates to null!
        });
      });
    }
  });
});
