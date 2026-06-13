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
  ALL_PLATFORM_INSTANCES_SHAPE: {
    kind: 'object',
    properties: {
      // === Core JS Structural Objects ===
      dateVal: {
        name: 'dateVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Date' },
      },
      regExpVal: {
        name: 'regExpVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'RegExp' },
      },

      // === Collections ===
      mapVal: {
        name: 'mapVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Map' },
      },
      setVal: {
        name: 'setVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Set' },
      },
      weakMapVal: {
        name: 'weakMapVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'WeakMap' },
      },
      weakSetVal: {
        name: 'weakSetVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'WeakSet' },
      },

      // === Web Platform Data Frames ===
      urlVal: {
        name: 'urlVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'URL' },
      },
      urlParamsVal: {
        name: 'urlParamsVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'URLSearchParams' },
      },
      headersVal: {
        name: 'headersVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Headers' },
      },
      requestVal: {
        name: 'requestVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Request' },
      },
      responseVal: {
        name: 'responseVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Response' },
      },
      blobVal: {
        name: 'blobVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Blob' },
      },
      fileVal: {
        name: 'fileVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'File' },
      },

      // === Binary Data & Typed Array Buffers ===
      arrayBufferVal: {
        name: 'arrayBufferVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'ArrayBuffer' },
      },
      dataViewVal: {
        name: 'dataViewVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'DataView' },
      },
      int8ArrayVal: {
        name: 'int8ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Int8Array' },
      },
      uint8ArrayVal: {
        name: 'uint8ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Uint8Array' },
      },
      uint8ClampedArrayVal: {
        name: 'uint8ClampedArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Uint8ClampedArray' },
      },
      int16ArrayVal: {
        name: 'int16ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Int16Array' },
      },
      uint16ArrayVal: {
        name: 'uint16ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Uint16Array' },
      },
      int32ArrayVal: {
        name: 'int32ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Int32Array' },
      },
      uint32ArrayVal: {
        name: 'uint32ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Uint32Array' },
      },
      float32ArrayVal: {
        name: 'float32ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Float32Array' },
      },
      float64ArrayVal: {
        name: 'float64ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Float64Array' },
      },
      bigInt64ArrayVal: {
        name: 'bigInt64ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'BigInt64Array' },
      },
      bigUint64ArrayVal: {
        name: 'bigUint64ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'BigUint64Array' },
      },

      // === Async & Streams ===
      promiseVal: {
        name: 'promiseVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Promise' },
      },
      readableStreamVal: {
        name: 'readableStreamVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'ReadableStream' },
      },
      writableStreamVal: {
        name: 'writableStreamVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'WritableStream' },
      },
      transformStreamVal: {
        name: 'transformStreamVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'TransformStream' },
      },
    },
  },
  ADVANCED_COMPLEXITY_SHAPE: {
    kind: 'object',
    properties: {
      userRole: {
        name: 'userRole',
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
                  },
                },
              },
            },
          },
        },
      },
      transformStreamVal: {
        name: 'transformStreamVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'TransformStream' },
      },
      executePipeline: {
        name: 'executePipeline',
        optional: false,
        shape: {
          kind: 'function',
          parameters: [
            {
              name: 'inputData',
              optional: false,
              shape: { kind: 'primitive', type: 'string' },
            },
            {
              name: 'retryCount',
              optional: true,
              shape: { kind: 'primitive', type: 'number' },
            },
          ],
          returnType: {
            kind: 'instanceof',
            name: 'Promise',
          },
        },
      },
    },
  },
} as const satisfies Record<string, TSolidShape>;
