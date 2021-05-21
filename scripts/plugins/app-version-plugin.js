const exec = require("child_process").exec;
const path = require("path");
const fs = require("fs");
const paths = require("../utils/paths");

const PLUGIN_NAME = "AppVersionPlugin";

class AppVersionPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      PLUGIN_NAME,
      async (_compilation, callback) => {
        exec("git describe", (error, stdout, _stderr) => {
          if (error) {
            throw error;
          }

          const date = new Date().toISOString().split("T")[0];
          const version = stdout.split("\n")[0] + "-" + date;
          const content = [
            `<!-- ${version} -->`,
            `<script type="text/javascript">console.log("${version}")</script>`,
          ].join("\n");

          fs.writeFileSync(
            path.join(paths.distFolder, "snippets", "app-version.liquid"),
            content
          );
          callback();
        });
      }
    );
  }
}

module.exports = AppVersionPlugin;
