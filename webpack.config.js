/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
/* eslint-disable quote-props */
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-ext-reloader');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
let version = require('./package.json').version;

module.exports = (env, argv) => {
  const supportedBrowsers = ['chrome', 'firefox'];
  const browser = env.browser || 'chrome';
let launchDarklyId = '';
  let extensionId = 'fgddmllnllkalaagkghckoinaemmogpe';
  // Default Rudderstack staging setup
let rudderstackWriteKey = '';
let rudderstackDataplaneUrl = '';

  if ((env.alpha || env.beta) && (!process.env.XVCHROME_ALPHA_KEY || !process.env.XVCHROME_BETA_KEY) && browser === 'chrome') {
    console.error('Alpha or Beta keys are missing!');
    process.exit(-1);
  }

  if (env.beta) {
let launchDarklyId = '';
    extensionId = 'olhkmmhcabcohlcodnbkfoekafimgkmb';
  } else if (env.alpha) {
let launchDarklyId = '';
    extensionId = 'gicmddjpmepnbabhkhihlgdfccbppflm';
  } else if (process.env.NODE_ENV === 'production') {
let launchDarklyId = '';
let rudderstackWriteKey = '';
let rudderstackDataplaneUrl = '';
  }

  if (process.env.CIRCLE_BUILD_NUM) {
    version += '.' + process.env.CIRCLE_BUILD_NUM;
  } else if (fs.existsSync('VERSION')) {
    version = fs.readFileSync('VERSION', 'utf8').trim();
  }
  const config = {
    mode: process.env.NODE_ENV,
    context: path.join(__dirname, 'source'),
    entry: {
      'scripts/background': './scripts/background.js',
      'scripts/popup': './scripts/popup.js',
      'scripts/networkLock': './scripts/networkLock.js',
    },
    output: {
      path: path.join(__dirname, 'build', env.beta || env.alpha ? (env.beta ? 'beta' : 'alpha') : process.env.NODE_ENV, browser),
      filename: '[name].js',
    },
    stats: {
      entrypoints: false,
      children: false,
    },
    resolve: {
      extensions: ['.js', '.vue', '.scss'],
      alias: {
        '@': path.resolve(__dirname, 'source'),
      },
    },
    devtool: 'cheap-source-map',
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: {
            loader: 'vue-loader',
          },
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: [/node_modules/],
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
            },
            {
              loader: 'sass-loader',
              options: {
                additionalData: '@import "@/styles/shared/vendor/assets/stylesheets/eds/core/_variables.scss";',
              },
            },
          ],
        },
      ],
    },
    performance: {
      hints: false,
    },
    ignoreWarnings: [/only default export is available soon/],
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            mangle: false,
            compress: {
              drop_console: true,
            },
            output: {
              comments: false,
            },
          },
        }),
      ],
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),
      new webpack.DefinePlugin({
        global: 'window',
        __IS_BETA__: !!env.beta,
        __IS_ALPHA__: !!env.alpha,
        __IS_RELEASE__: process.env.NODE_ENV === 'production',
        __BROWSER__: JSON.stringify(browser),
        __LD_ID__: `'${launchDarklyId}'`,
        __RS_WRITE_KEY__: `'${rudderstackWriteKey}'`,
        __RS_DATAPLANE_URL__: `'${rudderstackDataplaneUrl}'`,
      }),
      new VueLoaderPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'images', to: 'images' },
          {
            from: '_locales',
            to: '_locales',
            globOptions: {
              ignore: ['**/_locations/**/*'],
            },
            transform: (_content, filePath) => {
              const content = _content.toString();
              const rx = new RegExp(`_@${browser}@`, 'gi');
              const originalMessage = content.toString().replace(rx, '');
              let locations = {};
              let prependedLocations = {};
              try {
                // eslint-disable-next-line import/no-dynamic-require
                locations = require(filePath.replace('_locales', '_locales/_locations'));
              } catch (ex) {
                // Throw again so we know which file is invalid
                throw new Error('Invalid JSON location file:' + filePath);
              }

              for (let key in locations) {
                prependedLocations['_locationName_' + key.replace(/[ \-()]/g, '_')] = locations[key];
              }

              return JSON.stringify({
                ...JSON.parse(originalMessage),
                ...prependedLocations,
              });
            },
          },
          { from: 'html/**/*', to: 'html/[name][ext]' },
          {
            from: 'styles/shared/vendor/assets/fonts/eds/**/*',
            to: 'fonts/[name][ext]',
          },
          {
            from: '**/*',
            to: 'images/[path][name][ext]',
            context: 'styles/shared/vendor/assets/images/eds/',
          },
          { from: 'fonts/**/*', to: 'fonts/[name][ext]' },
          {
            from: 'scripts/content/**/*',
            to: 'scripts/content/[name][ext]',
            transform: (_content, filePath) => {
              const content = _content.toString();
              let transformedContent = content.toString().replace('__EXTENSION_ID__', `'${extensionId}'`);
              if (browser === 'chrome') {
                transformedContent = transformedContent.replace('inject_chrome() {', 'inject() {');
              } else {
                transformedContent = transformedContent.replace('inject_firefox() {', 'inject() {');
                transformedContent = transformedContent.replace('__GPSJS_CONTENT__', fs.readFileSync('source/scripts/content/gps.js', 'utf-8').replace(/([`$\\{}])/g, '\\$1'));
              }
              return transformedContent;
            },
          },
          {
            from: 'manifest.json',
            to: 'manifest.json',
            transform: (_content) => {
              const content = _content.toString();
              const manifestObj = JSON.parse(content);
              manifestObj.version = version;

              Object.keys(manifestObj).forEach(function (key) {
                if (new RegExp(supportedBrowsers.join('|')).test(key)) {
                  let rxCurrentBrowser = new RegExp(`__${browser}__`);
                  if (rxCurrentBrowser.test(key)) {
                    manifestObj[key.replace(rxCurrentBrowser, '')] = manifestObj[key];
                  }
                  delete manifestObj[key];
                }
              });

              if (env.alpha || env.beta) {
                let currentBuildType = env.alpha ? 'Alpha' : 'Beta';
                switch (browser) {
                  case 'chrome':
                    const chromeKeys = {
                      Alpha: process.env.XVCHROME_ALPHA_KEY,
                      Beta: process.env.XVCHROME_BETA_KEY,
                    };
                    manifestObj.name = currentBuildType === 'Beta' ? '__MSG_app_name_title_beta__' : '(Alpha) ExpressVPN Extension';
                    manifestObj.description =
                      currentBuildType === 'Beta' ? '__MSG_app_description_text_beta__' : '(Alpha) ExpressVPN Extension';
                    manifestObj.key = chromeKeys[currentBuildType];
                    break;
                  case 'firefox':
                    manifestObj.name = `(${currentBuildType}) ExpressVPN Extension`;
                    manifestObj.description = `(${currentBuildType}) ExpressVPN Extension`;
                    manifestObj.applications.gecko.id = 'firefox-addon-internal@expressvpn.com';
                    break;
                  default:
                    break;
                }
              } else if (browser === 'chrome') {
                manifestObj.key =
                  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs24qmLQZjYn5vnBdvJ77lURW/Ig8V4PPR+RWzenikcFUnvU3CaI92jlb7PBM1YtR4q4DyhNlGMiSccYxcwH5Z2wogWW/BUxV0idK8e24Xtl3HQvDvEHl684x2QJWbebXdV3d1XPu4FfwBJBEbVDwxqItSojdc+eam1GZtXfiibz4hgum2uNhnydIG/vxTJ/nWAJ8uBWOgHaiU47t49ma4ptvNQZ3QTaDsFbKtl+kfV9jNRChVW7skadvixTOIVZBLcnnNxVhgefsERz97IN6ngTQN0W2x2q3cKfl6EU0K7HStw1zet3/lorsqyoZbpHE3HWWsj+/RBCrAFjxqPO7hwIDAQAB';
              }

              if (config.mode === 'development') {
                manifestObj.web_accessible_resources[0].resources.push('html/*');
              }

              return JSON.stringify(manifestObj, null, 2);
            },
          },
        ],
      }),
    ],
  };

  if (config.mode === 'production') {
    config.plugins = (config.plugins || []).concat([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
        },
      }),
    ]);
  }

  if (process.env.HMR === 'true') {
    config.plugins = (config.plugins || []).concat([
      new ExtensionReloader({
        manifest: path.join(__dirname, 'source', 'manifest.json'),
      }),
    ]);
  }

  return config;
};
