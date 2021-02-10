const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const paths = require("../utils/paths");
const ThemekitSyncPlugin = require("../plugins/themekit-sync-plugin");
const transformLiquidPlugin = require("../plugins/transform-liquid-plugin");

const createJsRule = (config) => {
  return {
    test: /\.js$/,
    include: paths.jsFolder,
    exclude: /node_modules/,
    use: {
      loader: require.resolve("babel-loader"),
      options: {
        presets: [
          [
            require("@babel/preset-env").default,
            {
              useBuiltIns: "entry",
              corejs: 3,
              exclude: ["transform-typeof-symbol"],
            },
          ],
        ],
        plugins: [
          [
            require("@babel/plugin-transform-runtime").default,
            {
              absoluteRuntime: false,
              regenerator: true,
              corejs: 3,
              absoluteRuntime: require.resolve("@babel/runtime/package.json"),
              version: "^7.12.5",
            },
          ],
        ],
      },
    },
  };
};

const createCssRule = (config) => {
  return {
    test: /\.(scss|css)$/,
    use: [
      MiniCssExtractPlugin.loader,
      require.resolve("css-loader"),
      {
        loader: require.resolve("postcss-loader"),
        options: {
          postcssOptions: {
            plugins: [
              require("postcss-flexbugs-fixes"),
              require("postcss-preset-env"),
              require("postcss-import"),
              require("postcss-nested"),
              require("autoprefixer"),
            ],
          },
        },
      },
      require.resolve("sass-loader"),
    ],
  };
};

module.exports = (config) => {
  return {
    mode: config.environment,
    entry: {
      theme: paths.themeBundleJs,
    },
    output: {
      path: paths.distFolder,
      filename: "assets/[name].js",
    },
    module: {
      rules: [createJsRule(config), createCssRule(config)],
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
    ].filter(Boolean),
  };
};
