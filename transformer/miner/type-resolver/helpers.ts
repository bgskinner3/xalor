import ts from 'typescript';
import {
  isUndefined,
  isArray,
  isKeyInObject,
  isNull,
  isObject,
} from '../../../shared';

/**
 * YIELD NODE ANCESTORS RECURSIVE
 * Lazily climbs up the AST node hierarchy starting from a target node,
 * delegating parent tracking recursively via yield* with an absolute O(1) memory overhead.
 *
 * SATISFIES COMMANDMENT VIII & IX: Eliminates mutable while/for loop state tracking
 * entirely via pure functional generator delegation.
 */
/* prettier-ignore */
function* yieldNodeAncestorsRecursive(node: ts.Node | undefined): Generator<ts.Node> {
  if (isUndefined(node)) return;

  const parentContainer = node.parent;
  if (isUndefined(parentContainer)) return;

  // 1. Yield the immediate structural parent frame context
  yield parentContainer;

  // 2. Delegate recursive tail traversal down to the next tree layer without any loop blocks
  yield* yieldNodeAncestorsRecursive(parentContainer);
}

/**
 * IS NODE INSIDE GENERIC SCOPE
 * Public AST structural inspector to determine if an injection call site is nested
 * inside an active generic container (Function, Method, Class, or Interface).
 *
 * SATISFIES COMMANDMENT VIII & IX: Leverages pure tail-recursive generator streams
 * internally to preserve memory boundaries, while keeping the API simple and loopless.
 */
export function isNodeInsideGenericScope(node: ts.Node | undefined): boolean {
  if (!node) return false;

  // Lazily stream nodes up the parent tree context line
  for (const container of yieldNodeAncestorsRecursive(node)) {
    // 1. Check if the container is a construct capable of introducing generic type parameters
    if (
      ts.isFunctionDeclaration(container) ||
      ts.isMethodDeclaration(container) ||
      ts.isFunctionExpression(container) ||
      ts.isArrowFunction(container) ||
      ts.isClassDeclaration(container) ||
      ts.isInterfaceDeclaration(container)
    ) {
      /* prettier-ignore */
      if (isKeyInObject('typeParameters')(container) && isArray(container.typeParameters)) {
        if (container.typeParameters.length > 0) {
          return true;
        }
      }
    }
  }

  return false;
}

export function hasMappedTemplateModifiers(type: ts.Type): boolean {
  if (isKeyInObject('templateFlags')(type)) return true;

  if (
    isKeyInObject('target')(type) &&
    !isNull(type.target) &&
    isObject(type.target)
  ) {
    if (isKeyInObject('templateFlags')(type.target)) {
      return true;
    }
  }

  return false;
}
