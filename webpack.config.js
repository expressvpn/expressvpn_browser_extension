/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
/* eslint-disable quote-props */
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const TerserPlugin = require('terser-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
let version = require('./package.json').version;

const supportedBrowsers = ['chrome', 'firefox'];
const browser = argv.browser || 'chrome';

if ((argv.alpha || argv.beta) && (!process.env.XVCHROME_ALPHA_KEY || !process.env.XVCHROME_BETA_KEY) && browser === 'chrome') {
  console.error('Alpha or Beta keys are missing!');
  process.exit(-1);
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
    path: path.join(__dirname, 'build', argv.beta || argv.alpha ? (argv.beta ? 'beta' : 'alpha') : process.env.NODE_ENV, browser),
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
  devtool: browser === 'firefox' ? '' : 'cheap-source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loaders: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/, /https/],
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
              prependData: '@import "@/styles/shared/vendor/assets/stylesheets/eds/core/_variables.scss";',
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'fonts/',
        },
      },
    ],
  },
  performance: {
    hints: false,
  },
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
      '__IS_BETA__': !!argv.beta,
      '__IS_ALPHA__': !!argv.alpha,
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      { from: 'images', to: 'images' },
      {
        from: '_locales',
        to: '_locales',
        ignore: ['_locations/**/*'],
        transform(content, filePath) {
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

          return JSON.stringify({ ...JSON.parse(originalMessage), ...prependedLocations });
        },
      },
      { from: 'html/**/*', to: 'html/[name].[ext]' },
      { from: 'styles/shared/vendor/assets/fonts/eds/**/*', to: 'fonts/[name].[ext]' },
      { from: '**/*', to: 'images/[path][name].[ext]', context: 'styles/shared/vendor/assets/images/eds/' },
      { from: 'fonts/**/*', to: 'fonts/[name].[ext]' },
      { from: 'scripts/content/**/*', to: 'scripts/content/[name].[ext]' },
      // { from: 'scripts/modules/https/**/*', to: 'scripts/modules/https/[name].[ext]' },
      {
        from: 'manifest.json',
        to: 'manifest.json',
        transform: (content) => {
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

          if (argv.alpha || argv.beta) {
            let currentBuildType = argv.alpha ? 'Alpha' : 'Beta';
            switch (browser) {
              case 'chrome':
                const chromeKeys = {
                  'Alpha': process.env.XVCHROME_ALPHA_KEY,
                  'Beta': process.env.XVCHROME_BETA_KEY,
                };
                manifestObj.name = `(${currentBuildType}) ExpressVPN Extension`;
                manifestObj.description = `(${currentBuildType}) ExpressVPN Extension`;
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
            manifestObj.key = '';
          }

          if (config.mode === 'development') {
            manifestObj.web_accessible_resources.push('html/*');
          }

          return JSON.stringify(manifestObj, null, 2);
        },
      },
    ]),
    ...(argv.pack ? [new ZipPlugin({
      path: path.join(__dirname, 'dist'),
      filename: `expressvpn_extension_${version}_${argv.beta || argv.alpha ? (argv.beta ? 'beta' : 'alpha') : 'release'}_${browser}.zip`,
    })] : []),
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

module.exports = config;
