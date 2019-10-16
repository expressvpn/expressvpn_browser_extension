// https://eslint.org/docs/user-guide/configuring
// File taken from https://github.com/vuejs-templates/webpack/blob/1.3.1/template/.eslintrc.js, thanks.

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
    webextensions: true,
  },
  globals: {
    "chrome": true,
    "__IS_BETA__": true,
    "__IS_ALPHA__": true
  },
  // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
  // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
  extends: ['plugin:vue/essential', 'airbnb-base'],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // check if imports actually resolve
  settings: {
    'import/resolver': {
      "alias": {
        "map": [
          [ "@", "./source"]
        ],
        "extensions": [".vue", ".js", ".json", '.scss']
      },
      webpack: {
        config: './webpack.config.js'
      }
    }
  },
  // add your custom rules here
  rules: {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never'
    }],
    "camelcase": [
      "warn",
      {
        "allow": [
          "country_code", "is_smart_location", "is_country", "latest_version", "latest_version_url",
          "last_location", "website_url", "app_version", "include_default_location", "selected_location", 
          "is_default", "is_auto_connect"
        ]
      }
    ],
    "strict": 0,
    "func-names": 0,
    "object-shorthand": 0,
    "arrow-parens": 0,
    "guard-for-in": 0,
    "no-param-reassign": "warn",
    "no-else-return": "warn",
    "dot-notation": "warn",
    "prefer-arrow-callback": 0,
    "no-trailing-spaces": "warn",
    "prefer-template": 0,
    "prefer-const": 0,
    "no-case-declarations": 0,
    "prefer-destructuring": 0,
    "no-restricted-syntax": 0,
    "no-mixed-operators": 0,
    "no-console": 0,
    "no-continue": 0, // needed for better performance when evaluating headers
    "global-require": 0, // needed for HTTPS everywhere (ToDo: Move it to the top after Safari code is removed)
    "no-plusplus": ["error", {"allowForLoopAfterthoughts": true}],
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true, "optionalDependencies": false, "peerDependencies": false}],
    "max-len": [
      "warn",
      180
    ],
    "no-undef": [
      "warn"
    ],
    "quote-props": 0,
    "no-useless-return": 0,
    "consistent-return": 0,
    "no-restricted-properties": 0,
    "no-unused-vars": [
      "error",
      {
        "vars": "all",
        "args": "none"
      }
    ],
    "linebreak-style": 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
