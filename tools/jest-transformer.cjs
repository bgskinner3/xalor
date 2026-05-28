/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const path = require('path');

const transformerPath = path.resolve(
  __dirname,
  '../dist/transformer/index.cjs',
);
const pkgPath = path.resolve(__dirname, '../package.json');

const mod = require(transformerPath);
const pkg = require(pkgPath);
const transformer = mod.default || mod;

/**
 * JEST TRANSFORMER BRIDGE
 *
 * Satisfies ts-jest's architectural metadata constraint rules
 * while safely initializing your production compiler plugin.
 */
module.exports = {
  // 🛰️ Named metadata exports required by ts-jest to silence warnings
  name: 'xalor-transformer',
  version: pkg.version + '-' + Date.now(),

  factory: (compilerInstance) => {
    // eslint-disable-next-line no-useless-assignment
    let program = undefined;

    if (compilerInstance && typeof compilerInstance.getProgram === 'function') {
      program = compilerInstance.getProgram();
    } else if (
      compilerInstance &&
      compilerInstance.compiler &&
      typeof compilerInstance.compiler.getProgram === 'function'
    ) {
      program = compilerInstance.compiler.getProgram();
    } else {
      program =
        compilerInstance.program ||
        compilerInstance.tsProgram ||
        (compilerInstance.compiler && compilerInstance.compiler.program) ||
        compilerInstance._program;
    }

    if (!program) {
      console.warn(
        '\n⚠️ [xalor] Jest Miner Warning: No TypeScript Program found.',
      );
      program = {};
    }

    return transformer(program);
  },
};
