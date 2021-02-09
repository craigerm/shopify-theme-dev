process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const createCompiler = require("./utils/create-compiler");
const config = require("./utils/config");

createCompiler(config);

//const chalk = require("chalk");
//console.log(chalk.cyanBright("IT LOADED CHALK"));
//console.log("HELLO WORLD");
