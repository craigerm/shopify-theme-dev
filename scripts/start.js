process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const createCompiler = require("./utils/create-compiler");
const initConfig = require("./utils/config");
const displayThemeInfo = require("./utils/theme-info");
const themeKitEnv = process.argv[2] || "development";
const config = initConfig(themeKitEnv);

(async function () {
  await displayThemeInfo(config);
  createCompiler(config);
})();
