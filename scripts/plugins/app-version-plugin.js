const exec = require("child_process").exec;
const path = require("path");
const fs = require("fs");
const paths = require("../utils/paths");

const PLUGIN_NAME = "AppVersionPlugin";

const getVersion = async () => {
  console.log("PROCESS DEV", process.env.NODE_ENV);

  if (process.env.NODE_ENV === "development") {
    return "development";
  }

  return new Promise((resolve, reject) => {
    exec("git describe", (error, stdout, _stderr) => {
      if (error) {
        reject(error);
        return;
      }

      const date = new Date().toISOString().split("T")[0];
      const version = stdout.split("\n")[0] + "-" + date;
      resolve(version);
    });
  });
};
class AppVersionPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      PLUGIN_NAME,
      async (_compilation, callback) => {
        const version = await getVersion();
        const content = [
          '<script type="text/javascript">',
          `window.APP_VERSION = "${version}";`,
          "console.log(window.APP_VERSION);",
          "</script>",
        ].join("\n");

        fs.writeFileSync(
          path.join(paths.distFolder, "snippets", "app-version.liquid"),
          content
        );

        callback();
      }
    );
  }
}

module.exports = AppVersionPlugin;
