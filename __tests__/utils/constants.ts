import type { TSolidShape } from '../../shared';

export const UTIL_CONFIG_OPTIONS = {
  fileName: 'test.ts',
  // mineTransformation
  programLib: 'lib.esnext.d.ts',
} as const;

/**
 * 🧱 TEST_SHAPE_REGISTRY
 */
export const TEST_SHAPE_REGISTRY = {
  STANDARD_USER: {
    kind: 'object',
    properties: {
      id: {
        name: 'id',
        optional: false,
        shape: { kind: 'primitive', type: 'number' },
      },
      username: {
        name: 'username',
        optional: false,
        shape: { kind: 'primitive', type: 'string' },
      },
      active: {
        name: 'active',
        optional: false,
        shape: { kind: 'primitive', type: 'boolean' },
      },
    },
  },

  COMPLEX_ORDER: {
    kind: 'object',
    properties: {
      orderId: {
        name: 'orderId',
        optional: false,
        shape: { kind: 'primitive', type: 'string' },
      },
      items: {
        name: 'items',
        optional: false,
        shape: {
          kind: 'array',
          minLength: 0,
          hasRest: true,
          items: {
            kind: 'object',
            properties: {
              SKU: {
                name: 'SKU',
                optional: false,
                shape: { kind: 'primitive', type: 'string' },
              },
              quantity: {
                name: 'quantity',
                optional: false,
                shape: { kind: 'primitive', type: 'number' },
              },
            },
          },
        },
      },
    },
  },

  UNION_RESPONSE: {
    kind: 'object',
    properties: {
      status: {
        name: 'status',
        optional: false,
        shape: {
          kind: 'union',
          values: [
            { kind: 'literal', type: 'string', value: 'success' },
            { kind: 'literal', type: 'string', value: 'failed' },
            { kind: 'primitive', type: 'number' },
          ],
        },
      },
    },
  },

  DEEPLY_NESTED_STORE: {
    kind: 'object',
    properties: {
      orderId: {
        name: 'orderId',
        optional: false,
        shape: { kind: 'primitive', type: 'string' },
      },
      items: {
        name: 'items',
        optional: false,
        shape: {
          kind: 'array',
          minLength: 0,
          hasRest: true,
          items: {
            kind: 'object',
            properties: {
              SKU: {
                name: 'SKU',
                optional: false,
                shape: { kind: 'primitive', type: 'string' },
              },
              quantity: {
                name: 'quantity',
                optional: false,
                shape: { kind: 'primitive', type: 'number' },
              },
              logistics: {
                name: 'logistics',
                optional: false,
                shape: {
                  kind: 'object',
                  properties: {
                    warehouseCode: {
                      name: 'warehouseCode',
                      optional: false,
                      shape: { kind: 'primitive', type: 'string' },
                    },
                    dimensions: {
                      name: 'dimensions',
                      optional: false,
                      shape: {
                        kind: 'object',
                        properties: {
                          weight: {
                            name: 'weight',
                            optional: false,
                            shape: { kind: 'primitive', type: 'number' },
                          },
                          fragile: {
                            name: 'fragile',
                            optional: false,
                            shape: { kind: 'primitive', type: 'boolean' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies Record<string, TSolidShape>;
