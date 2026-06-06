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
  TRANSACTION: {
    kind: 'object',
    properties: {
      id: {
        name: 'id',
        optional: false,
        shape: {
          kind: 'primitive',
          type: 'string',
        },
      },

      amount: {
        name: 'amount',
        optional: false,
        shape: {
          kind: 'primitive',
          type: 'number',
        },
      },

      currency: {
        name: 'currency',
        optional: false,
        shape: {
          kind: 'union',
          values: [
            {
              kind: 'literal',
              type: 'string',
              value: 'USD',
            },
            {
              kind: 'literal',
              type: 'string',
              value: 'EUR',
            },
            {
              kind: 'literal',
              type: 'string',
              value: 'GBP',
            },
          ],
        },
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

  OPTIONAL_FIELDS_TEST: {
    kind: 'object',
    properties: {
      mandatoryId: {
        name: 'mandatoryId',
        optional: false,
        shape: { kind: 'primitive', type: 'number' },
      },
      optionalMeta: {
        name: 'optionalMeta',
        optional: true,
        shape: { kind: 'primitive', type: 'string' },
      },
      optionalData: {
        name: 'optionalData',
        optional: true,
        shape: {
          kind: 'object',
          properties: {
            nestedFlag: {
              name: 'nestedFlag',
              optional: false,
              shape: { kind: 'primitive', type: 'boolean' },
            },
          },
        },
      },
    },
  },

  COMPLEX_UNION_TEST: {
    kind: 'object',
    properties: {
      mixedValue: {
        name: 'mixedValue',
        optional: false,
        shape: {
          kind: 'union',
          values: [
            // 🎯 FIXED: 'type' added to satisfy the literal kind blueprint contract
            { kind: 'literal', type: 'string', value: 'custom_literal' },
            { kind: 'primitive', type: 'number' },
            { kind: 'primitive', type: 'boolean' },
          ],
        },
      },
    },
  },

  BRANDED_TYPE_TEST: {
    kind: 'object',
    properties: {
      userId: {
        name: 'userId',
        optional: false,
        shape: {
          // 🎯 EXACT ALIGNMENT PASS: Fulfills both 'name' and 'base' criteria flawlessly
          kind: 'branded',
          name: 'TUserId',
          base: { kind: 'primitive', type: 'string' },
        },
      },
    },
  },

  REFERENCE_LINK_TEST: {
    kind: 'object',
    properties: {
      id: {
        name: 'id',
        optional: false,
        shape: { kind: 'primitive', type: 'number' },
      },
      profileRef: {
        name: 'profileRef',
        optional: false,
        shape: { kind: 'reference', name: 'USER_TEST' },
      },
    },
  },

  CIRCULAR_DEPTH_TEST: {
    kind: 'object',
    properties: {
      id: {
        name: 'id',
        optional: false,
        shape: { kind: 'primitive', type: 'number' },
      },
      selfRef: {
        name: 'selfRef',
        optional: false,
        shape: { kind: 'reference', name: 'CIRCULAR_DEPTH_TEST' },
      },
    },
  },
} as const satisfies Record<string, TSolidShape>;
