process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const chalk = require("chalk");
const createCompiler = require("./utils/create-compiler");

const initConfig = require("./utils/config");
const config = initConfig("development");

config.isDebug = true;

console.log(chalk.bold.red("Running in Debug mode!"));
console.log(
  chalk.bold.yellow(
    "Files will be generated and built to dist but not sync'd to Shopify."
  )
);

createCompiler(config);
