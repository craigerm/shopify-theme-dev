const argv = require("minimist")(process.argv.slice(2));
const yaml = require("js-yaml");
const chalk = require("chalk");
const fs = require("fs");

const configFile = "config.yml";
const nodeEnv = process.env.NODE_ENV || "development";
const isDevelopment = nodeEnv !== "production";
const skipFirstDeploy = argv.skipFirstDeploy === true;

if (fs.existsSync(configFile) === false) {
  console.log(
    `No theme kit configuration file ${chalk.bold(
      configFile
    )} found at root of project!`
  );

  console.log(
    `Please create this using you theme id. You can use the ${chalk.bold(
      configFile + ".template"
    )} for reference.`
  );
  process.exit(1);
}

const initConfig = (themekitEnv) => {
  const configOptions = yaml.load(fs.readFileSync(configFile, "utf8"));
  const environmentOptions = configOptions[themekitEnv];

  if (!environmentOptions) {
    console.log(
      `ERROR: Could not find themekit configuration for environment ${chalk.bold(
        themekitEnv
      )} found in ${chalk.bold(configFile)}.`
    );
    process.exit(1);
  }

  const configValues = {
    themeId: environmentOptions.theme_id,
    password: environmentOptions.password,
    store: environmentOptions.store,
    isDevelopment: isDevelopment,
    environment: nodeEnv,
    themekitEnv: themekitEnv,
    skipFirstDeploy: skipFirstDeploy,
    isDebug: false,
  };

  return configValues;
};

module.exports = initConfig;
