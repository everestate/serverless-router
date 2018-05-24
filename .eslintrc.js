module.exports = {
  extends: 'airbnb-base',
  plugins: [
    'jest',
  ],
  env: {
    browser: true,
    node: true,
    'jest/globals': true,
  },
  rules: {
    'max-len': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
  },
  overrides: [{
    files: ['**/__tests__/*.js'],
    rules: {
      'no-undef': 0,
      'import/no-extraneous-dependencies': 0,
    },
  }],
};
