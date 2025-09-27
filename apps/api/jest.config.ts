import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { 
      tsconfig: '<rootDir>/tsconfig.json',
      useESM: true
    }],
    '^.+\\.js$': ['babel-jest', { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.ts'],
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ]
};
export default config;
