const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/Components/$1',
    '^@/containers/(.*)$': '<rootDir>/src/Containers/$1',
    '^@/assets/(.*)$': '<rootDir>/src/Assets/$1',
    '^@/constants/(.*)$': '<rootDir>/src/Constants/$1',
    '^@/functions/(.*)$': '<rootDir>/src/Functions/$1',
    '^@/helpers/(.*)$': '<rootDir>/src/Helpers/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/Hooks/$1',
    '^@/icons/(.*)$': '<rootDir>/src/Icons/$1',
    '^@/interfaces/(.*)$': '<rootDir>/src/Interfaces/$1',
    '^@/layouts/(.*)$': '<rootDir>/src/Layouts/$1',
    '^@/routes/(.*)$': '<rootDir>/src/Routes/$1',
    '^@/services/(.*)$': '<rootDir>/src/Services/$1',
    '^@/state/(.*)$': '<rootDir>/src/State/$1',
    '^@/theme/(.*)$': '<rootDir>/src/Theme/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
};

module.exports = createJestConfig(customJestConfig);
