import type { TSolidShapePrimitiveKeys } from './const-types';

/**
 * TSolidShape
 *
 * Foundational mapping of blueprint vault
 *
 * @see {@link GlobalRootTypeDocs.TSolidShape  }
 */
export type TSolidShape =
  | /* prettier-ignore */ { kind: 'primitive'; type: TSolidShapePrimitiveKeys }
  | /* prettier-ignore */ { kind: 'literal'; value: string | number | boolean }
  | /* prettier-ignore */ { kind: 'union'; values: TSolidShape[] }
  | /* prettier-ignore */ { kind: 'intersection'; parts: TSolidShape[] }
  | /* prettier-ignore */ { kind: 'branded'; name: string; base: TSolidShape }
  | /* prettier-ignore */ { kind: 'object'; properties: Record<string, TSolidObjectRawShape> }
  | /* prettier-ignore */ { kind: 'array'; items: TSolidShape; elementShapes?: TSolidShape[]; minLength?: number; hasRest?: boolean; }
  | /* prettier-ignore */ { kind: 'reference'; name: string };
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
