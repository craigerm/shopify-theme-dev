const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
//const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const paths = require("../utils/paths");
const ThemekitSyncPlugin = require("../plugins/themekit-sync-plugin");
//const transformLiquidPlugin = require("../plugins/transform-liquid-plugin");
const AppVersionPlugin = require("../plugins/app-version-plugin");
const LiquidChunksPlugin = require("../plugins/liquid-chunks-plugin");
const TransformThemeFilesPLugin = require("../plugins/transform-theme-files-plugin");
const CleanupPlugin = require("../plugins/cleanup-plugin");

const getBundles = () => {
  const names = fs
    .readdirSync(paths.jsFolder)
    .filter((x) => x.startsWith("bundle."));

  const map = {};

  names.forEach((name) => {
    const bundleName = name.split(".js")[0];
    const srcFile = path.resolve(paths.srcFolder, "js", name);
    map[bundleName] = srcFile;
  });
  return map;
};

const jsBundles = getBundles();

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

//devtool: config.isDevelopment ? undefined : "source-map",
module.exports = (config) => {
  return {
    mode: config.environment,
    devtool: undefined,
    entry: {
      ...jsBundles,
    },
    output: {
      path: paths.distFolder,
      filename: "assets/[name].js",
    },
    module: {
      rules: [createJsRule(config), createCssRule(config)],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          name: false,
          "vendor-react": {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "chunk-vendor-react",
            chunks: "all",
          },
          "common-chunk": {
            chunks: "all",
            name: "chunk",
            minChunks: 3,
            minSize: 100000,
            maxSize: 200000,
          },
        },
      },
    },

    plugins: [
      // Clean up the dist folder so we start from scratch when we start up
      new CleanupPlugin(),

      // Extract the css file
      new MiniCssExtractPlugin({
        filename: "assets/[name].css",
        chunkFilename: "assets/[id]-chunk.css",
      }),

      // Copies all the liquid/etc files and transforms yml config files into liquid files
      new TransformThemeFilesPLugin(),

      new LiquidChunksPlugin(),

      // Set verison before we upload to Shopfiy (but only in production)
      new AppVersionPlugin(),

      // This should be last (it handles syncing files to shopify during development)
      new ThemekitSyncPlugin(),
    ].filter(Boolean),
  };
};
