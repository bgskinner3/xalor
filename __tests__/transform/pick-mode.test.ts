// // __tests__/runtime/api/transform-xalor/pick-mode.test.ts
import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault, logEngineTrace } from '../utils';

/**
 * TEST CONTROL
 *
 * TO RUN
 pnpm run test -- __tests__/transform/pick-mode.test.ts
 */
const TEST_CONFIG_PICK_MODE = {
  PICK_MODE_TEST_ONE: {
    run: true,
    log: false,
  },
  PICK_MODE_TEST_TWO: {
    run: true,
    log: false,
  },
  PICK_MODE_TEST_THREE: {
    run: true,
    log: false,
  },
  PICK_MODE_TEST_FOUR: {
    run: true,
    log: false,
  },
  PICK_MODE_TEST_FIVE: {
    run: true,
    log: false,
  },
  PICK_MODE_TEST_SIX: {
    run: true,
    log: false,
  },
  PICK_MODE_TEST_SEVEN: {
    run: true,
    log: false,
  },
  PICK_MODE_TEST_EIGHT: {
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
    TRANSACTION: {
      id: string;
      amount: number;
      currency: 'USD' | 'EUR' | 'GBP';
    };
  }
}
// pick, omit, rename, merge, flatten
describe('Runtime Generator API', () => {
  beforeAll(() => {
    // Seed your mock blueprint registry definitions flatly straight into RAM memory
    seedTestVault('USER_TEST', TEST_SHAPE_REGISTRY.STANDARD_USER);
    seedTestVault('API_RESPONSE', TEST_SHAPE_REGISTRY.UNION_RESPONSE);
    seedTestVault('STORE_ORDER', TEST_SHAPE_REGISTRY.COMPLEX_ORDER);
    seedTestVault('TRANSACTION', TEST_SHAPE_REGISTRY.TRANSACTION);
  });
  //============================================================================================
  //============================================================================================
  // TRANSFORM XALOR API PICK MODE
  //============================================================================================
  //============================================================================================
  describe('Transform XALOR PICK MODE', () => {
    // it('🛡️ should successfully retain only deep-nested properties requested via advanced dot-notation paths', () => {
    //   const mockOrder = { id: 's2Z7XIErEIP', amount: 985, currency: 'EUR' };

    //   // ✔️ NEW ADVANCED FEATURE ENFORCED!
    //   // Here we explicitly pick the 'orderId' and ONLY the 'SKU' property inside your child collection!
    //   const result = xalor.pick<'TRANSACTION'>({
    //     data: mockOrder,
    //     keys: ['id', 'currency'],
    //   });

    //   console.log(result, 'RESULLTTT');
    // });
    if (TEST_CONFIG_PICK_MODE.PICK_MODE_TEST_ONE.run) {
      it('🛡️ should successfully retain only requested fields from a primitive/flat object payload', () => {
        const mockUser = {
          id: 42,
          username: 'XalethorDev',
          active: true,
          extraRogueProperty: 'malicious_injection_payload', // Should be cleanly sliced away
        };

        // Emulate the precompiled build-time parameter macro extraction injection pass
        const result = xalor.pick<'USER_TEST'>({
          data: mockUser,
          keys: ['id', 'username'],
        });
        logEngineTrace({
          enabled: TEST_CONFIG_PICK_MODE.PICK_MODE_TEST_ONE.log,
          mode: 'pick',
          operation: 'Selective Field Retention Pass',
          target: 'USER_TEST',
          behavior:
            'Retaining explicitly requested keys ["id", "username"] while pruning unlisted fields.',
          output: result,
        });

        expect(result).toEqual({
          id: 42,
          username: 'XalethorDev',
        });
        expect(Object.prototype.hasOwnProperty.call(result, 'active')).toBe(
          false,
        );
        expect(
          Object.prototype.hasOwnProperty.call(result, 'extraRogueProperty'),
        ).toBe(false);
      });
    }
    if (TEST_CONFIG_PICK_MODE.PICK_MODE_TEST_TWO.run) {
      it('🛡️ should preserve the prototype configuration mapping layers while peeling fields away', () => {
        class UserModel {
          id = 101;
          username = 'ProtoUser';
          active = false;
          greet() {
            return 'Hello';
          }
        }

        const userInstance = new UserModel();

        const result = xalor.pick<'USER_TEST'>({
          data: userInstance,
          keys: ['username', 'active'],
        });
        logEngineTrace({
          enabled: TEST_CONFIG_PICK_MODE.PICK_MODE_TEST_TWO.log,
          mode: 'pick',
          operation: 'Class Instance Properties Slicing',
          target: 'USER_TEST',
          behavior:
            'Preserving native class prototype layers while cleanly removing unlisted parameters.',
          output: result,
        });
        expect(result).toEqual({
          username: 'ProtoUser',
          active: false,
        });
        expect(Object.prototype.hasOwnProperty.call(result, 'id')).toBe(false);
        // Verify that class prototypes match up exactly through Object.create(proto) checks
        expect(Object.getPrototypeOf(result)).toBe(UserModel.prototype);
      });
    }
    if (TEST_CONFIG_PICK_MODE.PICK_MODE_TEST_THREE.run) {
      it('🛡️ should handle empty selection keys safely and return an absolute zero-property schema shell object', () => {
        const mockUser = { id: 99, username: 'Ghost', active: true };

        const result = xalor.pick<'USER_TEST'>({
          data: mockUser,
          keys: [],
        });
        logEngineTrace({
          enabled: TEST_CONFIG_PICK_MODE.PICK_MODE_TEST_THREE.log,
          mode: 'pick',
          operation: 'Empty Target Extraction Pass',
          target: 'USER_TEST',
          behavior:
            'Safely evaluating an empty selection array to return a pristine zero-property shell object.',
          output: result,
        });
        expect(result).toEqual({});
        expect(Object.keys(result).length).toBe(0);
      });
    }
    if (TEST_CONFIG_PICK_MODE.PICK_MODE_TEST_FOUR.run) {
      it('🛡️ should handle polymorphic union shapes quietly and filter fields matching the fitting variant path', () => {
        const mockSuccessResponse = { status: 'success', extraNoise: 12345 };
        const mockLiteralResponse = {
          status: 500,
          extraNoise: 'fatal_server_break',
        };

        const resultSuccess = xalor.pick<'API_RESPONSE'>({
          data: mockSuccessResponse,
          keys: ['status'],
        });

        const resultLiteral = xalor.pick<'API_RESPONSE'>({
          data: mockLiteralResponse,
          keys: ['status'],
        });
        logEngineTrace({
          enabled: TEST_CONFIG_PICK_MODE.PICK_MODE_TEST_FOUR.log,
          mode: 'pick',
          operation: 'Polymorphic Union Branch Slicing',
          target: 'API_RESPONSE',
          behavior:
            'Dynamically matching the valid union branch and slicing unlisted variables from both schemas.',
          output: { resultSuccess, resultLiteral },
        });
        expect(resultSuccess).toEqual({ status: 'success' });
        expect(resultLiteral).toEqual({ status: 500 });
        expect(
          Object.prototype.hasOwnProperty.call(resultSuccess, 'extraNoise'),
        ).toBe(false);
        expect(
          Object.prototype.hasOwnProperty.call(resultLiteral, 'extraNoise'),
        ).toBe(false);
      });
    }
    if (TEST_CONFIG_PICK_MODE.PICK_MODE_TEST_FIVE.run) {
      it('🛡️ should successfully retain only deep-nested properties requested via advanced dot-notation paths', () => {
        const mockOrder = {
          orderId: 'ORD-2026',
          items: [
            { SKU: 'AAA', quantity: 5, rogueTag: 'noise_one' },
            { SKU: 'BBB', quantity: 12, rogueTag: 'noise_two' },
          ],
          extraNoiseField: 'root_clutter_to_be_removed',
        };

        // ✔️ NEW ADVANCED FEATURE ENFORCED!
        // Here we explicitly pick the 'orderId' and ONLY the 'SKU' property inside your child collection!
        const result = xalor.pick<'STORE_ORDER'>({
          data: mockOrder,
          keys: ['orderId', 'items.SKU'],
        });

        logEngineTrace({
          enabled: TEST_CONFIG_PICK_MODE.PICK_MODE_TEST_FIVE.log,
          mode: 'pick',
          operation: 'Advanced Dot-Notation Deep Slicing Pass',
          target: 'STORE_ORDER',
          behavior:
            'Pruning nested collection fields ("quantity") dynamically on the stack trace frame via path parsing.',
          output: result,
        });

        expect(result).toEqual({
          orderId: 'ORD-2026',
          items: [
            { SKU: 'AAA' }, // 💎 'quantity' and 'rogueTag' are successfully sliced away!
            { SKU: 'BBB' }, // 💎 'quantity' and 'rogueTag' are successfully sliced away!
          ],
        });
      });
    }
  });
});
