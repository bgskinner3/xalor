// transformer/miner/spatial-identity.ts
import ts from 'typescript';
import { getFormattedPosition } from '../../utils';
import type { TInterfaceOrType } from '../../types';
import { xalorCentralContext } from '../../service';
/**
 * EXTRACT REGISTRATION TYPE ARGS (THE AST SLOT MINER)
 *
 * ROLE:
 * A high-velocity build-time utility used to parse a CallExpression's generic argument array
 * and extract the nominal metadata strings from the target type definitions.
 *
 * STRATEGY:
 * Safely inspects the `typeArguments` array of an active CallExpression node. If present and populated,
 * it pulls the raw textual tokens from the requested slot indices natively. This avoids running
 * expensive TypeChecker layout resolutions or graph traversals during background watch sweeps.
 */
export function extractRegistrationTypeArgs(callExpression: ts.CallExpression) {
  const typeArgs = callExpression.typeArguments;

  if (!typeArgs || typeArgs.length < 2) {
    return { firstSlotKey: undefined, secondSlotName: undefined };
  }

  const slotZeroNode = typeArgs[0];
  let firstSlotKey: string | undefined = undefined;

  if (
    ts.isLiteralTypeNode(slotZeroNode) &&
    ts.isStringLiteral(slotZeroNode.literal)
  ) {
    firstSlotKey = slotZeroNode.literal.text;
  } else if (
    ts.isTypeReferenceNode(slotZeroNode) &&
    ts.isIdentifier(slotZeroNode.typeName)
  ) {
    firstSlotKey = slotZeroNode.typeName.text;
  }

  const slotOneNode = typeArgs[1];
  let secondSlotName: string | undefined = undefined;

  if (
    ts.isTypeReferenceNode(slotOneNode) &&
    ts.isIdentifier(slotOneNode.typeName)
  ) {
    secondSlotName = slotOneNode.typeName.text;
  }

  return {
    firstSlotKey,
    secondSlotName,
  };
}

function generateStaticSyntaxAnchor(node: ts.Node): string {
  const absoluteCharacterOffset = node.getStart();

  return `#call:${absoluteCharacterOffset}`;
}

/**
 *
 * @see {@link TransformerDocs.resolveSpatialAndExportMeta}
 */
export function resolveSpatialAndExportMeta({
  node,
  sourceFile,
  shapeType,
  checker,
  callNode,
}: TInterfaceOrType) {
  const { keyHasExportedType } = xalorCentralContext.context;
  const nodeStartPosition = node.getStart(sourceFile);
  const area = getFormattedPosition(sourceFile, nodeStartPosition);

  const symbol = shapeType.aliasSymbol || shapeType.getSymbol();
  let symbolName = 'unknown';

  if (symbol) {
    const name = symbol.getName();
    const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);
    const isExported = !!sourceFileSymbol?.exports?.has(symbol.escapedName);
    symbolName = isExported ? name : 'unknown';

    if (isExported) keyHasExportedType.add(symbolName);
  }

  if (symbolName === 'unknown' && callNode !== undefined) {
    const { secondSlotName } = extractRegistrationTypeArgs(callNode);
    if (secondSlotName !== undefined) {
      symbolName = secondSlotName;
    }
  }
  const anchor = generateStaticSyntaxAnchor(node);
  return {
    area,
    symbolName,
    anchor,
  };
}
