const chalk = require("chalk");
const figures = require("figures");
const themekit = require("@shopify/themekit");
const fs = require("fs");
const path = require("path");
const paths = require("../../utils/paths");
const config = require("../../utils/config");

const ignores = fs.readFileSync(
  path.join(process.cwd(), ".themekit_ignores"),
  "utf8"
);

const customIgnores = ignores
  .split("\n")
  .filter((x) => !x.startsWith("#") && x !== "")
  .map((x) => x.trim());

const ignoreFiles = ["config/settings_data.json"].concat(customIgnores);
let flags = { env: config.environment, ignoredFiles: ignoreFiles };
let options = { cwd: paths.distFolder, logLevel: "all" };

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
      `Syncing ${files.length} files(s) to Shopify (theme id: ${config.themeId})`
    )
  );

  // Printe the files for reference
  console.log(files.map((x) => `   ${chalk.grey(x)}`).join("\n"));

  // Upload the files to shopify
  const commandFlags = { ...flags, files: files };

  await themekit.command("deploy", commandFlags, options);
};

module.exports = {
  deploy,
  syncFiles,
};
