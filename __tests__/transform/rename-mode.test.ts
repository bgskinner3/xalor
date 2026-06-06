// // __tests__/runtime/api/transform-xalor/rename-mode.test.ts
import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault, logEngineTrace } from '../utils';

/**
 * TEST CONTROL
 *
 * TO RUN
 pnpm run test -- __tests__/transform/rename-mode.test.ts
 */
const TEST_CONFIG_RENAME_MODE = {
  RENAME_MODE_TEST_ONE: {
    run: true,
    log: false,
  },
  RENAME_MODE_TEST_TWO: {
    run: true,
    log: false,
  },
  RENAME_MODE_TEST_THREE: {
    run: true,
    log: false,
  },
  RENAME_MODE_TEST_FOUR: {
    run: true,
    log: false,
  },
  RENAME_MODE_TEST_FIVE: {
    run: true,
    log: false,
  },
  RENAME_MODE_TEST_SIX: {
    run: true,
    log: false,
  },
  RENAME_MODE_TEST_SEVEN: {
    run: true,
    log: false,
  },
  RENAME_MODE_TEST_EIGHT: {
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
  // TRANSFORM XALOR API RENAME MODE
  //============================================================================================
  //============================================================================================
  describe('Transform XALOR RENAME MODE', () => {
    if (TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_ONE.run) {
      it('🛡️ should successfully map alien/incoming properties into the master internal blueprint layout', () => {
        // Incoming data layout matches alternate external API formatting tokens
        const rawIncomingJson = {
          // eslint-disable-next-line no-loss-of-precision
          uuid_identifier: 550e8400,
          handle_name: 'XalethorAligned',
          active: true,
        };

        // Define mappings payload layout format: Record<IncomingKey, TargetBlueprintKey>
        const result = xalor.rename<'USER_TEST'>({
          data: rawIncomingJson,
          mappings: { uuid_identifier: 'id', handle_name: 'username' },
        });

        logEngineTrace({
          enabled: TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_ONE.log,
          mode: 'rename',
          operation: 'Nominal Key Alignment Mapping',
          target: 'USER_TEST',
          behavior:
            'Translating alternate data fields into internal schema coordinates based on mapping rules.',
          output: result,
        });

        expect(result).toEqual({
          // eslint-disable-next-line no-loss-of-precision
          id: 550e8400,
          username: 'XalethorAligned',
          active: true,
        });
        expect(
          Object.prototype.hasOwnProperty.call(result, 'uuid_identifier'),
        ).toBe(false);
        expect(
          Object.prototype.hasOwnProperty.call(result, 'handle_name'),
        ).toBe(false);
      });
    }
    if (TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_TWO.run) {
      it('🛡️ should safely maintain native class instance prototype layers while mapping renamed parameters', () => {
        class ExtUserModel {
          legacy_id = 999;
          username = 'ProtoAligned';
          active = true;
        }

        const externalInstance = new ExtUserModel();

        const result = xalor.rename<'USER_TEST'>({
          data: externalInstance,
          mappings: { legacy_id: 'id' },
        });

        logEngineTrace({
          enabled: TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_TWO.log,
          mode: 'rename',
          operation: 'Class Instance Prototype Rename Pass',
          target: 'USER_TEST',
          behavior:
            'Preserving underlying prototype links intact during nominal alignments transformations.',
          output: result,
        });

        expect(result).toEqual({
          id: 999,
          username: 'ProtoAligned',
          active: true,
        });
        expect(Object.getPrototypeOf(result)).toBe(ExtUserModel.prototype);
        expect(Object.prototype.hasOwnProperty.call(result, 'legacy_id')).toBe(
          false,
        );
      });
    }
    if (TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_THREE.run) {
      it('🛡️ should parse and map renamed properties accurately through polymorphic union shapes branches', () => {
        const mockUnionPayload = {
          state_code: 'success',
        };

        const result = xalor.rename<'API_RESPONSE'>({
          data: mockUnionPayload,
          mappings: { state_code: 'status' },
        });

        logEngineTrace({
          enabled: TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_THREE.log,
          mode: 'rename',
          operation: 'Polymorphic Union Key Alignment Pass',
          target: 'API_RESPONSE',
          behavior:
            'Evaluating matching logical union branches across nominal key re-mappings.',
          output: result,
        });

        expect(result).toEqual({
          status: 'success',
        });
        expect(Object.prototype.hasOwnProperty.call(result, 'state_code')).toBe(
          false,
        );
      });
    }
    if (TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_FOUR.run) {
      it('🛡️ should recursively loop through collection arrays to rename keys symmetrically at deeper tiers', () => {
        const rawIncomingStore = {
          orderId: 'ORD-REN-7',
          items: [
            {
              part_number: 'NEXUS-01',
              quantity: 3,
              logistics: {
                warehouseCode: 'ZONE-A',
                dimensions: { mass_metric: 50.5, fragile: true },
              },
            },
            {
              part_number: 'NEXUS-02',
              quantity: 8,
              logistics: {
                warehouseCode: 'ZONE-B',
                dimensions: { mass_metric: 1.1, fragile: false },
              },
            },
          ],
        };

        // Define mappings mapping entries flatly across multiple properties layers
        const result = xalor.rename<'DEEPLY_NESTED_STORE'>({
          data: rawIncomingStore,
          mappings: { part_number: 'SKU', mass_metric: 'weight' },
        });

        logEngineTrace({
          enabled: TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_FOUR.log,
          mode: 'rename',
          operation: 'Deep Symmetrical Collection Key Remapping',
          target: 'DEEPLY_NESTED_STORE',
          behavior:
            'Symmetrically stepping inside collections to remap properties at nested levels.',
          output: result,
        });

        expect(result).toEqual({
          orderId: 'ORD-REN-7',
          items: [
            {
              SKU: 'NEXUS-01',
              quantity: 3,
              logistics: {
                warehouseCode: 'ZONE-A',
                dimensions: { weight: 50.5, fragile: true },
              },
            },
            {
              SKU: 'NEXUS-02',
              quantity: 8,
              logistics: {
                warehouseCode: 'ZONE-B',
                dimensions: { weight: 1.1, fragile: false },
              },
            },
          ],
        });

        // Assert deep cleanliness across all transformed elements instances
        expect(
          Object.prototype.hasOwnProperty.call(result.items[0], 'part_number'),
        ).toBe(false);
        expect(
          Object.prototype.hasOwnProperty.call(
            result.items[0].logistics.dimensions,
            'mass_metric',
          ),
        ).toBe(false);
      });
    }
    if (TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_FIVE.run) {
      it('🛡️ [STRESS TEST] should handle missing source keys in the payload gracefully without writing undefined values', () => {
        const incompletePayload = {
          orderId: 'ORD-ERR-1',
          // 'items' array is completely missing from the incoming data layer!
        };

        const result = xalor.rename<'DEEPLY_NESTED_STORE'>({
          data: incompletePayload,
          mappings: { legacy_items: 'items' },
        });
        logEngineTrace({
          enabled: TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_FIVE.log,
          mode: 'rename',
          operation: 'Deep Symmetrical Collection Key Remapping',
          target: 'DEEPLY_NESTED_STORE',
          behavior: 'payload gracefully without writing undefined values',
          output: result,
        });
        expect(result).toEqual({ orderId: 'ORD-ERR-1' });
        expect(Object.prototype.hasOwnProperty.call(result, 'items')).toBe(
          false,
        );
      });
    }
    if (TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_SIX.run) {
      it('🛡️ [STRESS TEST] should intercept duplicate key collisions deterministically and resolve safely', () => {
        const collisionPayload = {
          orderId: 'ORD-COLLIDE',
          items: [
            {
              part_number: 'ALIEN-TOKEN-1', // maps to SKU
              SKU: 'INTERNAL-TOKEN-2', // already matches blueprint key name!
              quantity: 1,
            },
          ],
        };

        const result = xalor.rename<'DEEPLY_NESTED_STORE'>({
          data: collisionPayload,
          mappings: { part_number: 'SKU' },
        });
        logEngineTrace({
          enabled: TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_SIX.log,
          mode: 'rename',
          operation: 'Deep Symmetrical Collection Key Remapping',
          target: 'DEEPLY_NESTED_STORE',
          behavior: 'payload gracefully without writing undefined values',
          output: result,
        });
        // Verify that the engine overwrites cleanly based on your mapping configurations prioritization
        expect(result.items[0].SKU).toBe('ALIEN-TOKEN-1');
      });
    }
    // if (TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_SEVEN.run) {
    //   it('🛡️ [STRESS TEST] should execute key remapping cleanly on null properties without altering value primitives structures', () => {
    //     const nullPayload = {
    //       uuid_identifier: null, // maps to id
    //       handle_name: 'NullUser',
    //       active: false,
    //     };

    //     const resultr = xalor.rename<'USER_TEST'>({
    //       data: nullPayload,
    //       mappings: { uuid_identifier: 'id', handle_name: 'username' },
    //     });

    //     const mockOrder = {
    //       orderId: 'ORD-2026',
    //       items: [
    //         { SKU: 'AAA', quantity: 5, rogueTag: 'noise_one' },
    //         { SKU: 'BBB', quantity: 12, rogueTag: 'noise_two' },
    //       ],
    //       extraNoiseField: 'root_clutter_to_be_removed',
    //     };

    //     // ✔️ NEW ADVANCED FEATURE ENFORCED!
    //     // Here we explicitly pick the 'orderId' and ONLY the 'SKU' property inside your child collection!
    //     const resultd = xalor.rename<'STORE_ORDER', 'pick'>({
    //       data: mockOrder,
    //       keys: ['orderId', 'items.SKU'],
    //     });
    //     const mockComplexStore = {
    //       orderId: 'ORD-DEEP-9',
    //       items: [
    //         {
    //           SKU: 'NEXUS-7',
    //           quantity: 2,
    //           logistics: {
    //             warehouseCode: 'ZONE-NORTH',
    //             dimensions: { weight: 88.4, fragile: true },
    //           },
    //         },
    //         {
    //           SKU: 'NEXUS-8',
    //           quantity: 5,
    //           logistics: {
    //             warehouseCode: 'ZONE-SOUTH',
    //             dimensions: { weight: 12.1, fragile: false },
    //           },
    //         },
    //       ],
    //     };

    //     // ✔️ ADVANCED FEATURE ASSERTER: Deep Omit!
    //     // Here we keep everything, but explicitly prune ONLY the 'fragile' flag 3 layers deep!
    //     const result = xalor.rename<'DEEPLY_NESTED_STORE', 'omit'>({
    //       data: mockComplexStore,
    //       keys: ['items.logistics.dimensions.fragile'],
    //     });
    //     const databaseState = {
    //       id: 202,
    //       username: 'XalethorDefensive',
    //       active: true,
    //     };

    //     // Patch contains partial values or uninstantiated positions explicitly intended to be ignored
    //     const chaoticPatch = {
    //       id: undefined,
    //       username: undefined,
    //     };

    //     const result = xalor.rename<'USER_TEST', 'merge'>({
    //       dataOne: databaseState,
    //       dataTwo: chaoticPatch,
    //     });
    //     const maliciousPayload: IBackRefUser = {
    //       id: 99,
    //       username: 'CrashTestDummy',
    //       active: true,
    //     };
    //     // Forge a recursive back-reference memory loop path
    //     maliciousPayload.self_link = maliciousPayload;

    //     const result = xalor.rename<'USER_TEST', 'flatten'>({
    //       data: maliciousPayload,
    //     });

    //     logEngineTrace({
    //       enabled: TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_SEVEN.log,
    //       mode: 'rename',
    //       operation: 'Deep Symmetrical Collection Key Remapping',
    //       target: 'DEEPLY_NESTED_STORE',
    //       behavior:
    //         'Symmetrically stepping inside collections to remap properties at nested levels.',
    //       output: result,
    //     });
    //     expect(result).toEqual({
    //       id: null,
    //       username: 'NullUser',
    //       active: false,
    //     });
    //   });
    // }
    if (TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_EIGHT.run) {
      it('🛡️ [STRESS TEST] should intercept deeply nested cyclic loop references across renamed object tracks without crashing', () => {
        type TCyclicAlien = { tracking_id: number; child_node: any };

        const maliciousPayload: TCyclicAlien = {
          tracking_id: 888,
          child_node: null,
        };
        // Forge an infinite memory back-reference loop path
        maliciousPayload.child_node = maliciousPayload;

        // Seed a temporary dynamic schema blueprint shortcut inside memory to trace objects loop paths
        const result = xalor.rename<'USER_TEST'>({
          data: maliciousPayload,
          mappings: { tracking_id: 'id', child_node: 'username' }, // Map loop to internal spots
        }) as any;
        logEngineTrace({
          enabled: TEST_CONFIG_RENAME_MODE.RENAME_MODE_TEST_EIGHT.log,
          mode: 'rename',
          operation: 'Deep Symmetrical Collection Key Remapping',
          target: 'DEEPLY_NESTED_STORE',
          behavior:
            'Symmetrically stepping inside collections to remap properties at nested levels.',
          output: result,
        });
        expect(result.id).toBe(888);
        // The back-reference pointer link must map exactly back onto your clean root instance reference!
        expect(result.username).toBe(result);
      });
    }
  });
});
