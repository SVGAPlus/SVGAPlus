module.exports = {
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'jsdom',
  collectCoverage: true,
  reporters: [
    'default',
    'jest-github-actions-reporter'
  ],
  setupFiles: [
    './.jest/xhr.js'
  ]
}
