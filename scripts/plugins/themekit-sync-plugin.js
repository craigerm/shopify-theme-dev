// This is a simple webpack plugin that will just call out to
// to the themekit library to deploy the full theme or partial changes.
const chalk = require("chalk");
const figures = require("figures");
const config = require("../utils/config");
const { deploy, syncFiles } = require("./lib/themkit-cli");

const PLUGIN_NAME = "ThemekitSyncPlugin";

let isFirstCompile = true;
let changedAssets = [];

class ThemekitSyncPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    // Hook when files have been written to the output path
    compiler.hooks.afterEmit.tapAsync(
      PLUGIN_NAME,
      async (_compilation, callback) => {
        if (config.skipFirstDeploy === true && isFirstCompile === true) {
          console.log(
            `\n${chalk.blue(
              figures.info
            )}  Skipping first deployment because --skipFirstDeploy flag`
          );
        }

        if (config.skipFirstDeploy === false && isFirstCompile === true) {
          await deploy();
        }

        // For future compile we just sync the changes assets
        if (isFirstCompile === false) {
          try {
            await syncFiles(changedAssets);
          } catch (err) {
            console.log(chalk.red("Shopify template error"));
          }
          changedAssets = [];
        }

        isFirstCompile = false;
        callback();
      }
    );

    // When an asset has been written to the output path
    // and not the first compile, track which assets changed
    compiler.hooks.assetEmitted.tap(PLUGIN_NAME, async (file, _options) => {
      if (isFirstCompile) {
        return;
      }
      changedAssets.push(file);
    });
  }
}

module.exports = ThemekitSyncPlugin;
