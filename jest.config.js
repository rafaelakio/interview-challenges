module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', 'tests/**/*.js', '!**/node_modules/**'],
  coverageReporters: ['text', 'lcov', 'html'],
};
