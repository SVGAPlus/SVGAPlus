const path = require('path')
const webpack = require('webpack')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const isWorkerBuild = !!process.env.IS_WORKER_BUILD
const version = require('../package').version

const config = {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/index.ts'),

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'index.js',
    library: 'SVGAPlus',
    libraryTarget: 'umd'
  },

  resolve: {
    extensions: ['.js', '.ts']
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false
      })
    ]
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components|test)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules|test/
      }
    ]
  },

  plugins: [
    new FriendlyErrorsPlugin(),
    new webpack.BannerPlugin({
      banner: 'SVGAPlus - Enhanced SVGA Player.\n' +
      '© LancerComet | # Carry Your World #\n' +
      `Version: ${version}\n` +
      'License: MIT'
    }),
    new webpack.DefinePlugin({
      'process.env.IS_WORKER_BUILD': isWorkerBuild
    })
  ]
}

if (isWorkerBuild) {
  config.output.filename = 'index.worker.js'
}

module.exports = config
