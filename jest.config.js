module.exports = {
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '.*\\.(js)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/config/file-mock.js',
    '^@/(.*)$': '<rootDir>../../source/$1',
  },
  setupFiles: ['jest-date-mock'],
  setupFilesAfterEnv: ['./config/jest.setup.js'],
  rootDir: './test/unit',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  globals: {
    __IS_ALPHA__: false,
    __IS_BETA__: false,
    __IS_RELEASE__: false,
    __RS_WRITE_KEY__: 'dummy key',
    __RS_DATAPLANE_URL__: 'https://dummy.dataplane.url',
  },
};
