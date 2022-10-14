const fs = require("fs-extra");

const paths = require("../utils/paths");
const PLUGIN_NAME = "CleanupPlugin";

class CleanupPlugin {
  constructor(isDebug) {
    this.isDebug = isDebug;
  }

  apply(compiler) {
    if (this.isDebug) {
      console.log(`[DEBUG] Emptying dist folder: ${paths.distFolder}`);
    }
    fs.emptyDirSync(paths.distFolder);
  }
}

module.exports = CleanupPlugin;
