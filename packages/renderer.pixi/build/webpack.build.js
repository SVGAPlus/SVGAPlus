const path = require('path')
const webpack = require('webpack')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const version = require('../package').version

const config = {
  mode: 'production',
  entry: path.resolve(__dirname, '../lib/index.ts'),

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'index.js',
    library: 'SVGAPlusPixiRenderer',
    libraryTarget: 'umd'
  },

  resolve: {
    extensions: ['.js', '.ts']
  },

  externals: {
    'pixi.js': 'commonjs2 pixi.js'
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
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
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
      banner: 'SVGAPlusPixiRenderer - Pixi Renderer for SVGAPlus.\n' +
        '© LancerComet | # Carry Your World #\n' +
        `Version: ${version}\n` +
        'License: MIT'
    })
  ]
}

if (process.env.npm_config_report) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  config.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = config
