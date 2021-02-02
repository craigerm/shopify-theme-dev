const webpack = require("webpack");
const chalk = require("chalk");
const clearConsole = require("./clear-console");
const formatWebpackMessages = require("./format-webpack-messages");
const webpackBuilder = require("../webpack/base.config");
const isInteractive = process.stdout.isTTY;

const showStatsInfo = (err, stats) => {
  if (err) {
    console.log(chalk.red("Failed to compile webpack config!"));
    console.log(chalk.gray(err.stack || err));
    if (err.details) {
      console.error(chalk.gray(errr.details));
    }
    return false;
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.log(chalk.red("Compiler has stats error."));
    info.errors.forEach((e) => {
      //console.log(chalk.white("Message:"));
      //console.log(chalk.grey(e.stack || e.message || ""));
      console.log(e);
    });
    return false;
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings);
  }
  return true;
};

const createCompiler = async (config) => {
  let compiler = null;

  try {
    const webpackConfig = webpackBuilder(config);
    compiler = webpack(webpackConfig);
  } catch (e) {
    console.log(chalk.red("Error compiling webpack config!"));
    console.log(e);
    process.exit(1);
  }

  // Show watch info
  compiler.watch({}, showStatsInfo);

  compiler.hooks.invalid.tap("invalid", () => {
    if (isInteractive) {
      clearConsole();
    }
  });

  compiler.hooks.done.tap("done", async (stats) => {
    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
    });

    const messages = formatWebpackMessages(statsData);
    const isSuccessful = !messages.errors.length && !messages.warnings.length;

    if (isSuccessful) {
      console.log(chalk.green("Compiled successfully!"));
    }

    // If errors exist, only show errors.
    if (messages.errors.length) {
      // Only keep the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise.
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }
      console.log(chalk.red("Failed to compile.\n"));
      console.log(messages.errors.join("\n\n"));
      console.log(messages);
      return;
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log(chalk.yellow("Compiled with warnings.\n"));
      console.log(messages.warnings.join("\n\n"));
    }
  });

  return compiler;
};

module.exports = createCompiler;
