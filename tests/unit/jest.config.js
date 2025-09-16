/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../apps/web/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  collectCoverageFrom: [
    '../../packages/**/*.ts',
    '../../apps/web/src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
