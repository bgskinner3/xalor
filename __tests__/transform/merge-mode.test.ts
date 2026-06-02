// // __tests__/runtime/api/transform-xalor/merge-mode.test.ts
import { transformXalor } from '../../src/operations';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault, logEngineTrace } from '../utils';
/**
 * TEST CONTROL
 *
  * TO RUN
 pnpm run test -- __tests__/transform/merge-mode.test.ts
 */
const TEST_CONFIG_MERGE_MODE = {
  MERGE_MODE_TEST_ONE: {
    run: true,
    log: false,
  },
  MERGE_MODE_TEST_TWO: {
    run: true,
    log: false,
  },
  MERGE_MODE_TEST_THREE: {
    run: true,
    log: false,
  },
  MERGE_MODE_TEST_FOUR: {
    run: true,
    log: false,
  },
  MERGE_MODE_TEST_FIVE: {
    run: true,
    log: false,
  },
  MERGE_MODE_TEST_SIX: {
    run: true,
    log: false,
  },
  MERGE_MODE_TEST_SEVEN: {
    run: true,
    log: false,
  },
  MERGE_MODE_TEST_EIGHT: {
    run: true,
    log: false,
  },
  MERGE_MODE_TEST_NINE: {
    run: true,
    log: false,
  },
  MERGE_MODE_TEST_TEN: {
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
  // TRANSFORM XALOR API MERGE MODE
  //============================================================================================
  //============================================================================================
  describe('Transform XALOR MERGE MODE', () => {
    if (TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_ONE.run) {
      it('🛡️ should successfully deep-merge flat object profiles using dataTwo as an absolute override patch', () => {
        const currentDatabaseState = {
          id: 101,
          username: 'XalethorOriginal',
          active: false,
        };

        const incomingDeltaPatch = {
          username: 'XalethorPatched', // Overrides baseline value
          active: true, // Overrides baseline value
        };

        const result = transformXalor<'USER_TEST', 'merge'>({
          dataOne: currentDatabaseState,
          dataTwo: incomingDeltaPatch,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_ONE.log,
          mode: 'merge',
          operation: 'Flat Object Delta Aggregation',
          target: 'USER_TEST',
          behavior:
            'Merging partial patch overrides over original state, preserving un-patched baseline properties.',
          output: result,
        });

        expect(result).toEqual({
          id: 101, // Preserved from dataOne
          username: 'XalethorPatched', // Overridden by dataTwo
          active: true, // Overridden by dataTwo
        });
      });
    }
    if (TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_TWO.run) {
      it('🛡️ should recursively step through arrays and merge collection elements symmetrically by index', () => {
        const baseOrder = {
          orderId: 'ORD-707',
          items: [
            { SKU: 'PROD-A', quantity: 1 },
            { SKU: 'PROD-B', quantity: 5 },
          ],
        };
        const patchOrder = {
          items: [
            { quantity: 3 }, // Updates index 0 quantity, keeps base SKU
            { SKU: 'PROD-B-UPDATED' }, // Updates index 1 SKU, keeps base quantity
            { SKU: 'PROD-C-NEW', quantity: 9 }, // Appends full index 2 since base has length 2
          ],
        };
        const result = transformXalor<'STORE_ORDER', 'merge'>({
          dataOne: baseOrder,
          dataTwo: patchOrder,
        });
        logEngineTrace({
          enabled: TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_TWO.log,
          mode: 'merge',
          operation: 'Symmetrical Array Index Aggregation',
          target: 'STORE_ORDER',
          behavior:
            'Symmetrically evaluating list indices to combine sub-object values while respecting maximum lengths.',
          output: result,
        });
        expect(result).toEqual({
          orderId: 'ORD-707',
          items: [
            { SKU: 'PROD-A', quantity: 3 },
            { SKU: 'PROD-B-UPDATED', quantity: 5 },
            { SKU: 'PROD-C-NEW', quantity: 9 },
          ],
        });
      });
    }
    if (TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_THREE.run) {
      it('🛡️ should successfully update nested properties multiple layers deep across compound boundaries', () => {
        const baseComplexStore = {
          orderId: 'ORD-DEEP-MERGE',
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
          items: [
            {
              logistics: {
                dimensions: { fragile: true }, // Targets deep change 3 levels down
              },
            },
          ],
        };

        const result = transformXalor<'DEEPLY_NESTED_STORE', 'merge'>({
          dataOne: baseComplexStore,
          dataTwo: patchComplexStore,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_THREE.log,
          mode: 'merge',
          operation: 'Multi-Layer Compound Path Merge',
          target: 'DEEPLY_NESTED_STORE',
          behavior:
            'Pruning nested collection entities to append modifications at exact child layout coordinates.',
          output: result,
        });

        expect(result).toEqual({
          orderId: 'ORD-DEEP-MERGE',
          items: [
            {
              SKU: 'CHIP-V1',
              quantity: 100,
              logistics: {
                warehouseCode: 'CENTRAL-01',
                dimensions: { weight: 0.5, fragile: true }, // Successfully flipped!
              },
            },
          ],
        });
      });
    }
    if (TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_FOUR.run) {
      it('🛡️ [STRESS TEST] should handle completely empty, null, or undefined patch values gracefully using fallback rules', () => {
        const databaseState = {
          id: 202,
          username: 'XalethorDefensive',
          active: true,
        };

        // Patch contains partial values or uninstantiated positions explicitly intended to be ignored
        const chaoticPatch = {
          id: undefined,
          username: undefined,
        };

        const result = transformXalor<'USER_TEST', 'merge'>({
          dataOne: databaseState,
          dataTwo: chaoticPatch,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_FOUR.log,
          mode: 'merge',
          operation: 'Defensive Partial Undefined Merge Check',
          target: 'USER_TEST',
          behavior:
            'Ensuring undefined properties inside dataTwo trigger structural fallback safety routes to preserve base state.',
          output: result,
        });

        expect(result).toEqual({
          id: 202,
          username: 'XalethorDefensive',
          active: true,
        });
      });
    }
    if (TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_FIVE.run) {
      it('🛡️ [STRESS TEST] should handle asymmetrical array length variations seamlessly without dropping trailing elements', () => {
        const baseStore = {
          orderId: 'ORD-ASYNC-1',
          items: [
            { SKU: 'X-1', quantity: 10 },
            { SKU: 'X-2', quantity: 20 },
            { SKU: 'X-3', quantity: 30 },
          ],
        };

        const patchStore = {
          items: [{ quantity: 99 }],
        };

        const result = transformXalor<'STORE_ORDER', 'merge'>({
          dataOne: baseStore,
          dataTwo: patchStore,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_FIVE.log,
          mode: 'merge',
          operation: 'Asymmetrical Collection Length Aggregation',
          target: 'STORE_ORDER',
          behavior:
            'Preserving trailing baseline entries when partial array patch sets cut short.',
          output: result,
        });

        expect(result.items.length).toBe(3);
        expect(result).toEqual({
          orderId: 'ORD-ASYNC-1',
          items: [
            { SKU: 'X-1', quantity: 99 },
            { SKU: 'X-2', quantity: 20 },
            { SKU: 'X-3', quantity: 30 },
          ],
        });
      });
    }
    if (TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_SIX.run) {
      it('🛡️ [STRESS TEST] should strictly preserve native class prototype mappings layers when merged with raw object literals patches', () => {
        class DatabaseUserRecord {
          id = 505;
          username = 'BaseClassInstance';
          active = false;
          logAccess() {
            return true;
          }
        }

        const activeInstance = new DatabaseUserRecord();
        const rawDeltaPatch = {
          username: 'UpgradedClassInstance',
          active: true,
        };

        const result = transformXalor<'USER_TEST', 'merge'>({
          dataOne: activeInstance,
          dataTwo: rawDeltaPatch,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_SIX.log,
          mode: 'merge',
          operation: 'Cross-Over Class Prototype Maintenance',
          target: 'USER_TEST',
          behavior:
            'Safely applying unstructured dictionary changes while protecting class method links.',
          output: result,
        });

        expect(result).toEqual({
          id: 505,
          username: 'UpgradedClassInstance',
          active: true,
        });
        expect(Object.getPrototypeOf(result)).toBe(
          DatabaseUserRecord.prototype,
        );
      });
    }
    if (TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_SEVEN.run) {
      it('🛡️ [STRESS TEST] should treat explicit null overrides as new state payloads while routing undefined fields to baseline fallbacks', () => {
        const activeState = {
          id: 711,
          username: 'PersistentUser',
          active: true,
        };

        const customPatch = {
          username: null,
          active: undefined,
        };

        const result = transformXalor<'USER_TEST', 'merge'>({
          dataOne: activeState,
          dataTwo: customPatch,
        }) as any;

        logEngineTrace({
          enabled: TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_SEVEN.log,
          mode: 'merge',
          operation: 'Null Overwrite vs Undefined Fallback Check',
          target: 'USER_TEST',
          behavior:
            'Nullifying targeted fields completely while using fallbacks for skipped parameters.',
          output: result,
        });

        expect(result).toEqual({
          id: 711,
          username: null,
          active: true,
        });
      });
    }

    if (TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_EIGHT.run) {
      it('🛡️ [STRESS TEST] should handle out-of-bounds array appends when patch list length exceeds base list length', () => {
        const baseOrder = {
          orderId: 'ORD-APPEND-1',
          items: [
            { SKU: 'PROD-A', quantity: 5 }, // Length is exactly 1
          ],
        };

        const patchOrder = {
          items: [
            { quantity: 10 }, // Updates index 0 quantity
            { SKU: 'PROD-B-NEW', quantity: 1 }, // Appends brand-new item at index 1!
          ],
        };

        const result = transformXalor<'STORE_ORDER', 'merge'>({
          dataOne: baseOrder,
          dataTwo: patchOrder,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_EIGHT.log,
          mode: 'merge',
          operation: 'Asymmetrical Out-of-Bounds Collection Append',
          target: 'STORE_ORDER',
          behavior:
            'Safely appending extra structural elements when the incoming patch list length exceeds baseline boundaries.',
          output: result,
        });

        expect(result.items.length).toBe(2);
        expect(result).toEqual({
          orderId: 'ORD-APPEND-1',
          items: [
            { SKU: 'PROD-A', quantity: 10 },
            { SKU: 'PROD-B-NEW', quantity: 1 },
          ],
        });
      });
    }
    if (TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_NINE.run) {
      it('🛡️ [STRESS TEST] should process key value mutations smoothly across varying logical polymorphic union branches', () => {
        const currentResponseState = { status: 'success' };
        const incomingDeltaErrorPatch = { status: 500 }; // Shifts branch from literal string to primitive number

        const result = transformXalor<'API_RESPONSE', 'merge'>({
          dataOne: currentResponseState,
          dataTwo: incomingDeltaErrorPatch,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_NINE.log,
          mode: 'merge',
          operation: 'Polymorphic Union Branch Mutation Alignment',
          target: 'API_RESPONSE',
          behavior:
            'Dynamically re-evaluating the shape variant match when a patch forces a type crossover.',
          output: result,
        });

        expect(result).toEqual({ status: 500 });
      });
    }

    if (TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_TEN.run) {
      it('🛡️ [STRESS TEST] should initialize empty object containers seamlessly when patch records collide with null base states', () => {
        const baseStateWithNullObject = {
          orderId: 'ORD-NULL-OBJ',
          items: null, // Object array field lands flatly as null from database layer
        };

        const partialIncomingPatch = {
          items: [{ SKU: 'RECOVERY-1', quantity: 12 }],
        };

        const result = transformXalor<'STORE_ORDER', 'merge'>({
          dataOne: baseStateWithNullObject,
          dataTwo: partialIncomingPatch,
        });

        logEngineTrace({
          enabled: TEST_CONFIG_MERGE_MODE.MERGE_MODE_TEST_TEN.log,
          mode: 'merge',
          operation: 'Null Graph Base State Recovery Pass',
          target: 'STORE_ORDER',
          behavior:
            'Intercepting invalid null reference properties to seamlessly hydrate structures from active patches.',
          output: result,
        });

        expect(result).toEqual({
          orderId: 'ORD-NULL-OBJ',
          items: [{ SKU: 'RECOVERY-1', quantity: 12 }],
        });
      });
    }
  });
});
