// transformer/miner/spatial-identity.ts
import ts from 'typescript';
import {
  isTypeReference,
  isObjectTypeGuard,
  getFormattedPosition,
  isUnionType,
  isIntersectionType,
  isClassOrInterfaceType,
} from '../utils';
import type {
  TPrintGhostStructure,
  TSpatialIdentity,
  TInterfaceOrType,
} from '../types';
import { xalorCentralContext } from '../service';

/**
 * printGhostStructure
 * TOOLING GEAR: GHOST TYPE STRINGIFIE
 *
 * @see {@link TransformerDocs.printGhostStructure}
 */
export function printGhostStructure(params: TPrintGhostStructure): string {
  const { type, checker, node } = params;
  return executeUnrollPass(type, checker, node);
}

/**
 * executeUnrollPass
 * THE STATIC UNROLLING MACHINE
 *
 * ROLE:
 * Pure, stateless execution loop that unwinds shapes recursively on the stack
 * without instantiating temporary configuration objects on the heap.
 */
function executeUnrollPass(
  type: ts.Type,
  checker: ts.TypeChecker,
  node: ts.Node,
): string {
  if (checker.isArrayType(type) && isTypeReference(type)) {
    const typeArgs = checker.getTypeArguments(type);

    const itemString =
      typeArgs && typeArgs.length > 0
        ? executeUnrollPass(typeArgs[0], checker, node)
        : 'unknown';

    return `${itemString}[]`;
  }

  if (isUnionType(type)) {
    const constituents = type.types;
    const unionLen = constituents.length;
    const unionStringTokens: string[] = [];

    for (let i = 0; i < unionLen; i++) {
      const variant = constituents[i];
      if (variant) {
        unionStringTokens.push(executeUnrollPass(variant, checker, node));
      }
    }
    return unionStringTokens.join(' | ');
  }

  const isClassOrInterface = isClassOrInterfaceType(type);
  const isObject = isObjectTypeGuard(type);
  const isIntersection = isIntersectionType(type);

  if (isClassOrInterface || isObject || isIntersection) {
    const coreProperties = checker.getPropertiesOfType(type);
    const propLen = coreProperties.length;

    // Commandment VIII — Zero allocation immutable token buffering
    const structuralTokenBuffer: string[] = [];

    for (let i = 0; i < propLen; i++) {
      const p = coreProperties[i];
      if (p) {
        const pDeclaration = p.valueDeclaration || p.declarations?.[0];

        const pType = pDeclaration
          ? checker.getTypeOfSymbolAtLocation(p, pDeclaration)
          : checker.getDeclaredTypeOfSymbol(p);

        if (pType.getFlags() & ts.TypeFlags.Never) {
          continue;
        }

        const isOptional =
          (p.getFlags() & ts.SymbolFlags.Optional) !== 0 ? '?' : '';
        const structure = executeUnrollPass(pType, checker, node);

        structuralTokenBuffer.push(
          `${p.getName()}${isOptional}: ${structure};`,
        );
      }
    }

    return `{ ${structuralTokenBuffer.join(' ')} }`;
  }

  return checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation);
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
}: TInterfaceOrType) {
  const nodeStartPosition = node.getStart(sourceFile);

  const area = getFormattedPosition(sourceFile, nodeStartPosition);

  const symbol = shapeType.aliasSymbol || shapeType.getSymbol();
  let symbolName = 'unknown';

  if (symbol) {
    const name = symbol.getName();
    const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);

    const isExported = !!sourceFileSymbol?.exports?.has(symbol.escapedName);
    symbolName = isExported ? name : 'unknown';
  }

  return {
    area,
    symbolName,
  };
}
/**
 * anchorSequencerImplementation
 * TOOLING GEAR: SEPARATE SEQUENCE ID GENERATOR
 *
 * ROLE:
 * Generates a formatting-proof, index-based string that numbers function calls
 * sequentially from the top of a file to the bottom (e.g., "#call:1", "#call:2").
 *
 * HOW IT WORKS (EASY TO READ):
 * 1. It looks at the current file path.
 * 2. It checks how many target functions it has already seen in this file during this save pass.
 * 3. It increments that count by 1.
 * 4. It saves the new count back to your memory tracker.
 * 5. It strings them together to return a unique ID like: "src/index.ts#call:1".
 */
export function anchorSequencerImplementation(
  sourceFile: ts.SourceFile,
): string {
  return xalorCentralContext.getNextSequenceAnchor(sourceFile.fileName);
}

/**
 * GET SPATIAL IDENTITY (The GPS)
 *
 * @see {@link TransformerDocs.getSpatialIdentity}
 */
export function getSpatialIdentity(params: TInterfaceOrType): TSpatialIdentity {
  const { symbolName, area } = resolveSpatialAndExportMeta({ ...params });

  const { shapeType, checker, node, sourceFile } = params;

  const typeName = printGhostStructure({ type: shapeType, checker, node });

  const anchor = anchorSequencerImplementation(params.sourceFile);
  return {
    area,
    typeName,
    symbolName,
    anchor,
    filePath: sourceFile.fileName,
  };
}
