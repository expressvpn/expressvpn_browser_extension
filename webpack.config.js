/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
/* eslint-disable quote-props */
const webpack = require('webpack');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const TerserPlugin = require('terser-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const version = require('./package.json').version + (process.env.CIRCLE_BUILD_NUM ? '.' + process.env.CIRCLE_BUILD_NUM : '');

const supportedBrowsers = ['chrome', 'firefox'];
const browser = argv.browser || 'chrome';

if ((argv.alpha || argv.beta) && (!process.env.XVCHROME_ALPHA_KEY || !process.env.XVCHROME_BETA_KEY)) {
  console.error('Alpha or Beta keys are missing!');
  process.exit(-1);
}

const config = {
  mode: process.env.NODE_ENV,
  context: path.join(__dirname, 'source'),
  entry: {
    'scripts/background': './scripts/background.js',
    'scripts/popup': './scripts/popup.js',
    'scripts/networkLock': './scripts/networkLock.js',
  },
  devtool: 'inline-source-map',
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
              data: '@import "@/styles/shared/scss/xv_style.scss";',
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
        transform: (content) => {
          let rx = new RegExp(`_@${browser}@`, 'gi');
          return content.toString().replace(rx, '');
        },
      },
      { from: 'html/**/*', to: 'html/[name].[ext]' },
      { from: 'styles/shared/fonts/**/*', to: 'fonts/[name].[ext]' },
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

          return JSON.stringify(manifestObj, null, 2);
        },
      },
    ]),
    ...(argv.pack ? [new ZipPlugin({
      path: path.join(__dirname, 'dist', browser),
      filename: `${argv.beta || argv.alpha ? (argv.beta ? 'BETA-' : 'ALPHA-') : ''}ExpressVPN-v${version}.zip`,
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
