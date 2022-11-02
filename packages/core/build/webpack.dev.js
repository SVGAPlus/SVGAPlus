const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('@soda/friendly-errors-webpack-plugin')

module.exports = {
  mode: 'development',

  entry: {
    index: './dev/index/index.ts',
    lottery: './dev/lottery/index.ts',
    sprite22: './dev/22/index.ts'
  },

  resolve: {
    extensions: ['.js', '.ts']
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },

  devServer: {
    historyApiFallback: true,
    https: false,
    port: 5000,
    static: ['static']
  },

  stats: 'none',

  plugins: [
    new HtmlWebpackPlugin({
      template: './dev/index/index.html',
      chunks: ['index']
    }),

    new HtmlWebpackPlugin({
      template: './dev/lottery/index.html',
      chunks: ['lottery'],
      filename: 'lottery.html'
    }),

    new HtmlWebpackPlugin({
      template: './dev/22/index.html',
      chunks: ['sprite22'],
      filename: '22.html'
    }),

    new FriendlyErrorsPlugin()
  ]
}
