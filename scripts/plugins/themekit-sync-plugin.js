// This is a simple webpack plugin that will just call out to
// to the themekit library to deploy the full theme or partial changes.
const chalk = require("chalk");
const figures = require("figures");
const themekit = require("@shopify/themekit");
const fs = require("fs");
const path = require("path");
const paths = require("../utils/paths");
const config = require("../utils/config");

const PLUGIN_NAME = "ThemekitSyncPlugin";

const ignores = fs.readFileSync(
  path.join(process.cwd(), ".themekit_ignores"),
  "utf8"
);

const customIgnores = ignores
  .split("\n")
  .filter((x) => !x.startsWith("#") && x !== "")
  .map((x) => x.trim());

const ignoreFiles = ["config/settings_data.json"].concat(customIgnores);

let isFirstCompile = true;

let flags = { env: config.environment, ignoredFiles: ignoreFiles };
let options = { cwd: paths.distFolder };

let changedAssets = [];

// Uploads full theme
const deploy = async () => {
  console.log(
    chalk.cyan(`Deploying full theme to Shopify (theme id: ${config.themeId}})`)
  );

  await themekit.command("deploy", flags, options);

  console.log(`${chalk.green(figures.tick)} Theme uploaded in full to Shopify`);
};

// Uploads partial theme
const syncFiles = async (files) => {
  console.log(
    chalk.cyan(
      `Syncing ${files.length} files(s) to Shopify (theme id: ${config.themeId}})`
    )
  );

  // Printe the files for reference
  console.log(files.map((x) => `   ${chalk.grey(x)}`).join("\n"));

  // Upload the files to shopify
  const commandFlags = { ...flags, files: files };

  await themekit.command("deploy", commandFlags, options);
};

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
          // This is a small hack for now
          if (changedAssets.length === 0) {
            changedAssets.push("assets/theme.css");
            changedAssets.push("assets/theme.js");
          }

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
