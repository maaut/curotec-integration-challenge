module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'], // Look for tests in the src directory
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    moduleNameMapper: {
        // If you have path aliases in tsconfig.json, map them here
        // e.g., '@/(.*)': '<rootDir>/src/$1'
    },
    // Consider adding setup files if needed, e.g., for global mocks or environment setup
    // setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'], 
    collectCoverage: true, // Enable coverage collection
    coverageReporters: ["json", "lcov", "text", "clover"], // Coverage report formats
    coverageDirectory: 'coverage', // Directory for coverage reports
    clearMocks: true, // Automatically clear mock calls and instances between every test
}; 