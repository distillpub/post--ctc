const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    "index": "./src/index.js"
  },
  resolve: {
    extensions: [ ".js"],
    modules: ["node_modules"]
  },
  output: {
    path: __dirname + "/public",
    filename: "[name].bundle.js"
  },
  plugins: [
    new UglifyJSPlugin({
      parallel: true,
      uglifyOptions: {
        ecma: 6
      }
    })
  ],
  devServer: {
    historyApiFallback: true,
    overlay: true,
    compress: true,
    contentBase:  __dirname + "/public"
  },
  stats: {
    maxModules: 20,
    modulesSort: "!size",
    excludeModules: ""
  },
  devtool: "inline-source-map"
};
