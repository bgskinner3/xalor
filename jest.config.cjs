const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: path.resolve(__dirname),

  // Allowing Jest to execute transformations inside your node_modules folder
  transformIgnorePatterns: ['node_modules/(?!(@bgskinner2/xalor)/)'],

  moduleNameMapper: {
    // Force Jest to load the physical cache locations
    '^@bgskinner2/xalor/generated$':
      '<rootDir>/node_modules/.cache/xalor/solid-env.d.ts',
    '^@bgskinner2/xalor$': '<rootDir>/src/api/index.ts',
    '^@bgskinner2/xalor/transformer$': '<rootDir>/src/transformer/index.ts',
    '^@bgskinner2/xalor/(.*)$': '<rootDir>/src/$1',
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
            {
              path: path.resolve(__dirname, 'tools/jest-transformer.cjs'),
            },
          ],
        },
      },
    ],
  },

  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
};
