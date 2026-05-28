import ts from 'typescript';
import { runMiningPass, persistenceGate } from '../lifecycle';
import { shouldProcessFile } from './resolvers';
// import { xalorCentralContext } from '../service';
type TMineFilePass = {
  program: ts.Program;
  context: ts.TransformationContext;
  sourceFile: ts.SourceFile;
  bridgeDir: string;
};

export function executeFileMiningPass({
  program,
  context,
  sourceFile,
  bridgeDir,
}: TMineFilePass) {
  if (!shouldProcessFile(sourceFile)) {
    return persistenceGate({
      file: sourceFile,
      program,
      rootDir: bridgeDir,
    });
  }
  const transformedFile = runMiningPass(program, context, sourceFile);

  return persistenceGate({
    file: transformedFile,
    program,
    rootDir: bridgeDir,
  });
}
