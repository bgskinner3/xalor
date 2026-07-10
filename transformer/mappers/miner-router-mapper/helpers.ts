import type { CallExpression, TypeChecker } from 'typescript';
import type { InferPayloadByApiName, TRegisterRawPayload } from '../../types';

/**
 * Reusable utility to scrape out a single string-literal generic argument from index [0]
 * and dynamically compute the execution mode flavor directly from the fully qualified API name string.
 *
 * SYSTEM RULE:
 * Generic parameter slot [0] is ALWAYS only the database <KEY> string literal token.
 */
export function extractSingleKeyPayload<T extends string>(
  node: CallExpression,
  checker: TypeChecker,
  apiName: T,
): InferPayloadByApiName<T> {
  const typeArgs = node.typeArguments ?? [];
  let keyName: string | undefined;
  let mode: string | undefined;

  if (typeArgs.length >= 1) {
    const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
    if (keyType.isStringLiteral()) {
      keyName = keyType.value;
    }
  }

  const periodIndex = apiName.indexOf('.');
  if (periodIndex !== -1) {
    mode = apiName.slice(periodIndex + 1);
  }

  // TODO: FIX AS CSTING
  return {
    keyName,
    apiName,
    mode,
  } as unknown as InferPayloadByApiName<T>;
}

/**
 * Reusable utility to extract a registration key declaration and resolve its associated
 * TypeScript shape contract from the AST.
 *
 * SYSTEM RULES:
 * - Registration always resolves to the reserved API token: "xalor.register".
 * - Generic parameter slot [0] is ALWAYS only the database <KEY> string literal token.
 * - The returned payload contains both the literal key identity and the resolved
 *   TypeScript type information required by the vault registration pipeline.
 *
 */
export function extractRegistrationKeyPayload(
  node: CallExpression,
  checker: TypeChecker,
): TRegisterRawPayload | null {
  const typeArgs = node.typeArguments;
  const args = node.arguments;

  if (typeArgs && typeArgs.length >= 2) {
    const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
    const shapeType = checker.getTypeFromTypeNode(typeArgs[1]);
    if (!keyType.isStringLiteral()) return null;
    return {
      keyName: keyType.value,
      keyType,
      shapeType,
      apiName: 'xalor.register',
    };
  }

  if (typeArgs && typeArgs.length === 1 && args.length >= 1) {
    const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
    const shapeType = checker.getTypeAtLocation(args[0]);
    if (!keyType.isStringLiteral()) return null;
    return {
      keyName: keyType.value,
      keyType,
      shapeType,
      apiName: 'xalor.register',
    };
  }

  return null;
}
