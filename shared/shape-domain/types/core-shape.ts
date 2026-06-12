// /shared/shape-domain/types.ts
import {
  IS_SOLID_SHAPE_KINDS_CONFIG,
  SOLID_SHAPE_PRIMITIVE_KEYS,
  SOLID_SHAPE_LITERAL_KEYS,
} from '../constants';
import type { InstanceRegistryKey } from './instance';
// ===============================================================
// ===============================================================
// SOLID TYPE SYSTEM — CORE CONSTANTS + DERIVED TYPES
// ===============================================================
// ===============================================================

/**
 * TSolidShapeKinds
 *
 * The exhaustive grammar of all structural AST node types
 * supported by the TSolid compiler system.
 * @see {@link FoundationalTypesDocs.TSolidShapeKinds}
 */
/* prettier-ignore */ export type TSolidShapeKinds = keyof typeof IS_SOLID_SHAPE_KINDS_CONFIG;
/**
 * TSolidShapePrimitiveKeys
 * List of All primitive key types in our Transformer
 * @see {@link FoundationalTypesDocs.TSolidShapePrimitiveKeys}
 */
/* prettier-ignore */ export type TSolidShapePrimitiveKeys = (typeof SOLID_SHAPE_PRIMITIVE_KEYS)[number];
/* prettier-ignore */ export type TSolidShapeLiteralKeys = (typeof SOLID_SHAPE_LITERAL_KEYS)[number];
// ===============================================================
// ===============================================================
// 🔷 AST CORE TYPE DEFINITIONS
// ===============================================================
// ===============================================================
/**
 * TSolidShape
 * // instanceof, intersection, function
 * Foundational mapping of blueprint vault
 *
 * @see {@link GlobalRootTypeDocs.TSolidShape}
 */
export type TSolidShape =
  | /* prettier-ignore */ { readonly kind: 'primitive'; readonly type: TSolidShapePrimitiveKeys; readonly maxLength?: number; }
  | /* prettier-ignore */ { readonly kind: 'literal'; readonly type: 'string' | 'number' | 'boolean'; readonly value: string | number | boolean; }
  | /* prettier-ignore */ { readonly kind: 'union'; readonly values: readonly TSolidShape[]; }
  | /* prettier-ignore */ { readonly kind: 'intersection'; readonly values: readonly TSolidShape[]; }
  | /* prettier-ignore */ { readonly kind: 'object'; readonly properties: Readonly<Record<string, TSolidObjectRawShape>>; }
  | /* prettier-ignore */ { readonly kind: 'array'; readonly items: TSolidShape; readonly minLength: number; readonly hasRest: boolean; readonly elementShapes?: readonly TSolidShape[]; }
  | /* prettier-ignore */ { readonly kind: 'function'; readonly parameters: readonly TSolidObjectRawShape[]; readonly returnType: TSolidShape; }
  | /* prettier-ignore */ { readonly kind: 'branded'; readonly name: string; readonly base: TSolidShape; }
  | /* prettier-ignore */ { readonly kind: 'reference'; readonly name: string; }
  | /* prettier-ignore */ { readonly kind: 'instanceof'; readonly name: InstanceRegistryKey; };
//  ADDED =====  instanceof, intersection, function

// ===============================================================
// ===============================================================
// 🔷 OBJECT PROPERTY DESCRIPTOR
// ===============================================================
// ===============================================================
/**
 * TSolidObjectRawShape
 *
 * Represents the complete compiled descriptor matrix for a single property
 * nested within an object blueprint.
 *
 * @see {@link GlobalRootTypeDocs.TSolidObjectRawShape  }
 */
export type TSolidObjectRawShape = {
  shape: TSolidShape;
  optional: boolean;
  name: string;
  requiresKeyPresence?: boolean;
};
