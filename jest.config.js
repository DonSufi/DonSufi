/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'domain',
      testEnvironment: 'node',
      rootDir: '.',
      testMatch: [
        '<rootDir>/src/domain/**/__tests__/**/*.test.ts',
        '<rootDir>/src/utils/**/__tests__/**/*.test.ts',
        '<rootDir>/src/data/**/__tests__/**/*.test.ts',
        '<rootDir>/src/i18n/**/__tests__/**/*.test.ts',
      ],
      transform: {
        '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'app',
      preset: 'jest-expo',
      rootDir: '.',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.tsx',
        '<rootDir>/app/**/__tests__/**/*.test.tsx',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)/)',
      ],
    },
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
