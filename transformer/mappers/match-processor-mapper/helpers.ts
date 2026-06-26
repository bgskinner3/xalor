import ts from 'typescript';

export function extractLiteralStringFromProperty(
  property: ts.ObjectLiteralElementLike,
  targetPropName: string,
): string | undefined {
  if (
    ts.isPropertyAssignment(property) &&
    ts.isIdentifier(property.name) &&
    property.name.text === targetPropName &&
    ts.isStringLiteral(property.initializer)
  ) {
    return property.initializer.text;
  }
  return undefined;
}
