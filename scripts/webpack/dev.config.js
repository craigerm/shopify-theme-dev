const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const paths = require("../utils/paths");
const ThemekitSyncPlugin = require("../plugins/themekit-sync-plugin");
const transformLiquidPlugin = require("../plugins/transform-liquid-plugin");
const config = require("../utils/config");

module.exports = {
  mode: config.environment,
  watch: true,
  entry: {
    theme: paths.themeBundleJs,
  },
  output: {
    path: paths.distFolder,
    filename: "assets/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    // Clean up the dist folder so we start from scratch when we start up
    new CleanWebpackPlugin(),

    // Extract the css file
    new MiniCssExtractPlugin({
      filename: "assets/[name].css",
      chunkFilename: "assets/[id]-chunk.css",
    }),

    // We don't need to create these right now,
    // but possibly later.
    //
    //// Create a snippet of our JS tags
    //new HtmlWebpackPlugin({
    //  inject: false,
    //  filename: "snippets/script-tags.liquid",
    //  template: paths.scriptIncludesFolder + "/script-tags.html",
    //}),

    //// Create a snippet of our css tags
    //new HtmlWebpackPlugin({
    //  inject: false,
    //  filename: "snippets/style-tags.liquid",
    //  template: paths.scriptIncludesFolder + "/style-tags.html",
    //}),

    // Copies all the liquid/etc files and transforms yml config files into liquid files
    transformLiquidPlugin(),

    // This should be last (it handles syncing files to shopify during development)
    new ThemekitSyncPlugin(),
  ],
};
