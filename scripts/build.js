// Set these before loading anything
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

const createCompiler = require("./utils/create-compiler");
const initConfig = require("./utils/config");
const displayThemeInfo = require("./utils/theme-info");
const themeKitEnv = process.argv[2] || "production";
const config = initConfig(themeKitEnv);

(async function () {
  await displayThemeInfo(config);
  createCompiler(config);
})();
