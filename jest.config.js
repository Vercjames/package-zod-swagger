module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'packages/zod-swagger/package/**/*.ts',
    '!packages/zod-swagger/package/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/packages/zod-swagger/package/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'packages/zod-swagger/tsconfig.json',
    },
  },
}; 