/*
 * Originally by https://github.com/kriasoft/react-starter-kit
 * React.js Starter Kit
 * Copyright (c) Konstantin Tarkus (@koistya), KriaSoft LLC
*/


import webpack, { DefinePlugin, BannerPlugin } from 'webpack';
import merge from 'lodash/object/merge';
import autoprefixer from 'autoprefixer-core';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const DEBUG = !argv.release;
const STYLE_LOADER = 'style-loader/useable';
const CSS_LOADER = DEBUG ? 'css-loader' : 'css-loader?minimize';
const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 20',
  'Firefox >= 24',
  'Explorer >= 8',
  'iOS >= 6',
  'Opera >= 12',
  'Safari >= 6'
];
const GLOBALS = {
  'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
  '__DEV__': DEBUG
};

//
// Common configuration chunk to be used for both
// client-side (app.js) and server-side (server.js) bundles
// -----------------------------------------------------------------------------

const config = {
  output: {
    publicPath: './',
    sourcePrefix: '  '
  },

  cache: DEBUG,
  debug: DEBUG,

  stats: {
    colors: true,
    reasons: DEBUG
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin()
  ],

  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
  },

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }
    ],

    loaders: [
      {
        test: /\.css$/,
        loader: `${STYLE_LOADER}!${CSS_LOADER}!postcss-loader`
      },
      {
        test: /\.less$/,
        loader: `${STYLE_LOADER}!${CSS_LOADER}!postcss-loader!less-loader`
      },
      {
        test: /\.gif/,
        loader: 'url-loader?limit=10000&mimetype=image/gif'
      },
      {
        test: /\.jpg/,
        loader: 'url-loader?limit=10000&mimetype=image/jpg'
      },
      {
        test: /\.png/,
        loader: 'url-loader?limit=10000&mimetype=image/png'
      },
      {
        test: /\.svg/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  postcss: [autoprefixer(AUTOPREFIXER_BROWSERS)]
};

//
// Configuration for the client-side bundle (app.js)
// -----------------------------------------------------------------------------

const appConfig = merge({}, config, {
  entry: './src/app.js',
  output: {
    path: './build/public',
    filename: 'app.js'
  },
  devtool: DEBUG ? 'source-map' : false,
  plugins: config.plugins.concat([
      new DefinePlugin(merge(GLOBALS, {'__SERVER__': false}))
    ].concat(DEBUG ? [] : [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.AggressiveMergingPlugin()
    ])
  ),
  module: {
    loaders: [
      {test: /\.css$/, loader: 'style!css', exclude: /node_modules/},
      {test: /\.less$/, loader: 'style!css!less', exclude: /node_modules/},
      {test: /\.scss/, loader: 'style!css!sass', exclude: /node_modules/},
      {test: /\.styl$/, loader: 'style!css!stylus', exclude: /node_modules/},
      {test: /\.png$/, loader: 'url', exclude: /node_modules/}
    ]
  }
});

//
// Configuration for the server-side bundle (server.js)
// -----------------------------------------------------------------------------

const serverConfig = merge({}, config, {
  entry: './src/server.js',
  output: {
    path: './build',
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  target: 'node',
  externals: /^[a-z][a-z\.\-0-9]*$/,
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },
  devtool: DEBUG ? 'source-map' : 'cheap-module-source-map',
  plugins: config.plugins.concat(
    new DefinePlugin(merge(GLOBALS, {'__SERVER__': true})),
    new BannerPlugin('require("source-map-support").install();',
      { raw: true, entryOnly: false })
  ),
  module: {
    loaders: config.module.loaders.map(function(loader) {
      // Remove style-loader
      return merge(loader, {
        loader: loader.loader = loader.loader.replace(STYLE_LOADER + '!', '')
      });
    })
  }
});

export default [appConfig, serverConfig];
