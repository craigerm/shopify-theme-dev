const fs = require("fs-extra");

const paths = require("../utils/paths");
const PLUGIN_NAME = "CleanupPlugin";

class CleanupPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    fs.emptyDirSync(paths.distFolder);
  }
}

module.exports = CleanupPlugin;
