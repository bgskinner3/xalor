// transformer/lifecycle/pipeline.ts
import ts from 'typescript';
import { theMiner } from '../miner';
import type { TVaultSyncPayload, TSolidVaultMap } from '../../shared';
import { visitNode } from 'typescript';
import { XalorRoutesService } from '../service';

/**
 * The AST Transformation Engine.
 *
 * @see {@link TransformerDocs.runMiningPass}
 */
export function runMiningPass(
  program: ts.Program,
  context: ts.TransformationContext,
  sourceFile: ts.SourceFile,
): ts.SourceFile {
  const visitor = theMiner({
    program,
    context,
    sourceFile,
  });
  // TODO: REMOVE AS
  return visitNode(sourceFile, visitor) as ts.SourceFile;
}

/**
 *  IS COMPILATION LOOP TERMINATED
 *
 * @see {@link TransformerDocs.isCompilationLoopTerminated}
 */
export function isCompilationLoopTerminated(
  file: ts.SourceFile,
  program: ts.Program,
  globalKeyRegistry: Map<string, TVaultSyncPayload>,
): boolean {
  const lifeCyclePaths = XalorRoutesService.resolveXalorLifecycle();
  const allFiles = program.getSourceFiles();
  const isLastFile = allFiles[allFiles.length - 1]?.fileName === file.fileName;

  return (
    isLastFile ||
    (lifeCyclePaths.isTestEnvironment && globalKeyRegistry.size > 0)
  );
}

/**
 *  INJECT TEST REIFIED BLUEPRINTS DIRECTLY INTO RAM
 *
 * @see {@link TransformerDocs.injectTestReifiedBlueprints}
 */
export function injectTestReifiedBlueprints(
  globalKeyRegistry: Map<string, TVaultSyncPayload>,
): void {
  if (!globalThis.__SOLID_VAULT__) {
    const rawMapVault: TSolidVaultMap = {
      driftTracking: new Map(),
      blueprints: new Map(),
      references: new Map(),
      manifest: new Map(),
      registry: new Map(),
      errors: new Map(),
      _isHydrated: false,
    };
    globalThis.__SOLID_VAULT__ = rawMapVault;
  }

  const vault = globalThis.__SOLID_VAULT__;

  if (vault && '_isHydrated' in vault) {
    globalKeyRegistry.forEach((meta, key) => {
      vault.blueprints.set(key, meta.shape);

      vault.manifest?.set(key, {
        area: meta.area,
        filePath: meta.filePath,
        anchor: meta.anchor,
      });

      vault.registry?.set(key, {
        symbolName: meta.symbolName ?? 'unknown',
        typeName: meta.typeName,
      });
    });

    vault._isHydrated = true;
  }
}
