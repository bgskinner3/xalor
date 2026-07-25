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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'number' },
      },
      username: {
        name: 'username',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'string', maxLength: 25 },
      },
      active: {
        name: 'active',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'boolean' },
      },
    },
  },
  USER_TEST_V1_ANCESTOR: {
    kind: 'object',
    properties: {
      id: {
        name: 'id',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'number' },
      },
      username: {
        name: 'username',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'string' },
      },
    },
  },
  // ============================================================================
  // 🛡️ SECURITY & CONFIG CAP BOUNDARY TESTS (The Final Hardening Pass)
  // ============================================================================

  // 🛡️ EXTRA BLUEPRINT 1: PROTOTYPE POLLUTION DEFENSE
  // Structural blueprint containing known keys to cross-verify toxic __proto__ injection dropouts.
  POISON_POLLUTION_TEST: {
    kind: 'object' as const,
    properties: {
      id: {
        name: 'id',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive' as const, type: 'number' as const },
      },
    },
  },

  // 🛡️ EXTRA BLUEPRINT 2: CUSTOM CLASS PROTO_CHAIN INHERITANCE
  // Confirms that custom constructor definitions and method access blocks survive purification loops.
  CLASS_INHERITANCE_TEST: {
    kind: 'object' as const,
    properties: {
      title: {
        name: 'title',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive' as const, type: 'string' as const },
      },
    },
  },

  // 🛡️ EXTRA BLUEPRINT 3: RADICAL CONFIG BOUNDARY TRUNCATION
  // Validates that oversized payloads are truncated safely using internal config constraints.
  BOUNDARY_LIMIT_TEST: {
    kind: 'object' as const,
    properties: {
      items: {
        name: 'items',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'array' as const,
          minLength: 0,
          hasRest: true,
          items: { kind: 'primitive' as const, type: 'number' as const },
        },
      },
    },
  },
  STORE_ORDER_V1_ANCESTOR: {
    kind: 'object',
    properties: {
      orderId: {
        name: 'orderId',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'string' },
      },
      legacySKU: {
        name: 'legacySKU',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'string' },
      },
      legacyQty: {
        name: 'legacyQty',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'number' },
      },
      deprecatedTelemetryId: {
        name: 'deprecatedTelemetryId',
        optional: true,
        requiresKeyPresence: false,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'string' },
      },
    },
  },

  BROKEN_REF_TEST: {
    kind: 'object',
    properties: {
      badLink: {
        name: 'badLink',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'reference',
          name: 'MISSING_TARGET_KEY', // Missing from Vault lookup cache maps
        },
      },
    },
  },
  // ============================================================================
  // 🔒 STRICT OBJECTS (Enforces Extra Property Rejection Guards)
  // ============================================================================
  STRICT_OBJECT_TEST: {
    kind: 'object',
    strict: true, // Evaluated by validateObject to activate extra-property scanning loops
    properties: {
      coreId: {
        name: 'coreId',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'string' },
      },
      rank: {
        name: 'rank',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'number' },
      },
    },
  },

  // ============================================================================
  // 🛑 TUPLE BOUNDS (Enforces Index Positional Type Configurations)
  // Sequence Contract: [string, number, boolean]
  // ============================================================================
  TUPLE_BOUNDS_TEST: {
    kind: 'object',
    properties: {
      sequence: {
        name: 'sequence',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'array',
          minLength: 3, // Locked tuple length configuration boundary
          hasRest: false,
          // Since tuples contain variant types per positional offset,
          // we use your schema's elementShapes array mapping matrix.
          elementShapes: [
            { kind: 'primitive', type: 'string' },
            { kind: 'primitive', type: 'number' },
            { kind: 'primitive', type: 'boolean' },
          ],
          // items serves as the fallback tracker or empty never type block
          items: { kind: 'primitive', type: 'never' },
        },
      },
    },
  },
  TRANSACTION: {
    kind: 'object',
    properties: {
      id: {
        name: 'id',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'primitive',
          type: 'string',
        },
      },

      amount: {
        name: 'amount',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'primitive',
          type: 'number',
        },
      },

      currency: {
        name: 'currency',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'string' },
      },
      items: {
        name: 'items',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
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
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
                shape: { kind: 'primitive', type: 'string' },
              },
              quantity: {
                name: 'quantity',
                optional: false,
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'string' },
      },
      items: {
        name: 'items',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
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
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
                shape: { kind: 'primitive', type: 'string' },
              },
              quantity: {
                name: 'quantity',
                optional: false,
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
                shape: { kind: 'primitive', type: 'number' },
              },
              logistics: {
                name: 'logistics',
                optional: false,
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
                shape: {
                  kind: 'object',
                  properties: {
                    warehouseCode: {
                      name: 'warehouseCode',
                      optional: false,
                      requiresKeyPresence: true,
                      allowsExplicitUndefined: false,
                      shape: { kind: 'primitive', type: 'string' },
                    },
                    dimensions: {
                      name: 'dimensions',
                      optional: false,
                      requiresKeyPresence: true,
                      allowsExplicitUndefined: false,
                      shape: {
                        kind: 'object',
                        properties: {
                          weight: {
                            name: 'weight',
                            optional: false,
                            requiresKeyPresence: true,
                            allowsExplicitUndefined: false,
                            shape: { kind: 'primitive', type: 'number' },
                          },
                          fragile: {
                            name: 'fragile',
                            optional: false,
                            requiresKeyPresence: true,
                            allowsExplicitUndefined: false,
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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      optionalMeta: {
        name: 'optionalMeta',
        optional: true,
        shape: { kind: 'primitive', type: 'string' },
        requiresKeyPresence: false,
        allowsExplicitUndefined: false,
      },
      optionalData: {
        name: 'optionalData',
        optional: true,
        requiresKeyPresence: false,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'object',
          properties: {
            nestedFlag: {
              name: 'nestedFlag',
              optional: false,
              shape: { kind: 'primitive', type: 'boolean' },
              requiresKeyPresence: true,
              allowsExplicitUndefined: false,
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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
    },
  },

  BRANDED_TYPE_TEST: {
    kind: 'object',
    properties: {
      userId: {
        name: 'userId',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'branded',
          name: 'userId', // The identifier string used by the compiler telemetry pass
          base: {
            kind: 'primitive',
            type: 'string', // The underlying structural base data atom primitive
          },
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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'number' },
      },
      profileRef: {
        name: 'profileRef',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'number' },
      },
      selfRef: {
        name: 'selfRef',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'reference', name: 'CIRCULAR_DEPTH_TEST' },
      },
    },
  },
  CIRCULAR_DEPTH_TEST_CAST: {
    kind: 'object',
    properties: {
      id: {
        name: 'id',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: { kind: 'primitive', type: 'number' },
      },
      selfRef: {
        name: 'selfRef',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      regExpVal: {
        name: 'regExpVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'RegExp' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },

      // === Collections ===
      mapVal: {
        name: 'mapVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Map' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      setVal: {
        name: 'setVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Set' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      weakMapVal: {
        name: 'weakMapVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'WeakMap' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      weakSetVal: {
        name: 'weakSetVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'WeakSet' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },

      // === Web Platform Data Frames ===
      urlVal: {
        name: 'urlVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'URL' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      urlParamsVal: {
        name: 'urlParamsVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'URLSearchParams' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      headersVal: {
        name: 'headersVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Headers' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      requestVal: {
        name: 'requestVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Request' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      responseVal: {
        name: 'responseVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Response' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      blobVal: {
        name: 'blobVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Blob' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      fileVal: {
        name: 'fileVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'File' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },

      // === Binary Data & Typed Array Buffers ===
      arrayBufferVal: {
        name: 'arrayBufferVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'ArrayBuffer' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      dataViewVal: {
        name: 'dataViewVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'DataView' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      int8ArrayVal: {
        name: 'int8ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Int8Array' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      uint8ArrayVal: {
        name: 'uint8ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Uint8Array' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      uint8ClampedArrayVal: {
        name: 'uint8ClampedArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Uint8ClampedArray' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      int16ArrayVal: {
        name: 'int16ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Int16Array' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      uint16ArrayVal: {
        name: 'uint16ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Uint16Array' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      int32ArrayVal: {
        name: 'int32ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Int32Array' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      uint32ArrayVal: {
        name: 'uint32ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Uint32Array' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      float32ArrayVal: {
        name: 'float32ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Float32Array' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      float64ArrayVal: {
        name: 'float64ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Float64Array' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      bigInt64ArrayVal: {
        name: 'bigInt64ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'BigInt64Array' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      bigUint64ArrayVal: {
        name: 'bigUint64ArrayVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'BigUint64Array' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },

      // === Async & Streams ===
      promiseVal: {
        name: 'promiseVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'Promise' },
        requiresKeyPresence: true,

        allowsExplicitUndefined: false,
      },
      readableStreamVal: {
        name: 'readableStreamVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'ReadableStream' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      writableStreamVal: {
        name: 'writableStreamVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'WritableStream' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      transformStreamVal: {
        name: 'transformStreamVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'TransformStream' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
    },
  },
  COLLIDING_INTERSECTION_TEST_V2: {
    kind: 'object' as const,
    properties: {
      conflictField: {
        name: 'conflictField',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'union' as const,
          values: [
            { kind: 'primitive' as const, type: 'string' as const },
            { kind: 'primitive' as const, type: 'number' as const },
          ],
        },
      },
    },
  },
  // COLLIDING_INTERSECTION_TEST: {
  //   kind: 'intersection',
  //   values: [
  //     {
  //       kind: 'object',
  //       properties: {
  //         conflictField: {
  //           name: 'conflictField',
  //           optional: false,
  //           requiresKeyPresence: true,
  //           allowsExplicitUndefined: false,
  //           shape: { kind: 'primitive', type: 'string' }, // Branch A demands a string type skeleton
  //         },
  //       },
  //     },
  //     {
  //       kind: 'object',
  //       properties: {
  //         conflictField: {
  //           name: 'conflictField',
  //           optional: false,
  //           requiresKeyPresence: true,
  //           allowsExplicitUndefined: false,
  //           shape: { kind: 'primitive', type: 'number' }, // Branch B demands a numeric type skeleton
  //         },
  //       },
  //     },
  //   ],
  // },
  COLLIDING_INTERSECTION_TEST: {
    kind: 'intersection' as const,
    values: [
      {
        kind: 'object' as const,
        properties: {
          conflictField: {
            name: 'conflictField',
            optional: false,
            requiresKeyPresence: true,
            allowsExplicitUndefined: false,
            shape: { kind: 'primitive' as const, type: 'string' as const },
          },
        },
      },
      {
        kind: 'object' as const,
        properties: {
          conflictField: {
            name: 'conflictField',
            optional: false,
            requiresKeyPresence: true,
            allowsExplicitUndefined: false,
            shape: { kind: 'primitive' as const, type: 'number' as const },
          },
        },
      },
    ],
  },
  INFINITE_LOOP_TEST: {
    kind: 'object',
    properties: {
      selfRef: {
        name: 'selfRef',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'reference',
          name: 'INFINITE_LOOP_TEST', // Points straight back to itself unconditionally
        },
      },
    },
  },
  ADVANCED_COMPLEXITY_SHAPE_CLONE: {
    kind: 'object',
    properties: {
      userRole: {
        name: 'userRole',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
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
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
              },
              quantity: {
                name: 'quantity',
                optional: false,
                shape: { kind: 'primitive', type: 'number' },
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
              },
              logistics: {
                name: 'logistics',
                optional: false,
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
                shape: {
                  kind: 'object',
                  properties: {
                    warehouseCode: {
                      name: 'warehouseCode',
                      optional: false,
                      shape: { kind: 'primitive', type: 'string' },
                      requiresKeyPresence: true,
                      allowsExplicitUndefined: false,
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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      executePipeline: {
        name: 'executePipeline',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'function',
          parameters: [
            {
              name: 'inputData',
              optional: false,
              shape: { kind: 'primitive', type: 'string' },
              requiresKeyPresence: true,
              allowsExplicitUndefined: false,
            },
            {
              name: 'retryCount',
              optional: true,
              requiresKeyPresence: false,
              allowsExplicitUndefined: false,
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
  ADVANCED_COMPLEXITY_SHAPE: {
    kind: 'object',
    properties: {
      userRole: {
        name: 'userRole',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
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
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
              },
              quantity: {
                name: 'quantity',
                optional: false,
                shape: { kind: 'primitive', type: 'number' },
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
              },
              logistics: {
                name: 'logistics',
                optional: false,
                requiresKeyPresence: true,
                allowsExplicitUndefined: false,
                shape: {
                  kind: 'object',
                  properties: {
                    warehouseCode: {
                      name: 'warehouseCode',
                      optional: false,
                      shape: { kind: 'primitive', type: 'string' },
                      requiresKeyPresence: true,
                      allowsExplicitUndefined: false,
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
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      executePipeline: {
        name: 'executePipeline',
        optional: false,
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
        shape: {
          kind: 'function',
          parameters: [
            {
              name: 'inputData',
              optional: false,
              shape: { kind: 'primitive', type: 'string' },
              requiresKeyPresence: true,
              allowsExplicitUndefined: false,
            },
            {
              name: 'retryCount',
              optional: true,
              requiresKeyPresence: false,
              allowsExplicitUndefined: false,
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

  ADVANCED_COMPLEXITY_V1_ANCESTOR: {
    kind: 'object',
    properties: {
      legacyRoleString: {
        name: 'legacyRoleString',
        optional: false,
        shape: { kind: 'primitive', type: 'string' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
      transformStreamVal: {
        name: 'transformStreamVal',
        optional: false,
        shape: { kind: 'instanceof', name: 'TransformStream' },
        requiresKeyPresence: true,
        allowsExplicitUndefined: false,
      },
    },
  },
} as const satisfies Record<string, TSolidShape>;
