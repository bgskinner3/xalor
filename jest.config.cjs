const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: path.resolve(__dirname),

  // 🚨 CRITICAL FIX 1: Allow Jest to execute transformations inside your node_modules folder
  transformIgnorePatterns: ['node_modules/(?!(@bgskinner2/xalor)/)'],

  moduleNameMapper: {
    // 🎯 PATH RADAR REALIGNMENT: Force Jest to load the real, physical location
    // where SOLID_EMITTER_KEYS.targetDir and XALOR_PATHS.cacheDir write files.
    '^@bgskinner2/xalor/generated$':
      '<rootDir>/node_modules/.cache/xalor/solid-env.d.ts',

    // Core package redirects to production artifacts
    '^@bgskinner2/xalor$': '<rootDir>/dist/index.cjs',
    '^@bgskinner2/xalor/transformer$': '<rootDir>/dist/transformer/index.cjs',
    '^@bgskinner2/xalor/(.*)$': '<rootDir>/dist/$1',
  },

  testPathIgnorePatterns: [
    '/dist/',
    '/playground/',
    'setup.ts',
    'test-utils.ts',
    '__tests__/utils/',
  ],

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: false,
        diagnostics: {
          ignoreCodes: [5103, 5023, 5024],
        },
        astTransformers: {
          before: [
            // 🎯 FIX: Route through your wrapper bridge, which contains the name and version metadata
            path.resolve(__dirname, 'tools/jest-transformer.cjs'),
          ],
        },
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
};
