/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const path = require('path');

const transformerPath = path.resolve(
  __dirname,
  '../dist/transformer/index.cjs',
);

const pkg = require('../package.json');
const mod = require(transformerPath);
const transformer = mod.default || mod;

/**
 * JEST TRANSFORMER BRIDGE
 */
module.exports = {
  name: 'xalor-transformer',

  // ❌ REMOVE Date.now() — breaks caching
  version: pkg.version,

  factory: (compilerInstance) => {
    if (!compilerInstance) {
      throw new Error('[xalor] Missing compiler instance in Jest transformer');
    }

    const program =
      compilerInstance.getProgram?.() ||
      compilerInstance.compiler?.getProgram?.() ||
      compilerInstance.program ||
      compilerInstance.tsProgram;

    if (!program) {
      throw new Error(
        '[xalor] No TypeScript Program found - transformer cannot run',
      );
    }

    return transformer(program);
  },
};
