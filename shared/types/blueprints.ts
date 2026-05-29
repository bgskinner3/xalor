import type { TSolidShapePrimitiveKeys } from './const-types';

/**
 * TSolidShape
 *
 * Foundational mapping of blueprint vault
 *
 * @see {@link GlobalRootTypeDocs.TSolidShape  }
 */
export type TSolidShape =
  | /* prettier-ignore */ { readonly kind: 'primitive'; readonly type: TSolidShapePrimitiveKeys; readonly maxLength?: number }
  | /* prettier-ignore */ { readonly kind: 'literal'; readonly type: 'string' | 'number' | 'boolean'; readonly value?: string | number | boolean }
  | /* prettier-ignore */ { readonly kind: 'union'; readonly values: readonly TSolidShape[] }
  | /* prettier-ignore */ { readonly kind: 'branded'; readonly name: string; readonly base: TSolidShape }
  | /* prettier-ignore */ { readonly kind: 'object'; readonly properties: Readonly<Record<string, TSolidObjectRawShape>> }
  | /* prettier-ignore */ { readonly kind: 'array'; readonly items: TSolidShape; readonly elementShapes?: readonly TSolidShape[]; readonly minLength: number; readonly hasRest: boolean; }
  | /* prettier-ignore */ { readonly kind: 'reference'; readonly name: string };
// | /* prettier-ignore */ { kind: 'tuple'; elementShapes: TSolidShape[]; minLength: number; hasRest: boolean; };

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
