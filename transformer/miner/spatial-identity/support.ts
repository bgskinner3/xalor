// transformer/miner/spatial-identity.ts
import ts from 'typescript';
import { getFormattedPosition } from '../../utils';
import type { TInterfaceOrType } from '../../types';
import { xalorCentralContext } from '../../service';
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
