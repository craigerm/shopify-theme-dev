const fs = require("fs-extra");
const chalk = require("chalk");
const paths = require("../utils/paths");
const PLUGIN_NAME = "CleanupPlugin";

class CleanupPlugin {
  constructor(isDebug) {
    this.isDebug = isDebug;
  }

  apply(compiler) {
    if (this.isDebug) {
      console.log(
        chalk.bold.blueBright(`[DEBUG] Running plugin ${PLUGIN_NAME}`)
      );
      console.log(`[DEBUG] Emptying dist folder: ${paths.distFolder}`);
    }
    fs.emptyDirSync(paths.distFolder);
  }
}

module.exports = CleanupPlugin;
