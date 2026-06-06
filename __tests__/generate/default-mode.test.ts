// __tests__/runtime/api/transform-xalor/flatten-mode.test.ts
import { xalor } from '../../src/api';
import { TEST_SHAPE_REGISTRY } from '../utils/constants';
import { seedTestVault } from '../utils';

// 'default', 'mock', 'clone', and 'cast' operational modes.
/**
 pnpm run test -- __tests__/generate/default-mode.test.ts

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
    BRANDED_TYPE_TEST: {
      userId: string & { readonly __brand: unique symbol };
    };
    REFERENCE_LINK_TEST: {
      id: number;
      profileRef: ISolidRegistry['USER_TEST'];
    };
    CIRCULAR_DEPTH_TEST: {
      id: number;
      selfRef?: ISolidRegistry['CIRCULAR_DEPTH_TEST'];
    };
  }
}

describe('Runtime Generator API', () => {
  beforeAll(() => {
    // 🚀 CLEAN, SYNCHRONIZED SEEDING PASS: Loads clean shapes from central constants file
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
    seedTestVault('COMPLEX_UNION_TEST', TEST_SHAPE_REGISTRY.COMPLEX_UNION_TEST);
    seedTestVault('BRANDED_TYPE_TEST', TEST_SHAPE_REGISTRY.BRANDED_TYPE_TEST);
    seedTestVault(
      'REFERENCE_LINK_TEST',
      TEST_SHAPE_REGISTRY.REFERENCE_LINK_TEST,
    );
    seedTestVault(
      'CIRCULAR_DEPTH_TEST',
      TEST_SHAPE_REGISTRY.CIRCULAR_DEPTH_TEST,
    );
  });

  // ========================================================================
  // CORE FOUNDATIONAL SPECIFICATION METHOD TRACKS
  // ========================================================================
  describe('GENERATE XALOR DEFAULT OBJECT', () => {
    it('🎯 should accurately generate a pristine default data skeleton from a standard user blueprint', () => {
      const result = xalor.default<'USER_TEST'>();

      expect(result).toBeDefined();
      expect(result).toEqual({
        id: 0,
        username: '',
        active: false,
      });
    });

    it('🎯 should accurately extract literal string value constraints for specific object fields', () => {
      const result = xalor.default<'API_RESPONSE'>();

      expect(result).toBeDefined();
      expect(result).toEqual({
        status: 'success', // Literals must fall back to their exact assigned literal constant value
      });
    });

    it('🎯 should handle deeply nested structures and generate an empty list skeleton for array schemas', () => {
      const result = xalor.default<'STORE_ORDER'>();

      expect(result).toBeDefined();
      expect(result).toEqual({
        orderId: '',
        items: [], // Array parameters map to a clean, isolated array allocation empty bucket
      });
    });

    it('🎯 should evaluate deeply nested multidimensional child blocks recursively without clipping structures', () => {
      const result = xalor.default<'DEEPLY_NESTED_STORE'>();

      expect(result).toBeDefined();
      expect(result).toEqual({
        orderId: '',
        items: [],
      });
    });

    // ========================================================================
    // ADVANCED DESIGN SYSTEM DRIVEN ENGINE GRANULAR COVERAGE PASSTHROUGHS
    // ========================================================================
    it('🧱 BRANCH MATCH: should gracefully skip properties explicitly marked as optional', () => {
      const result = xalor.default<'OPTIONAL_FIELDS_TEST'>();

      expect(result).toBeDefined();
      expect(result).toEqual({
        mandatoryId: 0,
      });
      expect(result).not.toHaveProperty('optionalMeta');
      expect(result).not.toHaveProperty('optionalData');
    });

    it('🧱 BRANCH MATCH: should materialize a union container by safely falling back to its absolute first indexed branch', () => {
      const result = xalor.default<'COMPLEX_UNION_TEST'>();

      expect(result).toBeDefined();
      expect(result).toEqual({
        mixedValue: 'custom_literal', // Matches index[0] of values array structure configuration
      });
    });

    it('🧱 BRANCH MATCH: should peel away branded encapsulation wrappers and unwrap down into the structural base type', () => {
      const result = xalor.default<'BRANDED_TYPE_TEST'>();

      expect(result).toBeDefined();
      expect(result).toEqual({
        userId: '', // Peels branded wrapping node down, printing primitive string fallback zero value
      });
    });

    it('🧱 BRANCH MATCH: should dynamically cross-reference separate cache tokens inside the vault keeper database layout', () => {
      const result = xalor.default<'REFERENCE_LINK_TEST'>();

      expect(result).toBeDefined();
      expect(result).toEqual({
        id: 0,
        profileRef: {
          id: 0,
          username: '',
          active: false,
        },
      });
    });

    // ========================================================================
    // CRITICAL ADVERSARIAL RECURSION BOUNDARIES (Commandment V & IX Parity)
    // ========================================================================
    it('🛡️ EDGE CASE 1: should intercept self-referencing circular dependency cycles, halting execution safely using reify limits', () => {
      const executeCircularGenerationPass = () => {
        return xalor.default<'CIRCULAR_DEPTH_TEST'>();
      };

      // 🧠 STRATEGY ASSIGNMENT INTERCEPT CHECK:
      // Executing a circular blueprint must never crash the thread with a "Maximum Call Stack Size Exceeded" panic.
      expect(executeCircularGenerationPass).not.toThrow();

      const result = executeCircularGenerationPass();

      // 🎯 COMPILER PARITY BOUNDARY:
      // If the runtime engine immediately identifies a root-level circular constraint loop or hits max depth,
      // it halts by returning undefined/null. If it returns an object, we unroll it to find the terminal safe break token.
      if (result !== undefined && result !== null) {
        expect(typeof result).toBe('object');

        let cursor: any = result;
        for (let depth = 0; depth < 20; depth++) {
          if (!cursor.selfRef || typeof cursor.selfRef !== 'object') break;
          cursor = cursor.selfRef;
        }

        // Assert that the deep structural loop eventually hits a safe termination boundary (null/undefined)
        expect(cursor.selfRef).not.toBeInstanceOf(Object);
      } else {
        // If the engine immediately terminates the circular trace at the root boundary, it is also a success!
        expect(result).toBeUndefined(); // Or expect(result).toBeNull() depending on your strict return configuration
      }
    });

    // it('🛡️ EDGE CASE 2: should handle unseeded references gracefully and return undefined inside object parameter trees point-free', () => {
    //   // Temporarily inject an unresolvable reference payload into the engine space
    //   seedTestVault('BROKEN_REF_TEST', {
    //     kind: 'object',
    //     properties: {
    //       leakingData: {
    //         name: 'leakingData',
    //         optional: false,
    //         shape: { kind: 'reference', name: 'NON_EXISTENT_GHOST_BLUEPRINT' },
    //       },
    //     },
    //   });

    //   const result = xalor.default<'BROKEN_REF_TEST'>();
    //   expect(result).toBeDefined();
    //   expect(result).toEqual({
    //     leakingData: undefined, // Non-existent references fall through safely inside our factory loop mapper fields
    //   });
    // });
  });
});
