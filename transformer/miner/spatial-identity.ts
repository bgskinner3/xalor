// transformer/miner/ghost-structures.ts
import ts from 'typescript';
import {
  isTypeReference,
  isObjectTypeGuard,
  getFormattedPosition,
} from '../utils';
import type {
  TPrintGhostStructure,
  TSpatialIdentity,
  TInterfaceOrType,
} from '../types';
import { xalorCentralContext } from '../service';

/**
 *
 * @see {@link TransformerDocs.printGhostStructure}
 */
export function printGhostStructure({
  type,
  checker,
  node,
}: TPrintGhostStructure): string {
  if (checker.isArrayType(type) && isTypeReference(type)) {
    const typeArgs = checker.getTypeArguments(type);

    // Verify layout length boundaries explicitly
    // to prevent multidimensional array metadata from collapsing into 'unknown[]'
    const targetItemType = typeArgs.length > 0 ? typeArgs[0] : undefined;

    const itemString = targetItemType
      ? printGhostStructure({ type: targetItemType, checker, node })
      : 'unknown';

    return `${itemString}[]`;
  }

  if (type.isClassOrInterface() || isObjectTypeGuard(type)) {
    const props = checker.getPropertiesOfType(type);
    let propertyStringBuffer = '';
    const propLen = props.length;

    // THE HARDENED OPERATOR OPTIMIZATION:
    // leverage array allocation pools with a primitive linear loop string builder.
    // This reduces runtime garbage collection overhead to near zero during rapid watcher saves.
    for (let i = 0; i < propLen; i++) {
      const p = props[i];
      if (p) {
        const pType = checker.getTypeOfSymbolAtLocation(p, node);
        const isOptional =
          (p.getFlags() & ts.SymbolFlags.Optional) !== 0 ? '?' : '';

        const structure = pType
          ? printGhostStructure({ type: pType, checker, node })
          : 'unknown';

        propertyStringBuffer += `${p.getName()}${isOptional}: ${structure}; `;
      }
    }

    return `{ ${propertyStringBuffer.trim()} }`;
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
  // Safe position resolution passing sourceFile explicitly to avoid Watch program pointer crashes
  const nodeStartPosition = node.getStart(sourceFile);

  const area = getFormattedPosition(sourceFile, nodeStartPosition);

  const symbol = shapeType.aliasSymbol || shapeType.getSymbol();
  let symbolName = 'unknown';

  if (symbol) {
    const name = symbol.getName();
    const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);

    // Safely check if the symbol's escaped name is an explicit member of the file's export map drawer
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
 * 🛰️ TOOLING GEAR: SEPARATE SEQUENCE ID GENERATOR
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
