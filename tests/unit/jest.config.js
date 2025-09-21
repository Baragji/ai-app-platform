/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../apps/web/src/$1',
    '^@ai-app-platform/db$': '<rootDir>/../../packages/db/src/index.ts',
    '^@ai-app-platform/gateway$': '<rootDir>/../../packages/gateway/src/index.ts',
    '^@ai-app-platform/jobs$': '<rootDir>/../../packages/jobs/src/index.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  collectCoverageFrom: [
    '../../packages/**/*.ts',
    '../../apps/web/src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
