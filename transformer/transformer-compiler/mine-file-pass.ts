import { runMiningPass, persistenceGate } from '../lifecycle';
import { shouldProcessFile } from './resolvers';
import type { TMineFilePass } from '../types';

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
